import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import * as modelAPI from '../dist/model.mjs';
import * as hardwareAPI from '../dist/hardware.mjs';
import * as domAPI from '../dist/dom.mjs';

function application() {
  const {document,window}=parseHTML('<html><head></head><body><div id="app"></div><div id="overlays"></div><div id="toast"></div></body></html>');
  let interval;
  let active=document.body;
  Object.defineProperty(document,'activeElement',{get:()=>active});
  window.HTMLElement.prototype.focus=function(){active=this;};
  window.scrollTo=()=>{};
  const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'');
  const context={...modelAPI,...hardwareAPI,...domAPI,document,window,CSS:{escape:value=>String(value)},setTimeout:()=>0,clearTimeout:()=>{},setInterval:callback=>{interval=callback;return 1;}};
  vm.runInNewContext(source+'\nglobalThis.api={view,getModel:()=>model};',context);
  return {
    ...context.api,document,
    click(selector){
      const element=document.querySelector(selector);
      assert.ok(element,`Controle disponível: ${selector}`);
      element.dispatchEvent(new window.Event('click',{bubbles:true}));
    },
    advance(count=1){for(let i=0;i<count;i++)interval();},
    escape(){const event=new window.Event('keydown',{bubbles:true});event.key='Escape';document.dispatchEvent(event);},
  };
}
const freezer='[data-action="inspect"][data-id="FZ-01"]';

test('Painel, rolagem, foco e botão fechar permanecem estáveis enquanto a temperatura atualiza',()=>{
  const app=application();
  app.advance(3);assert.equal(app.document.querySelector('.drawer'),null);
  app.click(freezer);
  app.click('[data-eq-action="open"]');
  const panel=app.document.querySelector('.drawer');
  const body=panel.querySelector('.drawer-body');
  const close=panel.querySelector('[data-action="drawer-close"]');
  const reading=panel.querySelector('.drawer-temperature').textContent;
  body.scrollTop=160;close.focus();
  app.advance(9);
  assert.ok(app.document.querySelector('.drawer')===panel,'O painel aberto não pode ser recriado pelo relógio');
  assert.ok(panel.querySelector('.drawer-body')===body,'A área rolável permanece montada');
  assert.ok(panel.querySelector('[data-action="drawer-close"]')===close,'O botão de fechar deve continuar recebendo o clique');
  assert.equal(body.scrollTop,160);
  assert.ok(app.document.activeElement===close);
  assert.notEqual(panel.querySelector('.drawer-temperature').textContent,reading,'As leituras continuam atualizando');
  close.dispatchEvent(new app.document.defaultView.Event('click',{bubbles:true}));
  assert.equal(app.document.querySelector('.drawer'),null);
  app.advance(8);assert.equal(app.document.querySelector('.drawer'),null,'O relógio não reabre o painel fechado');
});

test('Clicar novamente no mesmo gêmeo fecha o painel; outro clique o abre',()=>{
  const app=application();
  app.click(freezer);assert.equal(app.view.selected,'FZ-01');
  app.click(freezer);assert.equal(app.view.selected,null);
  assert.equal(app.document.querySelector('.drawer'),null);
  app.advance(3);assert.equal(app.document.querySelector('.drawer'),null);
  app.click(freezer);assert.equal(app.view.selected,'FZ-01');
  assert.ok(app.document.querySelector('.drawer'));
});

test('Trocar equipamento ou aba preserva o painel e reinicia somente a rolagem da nova seleção',()=>{
  const app=application();app.click(freezer);
  const panel=app.document.querySelector('.drawer');
  const body=panel.querySelector('.drawer-body');
  body.scrollTop=100;
  app.click('[data-action="inspect"][data-id="FZ-02"]');
  assert.ok(app.document.querySelector('.drawer')===panel);
  assert.equal(body.scrollTop,0);
  app.click('[data-action="drawer-tab"][data-drawer-tab="sensors"]');
  assert.equal(body.scrollTop,0);
  body.scrollTop=240;app.advance(6);
  assert.ok(panel.querySelector('.drawer-body')===body);
  assert.equal(body.scrollTop,240);
  assert.ok(body.textContent.includes('ESP-FZ-02'));
});

test('Cliques no botão fechar e fora do painel, e Escape, fecham sem reabertura automática',()=>{
  const app=application();
  for(const close of [()=>app.click('[data-action="drawer-close"]'),()=>app.click('.drawer-backdrop'),()=>app.escape()]){
    app.click(freezer);app.advance(2);close();
    assert.equal(app.view.selected,null);app.advance(2);
    assert.equal(app.document.querySelector('.drawer'),null);
  }
});

test('O roteiro automático não fecha o painel que o usuário ainda está consultando',()=>{
  const app=application();app.click('[data-action="demo-start"]');
  const panel=app.document.querySelector('.drawer');
  app.advance(50);
  assert.equal(app.view.selected,'FZ-01');
  assert.ok(app.document.querySelector('.drawer')===panel);
  app.click('[data-action="drawer-close"]');app.advance(15);
  assert.equal(app.document.querySelector('.drawer'),null);
});
