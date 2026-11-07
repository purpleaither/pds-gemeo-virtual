# PDS Gêmeo Virtual

Protótipo interativo em português do bar Pôr do Sol, pensado para desktop 1440 × 900, com adaptação para telas menores. Implementação estática sem dependências de execução. Todos os valores são simulados para demonstração; não há conexão a sensores, válvulas ou equipamentos reais.

Abra o endereço publicado para navegar. O botão **Demonstrar cenário** executa um roteiro automático de 62 segundos. O fluxo manual completo está no Freezer 1: simular porta aberta, observar o aquecimento e o estado crítico, assumir a ocorrência e normalizar. A recuperação de oito minutos simulados leva 16 segundos reais. A legenda permanece visível em todas as telas.

O painel lateral mantém o mesmo elemento na tela durante as atualizações de leitura, preservando foco, botões e rolagem. Clicar novamente no mesmo equipamento fecha o painel; o botão de fechar, o clique fora e Escape também o fecham. Atualizações de dados e mudanças de estado não o reabrem nem o fecham automaticamente, inclusive durante o roteiro. Ao trocar equipamento ou aba, a nova consulta começa no topo.

Mapa Operacional, Linha do Tempo, Visão Comparativa, Água e Impacto do Turno compartilham os mesmos estados. A visão adicional **Como monitoramos** detalha a instrumentação proposta, o caminho dos dados e as áreas sem sensores. A Linha do Tempo distingue o roteiro ilustrativo solicitado dos eventos efetivamente criados durante a sessão. Reiniciar simulação restaura os estados iniciais.

Água oferece uso normal, fluxo anormal e possível vazamento. O uso normal zera a vazão sem fechar a válvula. O fechamento é uma ação administrativa explícita, disponível no cenário de vazamento e acompanhada de confirmação. A mensagem “Ação sujeita a validação hidráulica e autorização” aparece no controle, na confirmação e no evento.

Tema claro com fundo branco, texto principal preto e amarelo da fachada nos destaques e botões, sempre com texto preto. Texto secundário usa cinza escuro; verde, vermelho, âmbar, azul e cinza usam versões escuras sobre fundos suaves, com rótulos e ícones para identificar os estados. Controles recebem bordas distinguíveis, foco visível por teclado e estados de seleção e desabilitado legíveis. As curvas e linhas do mapa compartilham os mesmos tokens de cor. A base visual continua inspirada na [fotografia do Bar Pôr do Sol na 408 Norte](https://medium.com/@bzferreira/reportagem-tecjor-fa86b9ce051a), sem pretensão de reproduzir códigos de um manual oficial de marca.

## Instrumentação proposta

Cada equipamento de refrigeração possui uma identidade de nó própria (`ESP-FZ-01` etc.). A aba **Sensores e ESP32** explica: sonda DS18B20 interna para temperatura; contato magnético de porta; medidor de potência ativa Modbus com medição de tensão e corrente e interface RS-485 isolada; farol e buzzer por módulo de saída. O medidor SDM120CT-Modbus é um exemplo sujeito à compatibilidade do circuito. Instalação e calibração precisam ser definidas no projeto. O ESP32 não altera o termostato nem comanda o compressor.

Temperatura configurada e referência de água são cadastros. Tendência, tempos e estimativa de recuperação são cálculos. Identidade do responsável vem da ação da equipe no painel. Nenhum desses valores é apresentado como leitura direta de um sensor inexistente.

A entrada principal e os ramais da cozinha, balcão e higienização têm medidores de pulsos e identidades ESP32 próprios na proposta. A simulação utiliza canais de ramal independentes: não distribui o fluxo principal em percentuais fixos. Localizar uma torneira individual requer medidor dedicado nela. Vazão mínima e calibração limitam a detecção de pequenos vazamentos. A posição física da válvula seria confirmada por fim de curso; comando enviado não confirma posição. No protótipo, fechamento e posição continuam simulados.

O caminho proposto é sensores → ESP32 → Wi-Fi / MQTT com TLS → gateway local e histórico → painel. São propostas configuráveis de coleta a cada 5 s, presença a cada 30 s e indicação de ausência de comunicação após 90 s. Esses intervalos descrevem uma futura instalação e não são uma integração de hardware ativa neste protótipo.

Caixa e salão são elementos de contexto, sem sensores próprios, câmeras ou contagem de pessoas. O caixa representa registros manuais da equipe. Uma integração com PDS Mesas ainda não está implementada. A cozinha é acompanhada pelos freezers e pelo ramal de água dedicado.

## Arquivos

- `dist/index.html`: entrada.
- `dist/styles.css`: identidade, layout, estados e acessibilidade.
- `dist/theme-light.css`: acabamento do tema claro, contraste, foco e estados dos controles.
- `dist/app.js`: componentes reutilizáveis, navegação, painéis e roteiro automático.
- `dist/model.mjs`: estado compartilhado, simulações e métricas.
- `dist/hardware.mjs`: mapeamento da instrumentação proposta por equipamento, setor e área.
- `dist/dom.mjs`: atualização incremental dos painéis sem reiniciar a animação de abertura.
- `tests/model.test.mjs`: verificações dos fluxos de refrigeração e água.
- `tests/drawer.test.mjs`: regressões de abertura, fechamento, foco, rolagem e atualização de leituras, com DOM em Node e LinkeDOM (dependência de desenvolvimento).

Execute `npm test` e `npm run check` para verificar. Sirva a pasta `dist` por HTTP para uso local. Não abra o HTML diretamente por `file://`, pois ele utiliza módulos ES.
