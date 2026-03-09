# 💰 Especificação Funcional — Módulo Finanças

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Finanças — Controle financeiro completo  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#10b981` (Emerald)  
> **Ícone Lucide:** `DollarSign`  
> **Subtítulo descritivo:** "Controle total do seu dinheiro"  
> **Pergunta norteadora:** "Como estão minhas Finanças?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard Financeiro](#5-tela-01--dashboard-financeiro)
6. [Tela 02 — Transações](#6-tela-02--transações)
7. [Tela 03 — Recorrentes](#7-tela-03--recorrentes)
8. [Tela 04 — Orçamentos](#8-tela-04--orçamentos)
9. [Tela 05 — Calendário Financeiro](#9-tela-05--calendário-financeiro)
10. [Tela 06 — Planejamento](#10-tela-06--planejamento)
11. [Tela 07 — Relatórios](#11-tela-07--relatórios)
12. [Fluxos CRUD Detalhados](#12-fluxos-crud-detalhados)
13. [Integrações com Outros Módulos](#13-integrações-com-outros-módulos)
14. [Diagrama de Integrações](#14-diagrama-de-integrações)
15. [Regras de Negócio Consolidadas](#15-regras-de-negócio-consolidadas)
16. [Modelo de Dados](#16-modelo-de-dados)
17. [Life Sync Score — Componente Finanças](#17-life-sync-score)
18. [Insights e Sugestões Adicionais](#18-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Finanças

O módulo Finanças é o **pilar central** do SyncLife — foi o primeiro módulo implementado, é o mais completo e é a razão pela qual a maioria dos usuários adota o app. Ele vai muito além de um simples registro de gastos: é um sistema financeiro completo que cobre **transações, orçamentos por envelope, recorrentes automáticas, calendário financeiro, projeção de fluxo de caixa e relatórios analíticos**.

A proposta é responder à pergunta **"Como estão minhas Finanças?"** de forma completa: quanto recebi, quanto gastei, quanto sobrou, quais orçamentos estão em risco, quanto vou ter daqui a 3 meses, e como isso se conecta com meus objetivos de vida.

### 1.2 Por que este módulo existe

Finanças pessoais é o ponto de dor #1 que faz pessoas buscarem apps de organização. No Brasil, apps como Mobills (600K+ usuários ativos) e Organizze dominam o mercado de controle financeiro pessoal. Internacionalmente, YNAB ($109/ano) é referência em orçamento zero-based, e Monarch Money ($99.99/ano) lidera em visão holística.

O problema de TODOS eles: **são silos financeiros**. Nenhum responde "estou gastando R$600/mês em delivery — isso está atrasando meu objetivo de comprar um apartamento em 3 anos?". O SyncLife faz isso porque Finanças conversa com Futuro (objetivos), Corpo (consultas médicas), Mente (custos educacionais), e Patrimônio (investimentos).

### 1.3 Proposta de valor única

O SyncLife Finanças não compete com YNAB em metodologia de orçamento (YNAB tem 15 anos de evolução nisso). Ele compete na **camada de integração e significado**:

- Cada transação pode alimentar o progresso de uma meta no Futuro
- Consultas médicas do Corpo geram despesas automáticas em Finanças
- O custo de trilhas do Mente registra-se como despesa educacional
- Recorrentes projetam o fluxo de caixa futuro no Planejamento
- O calendário financeiro é o "quando" do dinheiro — visualização temporal dos gastos
- Relatórios cruzam dados com orçamentos para identificar padrões

### 1.4 As 7 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Resumo financeiro do mês: saldo, receitas, despesas, orçamentos, projeção | Diária |
| 02 | Transações | Lista completa de todas as receitas e despesas com filtros avançados | Diária |
| 03 | Recorrentes | Gestão de despesas fixas e receitas regulares automáticas | Mensal |
| 04 | Orçamentos | Sistema de envelopes com limites por categoria | Semanal |
| 05 | Calendário | Visualização temporal de quando o dinheiro entra e sai | Semanal |
| 06 | Planejamento [PRO] | Projeção de fluxo de caixa e cenários futuros (3-6 meses) | Mensal |
| 07 | Relatórios | Análises, comparativos, gráficos e exportação | Mensal |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **YNAB** | Metodologia zero-based budgeting madura (15 anos), "give every dollar a job", comunidade forte, loan calculator, YNAB Together (5 users), relatórios detalhados. 4.8★ Apple Store | Só finanças — sem metas de vida, sem saúde, sem agenda. Caro ($109/ano). Curva de aprendizado alta. Não funciona bem para BR (sem integração bancária local) | $14.99/mês ou $109/ano |
| **Monarch Money** | Dashboard holístico (budget + investimentos + net worth), AI Assistant para perguntas sobre dados, compartilhamento com parceiro com permissões, projeção de fluxo de caixa | Sem conexão com saúde, estudo ou carreira. Sem gamificação. Relativamente novo no mercado (2019). Sem versão PT-BR | $14.99/mês ou $99.99/ano |
| **Mobills** | Líder BR (600K+ MAU), interface simples, categorias em PT-BR, barcode scanner, sincronização bancária brasileira (Open Finance), relatórios por período, metas financeiras | Sem integração com outros aspectos da vida. Design genérico. Versão free muito limitada. Sem IA ou insights inteligentes | Free c/ ads / Premium ~R$15/mês |
| **Organizze** | Popular BR, interface limpa, cartões de crédito, contas bancárias, orçamentos por categoria, faturas, exportação | Sem projeção de fluxo de caixa. Sem calendário financeiro. Sem metas de vida. Sem IA | Free c/ ads / Premium ~R$10/mês |
| **Copilot** | IA que auto-categoriza gastos, aprende padrões, sugere savings goals, design premium, Apple-native. Excelente UX | Apenas iOS. Sem integração com outros aspectos da vida. Sem recorrentes robustas. Preço alto para features limitadas | $69.99/ano |
| **Simplifi (Quicken)** | Budget automático baseado em histórico, bills & subscriptions tracker, spending plan com "safe-to-spend", clean design | Sem calendário financeiro visual. Sem gamificação. Sem versão PT-BR. Sem integração life management | $2.99-$5.99/mês |
| **PocketGuard** | "In My Pocket" feature (quanto posso gastar), auto-loweringsubscriptions, goals tracking. Interface simplificada | Customização limitada. Versão free funcional. Sem relatórios profundos. Sem agenda ou metas de vida | Free / $7.99/mês |
| **EveryDollar (Ramsey)** | Zero-based simples, método Dave Ramsey, clean UI. Free version funcional | Filosofia rígida (anti-cartão de crédito). Sem auto-import na versão free. Sem visão de investimentos. Sem IA | Free / $79.99/ano |
| **Spendee** | Wallets compartilhados com parceiro, UI bonita, categorias visuais, flow chart de cash flow | Poucos features avançados. Sem projeção. Sem recorrentes robustas. Mercado mais europeu | Free / $14.99-$22.99/ano |

### 2.2 Diferenciais Competitivos do SyncLife Finanças

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Quick Entry em 3 toques** | Numpad dedicado com categoria sugerida por IA, confirma com 1 toque. Mais rápido que qualquer concorrente | Copilot (parcial, IA categoriza mas sem numpad) |
| **Calendário Financeiro Visual** | Grid mensal colorido mostrando entradas/saídas por dia, com drawer de detalhes. Visualiza "quando" o dinheiro se move | YNAB (têm calendar view mas sem heat colors). Nenhum BR |
| **Projeção de Fluxo de Caixa** | Timeline de 5 meses com saldo projetado baseado em recorrentes + padrão de gastos. Nós cenários warn/good | Monarch Money (parcial). YNAB (age your money). Nenhum BR |
| **Transação → Meta no Futuro** | Criar envelope "Apartamento" com contribuição mensal que alimenta automaticamente o progresso do objetivo no Futuro | Ninguém |
| **Despesas Cross-Módulo** | Consulta médica (Corpo), curso (Mente), investimento (Patrimônio) geram transações automáticas em Finanças | Ninguém |
| **Budget Health Score** | Score visual dos orçamentos: dots coloridos (verde/amarelo/vermelho) mostram saúde de cada envelope num relance | YNAB (tem age of money mas é diferente) |
| **Foto Recibo → OCR** | Fotografar recibo e IA extrai valor, data, categoria. Feature PRO que elimina entrada manual | Copilot (parcial), Wally (GPT-powered) |
| **Experiência unificada** | Dashboard com insights IA, projeção, celebração ao atingir budget | Ninguém com abordagem similar |

### 2.3 O que aprendemos com o benchmark

**Do YNAB:** A metodologia "give every dollar a job" é poderosa mas intimida. No SyncLife, usamos envelopes de orçamento (similar) mas com abordagem mais suave — o usuário não precisa alocar 100% da renda, pode ter "Não alocado" como buffer. A comunidade do YNAB (subreddit 500K+) mostra que educação financeira dentro do app (insights, dicas) aumenta retenção.

**Do Monarch Money:** AI Assistant para perguntas sobre seus dados é o futuro. No SyncLife, o Coach IA no Panorama preenche esse papel cruzando Finanças com outros módulos. O compartilhamento com parceiro com permissões é feature roadmap pós-MVP.

**Do Mobills/Organizze:** A simplicidade de registro em PT-BR é essencial. Apps BR têm vantagem na categorização para contexto brasileiro (PIX, boleto, cartão de crédito). O SyncLife precisa ter categorias e métodos de pagamento brasileiros nativos.

**Do Copilot:** IA que aprende padrões de categorização é um diferencial forte. No SyncLife, a sugestão de categoria por IA no Quick Entry replica essa experiência. O design premium do Copilot é inspiração para nosso design system.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌────────────────────────────────────────────────────────────────────────┐
│                    💰 FINANÇAS — NAVEGAÇÃO PRINCIPAL                     │
│                                                                          │
│   Sub-nav (tabs com underline):                                         │
│   Dashboard │ Transações │ Recorrentes │ Orçamentos │ Calendário │      │
│   Planejamento [PRO] │ Relatórios                                       │
│                                                                          │
│   7 tabs = 7 telas principais. Navegação lateral entre elas.            │
└────┬────────┬──────────┬───────────┬───────────┬────────┬────────┬────┘
     │        │          │           │           │        │        │
     ▼        ▼          ▼           ▼           ▼        ▼        ▼
  ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐
  │01    │ │02    │ │03      │ │04      │ │05      │ │06    │ │07    │
  │DASHB.│ │TRANS.│ │RECORR. │ │ORÇAM.  │ │CALEND. │ │PLAN. │ │RELAT.│
  └──┬───┘ └──┬───┘ └───┬────┘ └───┬────┘ └───┬────┘ └──────┘ └──────┘
     │        │         │          │          │
     │   ┌────┼─────┐   │    ┌─────┼────┐     │
     │   │    │     │   │    │     │    │     │
     │   ▼    ▼     ▼   ▼    ▼     ▼    ▼     ▼
     │  08   09   10   11   12    13   14    15
     │ QUICK NOVA EDITAR CRIAR EDITAR CRIAR DRAWER
     │ ENTRY TRANS TRANS  RECOR RECOR  ORÇAM DIA
     │ (FAB) (form)(form) (form)(form) (form)(cal)
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Transações | Sub-nav "Transações" | — |
| **L1** | 03 Recorrentes | Sub-nav "Recorrentes" | — |
| **L1** | 04 Orçamentos | Sub-nav "Orçamentos" | — |
| **L1** | 05 Calendário | Sub-nav "Calendário" | — |
| **L1** | 06 Planejamento | Sub-nav "Planejamento" [PRO] | — |
| **L1** | 07 Relatórios | Sub-nav "Relatórios" | — |
| **L2** | 08 Quick Entry | FAB central (bottom bar) | ✕ Fecha (volta à tela anterior) |
| **L2** | 09 Nova Transação | Botão "+" no header (02) | ✕ Fecha (volta 02) |
| **L2** | 10 Editar Transação | Tap em transação (02) | ← Transações (02) |
| **L2** | 11 Criar Recorrente | Botão "+" no header (03) | ✕ Fecha (volta 03) |
| **L2** | 12 Editar Recorrente | Tap em recorrente (03) | ← Recorrentes (03) |
| **L2** | 13 Criar Orçamento | Botão "+" no header (04) | ✕ Fecha (volta 04) |
| **L2** | 14 Editar Orçamento | Tap em orçamento (04) | ← Orçamentos (04) |
| **L2** | 15 Drawer do Dia | Tap em dia no calendário (05) | ✕ Fecha (overlay) |

### 3.3 Padrão de Navegação

**Header do módulo:**
- "Finanças" à esquerda com subtítulo "Março 2026"
- Toggle Foco/Jornada + botão de busca à direita

**Sub-nav:**
- Tabs com underline (não pills) — PADRÃO FUTURO
- Tab ativa: texto branco + underline `#10b981`
- 7 tabs: Dashboard, Transações, Recorrentes, Orçamentos, Calendário, Planejamento [PRO], Relatórios
- Scroll horizontal em mobile (overflow-x com fade mask)

---

## 4. MAPA DE FUNCIONALIDADES

```
💰 FINANÇAS
│
├── 📊 Dashboard
│   ├── Saldo disponível (card hero com gradiente)
│   ├── Receitas vs Despesas (grid 2 cards)
│   ├── [Jornada] Projeção IA ("Termina março com R$ 4.200")
│   ├── Orçamentos do mês (lista de envelopes com barra de progresso)
│   ├── Últimas 7 transações (resumo)
│   ├── Projeção de saldo (timeline 5 meses)
│   ├── Próximas recorrentes (grid de 5)
│   ├── Gráfico fluxo de caixa diário (barras receitas/despesas + linha saldo)
│   └── [Jornada] Insight IA financeiro
│
├── 💳 Transações
│   ├── Filtros: período, tipo (todos/receitas/despesas/recorrentes), categoria
│   ├── Ordenação: mais recente, maior valor, categoria
│   ├── Lista de transações (emoji cat + nome + data + valor)
│   ├── Criar transação (form completo: valor, tipo, categoria, data, descrição, método pgto)
│   ├── Editar transação
│   ├── Excluir transação
│   ├── Busca por texto
│   └── Tags personalizadas (opcional)
│
├── 🔄 Recorrentes
│   ├── KPIs (total receitas rec., total despesas rec., % comprometida)
│   ├── [Jornada] Insight IA ("Próximo lançamento: Netflix dia 11")
│   ├── Próximas ocorrências (30 dias)
│   ├── Lista de recorrentes ativas (nome, valor, frequência, próximo lançamento)
│   ├── Criar recorrente (form: nome, valor, tipo, frequência, dia, categoria)
│   ├── Editar recorrente
│   ├── Pausar / Retomar recorrente
│   ├── Excluir recorrente
│   └── Geração automática de transações no dia
│
├── 📦 Orçamentos (Envelopes)
│   ├── Budget Health Score (dots coloridos)
│   ├── Resumo: total alocado vs total gasto vs não alocado
│   ├── Doughnut chart (gasto por categoria)
│   ├── Lista de envelopes (categoria, gasto/limite, %, barra)
│   ├── Criar envelope (categoria, limite mensal)
│   ├── Editar limite de envelope
│   ├── Excluir envelope
│   ├── Regras de cor: ≤60% verde, 61-79% amarelo, 80-99% laranja, ≥100% vermelho
│   └── [Jornada] Sugestão de ajuste de orçamento
│
├── 📅 Calendário Financeiro
│   ├── Grid mensal (28-31 dias)
│   ├── Cada dia: barras de entrada (verde) e saída (vermelho) proporcionais
│   ├── Linha de saldo acumulado (azul)
│   ├── Marcadores de eventos (salário, aluguel, contas, recorrentes)
│   ├── Dias futuros com projeção (opacity reduzida)
│   ├── Drawer do dia (tap): lista de transações + saldo acumulado
│   ├── Cards de resumo: maior entrada, maior saída, saldo mais baixo, saldo hoje
│   └── Navegação entre meses
│
├── 📈 Planejamento [PRO]
│   ├── Saldo atual com contexto (comprometido, livre, taxa de poupança)
│   ├── Timeline horizontal de 5 meses com nós (current, good, warn)
│   ├── Cenários: otimista, realista, pessimista
│   ├── Eventos de planejamento (despesas pontuais futuras: IPVA, IPTU, viagem)
│   ├── Alerta contextual se nó warn detectado
│   └── [Jornada] Sugestão IA de ação para melhorar projeção
│
└── 📄 Relatórios
    ├── Comparativo de períodos (mês atual vs anterior)
    ├── Gráfico de evolução mensal (receita × despesa × saldo)
    ├── Breakdown por categoria (barras horizontais ou pizza)
    ├── Filtros de período (3m, 6m, 12m)
    ├── Exportação CSV
    └── [PRO] Exportação PDF formatado
```

---

## 5. TELA 01 — DASHBOARD FINANCEIRO

### 5.1 Objetivo

Fornecer uma **leitura completa da saúde financeira do mês** em uma única tela. O escopo é sempre o mês corrente (navegável por seletor). É a tela mais acessada de todo o módulo.

### 5.2 Componentes

#### 5.2.1 Card de Saldo Principal (Hero)

**Visual (conforme protótipo tela 03):**
- Card com gradiente emerald→blue sutil
- Label: "Saldo disponível"
- Valor grande: "R$ 3.847,20" (DM Mono 36px)
- Badge verde: "+R$ 340 vs mês passado"

**Cálculo:**
```
Saldo = SUM(receitas do mês) - SUM(despesas do mês) + saldo_anterior
```

**Critérios de aceite:**
- Saldo positivo: valor verde. Negativo: valor vermelho
- Delta vs mês anterior calcula: saldo_atual - saldo_mesmo_dia_mês_anterior
- Atualiza em tempo real ao adicionar/remover transação

#### 5.2.2 Grid Receitas / Despesas (2 cards)

| Card | Valor | Cor | Sub-texto |
|------|-------|-----|-----------|
| Receitas | SUM(transações tipo 'income' do mês) | `#10b981` verde | Breakdown: "↑ Salário + Freela" |
| Despesas | SUM(transações tipo 'expense' do mês) | `#f43f5e` vermelho | "→ 38% da renda" |

#### 5.2.3 [Jornada] Insight de Projeção IA

**Card:**
- ✨ "Projeção"
- "Mantendo este ritmo, você termina março com **R$ 4.200** — R$ 600 acima do mês passado."

**Lógica:**
- Calcula taxa de gasto diário média (despesas / dias passados)
- Projeta: saldo_atual - (taxa × dias restantes) + receitas futuras conhecidas (recorrentes)
- Compara com projeção do mês anterior no mesmo ponto

#### 5.2.4 Orçamentos do Mês

**Budget Health Score (visual de dots):**
- Cada envelope = 1 dot colorido (verde/amarelo/laranja/vermelho/cinza)
- Resumo: "3 ok · 1 atenção · 0 inativo"

**Lista de envelopes (conforme protótipo):**
- Emoji + nome
- Valor gasto / Limite
- Barra de progresso com cor por faixa

#### 5.2.5 Últimas Transações

**7 transações mais recentes:**
- Emoji da categoria + nome
- Data + método de pagamento
- Valor com cor (- vermelho, + verde)
- Botão "Ver todas →" navega para Transações

#### 5.2.6 Projeção de Saldo (Timeline)

**Timeline horizontal com 5 nós (mês atual + 4 futuros):**
- Nó com dot colorido (current=verde, good=azul, warn=vermelho pulsante)
- Card com: mês, saldo projetado, variação, nota
- Alerta contextual se nó warn detectado

#### 5.2.7 Gráfico Fluxo de Caixa Diário

**Gráfico de barras stackadas + linha:**
- Barras verdes: entradas do dia
- Barras vermelhas: saídas do dia
- Linha azul: saldo acumulado
- Marcadores de eventos (💰 Salário, 🏠 Aluguel)
- Dias futuros com opacity 0.3

---

## 6. TELA 02 — TRANSAÇÕES

### 6.1 Objetivo

Lista completa e pesquisável de todas as transações financeiras do período selecionado. É o "extrato" do SyncLife.

### 6.2 Componentes

#### 6.2.1 Filtros

**Linha 1:** Seletor de mês/período (← Março 2026 →)  
**Linha 2:** Pills horizontais scrolláveis: Todos | Receitas | Despesas | Recorrentes | [Categoria ▼]  
**Linha 3:** Ordenação: Mais recente ▼

#### 6.2.2 Lista de Transações

**Para cada transação:**
- Emoji da categoria (38×38px, fundo com cor suave)
- Nome/descrição
- Data + método de pagamento (Pix, Cartão, Dinheiro, Débito, Transferência)
- Valor: "- R$ 280" (vermelho) ou "+ R$ 5.000" (verde)
- Badge se recorrente: "🔄 Recorrente"
- Badge se auto-gerado: "Auto — 🏃 Corpo" (transação criada por integração)

**Critérios de aceite:**
- Lista ordena por data DESC por padrão
- Filtros são combinados (AND): tipo + categoria + período
- Swipe left para excluir (com confirmação)
- Tap abre detalhe editável
- Empty state se sem transações no período

---

## 7. TELA 03 — RECORRENTES

### 7.1 Objetivo

Gerenciar despesas fixas (aluguel, Netflix, internet) e receitas regulares (salário, freela) que se repetem automaticamente. O sistema gera transações automaticamente na data configurada.

### 7.2 Componentes

#### 7.2.1 KPIs (3 cards)

| KPI | Cálculo | Cor |
|-----|---------|-----|
| Receitas Recorrentes | SUM(recorrentes tipo income) | `#10b981` |
| Despesas Recorrentes | SUM(recorrentes tipo expense) | `#f43f5e` |
| % Comprometida | despesas_rec / receitas_rec × 100 | Dinâmica |

#### 7.2.2 Próximas Ocorrências (30 dias)

**Lista cronológica:**
- Dia (grande, DM Mono) + mês
- Emoji + nome
- Frequência (Mensal, Semanal, Quinzenal, Anual)
- Valor com cor

#### 7.2.3 Lista de Recorrentes

**Para cada recorrente:**
- Emoji da categoria + nome
- Frequência + dia + valor
- Status: ativa (verde), pausada (cinza)
- Toggle rápido para pausar/retomar

#### 7.2.4 Geração Automática

**Regra RN-FIN-14:** No dia configurado, o sistema gera automaticamente uma transação em `transactions` com:
- Dados da recorrente (nome, valor, categoria, tipo)
- Data = data da ocorrência
- Badge: "🔄 Gerada automaticamente"
- Se dia cai em fim de semana: gera na segunda seguinte (configurável)

---

## 8. TELA 04 — ORÇAMENTOS

### 8.1 Objetivo

Sistema de **envelopes de orçamento** onde o usuário define limites mensais por categoria. Responde: "Estou gastando dentro do planejado em cada área?"

### 8.2 Componentes

#### 8.2.1 Doughnut Chart

**Visual (conforme protótipo tela 05):**
- Anel com segmentos por categoria
- Centro: "Total gasto / Total alocado"
- Cores dos segmentos = cores das categorias

#### 8.2.2 Lista de Envelopes

**Para cada envelope:**
- Emoji + nome da categoria
- Barra de progresso: gasto / limite
- Percentual e valor restante
- **Cor dinâmica da barra:**

| Faixa | Cor |
|-------|-----|
| ≤ 60% | `#10b981` verde |
| 61-79% | `#f59e0b` amarelo |
| 80-99% | `#f97316` laranja |
| ≥ 100% | `#f43f5e` vermelho |

#### 8.2.3 Card "Não Alocado"

**Badge:** Verde se positivo (tem folga), vermelho se negativo (orçou mais que recebe)
```
Não alocado = Receitas do mês - SUM(limites de todos os envelopes)
```

---

## 9. TELA 05 — CALENDÁRIO FINANCEIRO

### 9.1 Objetivo

Visualização temporal do dinheiro. Enquanto Transações mostra "o quê", o Calendário mostra "quando". É a tela mais visual do módulo.

### 9.2 Componentes

#### 9.2.1 Grid Mensal

**28-31 colunas (dias do mês):**
- Cada coluna: barra verde (entrada) + barra vermelha (saída)
- Altura proporcional ao valor
- Linha azul: saldo acumulado
- Dia atual destacado com borda
- Dias futuros: opacity 0.3 (dados de recorrentes previstas)

#### 9.2.2 Marcadores de Eventos

**Acima das barras, mini-labels:**
- 💰 Salário (dia de recebimento)
- 🏠 Aluguel / Condomínio
- ⚡ Contas (pacote mensal)
- 🔄 Recorrente

#### 9.2.3 Drawer do Dia (Tap)

**Bottom sheet ao clicar em um dia:**
- Header: "Dia X/MM" + data por extenso
- Cards resumo: Receitas do dia, Despesas do dia, Saldo do dia
- Lista de transações daquele dia
- Saldo acumulado até aquele dia
- Nota "futuro" se dia ainda não passou

#### 9.2.4 Cards de Resumo

**Grid 4 cards abaixo do gráfico:**

| Card | Dado | Cor |
|------|------|-----|
| Maior entrada | Valor + dia + descrição | Verde |
| Maior saída num dia | Valor + dia + descrição | Vermelho |
| Saldo mais baixo | Valor + dia + contexto | Vermelho |
| Saldo hoje | Valor + data | Azul |

---

## 10. TELA 06 — PLANEJAMENTO [PRO]

### 10.1 Objetivo

Projetar o futuro financeiro baseado em dados reais. Responde: "Se eu continuar assim, onde estarei financeiramente daqui a 6 meses?"

### 10.2 Componentes (PRO-only)

#### 10.2.1 Bloco de Saldo Atual

- Saldo disponível agora (grande)
- 3 pills: Comprometido (vermelho) | Livre estimado (verde) | Taxa de poupança (azul)

#### 10.2.2 Timeline de 5 Meses

- 5 nós com dots coloridos
- Cards por mês: saldo projetado, variação, nota contextual
- Trilho com preenchimento proporcional ao progresso do mês

#### 10.2.3 Cenários

- Otimista: renda +10%, gastos -5%
- Realista: padrão atual mantido
- Pessimista: gasto inesperado (IPVA, emergência)

#### 10.2.4 Eventos de Planejamento

- Despesas pontuais futuras conhecidas (IPVA em Abril, IPTU em Junho)
- Criam impacto visual nos nós da timeline (warn se significativo)

---

## 11. TELA 07 — RELATÓRIOS

### 11.1 Objetivo

Análises e comparativos para o usuário entender padrões de gasto e tomar decisões informadas.

### 11.2 Componentes

- **Comparativo mensal:** Mês atual vs anterior (tabela)
- **Gráfico de evolução:** Linha de receita, despesa e saldo nos últimos 6-12 meses (Recharts)
- **Breakdown por categoria:** Barras horizontais ou pizza
- **Filtros:** 3m, 6m, 12m
- **Exportação:** CSV (FREE) e PDF formatado (PRO)

---

## 12. FLUXOS CRUD DETALHADOS

### 12.1 Transação

#### CRIAR TRANSAÇÃO (via Quick Entry ou form completo)

```
QUICK ENTRY (3 toques):
├── Tela fullscreen com numpad
├── Toggle: Despesa | Receita | Transferência
├── Digita valor no numpad
├── Categoria sugerida por IA (tag verde "IA")
│   └── Toque para mudar (abre picker de categorias)
├── Data: "📅 Hoje" (toque para mudar)
├── "▼ Adicionar detalhes" (expande: descrição, tags, conta)
└── "✓ Confirmar — R$ X" (botão full-width no numpad)

FORM COMPLETO:
├── Tipo: Despesa / Receita / Transferência
├── Valor: input numérico (obrigatório)
├── Categoria: dropdown com emojis (obrigatório)
├── Data: date picker (default: hoje)
├── Descrição: texto livre (opcional)
├── Método de pagamento: PIX / Cartão / Débito / Dinheiro / Transferência
├── Tags: chips opcionais para filtro
├── Conta: qual conta bancária (se múltiplas)
└── Recorrente: toggle "Transformar em recorrente?"
```

**Validações:**
- Valor: obrigatório, > 0, máximo 2 casas decimais
- Categoria: obrigatório
- Data: não pode ser mais de 1 ano no futuro
- Descrição: máximo 200 caracteres

**Integrações disparadas:**
- Atualiza saldo do Dashboard
- Atualiza % do orçamento (se categoria tem envelope)
- Atualiza gráfico do Calendário
- Se vinculada a meta no Futuro → atualiza progresso do envelope

#### EDITAR TRANSAÇÃO

- Todos os campos editáveis (exceto tipo)
- Recalcula saldo, orçamento, calendário

#### EXCLUIR TRANSAÇÃO

- Confirmação: "Excluir transação R$ X?"
- Recalcula tudo
- Se era auto-gerada por integração: nota "Esta transação foi criada pelo módulo [X]. A transação original será mantida."

### 12.2 Recorrente

#### CRIAR RECORRENTE

```
PASSO 1 — Form:
├── Nome (obrigatório, ex: "Aluguel")
├── Valor (obrigatório)
├── Tipo: Despesa / Receita
├── Categoria: dropdown
├── Frequência: Mensal / Semanal / Quinzenal / Anual
├── Dia da ocorrência (1-31 para mensal, dia da semana para semanal)
├── Data de início
├── Data de fim (opcional — "sem fim" por padrão)
└── Notas (opcional)

PASSO 2 — Confirmar
├── Sistema cria em `recurrences`
├── Gera primeira transação se data já passou no mês atual
├── Aparece em "Próximas ocorrências"
└── Projeção no Planejamento é atualizada
```

#### PAUSAR / RETOMAR

| Ação | De | Para | O que acontece |
|------|----|------|----------------|
| Pausar | active | paused | Para de gerar transações. Projeção atualizada |
| Retomar | paused | active | Volta a gerar. Não gera retroativamente |

### 12.3 Orçamento (Envelope)

#### CRIAR ENVELOPE

```
├── Categoria: dropdown (1 envelope por categoria)
├── Limite mensal: valor (obrigatório, > 0)
├── Alerta em %: quando notificar (default: 80%)
└── Confirmar
```

#### EDITAR LIMITE

- Limite editável a qualquer momento
- % recalculado imediatamente

---

## 13. INTEGRAÇÕES COM OUTROS MÓDULOS

### 13.1 Corpo → Finanças

**Regra:** RN-CRP-21 — Custo de consulta médica gera transação

- Especialidade + médico no campo descrição
- Categoria: "Saúde"
- Badge: "Auto — 🏃 Corpo"
- Condição: toggle `crp_consulta_financas` ativo

### 13.2 Mente → Finanças

**Regra:** RN-MNT-14 — Custo de trilha de estudo gera transação

- Nome da trilha no campo descrição
- Categoria: "Educação"
- Badge: "Auto — 🧠 Mente"
- Condição: toggle `mnt_trilha_financas` ativo

### 13.3 Finanças → Futuro

**Regra:** RN-FIN-20 — Envelope vinculado a Objetivo atualiza progresso

- Envelope "Apartamento" tem contribuição mensal
- Saldo do envelope → `current_value` da meta financeira no Futuro
- Progresso do Objetivo recalculado automaticamente

### 13.4 Finanças → Panorama

- Saldo mensal → KPI no Dashboard do Panorama
- % orçamentos → Alertas no Dashboard
- Transações por dia → Heatmap de gastos
- Streak de saldo positivo → Badges financeiras

---

## 14. DIAGRAMA DE INTEGRAÇÕES

```
                     ┌────────────────────────────────┐
                     │     🌐 PANORAMA (Dashboard)      │
                     │  KPIs · Heatmap · Alertas · Score│
                     └───────────────┬──────────────────┘
                                     │ receitas, despesas,
                                     │ orçamentos, saldo
                                     │
┌──────────────────────────────────────────────────────────────────────┐
│                         💰 FINANÇAS                                    │
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐               │
│  │ Transações   │  │ Orçamentos   │  │ Recorrentes     │              │
│  │ (core CRUD)  │  │ (envelopes)  │  │ (auto-geração)  │              │
│  └──────┬───────┘  └──────┬───────┘  └───────┬─────────┘              │
│         │                 │                   │                        │
│  ┌──────┴───────┐  ┌──────┴────────┐  ┌──────┴──────────┐            │
│  │ Calendário    │  │ Planejamento   │  │ Relatórios      │            │
│  │ (visualização)│  │ (projeção PRO) │  │ (análise)       │            │
│  └───────────────┘  └────────────────┘  └─────────────────┘            │
└──────────┬────────────────────┬────────────────────────────────────────┘
           │                    │
    ┌──────┼────────┐    ┌──────┼────────┐
    │      │        │    │      │        │
    ▼      ▼        ▼    ▼      ▼        ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│🔮    ││🏃    ││🧠    ││📈    ││✈️    ││⏳    │
│FUTURO││CORPO ││MENTE ││PATRI.││EXPER.││TEMPO │
│      ││      ││      ││      ││      ││      │
│Envel.││Consul││Trilha││Aporte││Viagem││Evento│
│→Meta ││custo ││custo ││custo ││custo ││pgto  │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

---

## 15. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| **RN-FIN-01** | Saldo mensal | Saldo = SUM(income) - SUM(expense) do mês + saldo transportado. Atualiza em tempo real |
| **RN-FIN-02** | Categorias pré-definidas | 14 categorias seed: Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Vestuário, Assinaturas, Mercado, Pets, Presentes, Investimentos, Freelance, Salário. Mais "Outro" |
| **RN-FIN-03** | Métodos de pagamento | PIX, Cartão de Crédito, Cartão de Débito, Dinheiro, Transferência, Boleto |
| **RN-FIN-04** | Orçamento por envelope | 1 envelope por categoria. Limite mensal. Gasto = SUM(expense da categoria no mês) |
| **RN-FIN-05** | Cor do envelope | ≤60% verde, 61-79% amarelo, 80-99% laranja, ≥100% vermelho |
| **RN-FIN-06** | Não alocado | Receitas - SUM(limites). Se negativo, alerta "Você orçou mais do que recebe" |
| **RN-FIN-07** | Recorrente automática | No dia configurado, sistema gera transação com dados da recorrente. Se dia cai em fds, gera na segunda (default) |
| **RN-FIN-08** | Recorrente pausa | Pausar = para de gerar. Retomar = volta a gerar (sem retroativo) |
| **RN-FIN-09** | Quick Entry IA | Categoria sugerida baseada em padrão de gasto do usuário. Regras: valor < 50 → "Alimentação", 50-200 → "Mercado" (MVP). IA real pós-MVP |
| **RN-FIN-10** | Calendário dias futuros | Dias futuros mostram dados de recorrentes previstas. Opacity 0.3. Label "prev." |
| **RN-FIN-11** | Drawer do dia | Tap em dia abre bottom sheet com transações + saldo acumulado até aquele dia |
| **RN-FIN-12** | Projeção timeline | 5 nós: mês atual + 4 futuros. Saldo = saldo_atual + receitas_rec - despesas_rec × meses. Warn se saldo ≤ 30% do anterior |
| **RN-FIN-13** | Budget Health Score | Dots: verde (≤60%), amarelo (61-79%), laranja (80-99%), vermelho (≥100%), cinza (inativo) |
| **RN-FIN-14** | Transação auto-gerada | Transações criadas por integração (Corpo, Mente) têm badge "Auto — [módulo]" e não são editáveis na origem |
| **RN-FIN-15** | Relatório comparativo | Compara mês atual vs anterior: receitas, despesas, saldo, top categorias |
| **RN-FIN-16** | Exportação CSV | CSV. PDF formatado (pós-MVP: gate PRO) |
| **RN-FIN-17** | Planejamento | Tela de projeção 5 meses + cenários. (pós-MVP: gate PRO removido no MVP) |
| **RN-FIN-18** | Cenários de projeção | Otimista (+10% renda, -5% gasto), Realista (padrão), Pessimista (gasto inesperado) |
| **RN-FIN-19** | Valor não negativo | Transações sempre armazenam valor positivo. O tipo (income/expense) determina o sinal na exibição |
| **RN-FIN-20** | Envelope → Futuro | Envelope vinculado a objetivo: saldo do envelope alimenta current_value da meta financeira |
| **RN-FIN-21** | Busca de transação | Busca por descrição, categoria, valor. Case-insensitive. Resultados em tempo real |
| **RN-FIN-22** | Seletor de período | Mês navegável (← → ). Dashboard sempre abre no mês atual |
| **RN-FIN-23** | Gráfico fluxo diário | Barras empilhadas (entrada verde, saída vermelha) + linha de saldo (azul). Tooltip com detalhes |
| **RN-FIN-24** | Projeção IA | Texto gerado por regras: calcula taxa de gasto × dias restantes + receitas previstas. Compara vs mês anterior |
| **RN-FIN-25** | Alerta de orçamento | Notificação quando envelope ≥ 80%. Aparece no Panorama como alerta do dia |

---

## 16. MODELO DE DADOS

### 16.1 Tabelas (já existentes no schema)

```sql
-- categories: Categorias de transação (seed 14 + custom)
categories (
    id UUID PK,
    user_id UUID FK → profiles (nullable para seeds),
    name TEXT NOT NULL,
    icon TEXT NOT NULL, -- emoji
    type TEXT CHECK ('expense','income','both'),
    color TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMP
)

-- transactions: Transações financeiras
transactions (
    id UUID PK,
    user_id UUID FK → profiles,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK ('income','expense','transfer'),
    category_id UUID FK → categories,
    payment_method TEXT,
    transaction_date DATE NOT NULL,
    recurrence_id UUID FK → recurrences (nullable),
    source_module TEXT, -- 'corpo','mente','patrimonio' se auto-gerada
    source_entity_id UUID, -- id da entidade que gerou
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- recurrences: Transações recorrentes
recurrences (
    id UUID PK,
    user_id UUID FK → profiles,
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK ('income','expense'),
    category_id UUID FK → categories,
    frequency TEXT NOT NULL CHECK ('weekly','biweekly','monthly','annual'),
    day_of_month INTEGER, -- 1-31 para monthly
    day_of_week INTEGER, -- 0-6 para weekly
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK ('active','paused'),
    last_generated DATE,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- budgets: Orçamentos por envelope
budgets (
    id UUID PK,
    user_id UUID FK → profiles,
    category_id UUID FK → categories (UNIQUE por user),
    monthly_limit DECIMAL(12,2) NOT NULL,
    alert_threshold INTEGER DEFAULT 80, -- %
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- planning_events: Eventos de planejamento futuro
planning_events (
    id UUID PK,
    user_id UUID FK → profiles,
    name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK ('income','expense'),
    planned_month DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP
)
```

### 16.2 Índices

```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_cat ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_recurrences_user_status ON recurrences(user_id, status);
CREATE INDEX idx_budgets_user_cat ON budgets(user_id, category_id);
CREATE INDEX idx_planning_events_user ON planning_events(user_id, planned_month);
```

---

## 17. LIFE SYNC SCORE — COMPONENTE FINANÇAS

### 19.1 Peso no Score Geral

O módulo Finanças contribui com **20%** do Life Sync Score total — o maior peso junto com Futuro.

### 19.2 Fórmula

```
Finanças Score = (
    (% orçamento respeitado) × 0.40 +
    (consistência de registro) × 0.30 +
    (tendência vs mês anterior) × 0.30
) × 100

Onde:
- % orçamento respeitado: média do (1 - max(0, gasto-limite)/limite) de cada envelope ativo
- consistência de registro: min(transações_no_mês / 15, 1.0) — normaliza para 15 transações
- tendência: 1.0 se saldo ≥ saldo mês anterior, proporção se menor

Limitado a 100 (teto)
```

### 19.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Finanças em crise — sem controle, orçamentos estourados |
| 21-40 | Início — registro esporádico, alguns orçamentos |
| 41-60 | Regular — mantendo registro básico |
| 61-80 | Bom — orçamentos respeitados, registro consistente |
| 81-100 | Excelente — controle total, tendência positiva |

---

## 18. INSIGHTS E SUGESTÕES ADICIONAIS

### 20.1 Funcionalidades Futuras

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Open Finance / Integração bancária** | Importar transações automaticamente de bancos brasileiros (Nubank, Inter, Itaú). Elimina entrada manual | Game-changer. Mobills e Organizze já fazem. Requer certificação Open Finance Brasil. Custo de parceria. | Alta — v3 |
| **Foto Recibo → OCR + IA** | Fotografar nota fiscal, IA extrai: valor, data, estabelecimento, categoria. Auto-preenche transação | Elimina 90% do input manual. Copilot e Wally fazem parcialmente. Requer Vision API (Gemini/Claude) | Alta — pós-MVP |
| **Split de transação** | Dividir uma transação entre categorias (ex: R$300 no supermercado = R$200 Alimentação + R$100 Limpeza) | YNAB, Monarch e Simplifi fazem. Melhora precisão dos orçamentos. | Média — pós-MVP |
| **Contas bancárias múltiplas** | Gerenciar saldos de múltiplas contas (Nubank, Inter, carteira). Transferências entre contas | Feature padrão em apps maduros. Essencial para visão completa. | Alta — v2 |
| **Cartão de crédito com fatura** | Tratar cartão de crédito como "conta" separada com fatura mensal, limite, e parcelamento | Mobills e Organizze fazem bem. Feature #1 pedida por usuários BR | Alta — v2 |
| **Regras de categorização automática** | "Toda transação com 'iFood' vai para Alimentação". Regras definidas pelo usuário | YNAB e Monarch fazem. Reduz trabalho manual de categorização. | Média — pós-MVP |
| **Comparativo com média nacional** | "Você gasta 15% menos em Moradia que a média brasileira da sua faixa de renda" | Diferenciador que gera insight de valor. Dados do IBGE. Nenhum app BR faz. | Baixa — v3 |
| **Metas de economia** | "Economizar R$500 esse mês" com barra de progresso vinculada ao saldo livre | YNAB e EveryDollar fazem. No SyncLife, vincula com Futuro para visão de objetivo. | Média — pós-MVP |

### 20.2 Críticas ao Protótipo Atual

**1. Protótipo usa height fixa de 812px com scroll interno**
O novo protótipo v3 deve usar **altura automática** para que todo conteúdo seja visível e analisável por IA. O override CSS no final do arquivo resolve parcialmente, mas o padrão deve ser auto-height nativo.

**2. Navegação usa pills/chips ao invés de underline tabs**
O protótipo de Finanças Dashboard usa chips com border-radius:20px para Foco/Jornada. As tabs de navegação do módulo devem seguir o padrão underline aprovado (como no Futuro e Mente).

**3. Falta tela de Criação de Transação (form completo)**
O Quick Entry existe mas o form completo (com todos os campos) não está prototipado. Para transações complexas (parcelamento, notas, tags), o Quick Entry não é suficiente.

**4. Falta tela de Criação de Orçamento**
O protótipo mostra a lista de envelopes mas não o form de criação/edição.

**5. Falta empty states**
Nenhuma tela tem empty state. Essencial para: primeiro uso sem transações, período sem recorrentes, calendário vazio.

**6. Calendário precisa de drawer do dia**
O protótipo do calendário financeiro (arquivo separado) é robusto, mas o drawer ao clicar num dia não está no protótipo mobile simplificado.

**7. Planejamento não está no protótipo mobile**
A tela de Planejamento com timeline de 5 meses existe apenas no protótipo desktop. Precisa de versão mobile.

### 20.3 Telas Recomendadas para Prototipagem v3

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 01 | Dashboard Financeiro | 🔴 Alta | Tela principal, underline tabs |
| 02 | Transações (lista + filtros) | 🔴 Alta | Tela mais usada diariamente |
| 03 | Quick Entry (numpad) | 🔴 Alta | UX diferencial, já existe |
| 04 | Nova Transação (form completo) | 🔴 Alta | Form com todos os campos |
| 05 | Recorrentes | 🟡 Média | Lista + KPIs + próximas |
| 06 | Criar Recorrente | 🟡 Média | Form de cadastro |
| 07 | Orçamentos | 🟡 Média | Doughnut + envelopes |
| 08 | Criar Orçamento | 🟡 Média | Form de cadastro |
| 09 | Calendário Financeiro | 🟡 Média | Grid + drawer do dia |
| 10 | Planejamento (PRO) | 🟡 Média | Timeline mobile |
| 11 | Relatórios | 🟡 Média | Gráficos + export |
| 12 | Empty State (primeira transação) | 🟢 Baixa | Onboarding visual |
| 13 | Detalhe/Edição de Transação | 🟢 Baixa | Form de edição |
| 14 | Drawer do Dia (Calendário) | 🟢 Baixa | Bottom sheet com transações |

---

*Documento criado em: 07/03/2026*  
*Versão: 1.0 — Especificação Funcional Completa*  
*Protótipo base: `proto-mobile-synclife-fixed_-_novo.html` (telas 2,3,4,5)*  
*Referências: financas-visao-geral-regras-de-negocio.md, proto-calendario-financeiro_1.html, modules.ts, recorrentes/page.tsx*  
*Próximo passo: Gerar protótipo v3 (14 telas) com underline tabs e prompt para Claude Code*
