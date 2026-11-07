import test from 'node:test';
import assert from 'node:assert/strict';
import { createModel, equipmentById, tick, act, STATES, waterScenario, acknowledgeWater, closeValve, sortedEquipment, REFERENCE_EVENTS, trend } from '../dist/model.mjs';

test('Freezer 1: porta aberta, aquecimento gradual, crítico, reconhecimento e recuperação completa',()=>{
  const m=createModel(),e=equipmentById(m,'FZ-01');
  assert.equal(e.temp,-6);assert.equal(e.status,'normal');assert.equal(STATES[e.status].led,'green');
  assert.ok(act(m,e.id,'open'));assert.equal(e.door,'open');assert.equal(STATES[e.status].led,'red');
  tick(m);assert.ok(e.temp>-6);assert.ok(e.temp<0);assert.equal(e.doorSeconds,30);
  for(let i=0;i<6;i++)tick(m);
  assert.equal(e.status,'critical');assert.equal(e.ack,null);
  assert.ok(act(m,e.id,'ack'));assert.equal(e.ack.name,'João Dias');assert.equal(e.status,'critical');assert.equal(STATES[e.status].led,'red');
  const recognized=m.stats.recognized;assert.equal(act(m,e.id,'ack'),false);assert.equal(m.stats.recognized,recognized);
  assert.ok(act(m,e.id,'normalize'));assert.equal(e.status,'recovery');assert.equal(e.door,'closed');assert.equal(e.remaining,480);
  const warm=e.temp;tick(m);assert.ok(e.temp<warm);assert.equal(e.remaining,450);assert.equal(STATES[e.status].led,'red');
  for(let i=0;i<15;i++)tick(m);
  assert.equal(e.remaining,0);assert.equal(e.temp,-6);assert.equal(e.status,'normal');assert.equal(STATES[e.status].led,'green');
  assert.ok(m.logs.some(l=>l.equipmentId===e.id&&l.text==='Temperatura normalizada'));
});
test('Sem comunicação usa valores ausentes, preserva a última leitura e exige recuperação ao reconectar',()=>{
  const m=createModel(),e=equipmentById(m,'FZ-01'),last=e.lastRead;
  act(m,e.id,'disconnect');tick(m);
  assert.equal(e.temp,null);assert.equal(e.watts,null);assert.equal(e.door,'unknown');assert.equal(e.remaining,null);
  assert.equal(e.status,'offline');assert.equal(e.lastRead,last);assert.equal(STATES[e.status].led,null);
  assert.equal(act(m,e.id,'open'),false);assert.equal(act(m,e.id,'heat'),false);
  act(m,e.id,'normalize');assert.equal(e.status,'recovery');assert.notEqual(e.temp,null);assert.equal(STATES[e.status].led,'red');
});
test('Aquecimento com a porta fechada não solicita fechamento de uma porta já fechada',()=>{
  const m=createModel(),e=equipmentById(m,'FZ-01');
  act(m,e.id,'heat');assert.equal(e.door,'closed');assert.equal(STATES[e.status].command,'Mantenha fechado');
  const before=e.temp;tick(m);assert.ok(e.temp>before);assert.equal(trend(e).label,'Aquecendo');
  for(let i=0;i<6;i++)tick(m);assert.equal(e.status,'critical');
});
test('Uso normal de água retorna a zero sem fechar a válvula',()=>{
  const m=createModel();waterScenario(m,'normal');assert.equal(m.water.flow,4.2);
  const before=m.water.total;for(let i=0;i<4;i++)tick(m);
  assert.equal(m.water.flow,0);assert.equal(m.water.valve,'open');assert.equal(m.water.alert,false);assert.ok(m.water.total>before);
  assert.deepEqual(m.water.sectorFlows,{kitchen:0,bar:0,cleaning:0});
  assert.equal(closeValve(m),false);
});
test('Fluxo anormal e vazamento exigem verificação e fechamento somente por ação administrativa explícita',()=>{
  const m=createModel();waterScenario(m,'abnormal');assert.equal(m.water.alert,true);assert.ok(m.water.elapsed>m.water.limit);
  assert.equal(closeValve(m),false);for(let i=0;i<5;i++)tick(m);assert.equal(m.water.valve,'open');
  waterScenario(m,'leak');assert.equal(m.water.operation,false);assert.equal(m.water.valve,'open');
  assert.equal(m.water.sectorFlows.kitchen,1.7);assert.equal(m.water.sectorFlows.bar,0);assert.equal(m.water.sectorFlows.cleaning,0);
  for(let i=0;i<10;i++)tick(m);assert.ok(m.water.flow>0);assert.equal(m.water.valve,'open');
  assert.equal(acknowledgeWater(m),true);assert.equal(m.water.valve,'open');assert.equal(m.water.alert,true);
  assert.equal(acknowledgeWater(m),false);assert.equal(closeValve(m),true);assert.equal(m.water.flow,0);assert.equal(m.water.valve,'closed');
  assert.deepEqual(m.water.sectorFlows,{kitchen:0,bar:0,cleaning:0});
  assert.match(m.logs.at(-1).detail,/Ação sujeita a validação hidráulica e autorização/);
});
test('Comparação prioriza equipamentos críticos, em recuperação, desconectados e normais',()=>{
  const sorted=sortedEquipment(createModel());assert.equal(sorted[0].status,'critical');assert.equal(sorted[1].status,'recovery');
  assert.deepEqual(sorted.slice(-3).map(e=>e.status),['normal','normal','normal']);
});
test('Roteiro de referência preserva horários e eventos solicitados',()=>{
  assert.deepEqual(REFERENCE_EVENTS.map(e=>e.time),['20:10','20:12','20:13','20:14','20:20','20:22']);
});
