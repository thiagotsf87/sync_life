# ROADMAP DE IMPLEMENTAÇÃO — MVP v3 SyncLife

> **O Sistema Operacional da Vida Pessoal**
> **Data:** 27/02/2026
> **Pré-requisito:** MVP v2 implementado e validado
> **Estimativa total:** 24–32 semanas (6–8 meses)
> **Autor:** Claude (análise estratégica baseada nas specs do projeto)

---

## 1. DIAGNÓSTICO: ONDE ESTAMOS HOJE

### 1.1 Estado atual do projeto

Antes de falar sobre o futuro, é essencial entender exatamente onde o SyncLife está agora. Pense nisso como um GPS: antes de traçar a rota, ele precisa saber o ponto de partida.

**O que já está pronto (MVP v2 — Planejamento):**

- 19 protótipos HTML aprovados cobrindo 100% das telas do MVP v2
- 6 de 19 dev specs prontas (Shell, Auth, Onboarding, Configurações, Dashboard Financeiro, Landing Page)
- Fase 1 (Fundação) com 100% das specs prontas para implementação
- Design system auditado com 14 issues identificadas e resolvidas
- Infraestrutura Vercel + Supabase configurada
- ADR-001 aprovado com nomenclatura e arquitetura v3 definida
- 6 especificações de módulos v3 criadas (Futuro, Corpo, Patrimônio, Mente, Carreira, Experiências)

**O que AINDA PRECISA ser feito antes do v3:**

- Implementar o MVP v2 em Next.js (as 19 telas ainda são protótipos HTML)
- Criar as 13 dev specs restantes do v2 (sob demanda)
- Validar o v2 com usuários reais
- Só então partir para o v3

### 1.2 A verdade inconveniente (minha crítica honesta)

Thiago, preciso ser direto aqui: **o MVP v2 ainda não foi implementado em código**. Existem protótipos e especificações excelentes, mas nenhuma linha de Next.js rodando em produção. O v3 é ambicioso e fantástico na concepção, mas pular etapas seria um erro fatal.

Minha recomendação é organizar a implementação em **duas grandes ondas**:

- **Onda 1:** Implementar e lançar o MVP v2 (Finanças + Metas + Tempo)
- **Onda 2:** Expandir para o MVP v3 (6 novos módulos + Futuro reestruturado)

O roadmap abaixo cobre **ambas as ondas** de forma integrada, porque decisões arquiteturais do v2 impactam diretamente o v3.

---

## 2. BENCHMARK COMPETITIVO: O QUE O MERCADO FAZ

### 2.1 Por que fazer benchmark?

Benchmark significa olhar o que os concorrentes estão fazendo para entender onde estão as oportunidades e evitar reinventar a roda. É como estudar o cardápio de vários restaurantes antes de abrir o seu: você descobre o que funciona, o que falta, e onde pode inovar.

### 2.2 Mapa competitivo atualizado (2025-2026)

| App | O que faz | Preço | Ponto forte | Ponto fraco |
|-----|-----------|-------|-------------|-------------|
| **YNAB** | Orçamento (envelope) | $14.99/mês | Metodologia educativa fortíssima | Só finanças, sem metas de vida |
| **Monarch Money** | Finanças completas | $9.99/mês | Substituiu Mint, melhor UX do mercado | Sem saúde, carreira, estudos |
| **Quicken Simplifi** | Finanças + projeção | $5.99/mês | Projeção de fluxo de caixa | Sem integração com vida |
| **Notion (LifeOS)** | Tudo (customizável) | $10/mês | Flexibilidade total | Exige semanas de setup, sem fórmulas financeiras nativas |
| **Life Planner** | Tarefas + finanças + hábitos | Freemium | All-in-one básico | Raso em tudo, sem investimentos |
| **Habitica** | Gamificação de hábitos | Freemium | Gamificação divertida | Sem finanças, sem carreira |
| **MyFitnessPal** | Nutrição + exercício | $19.99/mês | Base de alimentos gigante | Só saúde, sem conexão com finanças |
| **Investidor 10** | Investimentos BR | R$ 29/mês | Dados B3 completos | Só investimentos |
| **BofA Life Plan** | Finanças + metas de vida | Só clientes BofA | 7 dimensões de vida integradas | Preso ao ecossistema do banco |

### 2.3 O gap de mercado que o SyncLife ocupa

A análise revela algo crucial: **nenhum app no mundo conecta todas as dimensões da vida de forma nativa e integrada**. O que existe são duas categorias:

1. **Apps especializados** (YNAB, MyFitnessPal, Investidor 10): excelentes no que fazem, mas são silos isolados
2. **Apps genéricos** (Notion, Life Planner): tentam cobrir tudo, mas são rasos ou exigem setup manual enorme

O SyncLife não precisa ser melhor que o YNAB em orçamento ou que o MyFitnessPal em nutrição. Precisa ser **o único que mostra como sua dieta impacta sua produtividade que impacta sua carreira que impacta seu patrimônio**. Essa é a tese competitiva, e o módulo **Futuro** (Objetivos → Metas distribuídas) é a peça que materializa isso.

### 2.4 Lições do benchmark para priorização

| Lição | Fonte | Impacto na priorização |
|-------|-------|------------------------|
| Finanças são a porta de entrada | YNAB, Monarch: 90%+ dos usuários começam por finanças | Confirma: v2 (Finanças) deve ser sólido antes de expandir |
| Gamificação retém | Habitica: retenção 2x maior com gamificação | Modo Jornada e Conquistas são críticos para retenção |
| Timer Pomodoro gera uso diário | Forest, Pomofocus: 40M+ downloads | Módulo Mente com Timer deve vir cedo (engajamento diário) |
| Nutrição com IA é tendência | MyFitnessPal AI, Noom | Cardápio IA no Corpo é diferencial forte |
| Investimentos BR são nicho carente | Investidor 10 é caro, Status Invest é fraco | Patrimônio com cotações B3 pode atrair público PRO |
| Planejamento de viagem é episódico | Wanderlog, TripIt | Experiências pode esperar — uso esporádico |
| Carreira é aspiracional | LinkedIn: 1B perfis, mas 0 planejamento pessoal | Carreira é poderoso para conversão PRO (impacto financeiro) |

---

## 3. ESTRATÉGIA DE PRIORIZAÇÃO: FRAMEWORK ICE + DEPENDÊNCIAS

### 3.1 Como estou priorizando (explicação para leigo)

Imagine que você tem 8 cômodos para reformar numa casa (os 8 módulos do SyncLife). Não dá para reformar todos ao mesmo tempo — você precisa decidir a ordem. Eu uso três critérios:

1. **Impacto (I):** Quanto esse módulo agrega ao produto? Quantos usuários ele atrai ou retém?
2. **Confiança (C):** Quão seguros estamos de que vai funcionar? Tem dependência técnica complexa?
3. **Esforço (E):** Quanto tempo e complexidade técnica?

A fórmula é: **Prioridade = (Impacto × Confiança) ÷ Esforço**

Além disso, considero o **grafo de dependências**: alguns módulos precisam de outros prontos antes. É como não poder pintar a parede antes de fazer a instalação elétrica.

### 3.2 Matriz de priorização dos módulos v3

| Módulo | Impacto (1-10) | Confiança (1-10) | Esforço (semanas) | Score ICE | Dependências |
|--------|---------------|-------------------|-------------------|-----------|--------------|
| 🔮 Futuro | 10 | 9 | 2-3 | **30.0** | MVP v2 completo (Metas migra para Futuro) |
| 🧠 Mente | 8 | 9 | 3 | **24.0** | Futuro (metas de aprendizado) |
| 💼 Carreira | 7 | 8 | 3 | **18.7** | Mente (habilidades alimentam roadmap) |
| 🏃 Corpo | 9 | 7 | 4 | **15.8** | Futuro, API Claude (nutrição IA) |
| 📈 Patrimônio | 8 | 6 | 4 | **12.0** | API cotações (B3/externa), Finanças |
| ✈️ Experiências | 6 | 8 | 4 | **12.0** | Futuro, Finanças, Tempo |

### 3.3 Insights que mudam a ordem original

A ordem que estava no `MVP-V3-ESPECIFICACAO-COMPLETA-V2.md` é:
Futuro → Corpo → Mente → Carreira → Patrimônio → Experiências

**Minha recomendação muda a posição do Corpo e do Mente/Carreira.** Motivos:

1. **Mente antes do Corpo** porque o Timer Pomodoro gera **uso diário** imediato (como o Forest que tem 40M+ downloads). É uma feature que faz o usuário abrir o app todo dia. O Corpo, embora tenha alto apelo emocional, depende da API do Claude para nutrição IA (complexidade técnica) e tem mais telas (5 vs 5, mas com modelo de dados mais pesado — 6 tabelas vs 4).

2. **Carreira logo após Mente** porque a integração Mente→Carreira (trilha de estudo alimenta habilidade que alimenta roadmap) é o ciclo virtuoso mais poderoso do SyncLife. Implementar os dois em sequência evita retrabalho na integração.

3. **Corpo após Carreira** porque embora tenha alto apelo emocional, a parte de IA (cardápio, coach nutricional) é a mais complexa tecnicamente de todo o v3 e pode ser entregue em fases internas.

4. **Patrimônio e Experiências por último** — Patrimônio depende de APIs externas de cotações (instáveis, caras) e Experiências é episódico (viagens são planejadas poucas vezes ao ano).

---

## 4. ROADMAP COMPLETO DE IMPLEMENTAÇÃO

### VISÃO GERAL DAS ONDAS

```
ONDA 1 — MVP v2 (8-12 semanas)
═══════════════════════════════════════════════════════════════
  Fase 0: Pré-requisitos           │ 1 semana
  Fase 1: Fundação (Shell+Auth)    │ 2-3 semanas
  Fase 2: Módulo Finanças          │ 3-4 semanas
  Fase 3: Módulo Metas             │ 1-2 semanas
  Fase 4: Módulo Agenda            │ 1-2 semanas
  Fase 5: Transversais + PWA       │ 1-2 semanas
  ────── LANÇAMENTO MVP v2 ──────  │ Validação com usuários

ONDA 2 — MVP v3 (16-20 semanas)
═══════════════════════════════════════════════════════════════
  Fase 6: Infraestrutura v3        │ 2 semanas
  Fase 7: Módulo Futuro            │ 2-3 semanas
  Fase 8: Módulo Mente             │ 3 semanas
  Fase 9: Módulo Carreira          │ 3 semanas
  Fase 10: Módulo Corpo            │ 4 semanas
  Fase 11: Módulo Patrimônio       │ 3-4 semanas
  Fase 12: Módulo Experiências     │ 3-4 semanas
  Fase 13: Integrações + Jornada   │ 2-3 semanas
  ────── LANÇAMENTO MVP v3 ──────
```

---

### ONDA 1 — MVP v2 (Implementação do produto base)

---

#### FASE 0 — Pré-requisitos (1 semana)
> **Objetivo:** Resolver pendências que bloqueiam o desenvolvimento.
> **Por que fazer primeiro:** São tarefas de 30 minutos que, se esquecidas, causam confusão durante todo o desenvolvimento.

| # | Tarefa | Esforço | Prioridade |
|---|--------|---------|------------|
| 0.1 | Atualizar doc 14 — marcar todos protótipos como ✅ Aprovado | 15 min | Crítica |
| 0.2 | Atualizar doc 11 — cores funcionais reais (Emerald, Rose, Electric Blue) | 10 min | Crítica |
| 0.3 | Criar tabela centralizada de limites FREE/PRO | 30 min | Alta |
| 0.4 | Configurar projeto Next.js 16 + React 19 + TypeScript + Tailwind v4 | 2h | Crítica |
| 0.5 | Configurar Supabase: schema inicial, RLS, auth providers | 4h | Crítica |
| 0.6 | Configurar CI/CD: Vercel preview deploys, branch strategy | 2h | Alta |
| 0.7 | Implementar `tokens.css` com 4 temas (dark/light × foco/jornada) | 2h | Crítica |
| 0.8 | Configurar Playwright para testes E2E (setup base) | 2h | Média |

**Entregável:** Repositório Next.js configurado, deployando no Vercel, conectado ao Supabase, com design tokens prontos.

---

#### FASE 1 — Fundação: Shell + Auth + Onboarding + Config (2-3 semanas)
> **Objetivo:** Construir a "moldura" que todas as telas usam.
> **Por que é primeira:** Toda tela depende do Shell. Se o Shell tiver bug, TODAS as telas herdam o problema.
> **Dev Specs:** ✅ Todas prontas (17, 15, configuracoes-dev-spec)

| Semana | Tarefa | Dev Spec | Detalhes |
|--------|--------|----------|----------|
| S1 | Shell de Navegação completo | `17-NAVEGACAO-SHELL-DEV-SPEC.md` | Module Bar, Sidebar, Top Header, Mobile Bottom Bar, Content Area, ModeProvider, ThemeProvider |
| S1 | Toggle Foco/Jornada + Toggle Dark/Light | Incluído no 17 | Context providers globais com gate PRO para Jornada |
| S2 | Autenticação (Login + Cadastro + Recovery) | `15-AUTH-ONBOARDING-DEV-SPEC.md` | Supabase Auth, Google OAuth, split-screen desktop, validações |
| S2 | Onboarding (5 steps) | `15-AUTH-ONBOARDING-DEV-SPEC.md` | WizardStepper reutilizável, persistência de preferências |
| S3 | Configurações (6 seções) | `configuracoes-dev-spec.md` | Perfil, Modo, Aparência, Notificações, Integrações, Dados |

**Decisão arquitetural importante para o v3:** O Shell do v2 tem 6 módulos na Module Bar (Home, Finanças, Metas, Agenda, Conquistas + Config). No v3 serão 9+ (adicionando Corpo, Mente, Patrimônio, Carreira, Experiências e renomeando Metas→Futuro, Agenda→Tempo). **Construa a Module Bar de forma dinâmica desde o início** — um array de módulos que vem do contexto, não hardcoded. Isso economiza retrabalho na transição v2→v3.

**Insight de valor:** Adicione no Onboarding um step perguntando "quais áreas da sua vida você quer gerenciar?" com as 8 dimensões. Mesmo que no v2 só Finanças/Metas/Agenda estejam disponíveis, as outras aparecem como "Em breve — receba um aviso quando disponível". Isso serve como: (a) pesquisa de mercado (qual módulo tem mais demanda), (b) lista de espera para v3, (c) validação da tese do produto.

---

#### FASE 2 — Módulo Finanças (3-4 semanas)
> **Objetivo:** O coração financeiro do app. É a feature que justifica o download.
> **Por que é segundo:** Finanças é o módulo mais robusto, com mais telas (7) e mais regras de negócio. É a "âncora" do produto — pesquisas mostram que 90%+ dos usuários de apps de gestão de vida começam por finanças.
> **Dev Specs:** 1 de 7 prontas (Dashboard). Criar sob demanda.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S4 | **2.1 Dashboard Financeiro** | Dev spec ✅ pronta. Cards de resumo, gráficos, Consultor IA, empty states Foco vs Jornada |
| S4 | **2.2 Transações** | Criar dev spec. CRUD completo, filtros, busca, paginação, categorias, importação CSV |
| S5 | **2.3 Orçamentos (Envelope)** | Criar dev spec. Regra 50-30-20, barras de progresso, alertas 80%/100% |
| S5 | **2.4 Planejamento Futuro** | Criar dev spec. Projeção 12 meses, cenários otimista/pessimista/realista |
| S6 | **2.5 Recorrentes** | Criar dev spec. Geração automática, pausar/encerrar, frequências múltiplas |
| S6 | **2.6 Calendário Financeiro** | Criar dev spec. Visualização mensal, recorrentes + previstas + reais |
| S7 | **2.7 Relatórios** | Criar dev spec. Gráficos (pizza, barra, linha), comparativo mensal, exportar PDF |

**Ordem interna não é aleatória:** Dashboard precisa de dados → Transações criam dados → Orçamentos categorizam → Planejamento projeta → Recorrentes automatizam → Calendário visualiza → Relatórios agregam. É uma cadeia de dependência de dados.

**Insight competitivo:** O Monarch Money cobra $9.99/mês e oferece basicamente o que está nesta Fase 2. Se o SyncLife entregar isso como FREE (com limites), já compete de frente com apps pagos.

---

#### FASE 3 — Módulo Metas (1-2 semanas)
> **Objetivo:** Permitir que o usuário defina e acompanhe metas.
> **Nota v3:** Este módulo será completamente reestruturado no v3 (vira "Futuro"). Implemente o básico agora com a arquitetura já pensando na migração. As tabelas `goals` e `goal_deposits` do v2 serão migradas para `objectives` e `objective_goals` no v3.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S8 | **3.1 Lista de Metas** | Criar dev spec. Cards com progresso, filtros, categorias |
| S8 | **3.2 Nova Meta (Wizard)** + **3.3 Detalhe** | Criar dev spec. Wizard 4 steps (reutiliza WizardStepper do Onboarding), timeline de marcos |

**Dica arquitetural para o v3:** Crie a tabela `goals` já com um campo `category` que aceite os valores que serão os módulos do v3 (financial, health, professional, educational, experience, personal). Isso facilita enormemente a migração para Objetivos→Metas.

---

#### FASE 4 — Módulo Agenda (1-2 semanas)
> **Objetivo:** Gestão de tempo e compromissos.
> **Nota:** Google Calendar Sync foi removido do MVP v2 (alta complexidade OAuth). Aparece como card bloqueado em Configurações > Integrações.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S9 | **4.1 Agenda Principal** | Criar dev spec. Visão semanal/mensal, drag & drop, cores por tipo |
| S9 | **4.2 Agenda CRUD** | Criar dev spec. Criar/editar eventos, integração Meta→Agenda ("Agendar sessão de foco") |

---

#### FASE 5 — Transversais + PWA + Lançamento (1-2 semanas)
> **Objetivo:** Páginas que dependem de dados de todos os módulos anteriores.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S10 | **5.1 Dashboard Home** | Criar dev spec. Agrega Finanças + Metas + Agenda num resumo |
| S10 | **5.2 Conquistas** | Criar dev spec. Sistema de badges, gamificação, desbloqueáveis |
| S10 | **5.3 Landing Page** | Dev spec ✅ pronta. Deploy independente (pública, sem auth) |
| S11 | **5.4 PWA** | Manifest, service worker, ícones, offline mode, cache |
| S11 | **5.5 Testes E2E** | Rodar Playwright em flows críticos (cadastro→onboarding→dashboard→transação) |
| S11 | **5.6 QA + Bug fixes** | Semana de estabilização antes do lançamento |

**🚀 MARCO: Lançamento MVP v2 → Validação com usuários reais (2-4 semanas de coleta de feedback)**

---

### PAUSA ESTRATÉGICA: VALIDAÇÃO DO V2

> **Isso não é opcional.** A spec do MVP v3 diz explicitamente: "Pré-requisito: MVP v2 lançado e validado com usuários reais."

**O que fazer durante a validação:**

1. **Medir:** Instalar analytics (PostHog, Mixpanel ou similar) para rastrear: conversão do onboarding, DAU/MAU, features mais usadas, onde os usuários abandonam
2. **Ouvir:** Formulário de feedback in-app (NPS), entrevistas com 5-10 usuários
3. **Preparar:** Enquanto os dados chegam, iniciar a Fase 6 (Infraestrutura v3) em paralelo

**Métricas que validam o v2:**
- Onboarding completo: > 70% dos cadastros
- Retenção D7: > 30%
- Transações registradas por usuário/mês: > 10
- NPS: > 30

Se esses números forem muito abaixo, **corrija o v2 antes de expandir para o v3.** Adicionar 6 módulos a um produto que não retém usuários é multiplicar desperdício.

---

### ONDA 2 — MVP v3 (Expansão para 8 módulos)

---

#### FASE 6 — Infraestrutura v3 (2 semanas)
> **Objetivo:** Preparar o terreno técnico para os 6 novos módulos.
> **Por que é uma fase separada:** Expandir de 3 para 8 módulos afeta banco de dados, navegação, roteamento, permissões e sistema de scoring. Fazer tudo de uma vez antes dos módulos evita conflitos de migração.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S12 | **6.1 Migração de banco** | Expandir schema Supabase com tabelas de todos os 6 novos módulos (conforme modelos de dados das SPECs). Criar migrations, RLS policies, indexes |
| S12 | **6.2 Migração Metas → Futuro** | Script de migração: cada `goal` vira 1 `objective` + 1 `objective_goal`. Preservar histórico e conquistas |
| S12 | **6.3 Shell v3** | Expandir Module Bar para 8 módulos + renomear (Metas→Futuro, Agenda→Tempo). Rotas: `/metas`→`/futuro`, `/agenda`→`/tempo` |
| S13 | **6.4 Sistema de Módulos ativos** | Cada usuário ativa/desativa módulos nas Configurações. Module Bar exibe apenas módulos ativos. Sidebar adapta-se dinamicamente |
| S13 | **6.5 Life Sync Score v3** | Atualizar cálculo para incluir 8 dimensões (peso variável por módulos ativos) |
| S13 | **6.6 Onboarding de transição** | Para usuários existentes: tela de novidades, migração de metas, seleção de novos módulos |
| S13 | **6.7 Stack de IA (Vercel AI SDK)** | Instalar `ai`, `@ai-sdk/google`, `@ai-sdk/groq`. Criar Route Handlers: `/api/ai/cardapio` (Gemini 1.5 Flash) e `/api/ai/viagem` (Gemini 1.5 Flash). Provider abstraído pelo SDK — migração para Claude é troca de 1 linha por endpoint. **NÃO usar Edge Function do Supabase** — Next.js Route Handlers são suficientes e mais simples. |
| S13 | **6.8 API Cotações** | Configurar API de cotações de mercado para Patrimônio (B3, câmbio). Avaliar: Alpha Vantage, Yahoo Finance, StatusInvest scraping |

**Entregável:** App funcionando com 8 slots de módulos, Metas migradas para Futuro, infraestrutura de IA pronta.

---

#### FASE 7 — Módulo Futuro (2-3 semanas)
> **Prioridade: MÁXIMA**
> **Por que é primeiro:** O Futuro é o coração do v3. É o módulo que transforma o SyncLife de "coleção de apps" em "sistema operacional da vida". Sem ele, os novos módulos seriam silos isolados — exatamente o que os concorrentes já oferecem.
> **Spec:** `SPEC-FUTURO.md` — 58 regras de negócio
> **Tabelas:** `objectives`, `objective_goals`, `objective_timeline`

| Semana | Subtarefa | Tela | Regras |
|--------|-----------|------|--------|
| S14 | Protótipos HTML do Futuro (3 telas) | Dashboard, Wizard, Detalhe | — |
| S14 | Dev spec do Futuro | Todas as 3 telas | — |
| S14 | **7.1 Dashboard Futuro** | Lista de objetivos com progresso agregado, filtros, badges de módulos | RN-FUT-01 a 06 |
| S15 | **7.2 Wizard Criar Objetivo** | 4 etapas: Sonho → Tipo → Metas → Confirmação. Metas distribuídas em módulos | RN-FUT-07 a 15 |
| S15 | **7.3 Detalhe do Objetivo** | Progresso detalhado por meta, timeline de marcos, insights (Jornada) | RN-FUT-16 a 25 |
| S16 | **7.4 Mapa da Vida** (Jornada only) | Radar chart das 8 dimensões, insights IA semanais | RN-FUT-26 a 30 |
| S16 | **7.5 Integrações Futuro ↔ todos** | Metas vinculadas a itens de Finanças, Tempo; preparar hooks para módulos futuros | RN-FUT-31 a 58 |

**Diferencial competitivo:** Bank of America lançou o "Life Plan" com 7 dimensões (Finance, Family, Home, Health, Work, Leisure, Giving) integradas. A diferença é que o BofA é restrito a clientes do banco. O SyncLife oferece isso para qualquer pessoa, com um sistema de Objetivos → Metas distribuídas que nenhum app consumer tem.

**Insight de valor:** O Mapa da Vida (radar chart) é o "screenshot do Instagram" — é a tela que os usuários vão compartilhar. Invista em design nele. Sugiro um botão "Compartilhar meu progresso" que gera imagem estilizada para stories.

---

#### FASE 8 — Módulo Mente (3 semanas)
> **Prioridade: ALTA**
> **Por que vem antes do Corpo:** O Timer Pomodoro gera engajamento diário. Forest (app de foco) tem 40M+ downloads. É a feature que faz o usuário abrir o SyncLife todo dia, não só quando quer registrar uma despesa. Além disso, o modelo de dados é menor (4 tabelas vs 6 do Corpo) e não depende de API externa.
> **Spec:** `SPEC-MENTE.md` — 21+ regras de negócio
> **Tabelas:** `study_tracks`, `track_steps`, `study_sessions`, `study_resources`

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S17 | Protótipos HTML + Dev spec Mente | 5 telas: Dashboard, Trilhas, Timer, Sessões, Biblioteca |
| S17 | **8.1 Dashboard Mente** | Horas da semana, streak, trilhas ativas, próximas sessões |
| S17 | **8.2 Trilhas de Aprendizado** | CRUD de trilhas com etapas, progresso automático, vínculo Carreira |
| S18 | **8.3 Timer Pomodoro** | Timer configurável (25/5, 50/10, custom), sons ambiente (Jornada), XP/níveis (Jornada) |
| S18 | **8.4 Sessões de Estudo** | Histórico, tempo por matéria, gráficos de produtividade |
| S19 | **8.5 Biblioteca de Recursos** | Links, PDFs, notas organizados por trilha |
| S19 | **8.6 Integrações** | Mente→Carreira (trilha alimenta habilidade), Mente→Tempo (blocos de estudo), Mente→Futuro (metas de aprendizado), Mente→Finanças (custo de cursos) |

**Insight competitivo:** Nenhum app de estudo conecta "horas estudadas" com "evolução de carreira" com "impacto salarial". Quando o usuário registra 2h de React no Timer, ele vê na trilha que avançou 10%, na habilidade de React que subiu de nível 3 para 4, e no roadmap de carreira que está 60% rumo a Tech Lead. Isso não existe em nenhum concorrente.

**Feature bônus de alto impacto:** "Modo Estudo" — quando o usuário inicia o Timer, o SyncLife pode enviar notificação push silenciando outras notificações do app (como lembretes de agenda) até acabar a sessão. Isso mostra respeito pelo foco do usuário.

---

#### FASE 9 — Módulo Carreira (3 semanas)
> **Prioridade: ALTA**
> **Por que vem logo após Mente:** A integração Mente→Carreira é o ciclo virtuoso mais poderoso do SyncLife (Estudo → Habilidade → Roadmap → Promoção → Salário → Finanças). Implementar os dois em sequência permite testar essa integração end-to-end.
> **Spec:** `SPEC-CARREIRA.md` — 20 regras de negócio
> **Tabelas:** `professional_profiles`, `career_roadmaps`, `roadmap_steps`, `skills`, `roadmap_step_skills`, `skill_study_tracks`

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S20 | Protótipos HTML + Dev spec Carreira | 5 telas: Dashboard, Perfil, Roadmap, Habilidades, Histórico |
| S20 | **9.1 Dashboard Carreira** | Cargo atual, próximo passo, % do roadmap, habilidades em evolução |
| S20 | **9.2 Perfil Profissional** | Cargo, empresa, salário. Sincroniza salário→Finanças como receita recorrente |
| S21 | **9.3 Roadmap de Carreira** | Timeline visual: cargo atual → cargo alvo. Steps com habilidades necessárias |
| S21 | **9.4 Mapa de Habilidades** | Skills com nível 1-5, vinculadas a trilhas de Mente. Radar chart |
| S22 | **9.5 Histórico Profissional** | Timeline de cargos, promoções, certificações |
| S22 | **9.6 Integrações** | Carreira→Finanças (salário = receita), Carreira→Mente (skills ← trilhas), Carreira→Tempo (entrevistas, deadlines), Carreira→Futuro (objetivos profissionais) |

**Insight de valor:** A feature "Simulador de Promoção" seria um diferencial matador: o usuário seleciona o próximo cargo no roadmap, informa o salário esperado, e o SyncLife recalcula automaticamente toda a projeção financeira (orçamento, metas, patrimônio). Mostra concretamente: "Se você for promovido em 6 meses, sua reserva para a casa própria chega 8 meses antes." Nenhum concorrente faz isso.

---

#### FASE 10 — Módulo Corpo (4 semanas)
> **Prioridade: ALTA (mas mais complexo tecnicamente)**
> **Por que vem aqui e não antes:** É o módulo com maior apelo emocional, mas também o mais pesado: 6 tabelas, API do Claude para nutrição, cálculos de TMB/TDEE, e o maior número de regras de negócio (35+). Precisava das integrações Futuro+Mente+Carreira estáveis antes.
> **Spec:** `SPEC-CORPO.md` — 36+ regras de negócio
> **Tabelas:** `health_profiles`, `weight_entries`, `medical_appointments`, `activities`, `meal_plans`, `meal_plan_days`

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S23 | Protótipos HTML + Dev spec Corpo | 5 telas: Dashboard, Evolução Corporal, Consultas, Atividades, Cardápio IA |
| S23 | **10.1 Dashboard Corpo** | Peso atual + meta, TMB, TDEE, próxima consulta, atividades da semana |
| S23 | **10.2 Evolução Corporal** | Registro de peso, medidas (cintura, quadril, braço), gráfico de evolução, fotos (opcional) |
| S24 | **10.3 Consultas Médicas** | CRUD de consultas, lembretes de retorno, custo→Finanças, consulta→Agenda |
| S24 | **10.4 Atividades Físicas** | Registro manual, cálculo MET, meta de passos, streak de atividade |
| S25 | **10.5 Cardápio IA (MVP)** | Chat simplificado com Claude API: gerar cardápio semanal considerando TDEE, restrições, orçamento. Aviso legal obrigatório |
| S25 | **10.6 Coach IA (Jornada)** | Modo conversacional que explica o "porquê" das sugestões nutricionais |
| S26 | **10.7 Integrações** | Corpo→Finanças (custos saúde), Corpo→Tempo (consultas, atividades), Corpo→Futuro (objetivos de saúde) |

**Insight competitivo:** MyFitnessPal cobra $19.99/mês. A feature de nutrição IA do SyncLife não precisa competir com a base de alimentos deles (impossível). O diferencial é **contextualizar a nutrição com o orçamento**: "Aqui está um cardápio semanal de 2.000 cal/dia que cabe em R$ 80/semana." Nenhum app de nutrição conecta com finanças.

**Sugestão de fase interna:** Divida a IA em duas entregas:
- **Corpo v1 (semanas 23-25):** Tudo sem IA (evolução, consultas, atividades) + cardápio IA básico
- **Corpo v2 (semana 26):** Coach IA conversacional (Jornada only)

Isso permite lançar o módulo mais cedo e iterar na IA com base no feedback.

---

#### FASE 11 — Módulo Patrimônio (3-4 semanas)
> **Prioridade: MÉDIA-ALTA**
> **Por que vem aqui:** Depende de APIs externas de cotações (B3, câmbio), o que adiciona incerteza técnica. Também depende do Finanças estável para a integração proventos→receita.
> **Spec:** `SPEC-PATRIMONIO.md` — 19+ regras de negócio
> **Tabelas:** `investment_portfolios`, `portfolio_assets`, `asset_transactions`, `dividends`, `fi_simulations`

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S27 | Protótipos HTML + Dev spec Patrimônio | 5 telas: Dashboard, Carteira, Ativo (detalhe), Proventos, Simulador IF |
| S27 | **11.1 Dashboard Patrimônio** | Patrimônio total, variação, alocação por classe, proventos do mês |
| S27 | **11.2 Carteira de Investimentos** | Lista de ativos, preço médio, P&L, % carteira, cotação via API |
| S28 | **11.3 Detalhe do Ativo** | Histórico de compras/vendas, gráfico de preço, proventos recebidos |
| S28 | **11.4 Proventos** | Agenda de proventos, histórico, proventos→receita em Finanças |
| S29 | **11.5 Simulador de Independência Financeira** | Projeção com aportes + rendimento → "Em X anos você atinge IF" |
| S29 | **11.6 Integrações** | Patrimônio→Finanças (proventos=receita, aportes=despesa), Patrimônio→Tempo (datas de proventos no calendário), Patrimônio→Futuro (objetivos patrimoniais) |

**Insight de valor:** O Simulador de IF (Independência Financeira) é a feature aspiracional do Patrimônio. Muitos brasileiros sonham com isso. A pergunta "Em quantos anos eu atinjo minha independência financeira se investir R$ X/mês?" é poderosa. Calcule usando taxa de retorno configurável e inflação.

**Decisão técnica sobre API de cotações:**

| API | Preço | Cobertura BR | Latência | Recomendação |
|-----|-------|-------------|----------|--------------|
| Alpha Vantage | Free (25 req/dia) | B3 limitada | Média | Não recomendo para BR |
| Yahoo Finance (informal) | Free | B3 via .SA suffix | Instável | Bom para MVP, risco longo prazo |
| brapi.dev | Free (limitado) | B3 completa | Boa | Melhor opção BR para MVP |
| StatusInvest | Scraping | B3 completa | Lenta | Frágil, pode quebrar |

**Recomendação:** Use brapi.dev para MVP com cache agressivo (atualizar cotações 1x/dia, não em tempo real). Patrimônio não precisa de cotação em tempo real — o usuário quer ver evolução, não fazer day trade.

---

#### FASE 12 — Módulo Experiências (3-4 semanas)
> **Prioridade: MÉDIA**
> **Por que é último:** É o módulo mais independente e de uso episódico (viagens são planejadas poucas vezes ao ano). Alto valor para quem usa, mas frequência baixa — não impacta retenção diária.
> **Spec:** `SPEC-EXPERIENCIAS.md` — 27+ regras de negócio
> **Tabelas:** `trips`, `trip_days`, `trip_activities`, `trip_accommodations`, `trip_checklist_items`, `trip_expenses`

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S30 | Protótipos HTML + Dev spec Experiências | 5 telas: Dashboard, Nova Viagem, Detalhe, Roteiro, Checklist |
| S30 | **12.1 Dashboard Experiências** | Próxima viagem, countdown, viagens planejadas, histórico |
| S30 | **12.2 Nova Viagem (Wizard)** | Destino, datas, orçamento, estilo. IA sugere roteiro (Jornada) |
| S31 | **12.3 Detalhe da Viagem** | Roteiro dia a dia, hospedagem, transporte, orçamento vs gasto real |
| S31 | **12.4 Checklist de Viagem** | Lista inteligente baseada no destino e duração |
| S32 | **12.5 Assistente IA de Viagem** (Jornada) | Chat conversacional para planejar: "Me sugira 5 restaurantes baratos em Lisboa" |
| S32 | **12.6 Integrações** | Experiências→Finanças (custo total = despesa planejada), Experiências→Tempo (dias bloqueados), Experiências→Futuro (economia para viagem) |

**Insight competitivo:** Wanderlog e TripIt são os principais apps de viagem. O diferencial do SyncLife é o orçamento integrado: o usuário vê em tempo real quanto já gastou vs quanto planejou, e isso reflete automaticamente nas Finanças. Nenhum app de viagem faz isso.

---

#### FASE 13 — Integrações Cross-Module + Modo Jornada v3 (2-3 semanas)
> **Prioridade: ALTA (finalização)**
> **Objetivo:** Garantir que todas as integrações entre módulos funcionem end-to-end e que o Modo Jornada esteja polido em todos os módulos.

| Semana | Subtarefa | Detalhes |
|--------|-----------|----------|
| S33 | **13.1 Teste de integrações** | Validar toda a matriz de integrações (tabela 11.1 da spec v3): cada seta do grafo precisa funcionar |
| S33 | **13.2 Dashboard Home v3** | Atualizar para agregar dados de 8 módulos |
| S33 | **13.3 Conquistas v3** | Adicionar conquistas dos novos módulos (streak de estudo, trilha concluída, primeira consulta registrada, etc.) |
| S34 | **13.4 Life Sync Score v3** | Score final com 8 dimensões, pesos configuráveis |
| S34 | **13.5 Modo Jornada polish** | Revisar toda a camada Jornada em cada módulo: gamificação, insights IA, celebrações, frases motivacionais |
| S35 | **13.6 Landing Page v3** | Atualizar landing para comunicar 8 módulos, novos screenshots |
| S35 | **13.7 QA final + Bug fixes** | Semana de estabilização, testes E2E completos |

**🚀 MARCO: Lançamento MVP v3**

---

## 5. GRAFO DE DEPENDÊNCIAS VISUAL

```
FASE 0 ──→ FASE 1 ──→ FASE 2 ──→ FASE 3 ──→ FASE 4 ──→ FASE 5
(Setup)    (Shell)    (Finanças) (Metas)    (Agenda)   (Home+PWA)
                                                           │
                                                    🚀 MVP v2 LAUNCH
                                                           │
                                                      VALIDAÇÃO
                                                           │
                                                       FASE 6
                                                    (Infra v3)
                                                    ╱     │     ╲
                                               FASE 7    │    FASE 8
                                             (Futuro)    │   (Mente)
                                                  │      │      │
                                                  │      │   FASE 9
                                                  │      │  (Carreira)
                                                  │      │      │
                                                  ├──────┼──────┤
                                                  │      │      │
                                              FASE 10  FASE 11  │
                                              (Corpo) (Patrim.) │
                                                  │      │      │
                                                  ├──────┼──────┤
                                                  │             │
                                              FASE 12      FASE 13
                                              (Exper.)   (Integrações)
                                                              │
                                                       🚀 MVP v3 LAUNCH
```

**Legenda de dependências:**
- Futuro precisa estar pronto antes de QUALQUER outro módulo v3 (é o módulo conector)
- Mente precisa estar pronto antes de Carreira (habilidades alimentam roadmap)
- Corpo, Patrimônio e Experiências podem ser paralelizados SE houver mais de uma pessoa desenvolvendo
- Integrações + Jornada vem por último (precisa de todos os módulos funcionando)

---

## 6. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| APIs de cotações instáveis/caras | Alta | Médio | Cache agressivo + fallback manual. Usuário pode informar cotação manualmente |
| Claude API para nutrição gerar conselhos inadequados | Média | Alto | Aviso legal obrigatório ("não substitui nutricionista"). Prompt engineering rigoroso. Revisão médica do prompt |
| Escopo v3 muito grande para 1 desenvolvedor | Alta | Alto | Lançar módulos incrementalmente (não esperar todos prontos). Cada módulo é um "mini-lançamento" |
| Migração Metas→Futuro quebrar dados de usuários v2 | Média | Alto | Script de migração com dry-run, backup automático, rollback disponível |
| Retenção baixa no v2 | Média | Alto | Não expandir para v3 até resolver. Focar em melhorar onboarding e value delivery nos primeiros 5 minutos |
| Timer Pomodoro parecer "feature de outro app" | Baixa | Médio | Sempre conectar ao contexto: "Você estudou 2h de React. Isso avançou sua meta de promoção em 5%" |

---

## 7. MÉTRICAS DE SUCESSO POR FASE

| Fase | Métrica | Meta |
|------|---------|------|
| MVP v2 Launch | Onboarding completo | > 70% |
| MVP v2 Launch | Retenção D7 | > 30% |
| MVP v2 Launch | Transações/usuário/mês | > 10 |
| Futuro (Fase 7) | Objetivos criados/usuário | > 2 |
| Mente (Fase 8) | Sessões Pomodoro/usuário/semana | > 3 |
| Carreira (Fase 9) | Roadmaps criados/usuário | > 1 |
| Corpo (Fase 10) | Registros de peso/mês | > 4 |
| Patrimônio (Fase 11) | Ativos cadastrados/usuário PRO | > 3 |
| Experiências (Fase 12) | Viagens planejadas/trimestre | > 1 |
| MVP v3 Launch | Módulos ativos/usuário PRO | > 3 |
| MVP v3 Launch | Conversão FREE→PRO | > 8% |
| MVP v3 Launch | NPS | > 50 |
| MVP v3 Launch | MRR | > R$ 10.000 |

---

## 8. RESUMO EXECUTIVO: CHECKLIST DE ATIVIDADES

### Onda 1 — MVP v2 (semanas 1-11)

- [ ] **Fase 0:** Setup do projeto (Next.js + Supabase + Vercel + tokens.css)
- [ ] **Fase 1.1:** Shell de Navegação (Module Bar + Sidebar + Top Header + Mobile)
- [ ] **Fase 1.2:** Auth (Login + Cadastro + Recovery + Google OAuth)
- [ ] **Fase 1.3:** Onboarding (5 steps + persistência)
- [ ] **Fase 1.4:** Configurações (6 seções)
- [ ] **Fase 2.1:** Dashboard Financeiro
- [ ] **Fase 2.2:** Transações
- [ ] **Fase 2.3:** Orçamentos (Envelope)
- [ ] **Fase 2.4:** Planejamento Futuro
- [ ] **Fase 2.5:** Recorrentes
- [ ] **Fase 2.6:** Calendário Financeiro
- [ ] **Fase 2.7:** Relatórios
- [ ] **Fase 3.1:** Lista de Metas
- [ ] **Fase 3.2:** Nova Meta (Wizard) + Detalhe
- [ ] **Fase 4.1:** Agenda Principal
- [ ] **Fase 4.2:** Agenda CRUD
- [ ] **Fase 5.1:** Dashboard Home
- [ ] **Fase 5.2:** Conquistas
- [ ] **Fase 5.3:** Landing Page
- [ ] **Fase 5.4:** PWA
- [ ] **Fase 5.5:** Testes E2E
- [ ] **Fase 5.6:** QA + Bug fixes
- [ ] **🚀 Lançamento MVP v2**
- [ ] **Validação** com usuários reais (2-4 semanas)

### Onda 2 — MVP v3 (semanas 12-35)

- [ ] **Fase 6:** Infraestrutura v3 (migração banco, Shell v3, módulos ativos, APIs)
- [ ] **Fase 7:** Módulo Futuro (Dashboard + Wizard + Detalhe + Mapa da Vida)
- [ ] **Fase 8:** Módulo Mente (Dashboard + Trilhas + Timer + Sessões + Biblioteca)
- [ ] **Fase 9:** Módulo Carreira (Dashboard + Perfil + Roadmap + Habilidades + Histórico)
- [ ] **Fase 10:** Módulo Corpo (Dashboard + Evolução + Consultas + Atividades + Cardápio IA)
- [ ] **Fase 11:** Módulo Patrimônio (Dashboard + Carteira + Proventos + Simulador IF)
- [ ] **Fase 12:** Módulo Experiências (Dashboard + Viagem + Roteiro + Checklist + IA)
- [ ] **Fase 13:** Integrações + Jornada + Landing v3 + QA final
- [ ] **🚀 Lançamento MVP v3**

---

## 9. DECISÕES ESTRATÉGICAS QUE RECOMENDO TOMAR AGORA

### 9.1 Lançamento incremental dos módulos v3 (não esperar tudo pronto)

Em vez de esperar as 20 semanas para lançar o v3 completo, lance cada módulo assim que ficar pronto:

| Release | Conteúdo | Semana |
|---------|----------|--------|
| v3.0 | Infra + Futuro | S16 |
| v3.1 | + Mente | S19 |
| v3.2 | + Carreira | S22 |
| v3.3 | + Corpo | S26 |
| v3.4 | + Patrimônio | S29 |
| v3.5 | + Experiências | S32 |
| v3.6 | Integrações finais + Jornada polish | S35 |

**Por que isso é melhor:** Cada release gera buzz, permite feedback por módulo, e mantém os early adopters engajados. Se você espera 6 meses para lançar tudo, os usuários do v2 perdem interesse.

### 9.2 Feature flags para módulos em desenvolvimento

Use feature flags (variáveis que ligam/desligam funcionalidades) para que módulos em desenvolvimento fiquem invisíveis para usuários normais mas acessíveis para beta testers. Isso permite testar em produção sem afetar todos os usuários.

### 9.3 Módulo Futuro como gatilho de conversão PRO

O módulo Futuro no FREE permite 3 objetivos com 3 metas cada. Isso é suficiente para o usuário entender o valor, mas restritivo o bastante para que quem realmente usa o app precise do PRO. Isso é muito mais eficaz do que restringir por número de transações (que frustra o usuário).

### 9.4 IA como diferencial PRO, não como core

Todas as features de IA (Nutrição, Coach, Assistente de Viagem) devem funcionar como **camada extra**, nunca como funcionalidade essencial. Motivo: APIs de IA têm custo por chamada. Se for essencial, cada usuário FREE gera custo. Se for PRO-only, o custo é coberto pela assinatura.

Exceção: insights simples no Dashboard (que podem ser calculados localmente, sem API) devem estar disponíveis no FREE para demonstrar valor.

### 9.5 Estratégia de providers de IA (MVP → Produção)

**MVP (validação de hipótese — sem custo):**

| Endpoint | Provider | Modelo | Limite free |
|----------|----------|--------|------------|
| `/api/ai/cardapio` | Google Gemini | gemini-1.5-flash | 1.500 req/dia |
| `/api/ai/viagem` | Google Gemini | gemini-1.5-flash | 1.500 req/dia |
| `/api/ai/coach` (chat) | Groq | llama-3.3-70b | 14.400 req/dia |

**Produção (pós-validação, quando MRR ≥ R$ 2.000):**

Todos os endpoints migram para **Anthropic Claude** alterando 1 linha por Route Handler — o restante do código (schema Zod, frontend, testes) não muda.

**Packages:**
```bash
# MVP
npm install ai @ai-sdk/google @ai-sdk/groq

# Migração para produção (adicionar)
npm install @ai-sdk/anthropic
```

**Arquitetura (Next.js Route Handlers — não usar Supabase Edge Functions):**
```
Client → POST /api/ai/[endpoint] → Route Handler → Vercel AI SDK → Provider
```

---

*Documento criado em: 27/02/2026*
*Baseado em: MVP-V3-ESPECIFICACAO-COMPLETA-V2.md, ADR-001, SPEC-FUTURO/CORPO/MENTE/CARREIRA/PATRIMONIO/EXPERIENCIAS, 18-STATUS-DEV-SPECS-ATUALIZADO.md, audit-report.md*
*Próximo passo: Iniciar Fase 0 (setup do projeto Next.js)*
