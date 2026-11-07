import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as modelAPI from '../dist/model.mjs';
import * as hardwareAPI from '../dist/hardware.mjs';

function templates(){
  const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'');
  const pure=source.slice(0,source.indexOf("document.addEventListener('click'"));
  const context={...modelAPI,...hardwareAPI,document:{querySelector:()=>({innerHTML:''})},setTimeout:()=>0,clearTimeout:()=>{}};
  vm.runInNewContext(pure+'\nglobalThis.api={view,page,drawer,startDemo,advanceDemo,getModel:()=>model};',context);
  return context.api;
}
test('Todas as seis visões e os painéis de operação e sensores produzem conteúdo com o selo de demonstração',()=>{
  const api=templates();
  for(const page of ['map','timeline','compare','water','impact','monitoring']){
    api.view.page=page;const html=api.page();
    assert.ok(html.includes(modelAPI.DEMO_LABEL),page);assert.ok(!html.includes('NaN'),page);assert.ok(!html.includes('undefined'),page);
  }
  for(const e of api.getModel().equipment){
    const html=api.drawer(e);assert.ok(html.includes(e.name));assert.ok(html.includes('Simular porta aberta'));
    assert.ok(html.includes('Simular aquecimento'));assert.ok(html.includes('Simular sensor desconectado'));assert.ok(html.includes('Normalizar equipamento'));
    if(e.status==='offline'){assert.ok(html.includes('Sem leitura'));assert.ok(html.includes('Verificação manual necessária'));}
    api.view.drawerTab='sensors';
    const sensors=api.drawer(e);
    assert.ok(sensors.includes('ESP-'+e.id));assert.ok(sensors.includes('DS18B20'));assert.ok(sensors.includes('Contato magnético'));
    assert.ok(sensors.includes('Nenhum ESP32'));assert.ok(sensors.includes('Um TC sozinho não mede potência ativa'));
    api.view.drawerTab='operation';
  }
  api.view.page='monitoring';
  for(const tab of ['cold','water','context']){
    api.view.hardwareTab=tab;const html=api.page();
    assert.ok(!html.includes('undefined'));assert.ok(html.includes('Instrumentação proposta'));
    if(tab==='water')for(const p of hardwareAPI.WATER_POINTS)assert.ok(html.includes(p.node));
    if(tab==='context'){assert.ok(html.includes('Sem sensor físico previsto'));assert.ok(html.includes('Sem sensor de presença'));}
  }
});
test('O roteiro automático termina em 62 passos com recuperação concluída e sem fechamento automático de válvula',()=>{
  const api=templates();api.startDemo();
  for(let i=0;i<62;i++){modelAPI.tick(api.getModel());api.advanceDemo();}
  const m=api.getModel(),e=modelAPI.equipmentById(m,'FZ-01');
  assert.equal(e.status,'normal');assert.equal(e.temp,-6);assert.equal(e.remaining,0);assert.equal(e.ack.name,'João Dias');
  assert.equal(api.view.demo,null);assert.equal(api.view.page,'impact');assert.equal(m.water.scenario,'leak');
  assert.ok(m.water.ack);assert.equal(m.water.valve,'open');
});
