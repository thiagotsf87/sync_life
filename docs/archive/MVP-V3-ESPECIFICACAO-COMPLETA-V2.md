# MVP v3 — Especificação Funcional Completa

> **SyncLife: O Sistema Operacional da Vida Pessoal**
> **Versão:** 2.0 — Fevereiro 2026
> **Pré-requisito:** MVP v2 lançado e validado com usuários reais
> **Prazo estimado:** 16–24 semanas (módulos paralelizáveis após infraestrutura base)

---

## ÍNDICE

1. [Visão Estratégica do MVP v3](#1-visão-estratégica-do-mvp-v3)
2. [Nomenclatura dos Módulos](#2-nomenclatura-dos-módulos)
3. [Arquitetura de Módulos](#3-arquitetura-de-módulos)
4. [Módulo Futuro — Objetivos e Metas de Vida](#4-módulo-futuro)
5. [Módulo Corpo — Saúde e Atividades](#5-módulo-corpo)
6. [Módulo Patrimônio — Investimentos e Ativos](#6-módulo-patrimônio)
7. [Módulo Mente — Estudos e Aprendizado](#7-módulo-mente)
8. [Módulo Carreira — Profissão e Crescimento](#8-módulo-carreira)
9. [Módulo Experiências — Viagens e Roteiros](#9-módulo-experiências)
10. [Módulos Existentes — Impacto v3](#10-módulos-existentes)
11. [Integração Entre Módulos](#11-integração-entre-módulos)
12. [Modo Jornada por Módulo](#12-modo-jornada-por-módulo)
13. [Impacto no Life Sync Score](#13-life-sync-score)
14. [Plano de Monetização v3](#14-monetização)
15. [Critérios de Sucesso](#15-critérios-de-sucesso)
16. [Ordem de Implementação](#16-ordem-de-implementação)
17. [Documentos de Especificação por Módulo](#17-documentos-por-módulo)

---

## 1. VISÃO ESTRATÉGICA DO MVP v3

### O que muda do v2 para o v3

O MVP v2 posiciona o SyncLife como um app de finanças com metas e agenda. O MVP v3 é a transformação do SyncLife no que ele promete ser desde o início: **o sistema operacional completo da vida pessoal**.

No v2, o usuário controla dinheiro e tempo. No v3, ele controla **oito dimensões da vida** — e o mais importante: tudo conectado por um sistema central de Objetivos que distribui metas para cada módulo.

### A Tese Competitiva

Nenhum app no mercado hoje conecta finanças, saúde, carreira, estudos e viagens de forma integrada. O que existe são silos: MyFitnessPal para nutrição, Investidor 10 para carteira, Notion para estudos, Wanderlog para viagens. O SyncLife não precisa ser melhor que cada um desses apps individualmente. Ele precisa ser **o único que conecta todos esses aspectos da vida em um lugar só**, mostrando como a dieta impacta a produtividade que impacta a carreira que impacta o patrimônio.

### O Grande Diferencial Arquitetural: Futuro

O módulo **Futuro** é o coração do v3. Ele substitui o antigo módulo "Metas" por uma camada muito mais poderosa: **Objetivos de vida que distribuem metas mensuráveis para os módulos correspondentes**. Isso significa que o SyncLife não pergunta "como está sua meta financeira?", mas sim **"como está seu progresso rumo ao sonho de ter uma casa própria?"** — e a resposta envolve finanças, investimentos, carreira e tempo, tudo junto.

### Benchmark de Referência por Módulo

| Módulo SyncLife | Apps de Referência | O que o SyncLife faz diferente |
|-----------------|-------------------|-------------------------------|
| 💰 Finanças | Monarch Money, YNAB, Mobills | Projeção de fluxo de caixa, integração com todos os outros módulos |
| ⏳ Tempo | Google Calendar, Todoist | Agenda integrada que recebe eventos de todos os módulos automaticamente |
| 🔮 Futuro | Nenhum equivalente direto | Cockpit de vida que distribui metas para cada módulo e agrega progresso |
| 🏃 Corpo | MyFitnessPal, Noom, HealthifyMe | Integra consultas na agenda, conecta saúde com finanças, IA para cardápio |
| 🧠 Mente | Forest, Focus To-Do, Notion | Timer Pomodoro integrado, progresso conectado a carreira |
| 📈 Patrimônio | Investidor 10, Status Invest, Kinvo | Carteira conectada a objetivos de vida, proventos no calendário |
| 💼 Carreira | LinkedIn (parcial), Glassdoor | Roadmap conectado a estudos e finanças, impacto salarial nas projeções |
| ✈️ Experiências | Wanderlog, TripIt, TriPandoo | Orçamento integrado às finanças, roteiro na agenda, economia vinculada a objetivo |

---

## 2. NOMENCLATURA DOS MÓDULOS

### Identidade Visual dos Módulos

O SyncLife usa uma nomenclatura híbrida: nomes conceituais que criam identidade emocional + subtítulos descritivos que garantem clareza funcional.

| Ícone | Nome Conceitual | Subtítulo Descritivo | Pergunta que Responde |
|-------|----------------|---------------------|----------------------|
| 💰 | **Finanças** | Finanças e orçamento | "Como está meu dinheiro?" |
| ⏳ | **Tempo** | Agenda e compromissos | "Como está meu tempo?" |
| 🔮 | **Futuro** | Objetivos e metas de vida | "Como está meu futuro?" |
| 🏃 | **Corpo** | Saúde e atividades | "Como está meu corpo?" |
| 🧠 | **Mente** | Estudos e aprendizado | "Como está minha mente?" |
| 📈 | **Patrimônio** | Investimentos e ativos | "Como está meu patrimônio?" |
| 💼 | **Carreira** | Profissão e crescimento | "Como está minha carreira?" |
| ✈️ | **Experiências** | Viagens e roteiros | "O que eu quero viver?" |

### Regras de Exibição

- **Module Bar (ícones):** Apenas ícone + nome conceitual curto
- **Sidebar expandida:** Nome conceitual + subtítulo descritivo abaixo
- **Onboarding:** Nome conceitual + frase explicativa de uma linha
- **Dashboard Home:** Nome conceitual com ícone

### Mapeamento de Nomes (v2 → v3)

| Nome v2 | Nome v3 | Justificativa |
|---------|---------|---------------|
| Finanças | **Finanças** | Mantido — ancora na clareza funcional |
| Agenda | **Tempo** | Conceitual — abrange mais que agenda de compromissos |
| Metas | **Futuro** | Reestruturado — de metas isoladas para objetivos de vida |
| — (novo) | **Corpo** | Saúde soa clínico; Corpo = autocuidado e evolução |
| — (novo) | **Mente** | Estudos é limitante; Mente permite incluir leitura, meditação, journaling |
| — (novo) | **Patrimônio** | Investimentos é limitante; Patrimônio inclui imóveis, veículos, bens |
| — (novo) | **Carreira** | Mantido funcional — ancora na clareza junto com Finanças |
| — (novo) | **Experiências** | Viagem é limitante; Experiências permite eventos, shows, hobbies no futuro |

---

## 3. ARQUITETURA DE MÓDULOS

### 3.1 Conceito Central: Objetivos e Metas

A distinção fundamental do v3:

**Objetivo (Qualitativo):** O sonho com intenção. O "o quê" e o "porquê". É aspiracional e representa o que o usuário quer para a vida. Mora no módulo **Futuro**.

**Meta (Quantitativa):** O caminho mensurável. O "quanto", "quando" e "como medir". Cada meta pertence a um módulo específico e tem indicadores concretos de progresso.

**Hierarquia:** Um Objetivo pode ter múltiplas Metas distribuídas em diferentes módulos. O progresso do Objetivo é a média ponderada do progresso de todas as suas Metas.

### 3.2 Exemplo Arquitetural

**Objetivo: "Comprar um carro"** (tipo: Aquisição)

| Meta | Módulo | Indicador |
|------|--------|-----------|
| Economizar R$ 60.000 até Dez/2027 | 💰 Finanças | Valor acumulado na reserva |
| Pesquisar modelos e versões | ⏳ Tempo | Tarefa com deadline |
| Melhorar score de crédito | 💰 Finanças | Score atualizado |

**Objetivo: "Viajar para Europa"** (tipo: Experiência)

| Meta | Módulo | Indicador |
|------|--------|-----------|
| Juntar R$ 15.000 para viagem | 💰 Finanças | Valor acumulado |
| Tirar passaporte | ⏳ Tempo | Tarefa com deadline |
| Estudar italiano básico | 🧠 Mente | Trilha de aprendizado |

**Objetivo: "Ser promovido a Tech Lead"** (tipo: Carreira)

| Meta | Módulo | Indicador |
|------|--------|-----------|
| Completar certificação AWS | 🧠 Mente | Trilha de estudo |
| Liderar 2 projetos como referência | 💼 Carreira | Roadmap step |
| Negociar promoção com gestor | ⏳ Tempo | Compromisso agendado |

### 3.3 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                 🔮 FUTURO (Cockpit)                  │
│                                                       │
│   Objetivo 1 ──── Meta A (Finanças) ── 75% ──┐      │
│              ├─── Meta B (Tempo)     ── 100% ─┤ 78%  │
│              └─── Meta C (Mente)     ── 60% ──┘      │
│                                                       │
│   Objetivo 2 ──── Meta D (Carreira)  ── 40% ──┐      │
│              ├─── Meta E (Mente)     ── 60% ─┤ 47%  │
│              └─── Meta F (Finanças)  ── 40% ──┘      │
│                                                       │
│   ┌─────────────────────────────────────────────┐    │
│   │  Progresso atualizado em qualquer módulo     │    │
│   │  → reflete automaticamente no Objetivo       │    │
│   └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
         │           │           │           │
    ┌────▼──┐   ┌───▼───┐  ┌───▼───┐  ┌───▼────┐
    │Finanças│   │ Tempo │  │ Mente │  │Carreira│
    │Meta A,F│   │Meta B │  │Meta C,E│  │Meta D  │
    └────────┘   └───────┘  └───────┘  └────────┘
```

### 3.4 Módulos v2 Reestruturados

| Módulo v2 | O que muda no v3 |
|-----------|-----------------|
| Finanças | Recebe metas financeiras do módulo Futuro. Salário de Carreira vira receita recorrente. Proventos de Patrimônio viram receita. Custos de Corpo viram despesa. |
| Tempo (Agenda) | Recebe eventos de todos os módulos: consultas (Corpo), blocos de estudo (Mente), viagens (Experiências), compromissos de carreira. |
| Futuro (ex-Metas) | Reestruturado completamente. De lista de metas isoladas para cockpit de objetivos de vida com metas distribuídas. |

---

## 4. MÓDULO FUTURO

> 📄 Especificação detalhada: `SPEC-FUTURO.md`

Cockpit central da vida do usuário. Todos os objetivos de vida com metas distribuídas nos módulos correspondentes. Progress tracking agregado. Visualização tipo "mapa da vida" mostrando cada dimensão. Principal diferencial competitivo do SyncLife — nenhum concorrente oferece esta visão integrada.

---

## 5. MÓDULO CORPO

> 📄 Especificação detalhada: `SPEC-CORPO.md`

Gestão de saúde, consultas médicas, evolução corporal, nutrição com IA, atividades físicas. Integra com Tempo (consultas viram eventos), Finanças (custos de saúde), Futuro (objetivos de saúde). 27+ regras de negócio.

---

## 6. MÓDULO PATRIMÔNIO

> 📄 Especificação detalhada: `SPEC-PATRIMONIO.md`

Gestão de carteira de investimentos, cotações, proventos, simulador de independência financeira. Integra com Finanças (proventos viram receita), Futuro (objetivos patrimoniais), Tempo (proventos no calendário). 19+ regras de negócio.

---

## 7. MÓDULO MENTE

> 📄 Especificação detalhada: `SPEC-MENTE.md`

Trilhas de aprendizado, Timer Pomodoro, biblioteca de recursos, sessões de estudo. Integra com Carreira (habilidades alimentam roadmap), Tempo (blocos de estudo), Futuro (objetivos de aprendizado). 21+ regras de negócio.

---

## 8. MÓDULO CARREIRA

> 📄 Especificação detalhada: `SPEC-CARREIRA.md`

Perfil profissional, roadmap de carreira, mapa de habilidades, histórico. Integra com Mente (trilhas alimentam habilidades), Finanças (salário → receita), Futuro (objetivos profissionais). 16+ regras de negócio.

---

## 9. MÓDULO EXPERIÊNCIAS

> 📄 Especificação detalhada: `SPEC-EXPERIENCIAS.md`

Planejamento de viagens de ponta a ponta, roteiro, hospedagem, orçamento, sugestões IA, checklist. Integra com Finanças (custos), Tempo (dias bloqueados), Futuro (economia para viagem). 27+ regras de negócio.

---

## 10. MÓDULOS EXISTENTES — IMPACTO V3

### 10.1 Finanças — Novas Integrações

O módulo Finanças permanece como especificado no v2, mas ganha novas fontes de dados:

- **Corpo → Finanças:** Custos de consultas médicas geram transações na categoria "Saúde"
- **Corpo → Finanças:** Orçamento alimentar do cardápio IA gera meta de gasto em "Alimentação"
- **Patrimônio → Finanças:** Proventos geram receita na categoria "Investimentos — Proventos"
- **Patrimônio → Finanças:** Aportes mensais refletem no orçamento como "Investimentos — Aportes"
- **Mente → Finanças:** Custos de cursos geram transação na categoria "Educação"
- **Carreira → Finanças:** Salário sincronizado como receita recorrente
- **Experiências → Finanças:** Custo total da viagem vira despesa planejada
- **Futuro → Finanças:** Metas financeiras de objetivos aparecem como metas vinculadas

### 10.2 Tempo (Agenda) — Novas Fontes de Eventos

O módulo Tempo permanece como especificado no v2, mas recebe eventos automaticamente de:

- **Corpo:** Consultas médicas, atividades físicas, lembretes de retorno
- **Mente:** Blocos de estudo agendados, sessões de Pomodoro
- **Carreira:** Entrevistas, reuniões de carreira, deadlines de roadmap
- **Experiências:** Dias de viagem (período bloqueado), check-in/check-out
- **Patrimônio:** Datas de pagamento de proventos (no calendário financeiro)
- **Futuro:** Deadlines de metas com prazo definido

Cada evento gerado por integração tem tag do módulo de origem e cor correspondente.

---

## 11. INTEGRAÇÃO ENTRE MÓDULOS

### 11.1 Mapa de Integrações Completo

| De → Para | Finanças | Tempo | Futuro | Corpo | Patrimônio | Mente | Carreira | Experiências |
|-----------|----------|-------|--------|-------|------------|-------|----------|--------------|
| **Finanças** | — | Transações no calendário | Metas financeiras | — | Categoria aportes | Categoria educação | Receita salarial | Despesa viagem |
| **Tempo** | — | — | Deadlines de metas | Lembretes retorno | — | Blocos de estudo | Deadlines roadmap | Dias de viagem |
| **Futuro** | Metas financeiras | Deadlines | — | Metas de saúde | Metas patrimoniais | Metas de estudo | Metas profissionais | Metas de viagem |
| **Corpo** | Custo consulta, orçamento alimentar | Consultas, atividades | Objetivos de saúde | — | — | — | — | — |
| **Patrimônio** | Proventos → receita, aportes → despesa | Proventos no calendário | Objetivos patrimoniais | — | — | — | Renda investimentos → projeção | Reserva viagem |
| **Mente** | Custo cursos → transação | Blocos estudo → agenda | Objetivos aprendizado | — | — | — | Trilha → habilidade → roadmap | — |
| **Carreira** | Salário → receita recorrente | Entrevistas → agenda | Objetivos profissionais | — | — | Habilidades ← trilhas | — | — |
| **Experiências** | Custo → despesa planejada | Dias → agenda bloqueada | Objetivos de viagem | — | — | — | — | — |

### 11.2 Regras de Integração Transversais

- **RN-INT01:** Toda integração entre módulos é opt-in (desativável nas Configurações)
- **RN-INT02:** Transações geradas por integração são marcadas com badge "Auto" e referência ao módulo de origem
- **RN-INT03:** Exclusão em cascata opcional: ao excluir item de origem, perguntar se deseja excluir items vinculados
- **RN-INT04:** Conflitos de agenda geram alerta visual
- **RN-INT05:** Metas vinculadas a objetivos exibem badge do Objetivo pai em todos os módulos

---

## 12. MODO JORNADA POR MÓDULO

### Filosofia

No MVP v2, o Modo Jornada traz gamificação e insights para Finanças. No v3, cada novo módulo ganha sua própria camada de Jornada. O Modo Jornada é feature PRO que transforma dados frios em experiência motivacional.

| Módulo | Modo Foco (FREE) | Modo Jornada (PRO) |
|--------|-------------------|---------------------|
| Futuro | Lista de objetivos com % | Mapa visual da vida com progresso animado, frases motivacionais, celebrações de marco |
| Corpo | Números: peso, TMB, próxima consulta | Coach IA, celebrações, badges de consistência, insights cruzados |
| Patrimônio | Tabelas, gráficos, cálculos | Barra de progresso para IF, contexto motivacional dos proventos |
| Mente | Timer simples, barras de progresso | Sons ambiente, XP e níveis, streak visual, insights de produtividade |
| Carreira | Timeline com status | Jornada do herói, radar chart animado, impacto financeiro de promoção |
| Experiências | Formulários e listas | Assistente IA conversacional, countdown animado, diário pós-viagem |

---

## 13. LIFE SYNC SCORE v3

### Novo Cálculo

Com o módulo Futuro como cockpit central, o Life Sync Score evolui:

```
Life Sync Score v3 = (
    Finanças      × 0.20 +
    Futuro        × 0.20 +
    Corpo         × 0.15 +
    Patrimônio    × 0.10 +
    Mente         × 0.10 +
    Carreira      × 0.10 +
    Tempo         × 0.10 +
    Experiências  × 0.05
) × 100
```

**Componentes:**

| Módulo | Fórmula |
|--------|---------|
| Finanças | (% orçamento respeitado × 0.4) + (consistência de registro × 0.3) + (tendência vs mês anterior × 0.3) |
| Futuro | (% de objetivos com progresso no mês × 0.5) + (metas concluídas no trimestre × 0.5) |
| Corpo | (atividades/semana ÷ meta × 0.3) + (consultas em dia × 0.3) + (registro de peso × 0.2) + (passos ÷ meta × 0.2) |
| Patrimônio | (aporte realizado ÷ planejado × 0.5) + (diversificação × 0.5) |
| Mente | (horas estudadas ÷ meta semanal × 0.5) + (streak × 0.3) + (trilhas em progresso × 0.2) |
| Carreira | (passos do roadmap em progresso × 0.5) + (habilidades evoluindo × 0.5) |
| Tempo | (% eventos concluídos × 0.5) + (consistência de uso × 0.5) |
| Experiências | Impacto indireto via Finanças e Futuro (viagem é episódica) |

**Regra:** Módulos não utilizados são excluídos e pesos redistribuídos proporcionalmente.

---

## 14. MONETIZAÇÃO v3

### Tabela FREE vs PRO

| Feature | FREE | PRO (R$ 29,90/mês) |
|---------|------|---------------------|
| **Futuro** | | |
| Objetivos ativos | 3 | Ilimitados |
| Metas por objetivo | 3 | Ilimitadas |
| Insights de progresso | ❌ | ✅ |
| **Corpo** | | |
| Consultas ativas | 3/mês | Ilimitadas |
| TMB + TDEE + registro de peso | ✅ | ✅ |
| Cardápio IA (regenerações) | 3/semana | Ilimitadas |
| Coach IA de nutrição | ❌ | ✅ |
| **Patrimônio** | | |
| Ativos na carteira | 10 | Ilimitados |
| Cotações | Diárias | Tempo real |
| Simulador IF | ❌ | ✅ |
| Comparativo vs benchmark | ❌ | ✅ |
| **Mente** | | |
| Trilhas ativas | 3 | Ilimitadas |
| Timer Pomodoro | ✅ | ✅ |
| Sons ambiente | ❌ | ✅ |
| Insights de produtividade | ❌ | ✅ |
| **Carreira** | | |
| Roadmaps ativos | 1 | 3 |
| Perfil profissional | ✅ | ✅ |
| Impacto financeiro de promoção | ❌ | ✅ |
| **Experiências** | | |
| Viagens ativas | 1 | Ilimitadas |
| Roteiro dia a dia | ✅ | ✅ |
| Sugestões IA | 5/viagem | Ilimitadas |
| Export PDF | ❌ | ✅ |
| **Modo Jornada (todos)** | ❌ | ✅ |
| **Life Sync Score completo** | Finanças apenas | Todos os módulos |

### Justificativa do Preço

R$ 29,90/mês para funcionalidades que, separadas, custariam 130+/mês:
- MyFitnessPal Premium: ~R$ 40/mês
- Investidor 10 PRO: R$ 39,90/mês
- Forest PRO: ~R$ 25/ano
- Wanderlog PRO: ~R$ 25/mês

---

## 15. CRITÉRIOS DE SUCESSO

| Critério | Meta | Como Medir |
|----------|------|------------|
| Módulos ativos por usuário PRO | ≥ 3 | Analytics |
| Retenção D30 geral | > 20% | Analytics |
| Retenção D30 de quem usa 3+ módulos | > 40% | Analytics |
| Conversão FREE → PRO | > 8% | Analytics |
| NPS | > 50 | Pesquisa in-app |
| Integrações entre módulos utilizadas | > 60% dos PRO | Analytics |
| Objetivos criados por usuário ativo | > 2 | Supabase |
| Life Sync Score médio | > 55 | Supabase |
| MRR (receita mensal recorrente) | R$ 10.000+ | Stripe/Supabase |

---

## 16. ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Fase 1 — Infraestrutura v3 (2 semanas)
- Expandir schema do banco com novas tabelas
- Expandir shell de navegação (8 módulos)
- Implementar sistema de Objetivos → Metas (Futuro)
- Atualizar Life Sync Score para novo cálculo
- Configurar API de cotações
- Configurar stack de IA: Vercel AI SDK + Google Gemini (free, MVP) → Anthropic Claude (produção)

### Fase 2 — Módulo Futuro (2 semanas)
Prioridade máxima pois é o módulo que conecta todos os outros. Sem ele, os novos módulos seriam silos.

### Fase 3 — Módulo Corpo (4 semanas)
Maior apelo emocional, engajamento diário (peso, atividades, passos).

### Fase 4 — Módulo Mente (3 semanas)
Timer Pomodoro é feature de engajamento diário. Integração com Carreira é simples se feita antes.

### Fase 5 — Módulo Carreira (3 semanas)
Depende do Mente (habilidades) para integração completa.

### Fase 6 — Módulo Patrimônio (4 semanas)
Depende de APIs externas (cotações) e tem mais complexidade técnica.

### Fase 7 — Módulo Experiências (4 semanas)
Módulo mais independente, usado episodicamente.

### Fase 8 — Integrações + Modo Jornada (2-4 semanas)
Após módulos individuais funcionando.

---

## 17. DOCUMENTOS DE ESPECIFICAÇÃO POR MÓDULO

Cada módulo possui especificação detalhada individual:

| Documento | Módulo | Regras de Negócio | Status |
|-----------|--------|-------------------|--------|
| `SPEC-FUTURO.md` | 🔮 Futuro | RN-FUT-01 a RN-FUT-XX | ✅ Criado |
| `SPEC-CORPO.md` | 🏃 Corpo | RN-CRP-01 a RN-CRP-XX | ✅ Criado |
| `SPEC-PATRIMONIO.md` | 📈 Patrimônio | RN-PTR-01 a RN-PTR-XX | ✅ Criado |
| `SPEC-MENTE.md` | 🧠 Mente | RN-MNT-01 a RN-MNT-XX | ✅ Criado |
| `SPEC-CARREIRA.md` | 💼 Carreira | RN-CAR-01 a RN-CAR-XX | ✅ Criado |
| `SPEC-EXPERIENCIAS.md` | ✈️ Experiências | RN-EXP-01 a RN-EXP-XX | ✅ Criado |

Cada documento contém: visão geral, telas previstas, funcionalidades detalhadas, regras de negócio, critérios de aceite, integrações com outros módulos, modo Foco vs Jornada, e modelo de dados.

---

*Documento atualizado em: Fevereiro 2026*
*Versão: 2.0 — Nova nomenclatura + Arquitetura Futuro (Objetivos → Metas)*
*Documento anterior: MVP-V3-ESPECIFICACAO-COMPLETA.md (v1.0)*
