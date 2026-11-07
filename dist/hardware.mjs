// Instrumentação proposta. Nenhum dispositivo físico está conectado ao protótipo.
export function equipmentHardware(e) {
  return {
    id:e.id,
    node:`ESP-${e.id}`,
    location:e.kind==='fridge'?'Balcão, junto à cervejeira':e.kind==='coldroom'?'Área técnica, fora da câmara fria':'Cozinha, fora do gabinete refrigerado',
    sensors:[
      {icon:'thermometer',metric:'Temperatura atual',type:'Medição física proposta',device:'Sonda digital DS18B20 encapsulada',detail:'Dentro do gabinete, em ponto representativo, longe da saída direta de ar e da parede do evaporador. Ligação 1-Wire ao ESP32; posição e calibração validadas na instalação.'},
      {icon:'door-open',metric:'Porta aberta ou fechada',type:'Medição física proposta',device:'Contato magnético de porta (reed switch)',detail:'Ímã na porta e contato no batente. O ESP32 registra abertura, fechamento e duração por entrada digital, com filtragem de ruído.'},
      {icon:'bolt',metric:'Potência elétrica em watts',type:'Medição física proposta',device:'Medidor de potência ativa Modbus + TC',detail:'Medidor no circuito individual, com tensão e corrente medidas; interface RS-485 isolada para o ESP32. Exemplo: SDM120CT-Modbus para circuito compatível. Um TC sozinho não mede potência ativa. Modelo e montagem definidos pela equipe elétrica.'},
      {icon:'signal',metric:'Farol e aviso sonoro',type:'Saída de sinalização proposta',device:'Farol verde/vermelho + buzzer',detail:'Saídas do ESP32 com módulo de acionamento compatível. Assumir a ocorrência silencia o buzzer e mantém o vermelho até a recuperação. O monitoramento não comanda o compressor.'},
    ],
    derived:[
      ['Temperatura configurada','Cadastro manual no sistema, conferido com o termostato do equipamento. Não é uma leitura automática do controlador original.'],
      ['Tendência térmica','Calculada a partir das leituras de temperatura ao longo do tempo.'],
      ['Tempo desde a abertura','Calculado pelos horários registrados pelo contato magnético.'],
      ['Recuperação estimada','Calculada pelo histórico térmico e pelo fechamento da porta. É uma estimativa, não um sensor nem uma garantia.'],
      ['Última leitura e comunicação','Horário da amostra e mensagens de presença do ESP32. Erro da sonda ou perda de comunicação gera “Sem leitura”.'],
      ['Responsável e reconhecimento','Registrados pela interação do funcionário com o painel; não são medidos por sensores.'],
    ],
  };
}

export const WATER_POINTS=[
  {id:'AG-01',node:'ESP-AG-01',name:'Entrada principal',icon:'valve',location:'Tubulação principal, em ponto definido pelo projeto hidráulico',device:'Hidrômetro com saída de pulsos',detail:'O ESP32 conta pulsos. A constante de litros por pulso e o tempo entre pulsos permitem calcular volume e vazão. Diâmetro, faixa de vazão, pressão e uso com água potável devem ser compatíveis com a instalação.'},
  {id:'AG-02',node:'ESP-AG-02',key:'kitchen',name:'Cozinha',icon:'kitchen',left:16,location:'Ramal de água da cozinha',device:'Medidor de vazão com saída de pulsos no ramal',detail:'Mede o ramal da cozinha de forma independente. As torneiras compartilham essa medição; identificar uma torneira individual exige um medidor dedicado nela.'},
  {id:'AG-03',node:'ESP-AG-03',key:'bar',name:'Balcão',icon:'tap',left:50,location:'Ramal de água do balcão',device:'Medidor de vazão com saída de pulsos no ramal',detail:'Mede o ramal do balcão de forma independente. A leitura não é obtida por divisão percentual do consumo da entrada.'},
  {id:'AG-04',node:'ESP-AG-04',key:'cleaning',name:'Higienização',icon:'droplet',left:84,location:'Ramal destinado à higienização',device:'Medidor de vazão com saída de pulsos no ramal',detail:'Mede o ramal de higienização de forma independente. Vazão mínima detectável e constante de pulsos precisam ser verificadas e calibradas.'},
];
export const CONTEXT_POINTS=[
  {id:'CX-01',name:'Caixa',icon:'register',method:'Registro pela equipe',detail:'Sem sensor físico previsto. Reconhecimento de ocorrências e operações de água são registros manuais identificados por funcionário. Uma integração futura com PDS Mesas depende de uma interface disponível; ela não está ativa neste protótipo.'},
  {id:'SL-01',name:'Salão',icon:'store',method:'Área de contexto no mapa',detail:'Sem sensor de presença, câmera ou contagem de pessoas. A refrigeração do balcão é acompanhada pelos sensores das cervejeiras; o consumo de água é atribuído aos ramais instrumentados.'},
  {id:'CZ-01',name:'Cozinha',icon:'kitchen',method:'Equipamentos e ramal instrumentados',detail:'Sem uma medição única do ambiente. Cada freezer tem seu próprio ESP32 e sensores; a água da cozinha é acompanhada pelo medidor AG-02 no ramal.'},
];
export const NETWORK_PROPOSAL={
  path:['Sensores físicos','ESP32 do equipamento','Wi-Fi · MQTT com TLS','Gateway e histórico','Painel PDS'],
  collection:'Coleta sugerida a cada 5 segundos; aberturas de porta enviadas por evento.',
  presence:'Mensagem de presença a cada 30 segundos. Após 90 segundos sem mensagem, exibir “Sem comunicação”. Esses intervalos são uma proposta configurável.',
  validation:'Amostras com erro ou vencidas não são convertidas em zero. O painel mantém a última leitura válida com seu horário e solicita verificação manual.',
};
