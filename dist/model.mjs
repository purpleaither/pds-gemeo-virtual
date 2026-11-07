export const DEMO_LABEL = 'Dados simulados para demonstração';
export const STATES = {
  normal: { label: 'Operação normal', command: 'Pode abrir', color: 'green', icon: 'check-circle', led: 'green' },
  recovery: { label: 'Recuperação térmica', command: 'Mantenha fechado', color: 'red', icon: 'snowflake', led: 'red' },
  critical: { label: 'Temperatura crítica', command: 'Verifique agora', color: 'red', icon: 'alert', led: 'red' },
  open: { label: 'Porta aberta', command: 'Feche a porta', color: 'yellow', icon: 'door-open', led: 'red' },
  offline: { label: 'Sem comunicação', command: 'Verificação manual necessária', color: 'gray', icon: 'wifi-off', led: null },
};
export const REFERENCE_EVENTS = [
  { time: '20:10', text: 'Porta aberta', detail: 'Abertura detectada no Freezer 1. A temperatura começa a subir.', icon: 'door-open', color: 'yellow' },
  { time: '20:12', text: 'Aquecimento detectado', detail: 'Temperatura acima da configuração. Mantenha fechado por aproximadamente 8 minutos.', icon: 'thermometer', color: 'yellow' },
  { time: '20:13', text: 'Farol vermelho', detail: 'Temperatura crítica. Verifique agora. Aviso sonoro representado visualmente.', icon: 'volume', color: 'red' },
  { time: '20:14', text: 'Ocorrência assumida', detail: 'João Dias reconheceu o alerta. Aviso silenciado; o farol permanece vermelho.', icon: 'user-check', color: 'orange' },
  { time: '20:20', text: 'Temperatura em recuperação', detail: 'Porta fechada. Temperatura descendo e contador de recuperação ativo.', icon: 'trend-down', color: 'red' },
  { time: '20:22', text: 'Temperatura normalizada', detail: 'Recuperação concluída. Farol verde e liberação: Pode abrir.', icon: 'check-circle', color: 'green' },
];

export function timeLabel(seconds, full = false) {
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor(seconds / 60) % 60;
  const s = Math.floor(seconds) % 60;
  const n = x => String(x).padStart(2, '0');
  return `${n(h)}:${n(m)}${full ? ':' + n(s) : ''}`;
}
export function duration(seconds) {
  if (seconds === null || seconds === undefined) return 'Indisponível';
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
export function temperature(n) {
  return n === null || n === undefined ? 'Sem leitura' : n.toFixed(1).replace('.', ',');
}
export function number(n, digits = 0) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
const start = 20 * 3600 + 10 * 60;
const definitions = [
  { id: 'FZ-01', name: 'Freezer 1', kind: 'freezer', status: 'normal', temp: -6, target: -6, watts: 340, left: 3, top: 13, lastOpen: 28 * 60, remaining: 0 },
  { id: 'FZ-02', name: 'Freezer 2', kind: 'freezer', status: 'recovery', temp: -4.2, target: -8, watts: 485, left: 27, top: 13, lastOpen: 120, remaining: 480 },
  { id: 'FZ-03', name: 'Freezer 3', kind: 'freezer', status: 'offline', temp: null, target: -10, watts: null, left: 51, top: 13, lastOpen: null, remaining: null },
  { id: 'CV-01', name: 'Cervejeira 1', kind: 'fridge', status: 'normal', temp: 2, target: 2, watts: 195, left: 30, top: 52, lastOpen: 14 * 60, remaining: 0 },
  { id: 'CV-02', name: 'Cervejeira 2', kind: 'fridge', status: 'critical', temp: 9.4, target: 2, watts: 310, left: 54, top: 52, lastOpen: 7 * 60, remaining: 480 },
  { id: 'CF-01', name: 'Câmara fria', kind: 'coldroom', status: 'normal', temp: -2, target: -2, watts: 1120, left: 75, top: 13, lastOpen: 42 * 60, remaining: 0 },
];

export function createModel() {
  return {
    clock: start,
    ticks: 0,
    equipment: definitions.map((d, index) => ({
      ...d,
      baseWatts: d.watts,
      door: d.status === 'offline' ? 'unknown' : 'closed',
      doorSeconds: 0,
      lastOpenedAt: d.lastOpen === null ? null : start - d.lastOpen,
      lastRead: d.status === 'offline' ? start - 120 : start,
      communication: d.status === 'offline' ? 'offline' : 'online',
      rate: 1,
      active: false,
      recoverTotal: 480,
      incident: d.status === 'critical' || d.status === 'offline' || d.status === 'recovery',
      incidentAt: start - 120,
      ack: d.id === 'FZ-02' ? { name: 'Marina Costa', at: start - 60 } : null,
      histories: Array.from({ length: 25 }, (_, i) => ({ at: start - 7200 + i * 300, temp: d.temp === null ? (i < 24 ? -10 + Math.sin(i * .9) * .2 : null) : d.temp + Math.sin(i * .7 + index) * .18 })),
    })),
    water: { scenario: 'normal', flow: 0, sectorFlows: {kitchen:0,bar:0,cleaning:0}, total: 846, reference: 900, valve: 'open', elapsed: 0, active: false, operation: true, ack: null, alert: false, limit: 480, closedAt: null },
    stats: { detected: 3, recognized: 1, responseSeconds: 96, doorSeconds: 720, recoverySeconds: 1080, waterAlerts: 0 },
    logs: [
      { id: 1, at: start - 120, equipmentId: 'CV-02', name: 'Cervejeira 2', text: 'Temperatura crítica detectada', detail: 'Verifique agora. Ocorrência aguardando reconhecimento.', color: 'red', icon: 'alert' },
      { id: 2, at: start - 120, equipmentId: 'FZ-03', name: 'Freezer 3', text: 'Sensor sem comunicação', detail: 'Sem leitura. Verificação manual necessária.', color: 'gray', icon: 'wifi-off' },
      { id: 3, at: start - 60, equipmentId: 'FZ-02', name: 'Freezer 2', text: 'Recuperação térmica em andamento', detail: 'Ocorrência reconhecida por Marina Costa. Mantenha fechado.', color: 'red', icon: 'snowflake' },
    ],
  };
}

export function equipmentById(model, id) {
  return model.equipment.find(e => e.id === id);
}
function log(model, e, text, detail, color, icon) {
  model.logs.push({ id: model.logs.length + 1, at: model.clock, equipmentId: e.id, name: e.name, text, detail, color, icon });
}
function incident(model, e) {
  if (!e.incident) {
    model.stats.detected++;
    e.incidentAt = model.clock;
    e.incident = true;
    e.ack = null;
  }
}
export function act(model, id, action) {
  const e = equipmentById(model, id);
  if (!e) return false;
  if (action === 'open') {
    if (e.communication === 'offline') return false;
    incident(model, e);
    e.door = 'open';
    e.status = 'open';
    e.doorSeconds = 0;
    e.lastOpenedAt = model.clock;
    e.heating = false;
    e.warmingLogged = false;
    e.remaining = 480;
    e.active = true;
    e.rate = 30;
    log(model, e, 'Porta aberta', 'Feche a porta. Mantenha fechado por aproximadamente 8 minutos após o fechamento.', 'yellow', 'door-open');
  } else if (action === 'heat') {
    if (e.communication === 'offline') return false;
    incident(model, e);
    e.active = true;
    e.rate = 30;
    e.status = 'recovery';
    e.door = 'closed';
    e.heating = true;
    e.heatingSeconds = 0;
    e.remaining = 480;
    log(model, e, 'Aquecimento detectado', 'Temperatura subindo. Mantenha fechado por aproximadamente 8 minutos.', 'yellow', 'thermometer');
  } else if (action === 'disconnect') {
    incident(model, e);
    e.status = 'offline';
    e.communication = 'offline';
    e.temp = null;
    e.watts = null;
    e.remaining = null;
    e.door = 'unknown';
    e.active = false;
    e.heating = false;
    log(model, e, 'Sensor sem comunicação', 'Sem leitura. Verificação manual necessária. A ausência de dados não indica operação normal.', 'gray', 'wifi-off');
  } else if (action === 'ack') {
    if (!e.incident || e.ack) return false;
    e.ack = { name: 'João Dias', at: model.clock };
    model.stats.recognized++;
    model.stats.responseSeconds += Math.max(1, model.clock - e.incidentAt);
    log(model, e, 'Ocorrência assumida', 'João Dias reconheceu o alerta. Aviso sonoro silenciado; o farol permanece no estado de segurança.', 'orange', 'user-check');
  } else if (action === 'normalize') {
    if (e.status === 'normal') return false;
    e.communication = 'online';
    e.temp = e.temp === null ? e.target + 5 : Math.max(e.temp, e.target + 2);
    e.watts = e.baseWatts ?? 355;
    e.door = 'closed';
    e.heating = false;
    e.status = 'recovery';
    e.remaining = 480;
    e.recoverTotal = 480;
    e.rate = 30;
    e.active = true;
    e.lastRead = model.clock;
    log(model, e, 'Temperatura em recuperação', 'Porta fechada. Temperatura descendo gradualmente. Mantenha fechado por aproximadamente 8 minutos.', 'red', 'trend-down');
  } else return false;
  return true;
}

export function tick(model) {
  model.ticks++;
  model.clock += 30;
  for (const e of model.equipment) {
    if (e.communication === 'offline') continue;
    e.lastRead = model.clock;
    const delta = e.rate;
    if (e.door === 'open') {
      e.doorSeconds += delta;
      model.stats.doorSeconds += delta;
    }
    if (e.active && (e.heating || ((e.status === 'open' || e.status === 'critical') && e.door === 'open'))) {
      e.temp = Math.min(e.target + 18, e.temp + .65);
      e.watts = Math.round((e.baseWatts ?? 340) * 1.28);
      if (e.heating) e.heatingSeconds += delta;
      const warmSeconds = e.heating ? e.heatingSeconds : e.doorSeconds;
      if (warmSeconds >= 60 && !e.warmingLogged) {
        log(model, e, 'Aquecimento detectado', 'Temperatura subindo. Mantenha fechado por aproximadamente 8 minutos.', 'yellow', 'thermometer');
        e.warmingLogged = true;
      }
      if (e.temp >= e.target + 4 && e.status !== 'critical') {
        e.status = 'critical';
        log(model, e, 'Temperatura crítica · farol vermelho', 'Verifique agora. Aviso sonoro representado visualmente.', 'red', 'volume');
      }
    } else if (e.status === 'recovery') {
      const step = Math.min(delta, e.remaining);
      e.temp += (e.target - e.temp) * step / Math.max(1, e.remaining);
      e.remaining = Math.max(0, e.remaining - step);
      model.stats.recoverySeconds += step;
      if (e.remaining === 0) {
        e.status = 'normal';
        e.temp = e.target;
        e.active = false;
        e.incident = false;
        e.warmingLogged = false;
        e.watts = e.baseWatts ?? 340;
        log(model, e, 'Temperatura normalizada', 'Recuperação concluída. Farol verde. Pode abrir.', 'green', 'check-circle');
      }
    }
    if (model.ticks % 2 === 0 || e.active) {
      e.histories.push({ at: model.clock, temp: e.temp });
      e.histories = e.histories.filter(h => h.at >= model.clock - 7200);
    }
  }
  const w = model.water;
  if (w.active && w.valve === 'open') {
    w.elapsed += 30;
    w.total += w.flow / 2;
    if (w.scenario === 'normal' && w.elapsed >= 120) {
      w.flow = 0;
      w.sectorFlows = {kitchen:0,bar:0,cleaning:0};
      w.active = false;
      log(model, { id: 'AG-01', name: 'Água' }, 'Uso normal concluído', 'Vazão retornou a zero. A válvula principal permanece aberta.', 'blue', 'droplet');
    }
  }
  return model;
}

export function waterScenario(model, scenario) {
  if (!['normal', 'abnormal', 'leak'].includes(scenario)) return false;
  const w = model.water;
  w.scenario = scenario;
  w.valve = 'open';
  w.closedAt = null;
  w.flow = { normal: 4.2, abnormal: 6.8, leak: 1.7 }[scenario];
  // Cada canal representa um medidor de ramal próprio. Não há rateio percentual.
  w.sectorFlows = {...{
    normal: {kitchen:2.6,bar:1.1,cleaning:.5},
    abnormal: {kitchen:3.4,bar:2.2,cleaning:1.2},
    leak: {kitchen:1.7,bar:0,cleaning:0},
  }[scenario]};
  w.elapsed = scenario === 'normal' ? 0 : scenario === 'abnormal' ? 540 : 720;
  w.active = true;
  w.operation = scenario !== 'leak';
  w.ack = null;
  w.alert = scenario !== 'normal';
  w.incidentAt = model.clock;
  if (w.alert) { model.stats.detected++; model.stats.waterAlerts++; }
  log(model, { id: 'AG-01', name: 'Água' }, { normal: 'Uso normal iniciado', abnormal: 'Alerta de fluxo contínuo', leak: 'Possível vazamento' }[scenario], scenario === 'normal' ? 'Operação registrada. A vazão retornará a zero e a válvula continuará aberta.' : scenario === 'abnormal' ? 'Fluxo acima do limite de 8 minutos. Verifique os setores monitorados.' : 'Vazão contínua sem operação registrada. Recomendada verificação hidráulica.', { normal: 'blue', abnormal: 'yellow', leak: 'red' }[scenario], 'droplet');
  return true;
}
export function acknowledgeWater(model) {
  if (!model.water.alert || model.water.ack) return false;
  model.water.ack = { name: 'João Dias', at: model.clock };
  model.stats.recognized++;
  model.stats.responseSeconds += Math.max(1, model.clock - model.water.incidentAt);
  log(model, { id: 'AG-01', name: 'Água' }, 'Alerta de água reconhecido', 'João Dias reconheceu o alerta. A verificação hidráulica continua necessária.', 'orange', 'user-check');
  return true;
}
export function closeValve(model) {
  if (model.water.scenario !== 'leak' || model.water.valve === 'closed') return false;
  model.water.valve = 'closed';
  model.water.flow = 0;
  model.water.sectorFlows = {kitchen:0,bar:0,cleaning:0};
  model.water.active = false;
  model.water.closedAt = model.clock;
  log(model, { id: 'AG-01', name: 'Água' }, 'Fechamento da válvula simulado', 'Simulação administrativa por João Dias. Ação sujeita a validação hidráulica e autorização.', 'orange', 'valve');
  return true;
}
export function sortedEquipment(model) {
  const priority = { critical: 0, open: 1, recovery: 2, offline: 3, normal: 4 };
  return [...model.equipment].sort((a, b) => priority[a.status] - priority[b.status] || a.name.localeCompare(b.name, 'pt-BR'));
}
export function trend(e) {
  if (e.communication === 'offline') return { label: 'Sem dados', icon: 'minus', color: 'gray' };
  if (e.heating) return { label: 'Aquecendo', icon: 'trend-up', color: 'red' };
  if (e.status === 'recovery') return { label: 'Resfriando', icon: 'trend-down', color: 'blue' };
  if (e.status === 'critical' || e.status === 'open') return { label: e.active ? 'Aquecendo' : 'Acima da configuração', icon: 'trend-up', color: 'red' };
  return { label: 'Temperatura estável', icon: 'minus', color: 'green' };
}
