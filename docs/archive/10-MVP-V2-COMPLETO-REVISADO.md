# 10 - MVP v2 — Especificação Completa

> **Escopo revisado:** Módulo Finanças (completo) + Módulo Metas + Módulo Agenda
> **MVP v3:** Saúde, Estudos, Carreira, Hábitos
> **Prazo estimado:** 8–12 semanas

---

## 1. Visão Geral do MVP v2

O MVP v2 é o momento em que o SyncLife para de ser "mais um app de finanças" e começa a ser o
**sistema operacional da vida pessoal**. Para isso, três módulos precisam estar funcionando e
integrados entre si:

- 💰 **Finanças** — versão completa, com planejamento futuro e projeção de fluxo de caixa
- 🎯 **Metas** — criar, acompanhar e conectar metas com finanças e agenda
- 📅 **Agenda** — compromissos, bloqueios de tempo, integração com metas

A regra de ouro do MVP v2: **o usuário deve conseguir enxergar como hoje (finanças) impacta amanhã
(metas) e como organizar seu tempo (agenda) para chegar lá.**

---

## 2. MÓDULO FINANÇAS — Completo

### 2.1 Transações Recorrentes

#### O que o usuário vê e faz

O usuário acessa "Recorrentes" no menu de finanças e vê uma lista de todas as transações que
acontecem automaticamente todo mês (ou semana, ou ano). Pode criar uma nova recorrente
informando: valor, categoria, tipo (despesa ou receita), frequência, data de início, data de
fim (opcional) e descrição. A partir do momento em que cria, o sistema passa a gerar
automaticamente a transação no período configurado, sem que o usuário precise fazer nada.

**Exemplo de uso:** O usuário cadastra "Netflix — R$ 47,90 — todo dia 15 — despesa — Lazer". A
partir daí, todo mês no dia 15 uma transação de R$ 47,90 aparece automaticamente no extrato.

#### Regras de Negócio

- Uma transação recorrente gera uma instância (transação real) automaticamente na data configurada.
- O sistema verifica transações pendentes a cada login e ao abrir o módulo de finanças.
- Frequências suportadas: diária, semanal, quinzenal, mensal, bimestral, trimestral, semestral, anual.
- O usuário pode pausar ou encerrar uma recorrente sem excluir o histórico gerado.
- Ao excluir uma recorrente, o sistema pergunta: "Excluir somente as futuras ou também as passadas?"
- Transações recorrentes que geraram instâncias passadas não podem ter valor retroativo alterado
  (apenas as futuras são afetadas pela edição).
- No calendário financeiro e na projeção futura, recorrentes aparecem como eventos previstos.
- Limite FREE: 5 recorrentes ativas. Limite PRO: ilimitadas.

---

### 2.2 Sistema de Orçamentos (Modelo Envelope)

#### O que o usuário vê e faz

Na tela de Orçamentos, o usuário distribui sua renda mensal em "envelopes" por categoria. É como
dividir o dinheiro físico em envelopes antes de gastar: você sabe exatamente quanto tem para cada
coisa. O usuário informa sua renda total esperada para o mês e o sistema sugere uma distribuição
baseada na regra 50-30-20 (50% necessidades, 30% desejos, 20% poupança/metas). O usuário pode
aceitar a sugestão ou personalizar livremente.

Cada envelope mostra: valor alocado, quanto já gastou, quanto resta, e uma barra de progresso
colorida (verde → amarela → vermelha conforme o gasto avança).

**Exemplo de uso:** Renda de R$ 5.000. O sistema sugere: Moradia R$ 1.500, Alimentação R$ 800,
Transporte R$ 400, Contas R$ 300, Saúde R$ 200, Lazer R$ 400, Poupança R$ 1.000, Outros R$ 400.
O usuário ajusta Lazer para R$ 300 e adiciona R$ 100 em Educação.

#### Regras de Negócio

- O total dos envelopes não pode exceder a renda informada (o sistema alerta se ultrapassar).
- Se o total for menor que a renda, o saldo restante aparece como "Não alocado" — um envelope
  especial que incentiva o usuário a planejar melhor.
- Alertas automáticos por push/email: ao atingir 75% e 100% de qualquer envelope.
- O usuário pode transferir valor entre envelopes durante o mês (como pegar dinheiro de um
  envelope para outro).
- Orçamento se reinicia no primeiro dia de cada mês (pode ser configurado para outro dia).
- Se o usuário tem uma meta financeira ativa, o sistema sugere criar um envelope para ela.
- Histórico de orçamentos anteriores fica acessível para comparação.
- A sugestão automática de distribuição usa a média dos últimos 3 meses de gastos reais.

---

### 2.3 Planejamento Futuro e Projeção de Fluxo de Caixa ⭐ (Feature Nova)

#### Contexto e Propósito

Esta é a funcionalidade mais estratégica do módulo financeiro. Ela responde à pergunta que todo
usuário tem mas nenhum app brasileiro resolve bem: **"Como vai estar meu dinheiro daqui a 3, 6
ou 12 meses?"**

A visão de planejamento futuro conecta tudo: despesas recorrentes, receitas esperadas, metas
financeiras e eventos pontuais planejados. O usuário consegue enxergar o futuro do seu caixa e
tomar decisões hoje — reduzir gastos, planejar uma compra grande, se motivar a evoluir na
carreira para aumentar a renda.

#### O que o usuário vê e faz

O usuário acessa "Planejamento" no menu de finanças e se depara com uma linha do tempo interativa,
tipo uma régua horizontal que vai do mês atual até 12 meses à frente (padrão). Pode ajustar o
horizonte de visualização para 3, 6 ou 12 meses.

A tela tem três camadas de informação, visíveis ao mesmo tempo:

**Camada 1 — Barra de Saldo Projetado:** Uma linha de saldo que sobe quando entram receitas e
desce quando saem despesas. Se em algum ponto a linha fica vermelha, significa que o saldo
projetado vai ficar negativo naquele período — um alerta visual claro de que algo precisa mudar.

**Camada 2 — Linha do Tempo de Eventos:** Abaixo da barra de saldo, uma linha do tempo mostra
todos os eventos financeiros futuros como "marcadores": receitas recorrentes (salário, freela),
despesas recorrentes (aluguel, streaming, parcelas), metas financeiras com suas contribuições
mensais, e eventos pontuais adicionados manualmente.

**Camada 3 — Painel de Resumo Mensal:** Ao clicar em qualquer mês na linha do tempo, um painel
lateral mostra o detalhamento daquele mês específico: receitas previstas, despesas previstas,
contribuições para metas, saldo inicial, saldo final projetado e diferença em relação ao mês
anterior.

**Exemplo de experiência:** Thiago abre o Planejamento em fevereiro. Vê que em março o saldo
cai muito por conta do IPVA (que ele adicionou como evento pontual). Em junho o saldo bate
um pico porque ele terá PLR no trabalho (também adicionou como evento). O sistema mostra que
se ele mantiver os gastos atuais, em dezembro terá acumulado R$ 8.400 — mas se reduzir R$ 200/mês
em lazer, chegará com R$ 10.800. Essa visualização faz ele tomar uma decisão concreta hoje.

#### O que o usuário pode adicionar manualmente à projeção

Além das transações recorrentes que já entram automaticamente, o usuário pode adicionar:

- **Receita pontual futura:** "PLR de R$ 3.000 em junho"
- **Despesa pontual futura:** "IPVA R$ 1.200 em março", "Viagem R$ 4.000 em julho"
- **Meta financeira:** Quando o usuário cria uma meta (ex: "Juntar R$ 10.000 para viagem"),
  o sistema pergunta "Qual o valor mensal que vai reservar?" e isso entra automaticamente
  na projeção como saída mensal.
- **Aumento de renda:** "A partir de agosto, meu salário passa para R$ 6.500" — o sistema
  ajusta todas as projeções a partir daquela data.

#### Conexão com Outros Módulos

- Se o usuário tem uma meta no módulo de Metas, ela aparece automaticamente na projeção
  como evento financeiro com a contribuição mensal necessária.
- Se o usuário tem um evento na Agenda marcado como "financeiro" (ex: "Matrícula pós-graduação"),
  ele aparece na projeção como despesa pontual.
- O sistema calcula automaticamente: "Mantendo o ritmo atual, você atinge sua meta X em [data]."
  Se o ritmo for insuficiente, mostra: "No ritmo atual, sua meta ficará para [data mais longe].
  Quer ajustar o valor mensal?"

#### Insights Automáticos com IA

No topo da tela de Planejamento, um card de insights mostra análises geradas pela IA:

- "Você tem R$ 340/mês não alocados. Quer direcionar para alguma meta?"
- "Seu maior gasto fixo é Moradia (38% da renda). A recomendação é manter abaixo de 35%."
- "Se você adicionar R$ 200/mês de aporte, sua meta de viagem antecipa 2 meses."
- "Em outubro você terá 4 despesas grandes no mesmo mês. Considere se preparar."

#### Regras de Negócio

- O horizonte padrão de projeção é 6 meses; ajustável para 3 ou 12.
- O saldo inicial da projeção é o saldo real atual do usuário (soma de todas as transações).
- Transações recorrentes entram automaticamente na projeção sem ação do usuário.
- Eventos pontuais futuros podem ter uma data exata ou um mês genérico ("em março").
- O sistema distingue "comprometido" (recorrente já cadastrada) de "planejado" (evento manual)
  — cores diferentes na linha do tempo (azul = comprometido, roxo = planejado).
- Quando o saldo projetado fica negativo em qualquer período, o sistema exibe um alerta
  vermelho e sugere ações: "Você pode pausar X recorrente ou reduzir Y orçamento."
- Eventos futuros não geram transações reais até a data chegar — são apenas projeções.
- Ao chegar na data de um evento pontual planejado, o sistema notifica: "Você havia planejado
  [IPVA R$ 1.200] para hoje. Essa despesa aconteceu? [Sim, registrar] [Não, remover]"
- Limite FREE: visualização de 3 meses, sem eventos pontuais futuros. PRO: 12 meses + ilimitados.

---

### 2.4 Calendário Financeiro

#### O que o usuário vê e faz

Uma visão de calendário mensal (igual a um calendário de parede) onde cada dia mostra os eventos
financeiros: transações já registradas e transações recorrentes futuras do mês. O usuário clica
em um dia para ver o detalhamento e pode adicionar uma transação diretamente clicando no dia.

Diferente da lista de transações (que é passado) e da projeção (que é futuro), o calendário
financeiro mostra **o mês como um todo — passado e futuro juntos** — para que o usuário saiba
exatamente o que já aconteceu e o que ainda vai acontecer naquele mês.

**Indicadores visuais por dia:**
- Ponto verde: dia com receita
- Ponto vermelho: dia com despesa
- Ponto azul: transação recorrente prevista (ainda não ocorreu)
- Número abaixo de cada dia: saldo acumulado naquele ponto do mês

#### Regras de Negócio

- O mês começa com o saldo final do mês anterior.
- Dias futuros mostram o saldo projetado com base nas recorrentes.
- Clicar em um dia abre uma lista lateral com todas as transações daquele dia.
- O usuário pode adicionar transações clicando em qualquer dia (passado ou futuro).
- Transações futuras adicionadas pelo calendário entram na projeção do Planejamento.

---

### 2.5 Relatórios e Exportação

#### O que o usuário vê e faz

Na seção "Relatórios", o usuário escolhe um período (mês específico, trimestre, semestre ou
ano) e recebe um relatório completo com: resumo executivo em texto gerado por IA, gráficos
de evolução, top 5 categorias de gasto, comparativo com período anterior, e insights de
tendência. Pode exportar em PDF formatado, Excel com planilha de dados brutos, ou CSV.

#### Regras de Negócio

- Relatório mensal gerado automaticamente nos primeiros 5 dias do mês seguinte.
- O PDF exportado tem o logo do SyncLife, nome do usuário e período.
- CSV exporta todas as transações do período com todos os campos.
- Excel exporta com abas: Resumo, Transações, Por Categoria, Orçamentos.
- Limite FREE: apenas relatório do mês atual. PRO: qualquer período.

---

### 2.6 Dark Mode

#### O que o usuário vê e faz

Nas configurações, o usuário escolhe entre Claro, Escuro ou Automático (segue o sistema
operacional do dispositivo). A mudança aplica instantaneamente sem recarregar a página.

#### Regras de Negócio

- Preferência salva no perfil do usuário (persiste entre dispositivos).
- Padrão: Escuro (o MVP v1 já é dark por design).
- Automático: respeita `prefers-color-scheme` do SO.

---

### 2.7 Insights com IA (Financial Copilot)

#### O que o usuário vê e faz

Um card no dashboard chamado "💡 Seu Consultor Financeiro" aparece todo mês com uma análise
personalizada em texto corrido (não bullets, não dados — texto de verdade, como um consultor
que conhece você). O usuário pode também fazer perguntas diretamente no card:
"Por que gastei mais em março?", "Estou no caminho para minha meta?", "Onde posso reduzir?"

#### Regras de Negócio

- A análise mensal é gerada automaticamente no dia 5 de cada mês com dados do mês anterior.
- O usuário pode regenerar a análise manualmente (máximo 3x/dia FREE, ilimitado PRO).
- Perguntas livres: FREE tem 5 perguntas/mês, PRO tem ilimitado.
- A IA só acessa dados do usuário atual — nunca dados de terceiros.
- Toda resposta da IA tem o aviso: "Esta é uma análise automatizada, não constitui consultoria
  financeira profissional."
- Implementação: Edge Function no Supabase chamando API da Anthropic com contexto dos dados.

---

### 2.8 Conquistas Financeiras

#### O que o usuário vê e faz

Uma tela de conquistas (acessível pelo perfil) mostra badges desbloqueados e os próximos
a desbloquear. Conquistas desbloqueadas aparecem com uma notificação celebrativa no app.

**Conquistas do Módulo Financeiro:**
- 🔥 Semana Consistente — 7 dias registrando pelo menos uma transação
- 🔥🔥 Mês Consistente — 30 dias registrando pelo menos uma transação
- 💚 Primeiro Mês no Verde — fechar um mês com saldo positivo
- 🎯 Orçamento Respeitado — fechar o mês sem estourar nenhum envelope
- 📊 Planejador — criar seu primeiro planejamento futuro
- 🔄 Automatizado — cadastrar 3 ou mais transações recorrentes
- 💰 Poupador — acumular 3 meses consecutivos de saldo positivo

#### Regras de Negócio

- No Modo Foco: conquistas aparecem discretamente (apenas notificação).
- No Modo Jornada: conquistas aparecem com animação celebrativa e mensagem motivacional.
- Conquistas não são removidas mesmo que a condição deixe de ser verdadeira (ex: mês no
  verde → mês no vermelho não retira o badge anterior).

---

## 3. MÓDULO METAS

### 3.1 Visão Geral do Módulo

#### Propósito

O módulo de metas é a alma do SyncLife. É ele que transforma registros do passado em
intenções para o futuro. Uma meta pode ser financeira (juntar dinheiro), pessoal
(ler 12 livros no ano), profissional (tirar uma certificação) ou de hábito (malhar 3x
por semana). O que unifica todas elas no SyncLife é a conexão: metas financeiras ligam
com o orçamento, metas de estudo ligam com a agenda, metas de carreira ligam com ambos.

#### O que o usuário vê ao entrar no módulo

Uma tela com as metas ativas organizadas em cartões visuais. Cada cartão mostra: nome
da meta, ícone/cor escolhidos, progresso visual (barra ou círculo), valor atual vs. alvo,
prazo e um status ("No caminho", "Atrasada", "Concluída"). No topo, um resumo: "Você tem
X metas ativas. Y estão no caminho, Z precisam de atenção."

---

### 3.2 Criar e Editar Metas

#### O que o usuário vê e faz

Ao criar uma meta, um assistente em etapas guia o processo (máximo 4 telas simples):

**Etapa 1 — O que você quer alcançar?**
Nome da meta (ex: "Viagem para Europa"), ícone (lista de emojis/ícones), cor do cartão.
Categoria: Financeira / Pessoal / Profissional / Saúde / Educação / Outro.

**Etapa 2 — Como medir o progresso?**
Tipo de medição:
- **Valor monetário** — "Juntar R$ 15.000" (barra de progresso em reais)
- **Número** — "Ler 12 livros" (progresso em contagem)
- **Percentual** — "Completar 80% do curso" (progresso em %)
- **Sim/Não** — "Tirar CNH" (concluído ou não)

**Etapa 3 — Quando você quer concluir?**
Data de prazo. O sistema calcula automaticamente: "Para chegar lá, você precisa de
[X] por [semana/mês]" — e mostra se o ritmo atual é suficiente.

**Etapa 4 — Como essa meta conecta com outras áreas?**
- Se for financeira: "Quer criar um envelope no orçamento para essa meta?"
  → Sistema cria automaticamente e vincula.
- Se tiver ações regulares: "Quer agendar blocos de tempo na Agenda para trabalhar
  nessa meta?" → Vai para o módulo de Agenda já com a meta pré-selecionada.
- "Quer receber lembretes de progresso?" → Configura frequência de notificação.

#### Regras de Negócio

- Limit FREE: 3 metas ativas simultâneas. PRO: ilimitadas.
- Uma meta "concluída" não pode ter progresso editado retroativamente.
- Ao excluir uma meta, pede confirmação e informa: "O envelope vinculado no orçamento
  também será removido. Confirmar?"
- Metas financeiras vinculadas ao orçamento: quando a categoria do envelope recebe
  uma transação marcada como "contribuição para meta", o progresso da meta avança.
- O prazo pode ser alterado a qualquer momento — o sistema recalcula o ritmo necessário.
- Metas sem prazo são válidas mas não geram alertas de atraso.

---

### 3.3 Registrar Progresso

#### O que o usuário vê e faz

**Para metas financeiras:** O progresso avança automaticamente quando transações vinculadas
são registradas. O usuário também pode fazer um "aporte manual" informando um valor.

**Para metas de contagem/percentual:** O usuário clica em "Registrar progresso" no cartão
da meta e informa o novo valor ou quanto avançou. Ex: "Terminei mais 1 livro" → progresso
vai de 3 para 4 (de 12).

**Para metas Sim/Não:** Há um botão "Concluir Meta" com confirmação.

Um histórico de todos os registros de progresso fica acessível no detalhe da meta, com data
e hora de cada atualização.

#### Regras de Negócio

- Progresso não pode ser retroativo — só é possível registrar a data atual ou futura.
- Cada registro de progresso pode ter uma nota opcional ("Terminei o livro de Clean Code!").
- No Modo Jornada, cada registro de progresso dispara uma mensagem motivacional personalizada.
- Se o progresso parar por 14 dias em uma meta com prazo, o sistema envia notificação:
  "Faz 2 semanas que [meta] não teve atualizações. Como está o progresso?"

---

### 3.4 Visão de Progresso e Análise

#### O que o usuário vê e faz

Dentro de cada meta, uma tela de detalhe mostra:
- Progresso atual com visualização gráfica (linha do tempo de progresso)
- Ritmo atual vs. ritmo necessário para bater o prazo
- Projeção: "No ritmo atual, você vai concluir em [data]"
- Histórico de todas as atualizações
- Para metas financeiras: impacto no fluxo de caixa (quanto está sendo reservado/mês)

**Exemplo:** Meta "Juntar R$ 15.000 para Europa — prazo: dezembro". Hoje é fevereiro,
acumulado R$ 2.500. O sistema mostra: "Você precisa de R$ 1.250/mês. Seu ritmo atual é
R$ 800/mês. Se continuar assim, vai chegar em fevereiro do próximo ano — 2 meses atrasado.
Quer aumentar o aporte para R$ 1.250?"

#### Regras de Negócio

- A projeção é calculada com base na média dos últimos 3 registros de progresso.
- Se não há registros suficientes (< 3), usa o ritmo necessário para cumprir o prazo.
- O status da meta muda automaticamente: "No caminho" / "Em risco" (< 80% do ritmo) /
  "Atrasada" (prazo ultrapassado sem conclusão) / "Concluída".

---

### 3.5 Celebração de Conclusão

#### O que o usuário vê e faz

Ao concluir uma meta (marcar como Sim/Não ou atingir 100% do valor), o app exibe uma tela
de celebração: animação de confetes, mensagem personalizada com o nome da meta, um badge
especial adicionado ao perfil, e opção de "Compartilhar conquista" (gera uma imagem para
redes sociais).

**Exemplo de mensagem (Modo Jornada):** "🎉 Parabéns, Thiago! Você juntou R$ 15.000 para
a Europa em 10 meses. Isso exigiu consistência e planejamento. Você conseguiu! O que vem
a seguir?"

No Modo Foco: "✅ Meta concluída: Viagem para Europa — R$ 15.000 em 10 meses."

---

### 3.6 Metas e a Conexão com Planejamento

Toda meta financeira aparece automaticamente na tela de Planejamento Futuro como um evento
mensal recorrente (o aporte) e como um evento pontual no prazo (a conclusão esperada). Isso
fecha o ciclo: o usuário cria uma meta, vê o impacto no fluxo de caixa futuro, e decide se
é viável ou se precisa ajustar a renda ou reduzir outros gastos. A motivação para evoluir na
carreira vem naturalmente: aumentar a renda é a forma mais eficaz de atingir mais metas mais rápido.

---

## 4. MÓDULO AGENDA

### 4.1 Visão Geral do Módulo

#### Propósito

A Agenda no SyncLife não é um calendário comum. Ela é a camada de **tempo** do sistema
operacional da vida. Onde as Metas dizem "o que você quer", a Agenda diz "quando você vai
fazer". A conexão entre os dois módulos é o diferencial: ao criar uma meta, o sistema
sugere blocos de tempo para trabalhar nela. A Agenda também exibe eventos financeiros
(contas a pagar, aporte de meta) para que o usuário veja dinheiro e tempo no mesmo lugar.

#### O que o usuário vê ao entrar no módulo

Uma visão semanal padrão (pode alternar para diária ou mensal), com slots de horário.
Eventos aparecem coloridos por tipo: azul (compromissos pessoais), verde (metas/foco),
vermelho (financeiro/pagar), roxo (trabalho/carreira), amarelo (saúde).

---

### 4.2 Criar Eventos e Compromissos

#### O que o usuário vê e faz

Ao clicar em qualquer slot de horário, um painel lateral abre para criar um evento.
Campos: título, data/hora início e fim, tipo/categoria, descrição, repetição (não repete,
diariamente, semanalmente, mensalmente), lembrete (5 min, 15 min, 1h, 1 dia antes), e
se tem vínculo com uma meta ativa.

**Exemplos de eventos:**
- "Reunião cliente" — tipo Trabalho — terça 14h-15h
- "Estudar React" — tipo Meta > vinculado à meta "Aprender Next.js" — toda segunda 19h-21h
- "Pagar aluguel" — tipo Financeiro — dia 5 de cada mês — lembrete 2 dias antes
- "Consulta médica" — tipo Saúde — quinta 10h

#### Regras de Negócio

- Eventos de meta vinculada contabilizam "tempo investido" no histórico da meta.
- Eventos financeiros vinculados a transações recorrentes são criados automaticamente
  (o usuário pode desativar essa sincronização nas configurações).
- Conflito de horário: o sistema alerta mas não impede a criação.
- Eventos recorrentes: editar um evento recorrente pergunta "Alterar só este" ou "Alterar todos".
- Limite FREE: 50 eventos/mês. PRO: ilimitado.

---

### 4.3 Visões de Calendário

O usuário pode alternar entre três visões:

**Visão Diária:** Slots de hora em hora do dia, com todos os eventos daquele dia. No topo,
um mini resumo: "Hoje: 3 compromissos, 1 bloco de foco agendado, 1 conta a pagar."

**Visão Semanal (padrão):** A semana inteira em colunas, com eventos sobrepostos por horário.
À esquerda, um mini calendário mensal para navegar rapidamente.

**Visão Mensal:** Visão de mês inteiro com pontos coloridos por dia indicando tipos de eventos.
Útil para planejamento de alto nível.

#### Regras de Negócio

- A visão padrão pode ser configurada pelo usuário nas preferências.
- Navegação entre semanas/meses com setas ou swipe (mobile).
- No mobile, a visão padrão é a diária; no desktop, a semanal.

---

### 4.4 Blocos de Foco para Metas

#### O que o usuário vê e faz

Esta é a feature de conexão mais importante entre Agenda e Metas. Ao abrir uma meta, o
usuário vê um botão "Agendar sessão de foco". Ao clicar, é direcionado para a Agenda com
um formulário pré-preenchido: evento do tipo Meta, vinculado à meta escolhida, e sugere
horários com base na disponibilidade da semana (slots sem eventos).

**Exemplo:** Meta "Aprender inglês". O usuário clica em "Agendar sessão de foco", escolhe
"toda terça e quinta às 7h por 45 minutos". O sistema cria eventos recorrentes na agenda,
cor verde, vinculados à meta. Cada vez que o usuário marca o evento como "Concluído" na
agenda, isso registra progresso na meta automaticamente.

#### Regras de Negócio

- Um bloco de foco concluído na agenda registra o tempo (em minutos) no histórico da meta.
- Para metas do tipo "Sim/Não" ou "Número", o usuário precisa registrar o progresso
  manualmente mesmo após marcar o bloco como concluído.
- A sugestão de horários considera apenas os slots livres da semana atual.
- Máximo de 3 metas com blocos de foco simultâneos no FREE. PRO: ilimitado.

---

### 4.5 Integração Google Calendar

#### O que o usuário vê e faz

Nas configurações, o usuário conecta sua conta Google. A partir daí, eventos do Google
Calendar aparecem na agenda do SyncLife (somente leitura, para não duplicar), e eventos
criados no SyncLife podem ser opcionalmente sincronizados para o Google Calendar.

#### Regras de Negócio

- Sincronização é unidirecional por padrão (Google → SyncLife).
- Sincronização bidirecional disponível apenas no PRO.
- Eventos importados do Google aparecem em cinza (para diferenciar dos criados no SyncLife).
- O usuário pode escolher quais calendários do Google quer importar.
- Feature PRO exclusiva.

---

### 4.6 Visão Unificada (Dashboard da Semana)

#### O que o usuário vê e faz

No dashboard principal do SyncLife, uma seção "Esta Semana" mostra os próximos 7 dias
de forma compacta: compromissos importantes, blocos de foco agendados, contas a pagar
e metas com prazo próximo. Não é a agenda completa — é um resumo executivo da semana
que aparece logo abaixo dos cards financeiros.

---

## 5. ONBOARDING DIAGNÓSTICO (Novo)

### O que o usuário vê e faz

Na primeira vez que o usuário loga após o cadastro, em vez de cair direto no dashboard
em branco, um assistente de configuração em 5 etapas configura o app para ele.

**Etapa 1 — Boas-vindas e modo de uso**
"Olá [nome]! Antes de começar, conta pra mim: como você prefere usar o SyncLife?"
Duas opções visuais grandes: Modo Foco (ícone de mira, "Direto ao ponto. Dados objetivos.")
e Modo Jornada (ícone de planta crescendo, "Acompanhe sua evolução. Insights e motivação.").

**Etapa 2 — Renda mensal**
"Qual é sua renda mensal aproximada? (Isso nos ajuda a sugerir um orçamento)."
Opções: Até R$ 2.000 / R$ 2-5k / R$ 5-10k / Mais de R$ 10k / Prefiro não informar.

**Etapa 3 — Maior desafio financeiro**
"Qual é seu maior desafio financeiro hoje?"
Opções: Controlar gastos / Guardar dinheiro / Pagar dívidas / Começar a investir.
(A resposta personaliza os insights iniciais da IA e os templates sugeridos.)

**Etapa 4 — Primeira meta**
"Você tem algum objetivo financeiro para este ano?"
Campo de texto livre + sugestões: Viagem, Reserva de emergência, Trocar de carro,
Quitar dívida, Fazer pós-graduação. O usuário pode criar a primeira meta aqui mesmo.

**Etapa 5 — Configuração rápida**
Com base nas respostas, o sistema configura automaticamente:
- Orçamento sugerido (envelopes por categoria com base na renda informada e na regra 50-30-20)
- Primeira meta criada (se respondeu a etapa 4)
- Alertas ativados ou desativados (baseado no modo escolhido)
Tela de confirmação: "Pronto! Configuramos isso para você. Pode ajustar a qualquer momento."

### Regras de Negócio

- O onboarding só aparece uma vez (flag `onboarding_completed` no perfil).
- O usuário pode pular qualquer etapa clicando em "Depois".
- Se pular, as configurações ficam com os padrões do sistema.
- O onboarding pode ser "refeito" nas configurações (botão "Reconfigurar SyncLife").

---

## 6. MODO FOCO vs. MODO JORNADA — Especificação de UX/UI

### Diferenças por Elemento de Interface

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| **Saudação no header** | "Fevereiro 2026" | "Boa tarde, Thiago! 🌟" |
| **Dashboard** | Cards compactos, só números | Cards + Life Sync Score + frase do dia |
| **Cores** | Tons frios: slate, azul, cinza | Tons quentes: índigo, violeta, âmbar |
| **Animações** | Nenhuma | Micro-animações suaves |
| **Alertas de orçamento** | "Alimentação: 80% usado" | "Quase lá em Alimentação! Faltam R$ 80 para o limite" |
| **Conquistas** | Notificação discreta | Tela celebrativa com confetes |
| **Progresso de meta** | Barra e número | Barra + percentual + mensagem motivacional |
| **Insights da IA** | Tom direto e técnico | Tom empático e motivacional |
| **Review semanal** | Desabilitado | Ativado (resumo todo domingo à noite) |
| **Life Sync Score** | Não aparece | Card proeminente no dashboard |
| **Sidebar** | Só ícones (compacta) | Ícones + labels + score mini |
| **Empty states** | "Nenhuma transação registrada" | "Que tal registrar o primeiro gasto do mês?" |
| **Mensagem ao abrir** | Nenhuma | Frase motivacional rotativa |

### Como o usuário muda de modo

Nas configurações, uma seção "Meu modo de uso" com toggle visual entre os dois modos.
A mudança aplica imediatamente. Um toast aparece: "Modo [X] ativado. A interface foi
atualizada para você."

---

## 7. SISTEMA DE NOTIFICAÇÕES E ALERTAS

### Tipos de Notificação

| Tipo | Modo Foco | Modo Jornada | Canal |
|------|-----------|--------------|-------|
| Orçamento 75% | ✅ | ✅ | Push + In-app |
| Orçamento 100% | ✅ | ✅ | Push + In-app |
| Recorrente gerada | ❌ | ✅ | In-app |
| Lembrete de registro | ❌ | ✅ (configurável) | Push |
| Review semanal (domingo) | ❌ | ✅ | Push |
| Conquista desbloqueada | In-app discreto | Push + tela celebrativa | Push + In-app |
| Meta em risco | ✅ | ✅ | Push + In-app |
| Meta concluída | ✅ | ✅ | Push + tela celebrativa |
| Saldo projetado negativo | ✅ | ✅ | Push + In-app |
| Insight mensal da IA | ✅ | ✅ | Push + In-app |
| Evento financeiro (dia anterior) | ✅ | ✅ | Push |
| Inatividade 7 dias | ❌ | ✅ | Push |

### Configurações de Notificação

O usuário pode personalizar cada tipo de notificação na tela de configurações:
ativar/desativar individualmente, escolher horário de lembretes diários, e escolher
se quer receber por push, email ou ambos.

---

## 8. PWA (Progressive Web App)

### O que o usuário experimenta

Ao acessar o SyncLife pelo celular, um banner aparece: "Instale o SyncLife na sua tela
inicial para acesso rápido e notificações." Ao instalar, o ícone aparece na tela inicial
do celular igual a um app nativo. O app funciona offline para leitura dos dados já
carregados, e sincroniza quando a conexão volta.

### Regras de Negócio

- Offline: o usuário consegue ver dashboard, transações e agenda sem internet.
- Offline: criação de transações funciona localmente e sincroniza ao voltar online.
- Offline: não é possível gerar insights da IA (requer conexão).
- Push notifications dependem de permissão concedida no navegador.
- No iOS (Safari): o banner de instalação é manual (Add to Home Screen), pois o iOS
  não suporta o evento `beforeinstallprompt`. O sistema guia o usuário com instruções.

---

## 8.5 TABELA CENTRALIZADA — Limites FREE vs PRO

> **Adição (23/02/2026):** Tabela consolidada de todos os limites por plano,
> extraída de todas as seções do MVP v2. Usar esta tabela como referência única
> no desenvolvimento para implementar os gates de upsell.

| Recurso | Plano FREE | Plano PRO | Onde implementar |
|---------|-----------|-----------|-----------------|
| **Finanças** | | | |
| Transações recorrentes ativas | 5 | Ilimitadas | Tela de Recorrentes |
| Horizonte de projeção futura | 3 meses | 12 meses | Tela de Planejamento |
| Eventos pontuais na projeção | ❌ Não disponível | ✅ Ilimitados | Tela de Planejamento |
| Relatórios | Apenas mês atual | Qualquer período | Tela de Relatórios |
| Exportação (PDF/Excel/CSV) | Apenas mês atual | Qualquer período | Tela de Relatórios |
| **Metas** | | | |
| Metas ativas simultâneas | 3 | Ilimitadas | Tela de Metas / Nova Meta |
| Metas com blocos de foco | 3 | Ilimitadas | Detalhe da Meta / Agenda |
| **Agenda** | | | |
| Eventos por mês | 50 | Ilimitados | Tela de Agenda |
| Google Calendar Sync | ❌ Não disponível | ✅ Bidirecional | Configurações |
| **IA** | | | |
| Perguntas ao Consultor IA | 5/mês | Ilimitadas | Card do Consultor IA |
| Regenerar análise IA | 3/dia | Ilimitado | Card do Consultor IA |
| **Notificações** | | | |
| Review semanal (domingo) | ❌ (Modo Jornada) | ✅ | Configurações |
| Lembrete de registro diário | ❌ | ✅ (configurável) | Configurações |

### Regras de implementação dos gates de upsell

1. **Soft limit:** Quando o usuário atinge 80% do limite FREE, exibir banner discreto:
   "Você está usando 4 de 5 recorrentes. [Upgrade para ilimitadas]"
2. **Hard limit:** Quando atinge 100%, bloquear a ação com modal de upgrade:
   "Limite atingido. Faça upgrade para PRO para continuar. [Ver planos]"
3. **Preview lock:** Para recursos exclusivos PRO, exibir o UI com um overlay de lock:
   visualização parcial + ícone de cadeado + "Disponível no PRO"
4. **Nenhum dado é perdido:** Se o usuário fizer downgrade de PRO para FREE e tiver
   mais itens que o limite, os itens existentes continuam visíveis (somente leitura)
   mas novos não podem ser criados até que esteja dentro do limite.

---

## 9. MODELO DE DADOS — Adições ao v1

```sql
-- Eventos futuros planejados (Planejamento Futuro)
CREATE TABLE future_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    event_date DATE NOT NULL,
    category_key TEXT,
    category_id UUID REFERENCES categories(id),
    is_recurring_ref UUID REFERENCES recurring_transactions(id),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metas
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,  -- 'financial', 'personal', 'professional', 'health', 'education', 'other'
    measure_type TEXT NOT NULL CHECK (measure_type IN ('monetary', 'numeric', 'percentage', 'boolean')),
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    deadline DATE,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#6366f1',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    monthly_contribution DECIMAL(12,2),  -- valor mensal para metas financeiras
    budget_category_id UUID REFERENCES categories(id),  -- envelope vinculado
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Progresso das metas
CREATE TABLE goal_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    value_added DECIMAL(12,2) NOT NULL,
    total_after DECIMAL(12,2) NOT NULL,
    note TEXT,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Eventos da Agenda
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,  -- 'personal', 'work', 'financial', 'health', 'goal_focus'
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    goal_id UUID REFERENCES goals(id),  -- vínculo com meta (opcional)
    recurrence TEXT,  -- 'none', 'daily', 'weekly', 'monthly'
    recurrence_end DATE,
    reminder_minutes INTEGER,  -- minutos antes para lembrete
    is_completed BOOLEAN DEFAULT FALSE,
    external_calendar_id TEXT,  -- ID no Google Calendar (para sync)
    color TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notificações configuradas pelo usuário
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
    budget_75 BOOLEAN DEFAULT TRUE,
    budget_100 BOOLEAN DEFAULT TRUE,
    goal_at_risk BOOLEAN DEFAULT TRUE,
    goal_completed BOOLEAN DEFAULT TRUE,
    weekly_review BOOLEAN DEFAULT TRUE,
    daily_reminder BOOLEAN DEFAULT FALSE,
    daily_reminder_time TIME DEFAULT '20:00',
    inactivity_alert BOOLEAN DEFAULT TRUE,
    ai_insights BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    email_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Life Sync Score (histórico)
CREATE TABLE life_sync_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    financial_component INTEGER,
    goals_component INTEGER,
    consistency_component INTEGER,
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Conquistas desbloqueadas
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    achievement_key TEXT NOT NULL,  -- 'first_week', 'first_month_green', etc.
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_key)
);

-- Atualizar profiles para novos campos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'focus';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Transações recorrentes (se ainda não existe)
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_key TEXT,
    category_id UUID REFERENCES categories(id),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','biweekly','monthly','bimonthly','quarterly','semiannual','annual')),
    start_date DATE NOT NULL,
    end_date DATE,
    day_of_month INTEGER,
    last_generated DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 10. TELAS DO MVP v2

### Novas Telas

| Tela | Descrição | Módulo |
|------|-----------|--------|
| `/planejamento` | Projeção de fluxo de caixa futuro | Finanças |
| `/calendario-financeiro` | Calendário mensal com transações | Finanças |
| `/orcamentos` | Sistema de envelopes por categoria | Finanças |
| `/recorrentes` | Gestão de transações recorrentes | Finanças |
| `/relatorios` | Relatórios e exportação | Finanças |
| `/metas` | Lista de metas ativas | Metas |
| `/metas/nova` | Wizard de criação de meta | Metas |
| `/metas/[id]` | Detalhe e progresso de uma meta | Metas |
| `/agenda` | Calendário semanal | Agenda |
| `/onboarding` | Diagnóstico inicial (1x) | Core |
| `/conquistas` | Badges e histórico de conquistas | Core |

---

## 11. CRITÉRIOS DE SUCESSO DO MVP v2

| Critério | Meta | Como Medir |
|----------|------|------------|
| PWA instalável iOS e Android | 100% funcional | Teste manual |
| Usuários ativos semanais | 100+ | Analytics |
| Retenção D7 | > 30% | Analytics |
| Retenção D30 | > 15% | Analytics |
| Metas criadas por usuário ativo | > 1 | Supabase query |
| NPS | > 40 | Pesquisa in-app |
| Erros críticos/semana | < 5 | Sentry |
| Conversão FREE → PRO | > 5% | Analytics |

---

*Documento criado em: Fevereiro 2026*
*Versão: 1.1 — Tabela FREE/PRO centralizada + regras de upsell adicionadas (23/02/2026)*
