import { DEMO_LABEL, STATES, REFERENCE_EVENTS, createModel, equipmentById, tick, act, temperature, number, duration, timeLabel, waterScenario, acknowledgeWater, closeValve, sortedEquipment, trend } from './model.mjs';
import { equipmentHardware, WATER_POINTS, CONTEXT_POINTS, NETWORK_PROPOSAL } from './hardware.mjs';
import { syncMarkup } from './dom.mjs';

const paths = {
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  sun: '<path d="M3 16h18M6 13a6 6 0 0 1 12 0M12 2v3M3 6l3 2M21 6l-3 2M6 20h12"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z"/><path d="M9 3v16M15 5v16"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  timeline: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  droplet: '<path d="M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  chart: '<path d="M4 3v17h17M8 15V9M13 15V5M18 15v-5"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M8 14h8"/>',
  reset: '<path d="M3 5v6h6M3 11a9 9 0 1 1 2 7"/>',
  store: '<path d="M4 10v10h16V10M3 4h18l1 6a3 3 0 0 1-5 1 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-1l1-6Z"/><path d="M10 20v-6h5v6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  snowflake: '<path d="M12 2v20M3.4 7l17.2 10M3.4 17 20.6 7M8 4l4 3 4-3M8 20l4-3 4 3M3 11l4-1V6M21 13l-4 1v4M3 13l4 1v4M21 11l-4-1V6"/>',
  alert: '<path d="m10.3 4-8 14A1.4 1.4 0 0 0 3.5 20h17a1.4 1.4 0 0 0 1.2-2l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 16h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  wifi: '<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
  'wifi-off': '<path d="m3 3 18 18M6 7a15 15 0 0 1 15 1M3 8l1-.6M9 11a10 10 0 0 1 9 1M6 12l1-.5M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  freezer: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M7 12v3M12 5v15"/>',
  fridge: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M9 5v1M9 13v4"/>',
  coldroom: '<path d="M3 21V3h18v18M3 21h18M7 21V7h10v14M13 13v3"/>',
  'trend-up': '<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>',
  'trend-down': '<path d="m3 7 6 6 4-4 8 10M15 19h6v-6"/>',
  minus: '<path d="M5 12h14"/>',
  door: '<path d="M5 21V3h14v18M3 21h18M14 12h.01"/>',
  'door-open': '<path d="M3 21h18M5 21V3h12v18M5 3l10 3v15M11 12h.01"/>',
  register: '<path d="M4 14h16l2 7H2l2-7ZM6 14V4h12v10M9 7h6M8 17h.01M12 17h.01M16 17h.01"/>',
  kitchen: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M19 21V3c-4 2-5 8-1 10h1"/>',
  plant: '<path d="M12 21v-8M12 16C3 15 3 9 4 5c6 0 9 3 8 8M12 12c0-6 4-9 9-9 1 7-3 11-9 11"/>',
  mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  thermometer: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z"/><path d="M12 8v9"/><circle cx="12" cy="18" r="1"/>',
  volume: '<path d="m11 4-6 5H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
  'user-check': '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 10l2 2 4-5"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  filter: '<path d="M4 4h16l-6 7v8l-4 2V11L4 4Z"/>',
  sort: '<path d="M8 3v18M4 17l4 4 4-4M14 5h7M14 10h5M14 15h3"/>',
  valve: '<path d="M1 12h6v8H1v-8Zm16 0h6v8h-6v-8ZM7 11h10v10H7V11ZM12 11V5M5 4h14M12 2v4"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  tap: '<path d="M3 12h14v5h4v-7a3 3 0 0 0-3-3h-5V4M8 4h10M3 9v6M19 21a1 1 0 0 0 2 0l-1-2-1 2Z"/>',
  cup: '<path d="M4 4h13v10a6.5 6.5 0 0 1-13 0V4Zm13 2h2a3 3 0 0 1 0 6h-2M3 22h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  signal: '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.info}</svg>`;
const badge = () => `<span class="demo-badge">${icon('flask')}${DEMO_LABEL}</span>`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let model = createModel();
const view = { page: 'map', selected: null, drawerTab:'operation', hardwareTab:'cold', layer: 'cold', fullmap: false, filter: 'all', query: '', timeline: 'reference', modal: false, demo: null, drawerId: null };
const nav = [ ['map', 'map', 'Mapa Operacional'], ['timeline', 'timeline', 'Linha do Tempo'], ['compare', 'grid', 'Visão Comparativa'], ['water', 'droplet', 'Água'], ['impact', 'chart', 'Impacto do Turno'], ['monitoring','chip','Como monitoramos'] ];
const app = document.querySelector('#app');
const overlays = document.querySelector('#overlays');
let toastTimer;

function shell() {
  const critical = model.equipment.filter(e => e.status === 'critical').length;
  return `<div class="shell ${view.fullmap ? 'fullmap' : ''}">
    <aside class="sidebar" aria-label="Navegação principal">
      <div class="brand"><div class="brand-mark">${icon('sun')}</div><div class="brand-word">PDS<small>PÔR DO SOL · ASA NORTE</small></div></div>
      <div class="product-label">${icon('layers')}GÊMEO VIRTUAL</div>
      <div class="nav-caption">VISÃO DA OPERAÇÃO</div>
      <nav class="nav">${nav.map(([id, glyph, label]) => `<button class="nav-link ${view.page === id ? 'active' : ''}" data-action="navigate" data-page="${id}" title="${label}" ${view.page === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${id === 'map' && critical ? `<span class="nav-count">${critical}</span>` : ''}</button>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="demo-environment"><div class="demo-env-title">${icon('flask')}Ambiente de demonstração</div><p>Explore os cenários e acompanhe a resposta da equipe.</p><p>Dados simulados para demonstração</p></div><button class="sidebar-reset" data-action="reset">${icon('reset')}Reiniciar simulação</button><div class="sidebar-signature"><span>PDS Gêmeo Virtual</span><span>protótipo</span></div></div>
    </aside>
    <header class="topbar"><div class="venue">${icon('store')}Pôr do Sol <small class="venue-location">408 NORTE</small><span class="venue-sep"></span><span class="prototype-chip">PROTÓTIPO INTERATIVO</span></div><div class="topbar-right"><div class="shift">Turno da noite <b>·</b> ${timeLabel(model.clock)}<span>${DEMO_LABEL}</span></div><div class="user-block"><div class="avatar">JD</div><div class="user-name">João Dias<small>Gestor do turno</small></div></div></div></header>
    <main class="content" id="main-content">${view.demo ? demoProgress() : ''}${page()}</main>
    <footer class="legend" aria-label="Legenda permanente"><div class="legend-items"><span class="legend-title">FAROL OPERACIONAL</span><span class="legend-item"><i class="dot green"></i>Verde: operação normal</span><span class="legend-item"><i class="dot red"></i>Vermelho: manter fechado ou agir</span><span class="legend-item"><i class="dot yellow"></i>Amarelo: atenção</span><span class="legend-item"><i class="dot gray"></i>Cinza: sem comunicação</span></div>${badge()}</footer>
  </div>`;
}
function heading(title, subtitle, eyebrow = 'OPERAÇÃO CONECTADA') {
  return `<div class="page-heading"><div><div class="eyebrow"><i class="dot green"></i>${eyebrow}</div><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="heading-actions"><span class="live-label"><i class="dot green"></i>Simulação ativa</span><button class="btn btn-primary" data-action="demo-start" title="Iniciar demonstração guiada de 62 segundos">${icon('play')}${view.demo ? 'Reiniciar roteiro' : 'Demonstrar cenário'}</button></div></div>`;
}
function page() {
  return { map: mapPage, timeline: timelinePage, compare: comparePage, water: waterPage, impact: impactPage, monitoring:monitoringPage }[view.page]();
}
function stat({ label, value, unit = '', note, color = '', glyph, action = '', cls = '' }) {
  const tag = action ? 'button' : 'div';
  return `<${tag} class="stat ${cls}" ${action ? `data-action="stat-filter" data-filter="${action}"` : ''}><div class="stat-label">${label}<span class="stat-icon-bg">${icon(glyph)}</span></div><div class="stat-number ${color}">${value}<small>${unit}</small></div><div class="stat-note">${note}</div>${badge()}</${tag}>`;
}
function mapPage() {
  const online = model.equipment.filter(e => e.communication === 'online').length;
  const normals = model.equipment.filter(e => e.status === 'normal').length;
  const attention = model.equipment.filter(e => ['critical', 'recovery', 'open'].includes(e.status));
  const critical = model.equipment.filter(e => e.status === 'critical').length;
  return `${heading('Mapa Operacional', 'Seu bar, em uma visão. Acompanhe os equipamentos e saiba quando agir.')}
    <div class="stats">
      ${stat({ label: 'Equipamentos monitorados', value: '06', glyph: 'layers', note: `${online} em comunicação <span class="gray">· ${6-online} sem sinal</span>`, action: 'all' })}
      ${stat({ label: 'Operação normal', value: String(normals).padStart(2, '0'), color: 'green', glyph: 'check-circle', note: '<i class="dot green"></i>Temperatura estável · pode abrir', action: 'normal' })}
      ${stat({ label: 'Precisam de atenção', value: String(attention.length).padStart(2, '0'), color: 'red', glyph: 'alert', note: `${critical} crítico${critical !== 1 ? 's' : ''} <span>· ${attention.length-critical} em atenção ou recuperação</span>`, action: 'alert', cls: 'alert' })}
      ${stat({ label: 'Água monitorada no turno', value: number(model.water.total), unit: 'L', color: 'blue', glyph: 'droplet', note: model.water.alert ? '<span class="yellow">Verifique o alerta de fluxo</span>' : '<i class="dot green"></i>Dentro da referência do turno', cls: 'water' })}
    </div>
    <div class="map-layout"><section class="panel map-panel" aria-label="Planta operacional do bar"><div class="panel-heading"><div><h2 class="panel-title">${icon('map')}Planta do estabelecimento</h2><p class="panel-subtitle">Vista superior · representação operacional 2D</p></div><div class="map-tools"><div class="segment" aria-label="Camada do mapa"><button data-action="layer" data-layer="cold" class="${view.layer === 'cold' ? 'active' : ''}" aria-pressed="${view.layer === 'cold'}">${icon('snowflake')}Refrigeração</button><button data-action="layer" data-layer="water" class="${view.layer === 'water' ? 'active' : ''}" aria-pressed="${view.layer === 'water'}">${icon('droplet')}Água</button></div><button class="icon-button" data-action="expand" title="${view.fullmap ? 'Reduzir' : 'Ampliar'} mapa" aria-label="${view.fullmap ? 'Reduzir' : 'Ampliar'} mapa">${icon('expand')}</button></div></div>
      <div class="floorplan-wrap"><div class="floorplan ${view.layer === 'water' ? 'water-mode' : ''}">
        <svg class="plan-base" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="hatch" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><path d="M0 0v5" stroke="var(--map-hatch)" stroke-width="1"/></pattern></defs><path d="M18 25H982V578H18V486M18 405V25" fill="var(--map-fill)" stroke="var(--map-wall)" stroke-width="2"/><path d="M25 32H975V570H25V489M25 402V32" fill="none" stroke="var(--map-wall-soft)" stroke-width="1"/><path d="M18 271h252m72 0h285m75 0h280M747 25v246" fill="none" stroke="var(--map-wall)" stroke-width="3"/><path d="M270 271v-69a69 69 0 0 1 69 69M628 271v-69a69 69 0 0 1 69 69" fill="none" stroke="var(--map-wall-soft)" stroke-width="1"/><path d="M18 487h80a80 80 0 0 0-80-80" fill="none" stroke="var(--map-wall-soft)" stroke-width="1"/><path d="M155 578h106m64 0h106m64 0h106m64 0h106" stroke="var(--blue-border)" stroke-width="4"/><path d="M159 574h98m72 0h98m72 0h98m72 0h98" stroke="var(--map-window)" stroke-width="2"/><rect x="40" y="291" width="175" height="29" rx="3" fill="url(#hatch)" stroke="var(--map-wall-soft)"/><path d="M889 374v-72h-96M889 302V290M793 302v-13M889 302H240V258" stroke="var(--blue)" stroke-opacity="${view.layer === 'water' ? '1' : '.65'}" stroke-width="2" stroke-dasharray="5 6" fill="none"/><circle cx="889" cy="302" r="4" fill="var(--blue)" fill-opacity="1"/></svg>
        <button class="room-label context-link" style="left:5%;top:5.5%" data-action="monitor-context" title="Ver como a cozinha é monitorada">${icon('kitchen')}COZINHA · ÁREA TÉCNICA</button><div class="room-label" style="left:77%;top:5.5%">${icon('snowflake')}ESTOQUE FRIO</div><div class="room-label" style="left:31%;top:45.5%">BALCÃO · SERVIÇO</div><button class="room-label context-link" style="left:6%;top:83%" data-action="monitor-context" title="Ver o papel do salão no monitoramento">SALÃO ${icon('info')}</button><div class="room-label" style="left:4%;top:94%;font-size:6px">ENTRADA</div>
        ${model.equipment.map(e => equipmentCard(e)).join('')}
        <button class="cashier context-link" data-action="monitor-context" title="Ver como o caixa participa do monitoramento">${icon('register')}Caixa ${icon('info')}</button>
        <button class="map-water ${model.water.scenario === 'leak' ? 'leak' : model.water.scenario === 'abnormal' ? 'warning' : ''}" data-action="navigate" data-page="water" title="Abrir módulo Água — ponto principal de entrada">${icon('droplet')}<div><strong>Entrada de água</strong><span>${number(model.water.flow, 1)} L/min</span>${badge()}</div></button>
        ${[35, 53, 71].map(left => `<div class="table-top" style="left:${left}%;top:84%"><span>${icon('cup')}</span></div>`).join('')}<div class="plant">${icon('plant')}</div>
      </div></div><div class="map-footer"><span>${icon('mouse')}Clique em um equipamento para inspecionar</span><button data-action="navigate" data-page="monitoring">${icon('chip')}Ver sensores e ESP32${icon('arrow')}</button></div>
    </section><aside class="rail"><section class="panel"><div class="panel-heading"><h2 class="panel-title">${icon('alert')}Atenção no turno</h2><span class="count-pill">${model.equipment.filter(e => e.status !== 'normal').length}</span></div>${attentionList()}</section>${waterRail()}</aside></div>
    <div class="insight-strip">${icon('info')}<div><strong>O farol orienta a equipe.</strong> Verde libera a abertura. Vermelho pede cuidado para preservar a temperatura.</div><button data-action="navigate" data-page="compare">Comparar equipamentos${icon('arrow')}</button></div>`;
}
function equipmentCard(e) {
  const state = operationalState(e);
  const t = trend(e);
  return `<button class="equipment ${e.status} ${e.kind}" style="left:${e.left}%;top:${e.top}%" data-action="inspect" data-id="${e.id}" aria-expanded="${view.selected===e.id}" aria-controls="equipment-panel" aria-label="${e.name}, ${e.id}, ${e.temp === null ? 'Sem leitura' : temperature(e.temp)+' graus Celsius'}, ${state.label}. Abrir painel de detalhes."><div class="equip-top"><span class="equip-name">${icon(e.kind)}${e.name}</span><i class="status-led" aria-label="${state.led ? 'Farol '+state.led.replace('green','verde').replace('red','vermelho') : 'Farol indisponível'}"></i></div><div class="equip-reading"><span class="equip-temp">${temperature(e.temp)}${e.temp === null ? '' : '<small> °C</small>'}</span>${icon(t.icon)}</div><div class="equip-set">${e.id} · Config. ${temperature(e.target)} °C</div><div class="equip-message">${icon(state.icon)}${state.command}</div><div class="equip-mini"><span>${e.watts === null ? 'Sem consumo lido' : number(e.watts)+' W'}</span><span>${e.door === 'unknown' ? 'Sem sinal' : e.door === 'open' ? 'Aberta · '+duration(e.doorSeconds) : 'Porta fechada'}</span></div>${badge()}</button>`;
}
function attentionList() {
  const equipment = sortedEquipment(model).filter(e => e.status !== 'normal');
  if (!equipment.length) return `<div class="empty">${icon('check-circle')}<p>Todos os equipamentos em operação normal.</p></div>`;
  return equipment.slice(0,4).map(e => `<button class="attention-item ${e.status}" data-action="inspect" data-id="${e.id}" aria-expanded="${view.selected===e.id}" aria-controls="equipment-panel"><span class="attention-symbol">${icon(STATES[e.status].icon)}</span><div class="attention-copy"><div class="attention-title">${e.name}${icon('chevron')}</div><p class="attention-text">${e.status === 'critical' ? `<span class="red">Temperatura crítica · ${temperature(e.temp)} °C</span><br>${e.ack ? 'Assumida por '+e.ack.name : 'Verifique agora'}` : e.status === 'recovery' ? `Em recuperação · ${duration(e.remaining)}<br>Mantenha fechado` : e.status === 'offline' ? 'Sem comunicação<br>Verificação manual necessária' : 'Porta aberta · '+duration(e.doorSeconds)+'<br>Feche a porta'}</p>${badge()}</div></button>`).join('');
}
function waterRail() {
  const w = model.water;
  return `<section class="panel water-rail"><div class="water-rail-head"><h2 class="panel-title">${icon('droplet')}Água no bar</h2><i class="dot ${w.alert ? w.scenario === 'leak' ? 'red' : 'yellow' : 'green'}"></i></div><div class="water-rail-numbers"><div><strong>${number(w.flow, 1)} <small>L/min</small></strong><p>Vazão instantânea</p></div><div><strong>${number(w.total)} <small>L</small></strong><p>Consumo no turno</p></div></div>${badge()}<button class="btn" data-action="navigate" data-page="water">${w.alert ? 'Verificar alerta de água' : 'Acompanhar consumo'}${icon('arrow')}</button></section>`;
}
function comparePage() {
  let equipment = sortedEquipment(model);
  if (view.filter === 'normal') equipment = equipment.filter(e => e.status === 'normal');
  if (view.filter === 'alert') equipment = equipment.filter(e => ['critical','recovery','open'].includes(e.status));
  if (view.filter === 'offline') equipment = equipment.filter(e => e.status === 'offline');
  const q = view.query.trim().toLocaleLowerCase('pt-BR');
  if (q) equipment = equipment.filter(e => `${e.name} ${e.id}`.toLocaleLowerCase('pt-BR').includes(q));
  return `${heading('Visão Comparativa', 'Priorize a ação. Os equipamentos críticos aparecem primeiro.')}
    <div class="view-toolbar"><div class="filters">${[['all','Todos'],['alert','Em atenção'],['offline','Sem comunicação'],['normal','Normais']].map(([key,label])=>`<button class="filter ${view.filter===key?'active':''}" data-action="filter" data-filter="${key}" aria-pressed="${view.filter===key}">${label}</button>`).join('')}</div><label class="search">${icon('search')}<input data-search aria-label="Buscar equipamento por nome ou identificação" placeholder="Buscar equipamento..." value="${esc(view.query)}" /></label></div>
    <div class="sort-note" style="margin-bottom:15px">${icon('sort')}Prioridade: críticos → porta aberta → recuperação → sem comunicação → normais</div>
    <div class="comparison-grid">${equipment.length ? equipment.map(comparisonCard).join('') : '<div class="panel empty">Nenhum equipamento encontrado.</div>'}</div>`;
}
function comparisonCard(e) {
  const s = operationalState(e), t = trend(e);
  const temp = e.temp === null ? 'Sem leitura' : `${temperature(e.temp)}<small> °C</small>`;
  return `<button class="comparison-card ${e.status}" data-action="inspect" data-id="${e.id}" aria-expanded="${view.selected===e.id}" aria-controls="equipment-panel" aria-label="Inspecionar ${e.name}"><div class="comparison-head"><div><h3>${e.name}</h3><small>${e.id}</small></div><span class="status-tag ${s.color}"><i class="dot ${e.status==='critical'?'blink-alarm':''}"></i>${s.label}</span></div><div class="comparison-reading"><span class="comparison-temp ${e.temp===null?'gray':''}">${temp}</span><span class="comparison-command ${s.color}">${icon(s.icon)}${s.command}</span></div><div class="comparison-details">
    <div>Temperatura configurada<strong>${temperature(e.target)} °C</strong></div><div>Tendência<strong class="${t.color}">${t.label}</strong></div>
    <div>Consumo elétrico<strong>${e.watts===null?'Sem leitura':number(e.watts)+' W'}</strong></div><div>Estado da porta<strong>${e.door==='unknown'?'Sem leitura':e.door==='open'?'Aberta · '+duration(e.doorSeconds):'Fechada'}</strong></div>
    <div>Última abertura<strong>${e.lastOpenedAt===null||e.communication==='offline'?'Indisponível':duration(model.clock-e.lastOpenedAt)+' atrás'}</strong></div><div>Recuperação estimada<strong>${e.remaining===null?'Indisponível':duration(e.remaining)}</strong></div>
    <div>Última leitura ${e.communication==='offline'?'válida':''}<strong>${timeLabel(e.lastRead,true)}</strong></div><div>Comunicação · farol<strong>${e.communication==='offline'?'Sem comunicação · indisponível':'Conectado · '+(s.led==='green'?'verde':'vermelho')}</strong></div></div>${badge()}</button>`;
}
function timelinePage() {
  const reference = view.timeline === 'reference';
  return `${heading('Linha do Tempo', 'Cada mudança de estado e cada resposta da equipe, no mesmo lugar.')}
    <div class="view-toolbar"><div class="filters"><button class="filter ${reference?'active':''}" data-action="timeline-tab" data-tab="reference">Roteiro de demonstração</button><button class="filter ${!reference?'active':''}" data-action="timeline-tab" data-tab="live">Eventos deste turno</button></div><button class="btn btn-small btn-ghost" data-action="inspect" data-id="FZ-01">${icon('freezer')}Inspecionar Freezer 1</button></div>
    <section class="panel timeline-panel"><div class="timeline-header"><div><h2>${reference?'Da abertura à normalização':'Registro da operação simulada'}</h2><p>${reference?'Sequência ilustrativa do Freezer 1 · da porta aberta à liberação de uso.':'Os eventos abaixo respondem às suas interações no protótipo.'}</p></div>${badge()}</div><div class="timeline-list">${reference?REFERENCE_EVENTS.map(e=>timelineEvent(e)).join(''):[...model.logs].reverse().map(e=>timelineEvent({time:timeLabel(e.at),text:e.text,detail:e.name+' · '+e.detail,icon:e.icon,color:e.color})).join('')}</div></section>`;
}
function timelineEvent(e) {
  return `<article class="timeline-event ${e.color}"><time>${e.time}</time><div class="timeline-event-inner">${icon(e.icon)}<div class="timeline-event-copy"><h3>${esc(e.text)}</h3><p>${esc(e.detail)}</p></div>${badge()}</div></article>`;
}
function waterPage() {
  const w = model.water;
  const pct = w.total/w.reference*100;
  return `${heading('Água', 'Do ponto de entrada aos setores. Veja o consumo e identifique fluxos fora do esperado.', 'MONITORAMENTO HÍDRICO')}
    <div class="water-scenarios" aria-label="Cenários simulados de água">${[['normal','check-circle','Uso normal','Vazão durante o uso e retorno a zero.'],['abnormal','clock','Fluxo anormal','Fluxo acima do tempo de referência.'],['leak','alert','Possível vazamento','Fluxo contínuo sem operação registrada.']].map(([key,glyph,title,desc])=>`<button class="scenario ${w.scenario===key?'active':''}" data-action="water-scenario" data-scenario="${key}" aria-pressed="${w.scenario===key}">${icon(glyph)}<div><strong>${title}</strong><small>${desc}</small></div><span class="scenario-check">${w.scenario===key?icon('check'):''}</span></button>`).join('')}</div>
    <div class="stats water-stats">${stat({label:'Vazão instantânea',value:number(w.flow,1),unit:'L/min',color:'blue',glyph:'droplet',note:w.flow===0?'Sem fluxo neste momento':w.operation?'Operação registrada':'<span class="red">Sem operação registrada</span>',cls:'water'})}${stat({label:'Consumo acumulado no turno',value:number(w.total),unit:'L',glyph:'chart',note:'Volume monitorado na entrada principal'})}${stat({label:'Referência para o turno',value:number(w.reference),unit:'L',color:'orange',glyph:'filter',note:`${number(pct,1)}% da linha de referência utilizada`})}</div>
    <div class="water-layout"><section class="panel"><div class="panel-heading"><div><h2 class="panel-title">${icon('map')}Distribuição no estabelecimento</h2><p class="panel-subtitle">Conectada ao mesmo Mapa Operacional</p></div><button class="btn btn-small btn-ghost" data-action="map-water">Ver no mapa${icon('arrow')}</button></div><div class="water-network"><svg class="network-lines ${w.flow===0?'stopped':''}" viewBox="0 0 600 230" preserveAspectRatio="none" aria-hidden="true"><path d="M300 88v35H95v34M300 123v34M300 123h205v34" fill="none" stroke="var(--blue)" stroke-width="2"/></svg><div class="network-main">${icon('valve')}<strong>Entrada principal · AG-01</strong><small>Hidrômetro de pulsos → ESP-AG-01</small><small>Válvula ${w.valve==='open'?'aberta':'fechada · simulação'}</small>${badge()}</div>${WATER_POINTS.filter(point=>point.key).map(({name:label,icon:glyph,left,key,id,node})=>`<button class="sector" style="left:${left}%" data-action="monitor-water" title="Ver medidor proposto de ${label}">${icon(glyph)}<strong>${label}</strong><span>${number(w.sectorFlows[key],2)} L/min</span><small class="sector-sensor">${id} · sensor de pulsos</small>${badge()}</button>`).join('')}</div><div class="reference"><div class="reference-labels"><span>Consumo monitorado <strong>${number(w.total)} L</strong></span><span>Referência <strong>${number(w.reference)} L</strong></span></div><div class="reference-track"><i style="width:${Math.min(100,pct*.8)}%"></i></div><div class="reference-note"><span>Início do turno</span><span class="orange">Linha de referência do turno</span></div>${badge()}</div></section>
    <section class="panel valve-card"><h2 class="panel-title">${icon('shield')}Válvula principal</h2><div class="valve-visual">${icon('valve')}</div><div class="valve-status"><i class="dot ${w.valve==='open'?'green':'orange'}"></i>${w.valve==='open'?'Aberta':'Fechada · simulação'}</div>${badge()}<div class="admin-label">${icon('shield')}AÇÃO ADMINISTRATIVA · DEMONSTRAÇÃO</div><button class="btn btn-danger" data-action="valve-modal" ${w.scenario!=='leak'||w.valve==='closed'?'disabled':''} title="${w.scenario!=='leak'?'Disponível no cenário Possível vazamento':'Simular ação administrativa'}">${icon('valve')}Simular fechamento da válvula</button><p class="hydraulic-notice"><strong>Monitoramento proposto:</strong> fim de curso de posição → ESP-AG-01. Atuador motorizado por módulo de saída isolado.</p><p class="hydraulic-notice">Ação sujeita a validação hidráulica e autorização.</p><p class="hydraulic-notice">${w.scenario!=='leak'?'Selecione “Possível vazamento” para demonstrar esta ação. A válvula permanece aberta durante o uso normal.':w.valve==='closed'?'Fechamento representado somente nesta demonstração. A verificação hidráulica continua necessária.':'A simulação depende de confirmação administrativa e não comanda nenhum equipamento real.'}</p></section></div>
    ${waterAlert()}<div class="hardware-link-banner">${icon("chip")}<div><strong>Medição por sensores de pulsos + ESP32.</strong><p>Cada ramal tem um medidor proposto próprio. Os valores exibidos são simulações independentes, sem rateio percentual da entrada.</p></div><button class="btn btn-small" data-action="monitor-water">Como medimos a água${icon("arrow")}</button></div>`;
}
function waterAlert() {
  const w=model.water;
  const title=w.scenario==='normal'?'Uso normal · sem alerta ativo':w.scenario==='abnormal'?'Atenção: fluxo contínuo acima do tempo definido':'Possível vazamento · verificação recomendada';
  const message=w.scenario==='normal'?'O fluxo acompanha a operação e retorna a zero após poucos minutos simulados. A válvula principal permanece aberta.':w.scenario==='abnormal'?`Fluxo contínuo há ${duration(w.elapsed)}. Limite de referência: 08:00. Verifique as torneiras da cozinha, do balcão e da higienização.`:`Vazão contínua sem operação registrada há ${duration(w.elapsed)}. Verifique os setores e solicite avaliação hidráulica.${w.valve==='closed'?' Fechamento da válvula apenas simulado.':''}`;
  return `<section class="water-alert ${w.scenario==='abnormal'?'warning':w.scenario==='leak'?'leak':''}" aria-label="Estado do monitoramento de água">${icon(w.scenario==='normal'?'check-circle':'alert')}<div class="water-alert-copy"><strong>${title}</strong><p>${message}</p>${w.ack?`<p class="green">Reconhecido por ${w.ack.name} às ${timeLabel(w.ack.at)}. Verificação pendente.</p>`:''}${badge()}</div><button class="btn ${w.ack?'btn-green':'btn-ghost'}" data-action="water-ack" ${!w.alert||w.ack?'disabled':''}>${icon(w.ack?'user-check':'check-circle')}${w.ack?'Alerta reconhecido':'Reconhecer alerta'}</button></section>`;
}
function impactPage() {
  const s=model.stats;
  const metrics=[
    ['alert','Ocorrências detectadas',number(s.detected),''],['user-check','Ocorrências reconhecidas',number(s.recognized),''],['clock','Tempo médio de resposta',duration(s.recognized?s.responseSeconds/s.recognized:0),'min:s'],['door-open','Minutos de porta aberta',number(s.doorSeconds/60,1),'min'],['snowflake','Tempo de recuperação térmica',number(s.recoverySeconds/60,1),'min'],['droplet','Litros monitorados',number(model.water.total),'L'],['tap','Alertas de fluxo anormal',number(s.waterAlerts),''],['wifi-off','Equipamentos sem comunicação',number(model.equipment.filter(e=>e.communication==='offline').length),''],
  ];
  return `${heading('Impacto do Turno','Um retrato da operação, dos alertas e da resposta da equipe.','INDICADORES DO TURNO · SIMULAÇÃO')}
    <div class="impact-grid">${metrics.map(([glyph,label,value,unit])=>`<article class="impact-card"><div class="impact-icon">${icon(glyph)}</div><h2>${label}</h2><div class="impact-value">${value} <small>${unit}</small></div>${badge()}</article>`).join('')}</div><div class="impact-bottom"><p><strong>Métricas simuladas para demonstração.</strong>Os indicadores acompanham as interações realizadas neste protótipo.</p><div class="impact-buttons"><button class="btn btn-ghost" data-action="navigate" data-page="timeline">${icon('timeline')}Rever eventos</button><button class="btn btn-primary" data-action="navigate" data-page="map">Voltar ao mapa${icon('arrow')}</button></div></div>`;
}

function proposalNotice() {
  return `<div class="proposal-notice">${icon('flask')}<div><strong>Instrumentação proposta · demonstração</strong><p>Os componentes abaixo explicam como os dados seriam coletados em uma instalação real. Nenhum ESP32, sensor ou atuador está conectado a este protótipo.</p></div></div>`;
}
function monitoringPage() {
  const tab=view.hardwareTab;
  return `${heading('Como monitoramos','Do sensor ao painel: veja a origem de cada informação e o papel de cada componente.','INSTRUMENTAÇÃO · PDS ASA NORTE')}
    ${proposalNotice()}<section class="panel data-pipeline"><h2 class="panel-title">${icon('chip')}Caminho proposto dos dados</h2><div class="pipeline-steps">${NETWORK_PROPOSAL.path.map((label,i)=>`${i?'<span class="pipeline-arrow">'+icon('arrow')+'</span>':''}<div class="pipeline-step">${icon(['thermometer','chip','wifi','database','map'][i])}<span>${label}</span></div>`).join('')}</div><p>O ESP32 coleta as leituras. Um gateway local (Raspberry Pi ou mini PC) recebe as mensagens e mantém o histórico. O painel consulta o serviço de dados para apresentar estados e ocorrências.</p></section>
    <div class="view-toolbar hardware-toolbar"><div class="filters">${[['cold','Refrigeração'],['water','Água e válvula'],['context','Caixa, salão e cozinha']].map(([key,label])=>`<button class="filter ${tab===key?'active':''}" data-action="hardware-tab" data-hardware-tab="${key}" aria-pressed="${tab===key}">${label}</button>`).join('')}</div><button class="btn btn-small btn-ghost" data-action="navigate" data-page="map">Voltar ao mapa${icon('arrow')}</button></div>
    ${tab==='cold'?`<div class="instrument-grid">${model.equipment.map(e=>{const h=equipmentHardware(e);return `<article class="panel instrument-card"><div class="instrument-card-heading">${icon(e.kind)}<div><h2>${e.name}</h2><small>${e.id} · ${h.node}</small></div><span class="proposal-tag">PROPOSTO</span></div><p class="instrument-location">ESP32: ${h.location}.</p><ul class="sensor-summary"><li>${icon('thermometer')}DS18B20: temperatura interna</li><li>${icon('door-open')}Contato magnético: estado da porta</li><li>${icon('bolt')}Medidor Modbus + TC: potência ativa</li></ul><button class="btn btn-small btn-ghost" data-action="inspect-sensors" data-id="${e.id}">Ver sensores e cálculos${icon('arrow')}</button>${badge()}</article>`;}).join('')}</div>`:tab==='water'?waterInstrumentation():`<div class="instrument-grid context-grid">${CONTEXT_POINTS.map(point=>`<article class="panel instrument-card"><div class="instrument-card-heading">${icon(point.icon)}<div><h2>${point.name}</h2><small>${point.id}</small></div></div><h3 class="context-method">${point.method}</h3><p class="instrument-description">${point.detail}</p><span class="proposal-tag">ESCOPO PROPOSTO</span>${badge()}</article>`).join('')}</div><div class="hardware-note">${icon('info')}O registro de operação de água é uma informação manual da equipe neste protótipo. “Possível vazamento” é uma suspeita calculada ao cruzar esse registro com o fluxo contínuo; não é uma confirmação automática de vazamento.</div>`}
    <div class="network-policy panel"><h2 class="panel-title">${icon('wifi')}Comunicação e qualidade da leitura</h2><div><p>${NETWORK_PROPOSAL.collection}</p><p>${NETWORK_PROPOSAL.presence}</p><p>${NETWORK_PROPOSAL.validation}</p></div>${badge()}</div><p class="hardware-references">Referências dos componentes propostos: <a href="https://www.analog.com/en/products/DS18B20.html" target="_blank" rel="noopener noreferrer">DS18B20 · Analog Devices</a> · <a href="https://docs.espressif.com/projects/esp-mqtt/en/latest/esp32/" target="_blank" rel="noopener noreferrer">ESP32 / MQTT · Espressif</a> · <a href="https://www.eastroneurope.com/images/uploads/products/cad-drawings/SDM120_CT_Datasheet_May22.pdf" target="_blank" rel="noopener noreferrer">Medidor Modbus · Eastron</a></p>`;
}
function waterInstrumentation() {
  return `<div class="instrument-grid water-instrument-grid">${WATER_POINTS.map(point=>`<article class="panel instrument-card"><div class="instrument-card-heading">${icon(point.icon)}<div><h2>${point.name}</h2><small>${point.id} · ${point.node}</small></div><span class="proposal-tag">PROPOSTO</span></div><h3 class="context-method">${point.device}</h3><p class="instrument-location">${point.location} → entrada de pulsos do ESP32.</p><p class="instrument-description">${point.detail}</p>${badge()}</article>`).join('')}<article class="panel instrument-card valve-instrument"><div class="instrument-card-heading">${icon('valve')}<div><h2>Válvula principal</h2><small>Atuador + retorno de posição · ESP-AG-01</small></div><span class="proposal-tag">PROPOSTO</span></div><p class="instrument-description"><strong>Como saber a posição:</strong> contatos de fim de curso informam aberta ou fechada ao ESP32. Enviar um comando não confirma a posição física.<br><strong>Como atuar:</strong> válvula motorizada e módulo de saída isolado, dimensionados no projeto hidráulico e elétrico. No protótipo, o fechamento continua sendo somente uma simulação administrativa.</p><p class="hydraulic-notice">Ação sujeita a validação hidráulica e autorização.</p>${badge()}</article></div><div class="hardware-note">${icon('info')}Vazão e litros vêm dos pulsos de cada medidor, conforme sua calibração. Fluxo anormal e possível vazamento são cálculos de duração e contexto. A ausência de pulsos abaixo da vazão mínima do sensor não descarta um pequeno vazamento. A referência de consumo é cadastrada pela gestão.</div>`;
}
function equipmentInstrumentation(e) {
  const h=equipmentHardware(e);
  return `${proposalNotice()}<div class="node-identity"><span>${icon('chip')}Nó proposto</span><strong>${h.node}</strong><p>${h.location}. A placa fica protegida da umidade e fora da zona refrigerada.</p></div><h3 class="section-title">O que cada componente acompanha</h3><div class="sensor-details">${h.sensors.map(sensor=>`<article class="sensor-detail"><span class="sensor-glyph">${icon(sensor.icon)}</span><div><small>${sensor.type}</small><h4>${sensor.metric}</h4><strong>${sensor.device}</strong><p>${sensor.detail}</p></div></article>`).join('')}</div><h3 class="section-title">O que é calculado ou cadastrado</h3><dl class="derived-details">${h.derived.map(([label,detail])=>`<div><dt>${label}</dt><dd>${detail}</dd></div>`).join('')}</dl><div class="hardware-note">${icon('wifi')}DS18B20 / contato de porta / medidor → ${h.node} → Wi-Fi / MQTT com TLS → gateway → painel.</div><p class="offline-note">${NETWORK_PROPOSAL.validation}</p>${badge()}`;
}

function detailCell(label,value,cls='') {
  return `<div class="detail-cell"><small>${label}</small><strong class="${cls}">${value}</strong>${badge()}</div>`;
}
function operationalState(e) {
  return e.heating && e.status !== 'critical' ? {...STATES[e.status],label:'Aquecimento detectado'} : STATES[e.status];
}
function drawer(e) {
  const s=operationalState(e),t=trend(e),off=e.communication==='offline';
  const sound=e.status==='critical';
  const recent=model.logs.filter(event=>event.equipmentId===e.id).slice(-4).reverse();
  const doors=model.logs.filter(event=>event.equipmentId===e.id&&event.text==='Porta aberta').slice(-3).reverse();
  return `<div class="drawer-backdrop" data-action="drawer-close" aria-hidden="true"></div><aside class="drawer" id="equipment-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-equipment="${e.id}"><header class="drawer-header"><div><p class="drawer-kicker">REFRIGERAÇÃO / ${e.id}</p><h2 class="drawer-title" id="drawer-title">${icon(e.kind)}${e.name}</h2></div><button class="icon-button" data-action="drawer-close" aria-label="Fechar painel">${icon('close')}</button></header><div class="drawer-tabs" aria-label="Conteúdo do equipamento"><button data-action="drawer-tab" data-drawer-tab="operation" class="${view.drawerTab==='operation'?'active':''}" aria-pressed="${view.drawerTab==='operation'}">${icon('signal')}Operação</button><button data-action="drawer-tab" data-drawer-tab="sensors" class="${view.drawerTab==='sensors'?'active':''}" aria-pressed="${view.drawerTab==='sensors'}">${icon('chip')}Sensores e ESP32</button></div><div class="drawer-body" id="equipment-panel-body" data-drawer-tab="${view.drawerTab}">${view.drawerTab==='sensors'?equipmentInstrumentation(e):`<div class="status-banner ${e.status}" data-ui-key="equipment-status"><i class="dot ${s.led==='green'?'green':s.led==='red'?'red':'gray'} ${sound?'blink-alarm':''}"></i>${s.command}${sound?`<span title="${e.ack?'Aviso sonoro silenciado':'Alarme sonoro representado visualmente'}">${icon(e.ack?'mute':'volume')}${!e.ack?'<span class="sound-bars" aria-label="Alarme sonoro representado visualmente"><i></i><i></i><i></i></span>':''}</span>`:''}</div>
    <div class="drawer-reading" data-ui-key="equipment-reading"><div><div class="drawer-temperature ${off?'gray':''}" ${off?'style="font-size:32px;letter-spacing:-1px"':''}>${temperature(e.temp)}${off?'':'<small> °C</small>'}</div><div class="trend-label ${t.color}">${icon(t.icon)}${t.label}</div>${badge()}</div><div class="drawer-reading-right">Temperatura configurada<strong>${temperature(e.target)} °C</strong><span class="${s.color}">${s.label}</span>${badge()}</div></div>
    <button class="equipment-source" data-action="drawer-tab" data-drawer-tab="sensors">${icon('chip')}<span><strong>ESP-${e.id} · instrumentação proposta</strong><small>DS18B20 + contato de porta + medidor de potência</small></span>${icon('chevron')}</button>
    ${['recovery','critical','open'].includes(e.status)?`<div class="recovery-hint" data-ui-key="equipment-recovery">${e.door==='open'?'Feche a porta. ':''}Mantenha fechado por aproximadamente 8 minutos.<strong>${duration(e.remaining)} <span style="font:9px var(--font)">${e.status==='recovery'&&!e.heating?'para recuperação estimada':'estimados de recuperação após o fechamento'}</span></strong><div class="recovery-track"><i style="width:${Math.max(0,100-(e.remaining/e.recoverTotal*100))}%"></i></div>${badge()}</div>`:''}
    ${off?'<p class="offline-note">Sem leitura atual. Verificação manual necessária. A ausência de dados não indica temperatura zero ou operação normal.</p>':''}
    <div class="detail-grid" data-ui-key="equipment-metrics" style="${off?'margin-top:15px':''}">
      ${detailCell('Consumo elétrico',e.watts===null?'Sem leitura':number(e.watts)+' W')}
      ${detailCell('Estado da porta',e.door==='unknown'?'Sem leitura':e.door==='open'?'Aberta há '+duration(e.doorSeconds):'Fechada',e.door==='open'?'yellow':'')}
      ${detailCell('Desde a última abertura',off||e.lastOpenedAt===null?'Indisponível':duration(model.clock-e.lastOpenedAt))}
      ${detailCell('Recuperação estimada',e.remaining===null?'Indisponível':duration(e.remaining),e.status==='normal'?'green':'red')}
      ${detailCell(off?'Última leitura válida':'Horário da última leitura',timeLabel(e.lastRead,true))}
      ${detailCell('Estado da comunicação',off?'Sem comunicação':'Conectado',off?'gray':'green')}
    </div>
    <h3 class="section-title">Temperatura nas últimas duas horas<small>°C · SIMULAÇÃO</small></h3>${temperatureChart(e)}
    <h3 class="section-title">Histórico de abertura da porta${icon('door-open')}</h3>${doors.length?doors.map(event=>miniEvent(event.at,'Porta aberta. '+(e.door==='open'?'Aberta há '+duration(e.doorSeconds)+'.':'Porta fechada na normalização.'))).join(''):e.lastOpenedAt!==null?miniEvent(e.lastOpenedAt,'Última abertura registrada. Porta '+(e.door==='open'?'aberta.':'fechada.')):`<p class="offline-note">Histórico indisponível: sensor sem comunicação.</p>`}
    <h3 class="section-title">Ocorrências recentes<small>REGISTRO DO EQUIPAMENTO</small></h3>${recent.length?recent.map(event=>miniEvent(event.at,event.text+'. '+event.detail,event.color)).join(''):`<div class="event-mini"><p>Sem alarme ativo. Temperatura estável e farol verde.${badge()}</p></div>`}
    ${e.ack?`<div class="acknowledged">${icon('user-check')}<div>Reconhecido por ${e.ack.name}<small>Às ${timeLabel(e.ack.at)} · ${sound?'Aviso silenciado. O farol continua vermelho.':'Reconhecimento registrado no turno.'}</small>${badge()}</div></div>`:e.incident?'<p class="offline-note">Responsável pelo reconhecimento: aguardando equipe.</p>':''}
    <p class="offline-note">Simulação acelerada: a cada segundo, 30 segundos do cenário. Estimativas ilustrativas, sem sensores reais.</p>
    `}</div><div class="drawer-actions"><div class="drawer-actions-title">CONTROLES DE DEMONSTRAÇÃO</div>
      <button class="btn" data-action="simulate" data-eq-action="open" data-id="${e.id}" ${off||e.door==='open'?'disabled':''}>${icon('door-open')}Simular porta aberta</button>
      <button class="btn" data-action="simulate" data-eq-action="heat" data-id="${e.id}" ${off?'disabled':''}>${icon('thermometer')}Simular aquecimento</button>
      <button class="btn btn-ghost" data-action="simulate" data-eq-action="disconnect" data-id="${e.id}" ${off?'disabled':''}>${icon('wifi-off')}Simular sensor desconectado</button>
      <button class="btn ${e.ack?'btn-green':'btn-danger'}" data-action="simulate" data-eq-action="ack" data-id="${e.id}" ${!e.incident||e.ack?'disabled':''}>${icon('user-check')}${e.ack?'Ocorrência assumida':'Assumir ocorrência'}</button>
      <button class="btn btn-green" data-action="simulate" data-eq-action="normalize" data-id="${e.id}" ${e.status==='normal'?'disabled':''}>${icon('snowflake')}Normalizar equipamento</button>
    </div></aside>`;
}
function miniEvent(at,text,color='') {
  return `<div class="event-mini"><time>${timeLabel(at)}</time><p class="${color}">${esc(text)}${badge()}</p></div>`;
}
function temperatureChart(e) {
  const samples=e.histories.filter(h=>h.temp!==null&&h.at>=model.clock-7200);
  if (!samples.length) return `<div class="temperature-chart"><p class="offline-note">Sem leituras válidas no período. Verificação manual necessária.</p>${badge()}</div>`;
  const values=samples.map(s=>s.temp);
  const lo=Math.min(...values,e.target)-1.2,hi=Math.max(...values,e.target)+1.2;
  const x=at=>32+(at-(model.clock-7200))/7200*320;
  const y=temp=>83-(temp-lo)/(hi-lo)*69;
  const points=samples.map(h=>`${x(h.at).toFixed(1)},${y(h.temp).toFixed(1)}`).join(' ');
  const stroke=e.communication==='offline'?'var(--gray)':e.status==='normal'?'var(--green)':e.status==='recovery'?'var(--blue)':'var(--red)';
  const targetY=y(e.target).toFixed(1);
  return `<div class="temperature-chart"><svg viewBox="0 0 365 98" aria-label="Histórico simulado de temperatura nas últimas duas horas" role="img"><path d="M32 15h320M32 48h320M32 83h320" stroke="var(--line)" fill="none" stroke-dasharray="3 5"/><text x="0" y="18" fill="var(--muted)" font-size="8" font-family="monospace">${temperature(hi)}</text><text x="0" y="85" fill="var(--muted)" font-size="8" font-family="monospace">${temperature(lo)}</text><path d="M32 ${targetY}h320" stroke="var(--brand-ink)" stroke-dasharray="4 4"/><polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>${e.temp!==null?`<circle cx="${x(samples.at(-1).at)}" cy="${y(samples.at(-1).temp)}" r="3" fill="${stroke}"/>`:''}</svg><div class="chart-labels"><span>${timeLabel(model.clock-7200)}</span><span>${timeLabel(model.clock-3600)}</span><span>${timeLabel(model.clock)}</span></div><div style="font-size:8px;color:var(--muted);padding:7px 10px 0"><span class="orange">┄</span> Configurada: ${temperature(e.target)} °C${e.communication==='offline'?' · Somente leituras válidas anteriores à desconexão':''}</div>${badge()}</div>`;
}
function valveModal() {
  return `<div class="modal-wrap" data-action="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-icon">${icon('shield')}</div><h2 id="modal-title">Simular fechamento da válvula</h2><p>Esta ação representa uma decisão administrativa no cenário de possível vazamento. O fluxo será zerado somente neste protótipo.</p><div class="modal-warning">Ação sujeita a validação hidráulica e autorização.</div><p>Responsável pela simulação: João Dias · Administrador de demonstração.</p>${badge()}<div class="modal-buttons"><button class="btn btn-ghost" data-action="modal-close">Cancelar</button><button class="btn btn-primary" data-action="valve-confirm">${icon('valve')}Confirmar simulação</button></div></section></div>`;
}
function demoLabel(elapsed) {
  if(elapsed<4)return 'Freezer 1 em operação normal. Farol verde: pode abrir.';
  if(elapsed<11)return 'Porta aberta. Observe o aquecimento e o farol vermelho.';
  if(elapsed<18)return 'Temperatura crítica. O aviso sonoro aparece visualmente.';
  if(elapsed<24)return 'João Dias assumiu a ocorrência. O farol permanece vermelho.';
  if(elapsed<40)return 'Recuperação térmica. A temperatura diminui e o contador avança.';
  if(elapsed<42)return 'Temperatura normalizada. Farol verde e recuperação concluída.';
  if(elapsed<48)return 'Uso normal de água. A vazão retorna a zero, com a válvula aberta.';
  if(elapsed<52)return 'Fluxo anormal. O tempo de referência foi ultrapassado.';
  if(elapsed<58)return 'Possível vazamento. A equipe reconhece o alerta.';
  return 'Revise a sequência de eventos e o impacto simulado do turno.';
}
function demoProgress() {
  const d=view.demo;
  return `<div class="demo-progress">${icon('play')}<div class="demo-progress-copy">${demoLabel(d.elapsed)}<small>Roteiro automático · ${d.elapsed} de 62 segundos · ${DEMO_LABEL}</small></div><div class="demo-progress-track" role="progressbar" aria-label="Progresso da demonstração" aria-valuenow="${d.elapsed}" aria-valuemin="0" aria-valuemax="62"><i style="width:${d.elapsed/62*100}%"></i></div><button class="btn btn-small btn-ghost" data-action="demo-pause">${icon(d.paused?'play':'pause')}${d.paused?'Continuar':'Pausar'}</button><button class="icon-button" data-action="demo-stop" aria-label="Encerrar demonstração" title="Encerrar demonstração">${icon('close')}</button></div>`;
}
function startDemo() {
  model=createModel();
  Object.assign(view,{page:'map',selected:'FZ-01',drawerTab:'operation',layer:'cold',modal:false,demo:{elapsed:0,paused:false}});
  toast('Demonstração iniciada. O roteiro percorre os cenários em 62 segundos.');
}
function advanceDemo() {
  if(!view.demo||view.demo.paused)return;
  const d=view.demo;
  d.elapsed++;
  if(d.elapsed===4)act(model,'FZ-01','open');
  if(d.elapsed===18)act(model,'FZ-01','ack');
  if(d.elapsed===24)act(model,'FZ-01','normalize');
  if(d.elapsed===42){view.page='water';waterScenario(model,'normal');}
  if(d.elapsed===48)waterScenario(model,'abnormal');
  if(d.elapsed===52)waterScenario(model,'leak');
  if(d.elapsed===55)acknowledgeWater(model);
  if(d.elapsed===58){view.page='timeline';view.timeline='reference';}
  if(d.elapsed>=62){view.page='impact';view.demo=null;toast('Roteiro concluído. Explore os indicadores e os registros do turno.');}
}
function toast(message) {
  const host=document.querySelector('#toast');
  host.innerHTML=`<div class="toast">${icon('check-circle')}${esc(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{host.innerHTML='';},4500);
}

function focusSelector(element) {
  if(!element||!element.matches('button,input'))return null;
  if(element.hasAttribute('data-search'))return '[data-search]';
  const attributes=['data-action','data-id','data-eq-action','data-page','data-filter','data-scenario','data-tab','data-layer','data-drawer-tab','data-hardware-tab'];
  return 'button'+attributes.filter(a=>element.hasAttribute(a)).map(a=>`[${a}="${CSS.escape(element.getAttribute(a))}"]`).join('');
}
function render() {
  const active=document.activeElement;
  const focus=focusSelector(active);
  const selection=active?.matches('[data-search]')?[active.selectionStart,active.selectionEnd]:null;
  const oldDrawer=overlays.querySelector('.drawer');
  const oldBody=oldDrawer?.querySelector('.drawer-body');
  const scroll=oldDrawer?.dataset.equipment===view.selected&&oldBody?.dataset.drawerTab===view.drawerTab?oldBody.scrollTop:0;
  app.innerHTML=shell();
  syncMarkup(overlays,(view.selected?drawer(equipmentById(model,view.selected)):'')+(view.modal?valveModal():''));
  const overflow=view.selected||view.modal?'hidden':'';
  if(document.body.style.overflow!==overflow)document.body.style.overflow=overflow;
  if(view.selected){overlays.querySelector('.drawer-body').scrollTop=scroll;}
  if(focus){const replacement=document.querySelector(focus);if(replacement&&replacement!==active)replacement.focus({preventScroll:true});if(selection&&replacement)replacement.setSelectionRange(...selection);}
  document.title=`${nav.find(n=>n[0]===view.page)?.[2]} · PDS Gêmeo Virtual`;
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='navigate'){
    view.page=button.dataset.page;view.selected=null;view.modal=false;
    if(view.demo){view.demo=null;toast('Roteiro encerrado. A simulação continua em modo livre.');}
    window.scrollTo({top:0,behavior:'instant'});
  } else if(action==='inspect'){
    view.selected=view.selected===button.dataset.id?null:button.dataset.id;view.drawerTab='operation';
  } else if(action==='inspect-sensors'){
    view.selected=view.selected===button.dataset.id?null:button.dataset.id;view.drawerTab='sensors';
  } else if(action==='drawer-tab'){
    view.drawerTab=button.dataset.drawerTab;
  } else if(action==='hardware-tab'){
    view.hardwareTab=button.dataset.hardwareTab;
  } else if(action==='monitor-water'){
    view.page='monitoring';view.hardwareTab='water';view.selected=null;
  } else if(action==='monitor-context'){
    view.page='monitoring';view.hardwareTab='context';view.selected=null;
  } else if(action==='drawer-close'){
    const selected=view.selected;view.selected=null;render();document.querySelector(`[data-action="inspect"][data-id="${selected}"]`)?.focus({preventScroll:true});return;
  } else if(action==='layer')view.layer=button.dataset.layer;
  else if(action==='expand')view.fullmap=!view.fullmap;
  else if(action==='stat-filter'){view.page='compare';view.filter=button.dataset.filter;}
  else if(action==='filter')view.filter=button.dataset.filter;
  else if(action==='timeline-tab')view.timeline=button.dataset.tab;
  else if(action==='map-water'){view.page='map';view.layer='water';window.scrollTo({top:0,behavior:'instant'});}
  else if(action==='simulate'){
    view.drawerTab='operation';
    const kind=button.dataset.eqAction;
    if(act(model,button.dataset.id,kind))toast({open:'Porta aberta simulada. Observe a temperatura subir.',heat:'Aquecimento iniciado. O farol permanece vermelho.',disconnect:'Sensor desconectado. Sem leitura: verificação manual necessária.',ack:'Ocorrência assumida por João Dias. O aviso foi silenciado e o farol foi preservado.',normalize:'Porta fechada. Recuperação iniciada: 8 minutos simulados em 16 segundos.'}[kind]);
  } else if(action==='water-scenario'){
    waterScenario(model,button.dataset.scenario);
    toast({normal:'Uso normal iniciado. A vazão retornará a zero e a válvula permanecerá aberta.',abnormal:'Fluxo contínuo simulado: atenção aos setores monitorados.',leak:'Possível vazamento simulado. Verifique o alerta e a ação administrativa.'}[button.dataset.scenario]);
  } else if(action==='water-ack'){
    if(acknowledgeWater(model))toast('Alerta reconhecido por João Dias. A verificação continua necessária.');
  } else if(action==='valve-modal')view.modal=true;
  else if(action==='modal-close')view.modal=false;
  else if(action==='modal-backdrop'){if(event.target===button)view.modal=false;else return;}
  else if(action==='valve-confirm'){
    closeValve(model);view.modal=false;toast('Fechamento simulado. Ação sujeita a validação hidráulica e autorização.');
  } else if(action==='reset'){
    model=createModel();Object.assign(view,{page:'map',selected:null,drawerTab:'operation',hardwareTab:'cold',layer:'cold',filter:'all',query:'',timeline:'reference',modal:false,demo:null});toast('Simulação reiniciada. Freezer 1 em operação normal a −6 °C.');
  } else if(action==='demo-start')startDemo();
  else if(action==='demo-pause')view.demo.paused=!view.demo.paused;
  else if(action==='demo-stop'){view.demo=null;toast('Roteiro encerrado. Você pode explorar todos os controles.');}
  else return;
  render();
  if(action==='inspect'||action==='inspect-sensors'){
    const target=view.selected?'[data-action="drawer-close"]':`[data-action="${action}"][data-id="${button.dataset.id}"]`;
    document.querySelector(target)?.focus({preventScroll:true});
  }
  if(action==='valve-modal')document.querySelector('[data-action="modal-close"]')?.focus({preventScroll:true});
});
document.addEventListener('input',event=>{
  if(event.target.matches('[data-search]')){view.query=event.target.value;render();}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    if(view.modal){view.modal=false;render();document.querySelector('[data-action="valve-modal"]')?.focus();}
    else if(view.selected){const id=view.selected;view.selected=null;render();document.querySelector(`[data-action="inspect"][data-id="${id}"]`)?.focus({preventScroll:true});}
  }
  if(event.key==='Tab'&&(view.modal||view.selected)){
    const dialog=document.querySelector(view.modal?'.modal':'.drawer');
    const items=[...dialog.querySelectorAll('button:not(:disabled),[tabindex="0"]')];
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
render();
setInterval(()=>{
  if(document.hidden||view.demo?.paused)return;
  tick(model);advanceDemo();render();
},1000);
