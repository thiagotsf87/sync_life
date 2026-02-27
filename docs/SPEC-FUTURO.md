# SPEC-FUTURO — 🔮 Módulo Futuro

> **Objetivos e Metas de Vida**
> **Versão:** 1.0 — Fevereiro 2026
> **Módulo:** Futuro (antigo "Metas" — reestruturado)
> **Dependências:** Todos os demais módulos (Futuro é o módulo conector)

---

## 1. VISÃO GERAL

### 1.1 O que é o Módulo Futuro

O Futuro é o **cockpit central da vida** do usuário no SyncLife. Ele não armazena dados operacionais (transações, consultas, trilhas de estudo) — isso é responsabilidade de cada módulo individual. O Futuro armazena **o propósito**: os objetivos de vida do usuário e as metas mensuráveis que os compõem.

Enquanto os outros módulos respondem "como está minha saúde?" ou "como estão minhas finanças?", o Futuro responde a pergunta mais poderosa: **"Como está meu futuro?"**

### 1.2 O Problema que Resolve

Apps tradicionais de metas (Habitica, Strides, Way of Life) tratam metas como itens isolados: "perder 5kg", "economizar R$ 10.000", "ler 12 livros". Isso gera três problemas:

1. **Falta de propósito:** O usuário sabe que quer economizar R$ 10.000, mas esquece que é para a viagem dos sonhos
2. **Visão fragmentada:** Meta financeira vive num app, meta de saúde em outro, meta de estudo em outro
3. **Sem conexão:** O usuário não percebe que estudar React o aproxima da promoção que financia a casa própria

O Futuro resolve os três: agrupa metas sob um propósito (Objetivo), centraliza tudo num lugar (cockpit), e mostra conexões (uma hora de estudo = progresso na promoção = mais dinheiro para a casa).

### 1.3 Conceitos Fundamentais

#### Objetivo (O sonho com intenção)

Um **Objetivo** é qualitativo e aspiracional. Representa algo que o usuário deseja conquistar na vida. É definido por uma frase curta e uma motivação.

Exemplos:
- "Comprar minha casa própria"
- "Viajar para o Japão"
- "Ser promovido a gerente"
- "Atingir independência financeira"
- "Ficar saudável e ativo"
- "Dominar inglês fluente"

O Objetivo responde: **"O que eu quero para minha vida?"**

#### Meta (O caminho mensurável)

Uma **Meta** é quantitativa e concreta. É o indicador mensurável que mostra progresso rumo a um Objetivo. Cada Meta pertence a um módulo específico do SyncLife.

Exemplos:
- "Economizar R$ 200.000" → Módulo Finanças
- "Completar certificação JLPT N3" → Módulo Mente
- "Perder 10kg" → Módulo Corpo
- "Atingir patrimônio de R$ 2.000.000" → Módulo Patrimônio
- "Concluir roadmap para Gerente" → Módulo Carreira

A Meta responde: **"Como sei que estou progredindo?"**

#### Relação Objetivo → Meta

Um Objetivo pode ter **1 a N Metas** distribuídas em **1 a N módulos diferentes**. Essa é a essência do SyncLife v3: um sonho é multidimensional.

```
🔮 Objetivo: "Comprar minha casa própria"
│
├── 💰 Meta: "Economizar R$ 200.000 para entrada" (Finanças)
│       → Progresso: R$ 85.000 / R$ 200.000 = 42.5%
│
├── 📈 Meta: "Investir reserva em CDB/Tesouro" (Patrimônio)
│       → Progresso: R$ 85.000 investidos com rendimento
│
├── 💼 Meta: "Conseguir promoção para aumentar renda" (Carreira)
│       → Progresso: 3/5 passos do roadmap = 60%
│
└── ⏳ Meta: "Pesquisar imóveis no bairro desejado" (Tempo)
        → Progresso: Tarefa pendente = 0%
```

**Progresso do Objetivo = Média ponderada das Metas**

O usuário pode atribuir pesos diferentes a cada meta (padrão: peso igual). No exemplo acima, se todas têm peso igual: (42.5 + 50 + 60 + 0) / 4 = **38.1%**

---

## 2. TELAS PREVISTAS

| Tela | Descrição | Prioridade |
|------|-----------|------------|
| Dashboard Futuro | Cockpit com todos os objetivos, progresso agregado, próximos marcos | Alta |
| Criar Objetivo (Wizard) | Wizard passo a passo para criar objetivo com metas | Alta |
| Detalhe do Objetivo | Visão detalhada com todas as metas, progresso, timeline | Alta |
| Criar/Editar Meta | Formulário de meta com tipo, módulo destino, indicadores | Alta |
| Visão "Mapa da Vida" | Visualização radial/grid mostrando todas as dimensões da vida | Média (Jornada) |
| Timeline de Conquistas | Histórico de marcos atingidos e objetivos concluídos | Média |

---

## 3. FUNCIONALIDADE: DASHBOARD FUTURO

### 3.1 O que o usuário vê e faz

Ao acessar o módulo Futuro, o usuário vê o cockpit da sua vida organizado em:

**Header de Resumo:**
- Total de objetivos ativos
- Progresso geral (média de todos os objetivos)
- Próximo marco previsto (a meta mais próxima de ser concluída)
- Objetivos concluídos este ano

**Lista de Objetivos:**
Cards organizados por prioridade (definida pelo usuário) ou progresso. Cada card mostra:
- Nome do objetivo
- Ícone/emoji escolhido pelo usuário
- Barra de progresso agregada (0-100%)
- Badges dos módulos envolvidos (ícones dos módulos onde há metas)
- Prazo final (se definido) com indicador de prazo (no prazo/atrasado/próximo)
- Número de metas (X de Y concluídas)

**Filtros disponíveis:**
- Por status: Ativos, Concluídos, Pausados, Todos
- Por tipo/categoria: Financeiro, Saúde, Carreira, Educação, Experiência, Pessoal
- Por módulo envolvido: filtrar objetivos que têm metas em determinado módulo
- Por prazo: Com prazo definido, Sem prazo, Vencendo em 30 dias

**Ação principal:** Botão "Novo Objetivo" proeminente no header

### 3.2 Regras de Negócio — Dashboard

- **RN-FUT-01:** O Dashboard exibe objetivos ordenados por: (1) prioridade manual do usuário, ou (2) progresso (maior primeiro), ou (3) prazo mais próximo. Toggle entre ordenações.
- **RN-FUT-02:** Objetivos com prazo vencido e progresso < 100% recebem badge "Atrasado" em vermelho.
- **RN-FUT-03:** O progresso geral do Futuro é calculado como média ponderada dos progressos de todos os objetivos ativos (peso = prioridade do objetivo, se definida, ou peso igual).
- **RN-FUT-04:** Objetivos concluídos são automaticamente movidos para a aba "Concluídos" após 7 dias, com opção de restaurar.
- **RN-FUT-05:** O Dashboard mostra no máximo 10 objetivos ativos na visão principal. Objetivos além disso ficam em seção "Ver todos".
- **RN-FUT-06:** Limite FREE: 3 objetivos ativos simultâneos. PRO: ilimitados.

### 3.3 Critérios de Aceite — Dashboard

- [ ] Cards de objetivos exibem progresso agregado de todas as metas
- [ ] Badges de módulos envolvidos são exibidos corretamente em cada card
- [ ] Filtros por status, tipo e módulo funcionam
- [ ] Ordenação por prioridade/progresso/prazo funciona
- [ ] Indicador de prazo (no prazo/atrasado) é calculado corretamente
- [ ] Progresso geral do Futuro é exibido no header
- [ ] Limite FREE de 3 objetivos é respeitado com upsell para PRO

---

## 4. FUNCIONALIDADE: CRIAR OBJETIVO (WIZARD)

### 4.1 O que o usuário vê e faz

O Wizard de criação de Objetivo guia o usuário em 4 etapas:

**Etapa 1 — O Sonho**
- Nome do objetivo (texto livre, máx. 100 caracteres)
  - Exemplo: "Comprar minha casa própria"
- Descrição/Motivação (texto livre, opcional, máx. 500 caracteres)
  - Exemplo: "Quero sair do aluguel e ter estabilidade para minha família"
- Ícone/Emoji (seletor com emojis + ícones predefinidos)
- Categoria/Tipo:
  - 💰 Financeiro (comprar algo, quitar dívida, atingir valor)
  - 🏃 Saúde (emagrecer, ganhar massa, hábito de exercício)
  - 💼 Profissional (promoção, mudança de carreira, certificação)
  - 🧠 Educacional (curso, idioma, habilidade)
  - ✈️ Experiência (viagem, evento, hobby)
  - 🏠 Pessoal (relacionamento, moradia, estilo de vida)
  - ⭐ Outro (campo livre)

**Etapa 2 — O Prazo**
- Tem prazo definido? (Sim/Não)
- Se sim: data alvo (date picker)
- Prioridade: Alta, Média, Baixa (define ordenação no Dashboard)
- "Por que essa data?": campo opcional para o usuário lembrar da motivação do prazo

**Etapa 3 — As Metas**
O coração do wizard. O usuário cria as metas que compõem o objetivo.

Para cada meta, informa:
- Nome da meta (texto livre)
- **Módulo destino** (dropdown com os módulos do SyncLife que o usuário tem ativos):
  - 💰 Finanças — meta financeira (valor a economizar/investir)
  - ⏳ Tempo — tarefa com prazo (algo a fazer/agendar)
  - 🏃 Corpo — meta de saúde (peso, exercício, hábito)
  - 🧠 Mente — meta de aprendizado (trilha, horas, curso)
  - 📈 Patrimônio — meta patrimonial (valor investido, renda passiva)
  - 💼 Carreira — meta profissional (step do roadmap, habilidade)
  - ✈️ Experiências — meta de experiência (viagem planejada)
- **Tipo de indicador** (depende do módulo selecionado):
  - Financeiro: valor alvo em R$, valor atual, prazo
  - Tarefa: sim/não (concluído ou não)
  - Peso: peso alvo em kg
  - Frequência: X vezes por semana/mês
  - Porcentagem: progresso manual 0-100%
  - Quantidade: número inteiro (livros lidos, certificações, etc.)
  - Vinculação: vincular a item existente do módulo (trilha de estudo, step de roadmap, etc.)
- **Peso** (importância relativa): padrão 1.0, ajustável de 0.5 a 3.0

O wizard sugere metas com base no tipo de objetivo selecionado:
- Tipo "Financeiro" → sugere meta de economia (Finanças) + meta de investimento (Patrimônio)
- Tipo "Profissional" → sugere meta de estudo (Mente) + step de roadmap (Carreira)
- Tipo "Experiência" → sugere meta de economia (Finanças) + tarefa preparatória (Tempo)
- Tipo "Saúde" → sugere meta de peso (Corpo) + meta de exercício (Corpo)

O usuário pode ignorar as sugestões e criar metas manualmente.

**Etapa 4 — Confirmação**
- Resumo do objetivo com todas as metas
- Preview de como vai aparecer no Dashboard
- Indicação de quais módulos serão impactados
- Botão "Criar Objetivo"

### 4.2 Regras de Negócio — Wizard

- **RN-FUT-07:** Cada objetivo precisa de pelo menos 1 meta para ser criado.
- **RN-FUT-08:** Limite FREE: máximo 3 metas por objetivo. PRO: ilimitado.
- **RN-FUT-09:** O módulo destino de uma meta precisa estar ativo no perfil do usuário. Se não estiver, mostrar: "Ative o módulo [Nome] para criar metas nesta área. [Ativar]"
- **RN-FUT-10:** Metas do tipo "Vinculação" permitem conectar a itens existentes no módulo destino. Exemplo: vincular meta a uma trilha de estudo já existente no módulo Mente — o progresso da trilha alimenta automaticamente a meta.
- **RN-FUT-11:** Ao criar meta financeira (módulo Finanças), o sistema pergunta se quer vincular a um item do orçamento existente ou criar um novo.
- **RN-FUT-12:** Ao criar meta de tarefa (módulo Tempo), o sistema cria automaticamente um evento/tarefa na Agenda com o prazo definido.
- **RN-FUT-13:** A sugestão de metas no Wizard é contextual ao tipo selecionado e é apenas sugestão — não obrigatória.
- **RN-FUT-14:** O nome do objetivo não pode ser duplicado (mesmo usuário, mesmo nome = erro).
- **RN-FUT-15:** A data alvo do objetivo deve ser futura (não permite datas passadas).

### 4.3 Critérios de Aceite — Wizard

- [ ] Wizard de 4 etapas navega corretamente (próximo/voltar)
- [ ] Tipos de objetivo exibem sugestões de metas relevantes
- [ ] Dropdown de módulo destino filtra apenas módulos ativos do usuário
- [ ] Tipos de indicador mudam conforme módulo selecionado
- [ ] Vinculação com itens existentes (trilhas, roadmap, etc.) funciona
- [ ] Meta financeira pergunta sobre vínculo com orçamento
- [ ] Meta de tarefa cria evento na Agenda automaticamente
- [ ] Resumo de confirmação mostra preview correto
- [ ] Validação de nome duplicado funciona
- [ ] Limite FREE de metas por objetivo é respeitado

---

## 5. FUNCIONALIDADE: DETALHE DO OBJETIVO

### 5.1 O que o usuário vê e faz

Ao clicar em um objetivo no Dashboard, o usuário vê a tela de detalhe com:

**Header do Objetivo:**
- Ícone + Nome do objetivo
- Descrição/Motivação
- Barra de progresso grande (0-100%)
- Prazo com countdown ("Faltam 8 meses e 12 dias") ou "Sem prazo definido"
- Status: Ativo, Pausado, Concluído
- Botões: Editar, Pausar, Concluir, Arquivar

**Seção: Metas**
Cards de cada meta organizados por módulo. Cada card mostra:
- Ícone do módulo + Nome da meta
- Barra de progresso individual
- Valor atual / valor alvo (se aplicável)
- Status: Em andamento, Concluída, Atrasada
- Peso relativo (se diferente de 1.0)
- Link direto: "Ver no módulo [Nome]" que navega para o item vinculado no módulo correspondente
- Último update: data da última atualização de progresso

**Seção: Timeline de Marco**
Histórico cronológico de marcos atingidos:
- "Meta X concluída" com data
- "Progresso ultrapassou 50%" com data
- "Objetivo criado" com data
- "Meta Y adicionada" com data

**Seção: Insights (Modo Jornada)**
- Velocidade de progresso: "No ritmo atual, você atinge este objetivo em X meses"
- Comparativo: "Este mês você progrediu X% — Y% a mais que o mês passado"
- Sugestão: "A meta Z está parada há 15 dias. Que tal revisitar?"

### 5.2 Regras de Negócio — Detalhe

- **RN-FUT-16:** O progresso do objetivo é calculado como:
  ```
  Progresso = Σ (progresso_meta_i × peso_meta_i) / Σ (peso_meta_i)
  ```
  Onde `progresso_meta_i` é um valor de 0 a 100 para cada meta.

- **RN-FUT-17:** O progresso de cada meta é calculado conforme seu tipo de indicador:
  - **Valor monetário:** (valor_atual / valor_alvo) × 100
  - **Peso corporal:** ((peso_inicial - peso_atual) / (peso_inicial - peso_alvo)) × 100
  - **Tarefa:** 0% (pendente) ou 100% (concluída)
  - **Frequência:** (realizações_no_período / meta_no_período) × 100, cap em 100%
  - **Porcentagem:** valor informado manualmente pelo usuário
  - **Quantidade:** (atual / alvo) × 100
  - **Vinculação:** herda progresso do item vinculado (trilha de estudo, step de roadmap, etc.)

- **RN-FUT-18:** Metas vinculadas a itens de outros módulos atualizam progresso automaticamente. Exemplo: se uma meta está vinculada à trilha "React Avançado" no módulo Mente, quando o usuário avança a trilha para 80%, a meta também atualiza para 80%.

- **RN-FUT-19:** Quando todas as metas de um objetivo atingem 100%, o sistema:
  1. Exibe notificação de celebração
  2. Pergunta: "Parabéns! Deseja marcar este objetivo como concluído?"
  3. Se sim: objetivo muda para status "Concluído" e vai para histórico
  4. Gera conquista no sistema de Conquistas

- **RN-FUT-20:** Objetivos pausados não contam no cálculo do Life Sync Score nem no progresso geral do Futuro.

- **RN-FUT-21:** O usuário pode adicionar novas metas a um objetivo existente a qualquer momento.

- **RN-FUT-22:** O usuário pode remover metas de um objetivo. Se for a última meta, deve substituir por outra ou pausar/arquivar o objetivo.

- **RN-FUT-23:** Ao editar um objetivo (nome, prazo, prioridade), um registro de alteração é salvo na timeline de marcos.

- **RN-FUT-24:** A velocidade de progresso é calculada com base nos últimos 30 dias de dados:
  ```
  Velocidade = (progresso_atual - progresso_30_dias_atrás) / 30 × 30
  Previsão = (100 - progresso_atual) / velocidade_diária (em dias)
  ```

- **RN-FUT-25:** Se a velocidade de progresso indica que o objetivo não será atingido no prazo, exibir alerta amarelo: "No ritmo atual, este objetivo será atingido em [data estimada] — [X meses] após o prazo definido."

### 5.3 Critérios de Aceite — Detalhe

- [ ] Header exibe progresso agregado correto
- [ ] Countdown do prazo é calculado corretamente
- [ ] Cards de metas exibem progresso individual correto
- [ ] Link "Ver no módulo" navega para o item correto no módulo correspondente
- [ ] Timeline de marcos registra eventos cronologicamente
- [ ] Metas vinculadas atualizam automaticamente quando item de origem progride
- [ ] Botões de editar/pausar/concluir/arquivar funcionam
- [ ] Notificação de conclusão aparece quando todas as metas atingem 100%
- [ ] Alerta de prazo insuficiente é exibido quando aplicável
- [ ] Adicionar/remover metas de objetivo existente funciona

---

## 6. FUNCIONALIDADE: MAPA DA VIDA (MODO JORNADA)

### 6.1 O que o usuário vê e faz

O Mapa da Vida é uma visualização exclusiva do Modo Jornada que apresenta as 8 dimensões da vida do usuário em formato radial (radar chart) ou grid visual:

**Radar Chart (Roda da Vida):**
Cada eixo representa um módulo ativo. O valor de cada eixo é o progresso médio dos objetivos que têm metas naquele módulo. O resultado é um gráfico tipo "teia de aranha" que mostra visualmente quais áreas da vida estão avançando e quais estão estagnadas.

```
         Finanças (72%)
            │
   Experiências    Corpo
   (45%)    │     (68%)
      \     │     /
       \    │    /
        ────┼────
       /    │    \
      /     │     \
   Carreira │    Patrimônio
   (55%)    │     (40%)
            │
        Mente (80%)
```

**Grid de Dimensões:**
Alternativa ao radar, um grid com 8 cards (um por módulo) mostrando:
- Ícone e nome do módulo
- Número de objetivos ativos naquela dimensão
- Progresso médio da dimensão
- Cor de status: verde (>70%), amarelo (40-70%), vermelho (<40%)
- Insight curto: "Sua área mais forte" ou "Precisa de atenção"

**Frases do Modo Jornada:**
- "Seu Futuro está 64% construído este mês"
- "Você avançou 3 objetivos esta semana — seu melhor ritmo!"
- "Corpo e Mente estão voando, mas Patrimônio precisa de atenção"
- "No ritmo atual, seu objetivo 'Casa própria' será realizado em 18 meses"

### 6.2 Regras de Negócio — Mapa da Vida

- **RN-FUT-26:** O Mapa da Vida é exclusivo do Modo Jornada (PRO).
- **RN-FUT-27:** Cada dimensão do radar é calculada como: média dos progressos dos objetivos que possuem metas naquele módulo. Se não há objetivos com metas naquele módulo, a dimensão aparece vazia/neutra.
- **RN-FUT-28:** O radar atualiza em tempo real conforme o usuário navega pelo app e atualiza dados em qualquer módulo.
- **RN-FUT-29:** Insights são gerados semanalmente comparando progresso da semana atual com a anterior.
- **RN-FUT-30:** O Mapa da Vida também pode ser acessado via Dashboard Home como widget resumido.

### 6.3 Critérios de Aceite — Mapa da Vida

- [ ] Radar chart renderiza corretamente com 8 eixos
- [ ] Valores dos eixos correspondem ao progresso real dos módulos
- [ ] Grid alternativo exibe status correto por módulo
- [ ] Frases motivacionais são geradas com dados reais
- [ ] Feature bloqueada no modo FREE com preview e CTA para PRO

---

## 7. INTEGRAÇÃO COM OUTROS MÓDULOS

### 7.1 Futuro → Finanças

**Metas financeiras do Futuro aparecem no módulo Finanças:**
- Quando uma meta do tipo "Valor monetário" é criada no Futuro com destino Finanças, ela aparece na seção "Metas" do módulo Finanças
- O progresso é bidirecional: atualizar no Finanças reflete no Futuro e vice-versa
- Se o usuário vincular a meta a uma categoria do orçamento, os depósitos naquela categoria avançam o progresso automaticamente

**Regras:**
- **RN-FUT-31:** Meta financeira criada no Futuro gera entrada automática na seção de metas do módulo Finanças com badge "🔮 Objetivo: [nome do objetivo]"
- **RN-FUT-32:** Valor acumulado em categoria vinculada do orçamento alimenta o progresso da meta financeira automaticamente
- **RN-FUT-33:** Se a meta financeira é excluída no Futuro, a entrada no Finanças pergunta: "Deseja manter como meta financeira independente?"

### 7.2 Futuro → Tempo (Agenda)

**Metas de tarefa do Futuro geram eventos na Agenda:**
- Metas do tipo "Tarefa" com prazo criam evento na Agenda automaticamente
- Deadlines de objetivos (prazo final) geram lembrete na Agenda

**Regras:**
- **RN-FUT-34:** Meta tipo "Tarefa" gera evento na Agenda com tag "🔮 Futuro" e referência ao objetivo
- **RN-FUT-35:** Prazo final do objetivo gera lembrete na Agenda 30 dias antes, 7 dias antes e no dia
- **RN-FUT-36:** Ao concluir tarefa na Agenda, a meta correspondente no Futuro atualiza para 100%

### 7.3 Futuro → Corpo

**Metas de saúde vinculadas ao módulo Corpo:**
- Meta de peso alvo → sincroniza com peso alvo no perfil de saúde
- Meta de exercício (frequência) → sincroniza com meta de atividade no Corpo

**Regras:**
- **RN-FUT-37:** Meta de peso criada no Futuro sincroniza com `weight_goal_kg` do perfil de saúde
- **RN-FUT-38:** Progresso de peso atualiza automaticamente conforme registros no módulo Corpo
- **RN-FUT-39:** Meta de exercício sincroniza com meta de atividades semanais no Corpo

### 7.4 Futuro → Mente

**Metas de estudo vinculadas ao módulo Mente:**
- Meta pode ser vinculada a uma trilha de aprendizado existente
- Progresso da trilha alimenta a meta automaticamente

**Regras:**
- **RN-FUT-40:** Meta vinculada a trilha herda progresso: (etapas concluídas / total etapas) × 100
- **RN-FUT-41:** Ao criar meta de estudo sem vincular a trilha existente, sugerir: "Deseja criar uma nova trilha no módulo Mente?"
- **RN-FUT-42:** Conclusão da trilha marca a meta como 100% automaticamente

### 7.5 Futuro → Patrimônio

**Metas patrimoniais vinculadas ao módulo Patrimônio:**
- Meta de patrimônio total → valor alvo comparado com patrimônio investido atual
- Meta de renda passiva → valor alvo comparado com proventos mensais

**Regras:**
- **RN-FUT-43:** Meta de patrimônio total calcula progresso como: (patrimônio investido atual / valor alvo) × 100
- **RN-FUT-44:** Meta de renda passiva calcula progresso como: (proventos médios 12 meses / renda passiva alvo) × 100
- **RN-FUT-45:** Atualização de cotações e aportes refletem automaticamente no progresso da meta

### 7.6 Futuro → Carreira

**Metas profissionais vinculadas ao módulo Carreira:**
- Meta pode ser vinculada a step do roadmap de carreira
- Progresso do step alimenta a meta

**Regras:**
- **RN-FUT-46:** Meta vinculada a step do roadmap herda progresso do step
- **RN-FUT-47:** Conclusão de roadmap inteiro marca todas as metas vinculadas como 100%
- **RN-FUT-48:** Meta de "aumento salarial" compara salário atual com salário alvo do perfil profissional

### 7.7 Futuro → Experiências

**Metas de viagem vinculadas ao módulo Experiências:**
- Meta de economia para viagem → vincula ao orçamento da viagem
- Meta de preparação → tarefas como passaporte, reservas

**Regras:**
- **RN-FUT-49:** Meta financeira de viagem vincula ao orçamento total da viagem em Experiências
- **RN-FUT-50:** Ao criar viagem em Experiências, sugerir: "Deseja criar um Objetivo no Futuro para acompanhar o progresso completo desta viagem?"

---

## 8. MODO FOCO vs MODO JORNADA

### 8.1 Dashboard Futuro

| Elemento | Modo Foco (FREE) | Modo Jornada (PRO) |
|----------|-------------------|---------------------|
| Lista de objetivos | Cards com barra de progresso | Cards com progresso animado + micro-interações |
| Progresso geral | Número percentual | "Seu Futuro está X% construído" + barra animada |
| Marcos atingidos | Lista simples | Celebração com confetti + badge desbloqueado |
| Objetivos concluídos | ✅ Status "concluído" | Animação de celebração + frase motivacional |
| Mapa da Vida | ❌ Não disponível | ✅ Radar chart + grid com insights |

### 8.2 Detalhe do Objetivo

| Elemento | Modo Foco | Modo Jornada |
|----------|-----------|--------------|
| Header | Nome + progresso % | Nome + frase: "Você está a X% do seu sonho" |
| Timeline de marcos | Lista cronológica | Timeline visual animada tipo "jornada" |
| Metas | Barras de progresso | Barras + insights por meta ("esta meta está acelerando!") |
| Previsão | Texto: "Estimativa: [data]" | Visual: timeline futura mostrando marcos esperados |
| Conclusão | Toast simples | Celebração completa com retrospectiva do caminho percorrido |

### 8.3 Por que assinar para ter o Modo Jornada no Futuro?

O Futuro no Modo Jornada transforma planejamento de vida de uma lista de tarefas em uma experiência de coaching pessoal. O usuário vê o Mapa da Vida mostrando quais dimensões estão fortes e quais precisam de atenção. Cada marco atingido é celebrado. Cada semana gera um resumo: "Você progrediu X% esta semana. Sua área mais forte é Mente. Patrimônio precisa de atenção." É a diferença entre gerenciar metas e **viver uma jornada de evolução pessoal**.

---

## 9. NOTIFICAÇÕES E LEMBRETES

### 9.1 Tipos de Notificação

| Notificação | Condição | Frequência |
|-------------|----------|------------|
| Prazo próximo | Objetivo com prazo em 30 dias | 1x (30 dias antes) |
| Prazo urgente | Objetivo com prazo em 7 dias | 1x (7 dias antes) |
| Prazo vencido | Objetivo com prazo expirado | 1x (no dia) |
| Meta parada | Meta sem atualização há 14 dias | 1x (14 dias) |
| Marco atingido | Meta individual concluída | Imediato |
| Objetivo concluído | Todas as metas a 100% | Imediato |
| Resumo semanal | Progresso da semana (Jornada) | Semanal (domingo) |

### 9.2 Regras de Notificação

- **RN-FUT-51:** Notificações podem ser desativadas individualmente nas Configurações
- **RN-FUT-52:** Notificação de meta parada é enviada apenas 1 vez (após 14 dias). Se continuar parada, card aparece no Dashboard mas sem nova notificação
- **RN-FUT-53:** Resumo semanal é exclusivo do Modo Jornada (PRO)
- **RN-FUT-54:** Tom das notificações é empático e encorajador, nunca punitivo. Exemplo: "Faz um tempinho que a meta 'Estudar italiano' não recebe atenção. Que tal dedicar 15 minutos hoje?" — NUNCA: "Você está atrasado na meta de italiano."

---

## 10. MODELO DE DADOS

### 10.1 Tabelas

```sql
-- ============ FUTURO (OBJETIVOS E METAS) ============

CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    category TEXT NOT NULL CHECK (category IN (
        'financial', 'health', 'professional', 'educational',
        'experience', 'personal', 'other'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    target_date DATE,
    target_date_reason TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN (
        'active', 'paused', 'completed', 'archived'
    )),
    completed_at TIMESTAMP,
    progress DECIMAL(5,2) DEFAULT 0, -- cache calculado
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE TABLE objective_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    target_module TEXT NOT NULL CHECK (target_module IN (
        'financas', 'tempo', 'corpo', 'mente',
        'patrimonio', 'carreira', 'experiencias'
    )),
    indicator_type TEXT NOT NULL CHECK (indicator_type IN (
        'monetary', 'weight', 'task', 'frequency',
        'percentage', 'quantity', 'linked'
    )),
    -- Valores do indicador
    target_value DECIMAL(15,2),    -- valor alvo (R$, kg, quantidade)
    current_value DECIMAL(15,2) DEFAULT 0,  -- valor atual
    initial_value DECIMAL(15,2),   -- valor inicial (para cálculos como peso)
    target_unit TEXT,               -- unidade: 'BRL', 'kg', 'hours', 'times', etc.
    -- Vinculação com módulos
    linked_entity_type TEXT,        -- 'study_track', 'roadmap_step', 'budget_category', etc.
    linked_entity_id UUID,          -- ID do item vinculado no módulo destino
    -- Configuração
    weight DECIMAL(3,1) DEFAULT 1.0 CHECK (weight BETWEEN 0.5 AND 3.0),
    frequency_period TEXT CHECK (frequency_period IN ('daily', 'weekly', 'monthly')),
    frequency_target INTEGER,       -- X vezes por período
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN (
        'active', 'completed', 'paused'
    )),
    progress DECIMAL(5,2) DEFAULT 0, -- cache calculado
    completed_at TIMESTAMP,
    last_progress_update TIMESTAMP,
    -- Integração automática
    auto_sync BOOLEAN DEFAULT TRUE, -- sincronizar automaticamente com módulo destino
    finance_transaction_id UUID,    -- se gerou transação em Finanças
    agenda_event_id UUID,           -- se gerou evento na Agenda
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE objective_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES objective_goals(id),  -- NULL para marcos do objetivo
    event_type TEXT NOT NULL CHECK (event_type IN (
        'created', 'goal_added', 'goal_completed', 'goal_removed',
        'progress_50', 'progress_75', 'progress_90',
        'objective_completed', 'objective_edited',
        'objective_paused', 'objective_resumed'
    )),
    description TEXT NOT NULL,
    progress_snapshot DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_objectives_user_status ON objectives(user_id, status);
CREATE INDEX idx_objective_goals_objective ON objective_goals(objective_id);
CREATE INDEX idx_objective_goals_module ON objective_goals(target_module);
CREATE INDEX idx_objective_goals_linked ON objective_goals(linked_entity_type, linked_entity_id);
CREATE INDEX idx_objective_milestones_objective ON objective_milestones(objective_id);
```

### 10.2 Views Úteis

```sql
-- View: progresso por módulo (para Mapa da Vida)
CREATE VIEW module_progress AS
SELECT 
    og.user_id,
    og.target_module,
    AVG(og.progress) as avg_progress,
    COUNT(DISTINCT og.objective_id) as objectives_count,
    COUNT(*) as goals_count,
    COUNT(*) FILTER (WHERE og.status = 'completed') as completed_goals
FROM objective_goals og
JOIN objectives o ON og.objective_id = o.id
WHERE o.status = 'active'
GROUP BY og.user_id, og.target_module;

-- View: resumo do Futuro por usuário
CREATE VIEW future_summary AS
SELECT 
    o.user_id,
    COUNT(*) FILTER (WHERE o.status = 'active') as active_objectives,
    COUNT(*) FILTER (WHERE o.status = 'completed') as completed_objectives,
    AVG(o.progress) FILTER (WHERE o.status = 'active') as avg_progress,
    MIN(o.target_date) FILTER (WHERE o.status = 'active' AND o.target_date IS NOT NULL) as nearest_deadline
FROM objectives o
GROUP BY o.user_id;
```

---

## 11. EDGE CASES E SITUAÇÕES ESPECIAIS

### 11.1 Módulo desativado após criação de meta

Se o usuário desativar um módulo que tem metas vinculadas:
- A meta permanece no objetivo mas fica com status "Módulo inativo"
- Não recebe mais atualizações automáticas
- Progresso congela no último valor conhecido
- Ao reativar o módulo, a meta volta a funcionar normalmente
- **RN-FUT-55:** Metas de módulos inativos não são excluídas, apenas suspensas

### 11.2 Item vinculado excluído

Se o usuário excluir uma trilha de estudo, step de roadmap ou outro item que tem meta vinculada:
- O sistema notifica: "A trilha [nome] foi excluída. A meta [nome] no objetivo [nome] será desvinculada."
- A meta permanece mas perde a vinculação automática
- Progresso congela no último valor
- Usuário pode vincular a outro item ou converter em progresso manual
- **RN-FUT-56:** Exclusão de item vinculado não exclui automaticamente a meta

### 11.3 Objetivo com todas as metas pausadas

Se todas as metas de um objetivo forem pausadas:
- O objetivo automaticamente sugere pausar também
- Se o usuário não pausar, o progresso fica congelado
- **RN-FUT-57:** Objetivo com todas as metas inativas por 30+ dias sugere arquivamento

### 11.4 Migração de dados (v2 → v3)

Metas existentes do módulo Metas (v2) precisam ser migradas:
- Cada meta v2 vira um Objetivo v3 com uma única meta vinculada
- O usuário pode depois adicionar mais metas ao objetivo
- **RN-FUT-58:** Script de migração preserva todo o histórico e progresso

---

## 12. RESUMO DAS REGRAS DE NEGÓCIO

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-FUT-01 | Ordenação do Dashboard: prioridade, progresso ou prazo | Dashboard |
| RN-FUT-02 | Badge "Atrasado" para prazo vencido | Dashboard |
| RN-FUT-03 | Progresso geral = média ponderada dos objetivos | Dashboard |
| RN-FUT-04 | Concluídos movem para aba após 7 dias | Dashboard |
| RN-FUT-05 | Máximo 10 objetivos na visão principal | Dashboard |
| RN-FUT-06 | Limite FREE: 3 objetivos ativos | Dashboard |
| RN-FUT-07 | Mínimo 1 meta por objetivo | Wizard |
| RN-FUT-08 | Limite FREE: 3 metas por objetivo | Wizard |
| RN-FUT-09 | Módulo destino precisa estar ativo | Wizard |
| RN-FUT-10 | Vinculação com itens existentes de módulos | Wizard |
| RN-FUT-11 | Meta financeira → pergunta sobre orçamento | Wizard |
| RN-FUT-12 | Meta tarefa → cria evento na Agenda | Wizard |
| RN-FUT-13 | Sugestões de metas são contextuais e opcionais | Wizard |
| RN-FUT-14 | Nome de objetivo não duplicável | Wizard |
| RN-FUT-15 | Data alvo deve ser futura | Wizard |
| RN-FUT-16 | Progresso = média ponderada das metas | Detalhe |
| RN-FUT-17 | Cálculo de progresso por tipo de indicador | Detalhe |
| RN-FUT-18 | Metas vinculadas atualizam automaticamente | Detalhe |
| RN-FUT-19 | Todas metas 100% → notificação de conclusão | Detalhe |
| RN-FUT-20 | Pausados excluídos do Life Sync Score | Detalhe |
| RN-FUT-21 | Adicionar metas a objetivo existente | Detalhe |
| RN-FUT-22 | Remover metas (mínimo 1 obrigatória) | Detalhe |
| RN-FUT-23 | Edições registradas na timeline | Detalhe |
| RN-FUT-24 | Velocidade calculada com base em 30 dias | Detalhe |
| RN-FUT-25 | Alerta se ritmo insuficiente para prazo | Detalhe |
| RN-FUT-26 | Mapa da Vida exclusivo Jornada | Mapa |
| RN-FUT-27 | Dimensão do radar = média por módulo | Mapa |
| RN-FUT-28 | Radar atualiza em tempo real | Mapa |
| RN-FUT-29 | Insights gerados semanalmente | Mapa |
| RN-FUT-30 | Widget do Mapa disponível no Home | Mapa |
| RN-FUT-31 a 50 | Integrações com módulos | Integração |
| RN-FUT-51 a 54 | Regras de notificação | Notificações |
| RN-FUT-55 a 58 | Edge cases | Especiais |

---

*Documento criado em: Fevereiro 2026*
*Módulo: 🔮 Futuro — Objetivos e Metas de Vida*
*Total de regras de negócio: 58*
*Próximos passos: Protótipo HTML seguindo design system do MVP v2*
