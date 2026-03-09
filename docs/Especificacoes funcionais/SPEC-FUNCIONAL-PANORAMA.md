# 🌐 Especificação Funcional — Módulo Panorama

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Panorama — Visão Geral e Gamificação  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#6366f1` (Indigo) — **NOVA COR** (anteriormente #10b981, igual a Finanças)  
> **Ícone Lucide:** `Globe`  
> **Subtítulo descritivo:** "Cockpit da sua vida"  
> **Pergunta norteadora:** "Como está minha vida?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Conquistas](#6-tela-02--conquistas)
7. [Tela 03 — Ranking](#7-tela-03--ranking)
8. [Telas L2 — Detalhes e Modais](#8-telas-l2)
9. [Tela Especial — Review Semanal](#9-tela-especial--review-semanal)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações com Outros Módulos](#11-integrações-com-outros-módulos)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Motor Central](#15-life-sync-score)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Panorama

O Panorama é o **cockpit central do SyncLife** — a tela onde o usuário aterrissa ao abrir o app. Diferente de todos os outros módulos que gerenciam uma dimensão específica da vida (Finanças, Corpo, Mente...), o Panorama **sintetiza todos eles** em uma visão unificada.

Ele responde à pergunta mais ambiciosa do SyncLife: **"Como está minha vida, em uma tela?"**

O Panorama tem 3 responsabilidades:

1. **Dashboard** — Mostrar o Life Sync Score, KPIs-resumo de cada módulo ativo, insight IA cross-módulo, heatmap de gastos, e ações rápidas
2. **Conquistas** — Sistema de badges/achievements que recompensa comportamento positivo em qualquer módulo (gamificação core)
3. **Ranking** — Leaderboard anônimo onde o usuário vê sua posição relativa na comunidade SyncLife

### 1.2 Por que este módulo existe

Sem o Panorama, o SyncLife seria uma **coleção de silos**. O usuário teria que abrir cada módulo individualmente para entender como está sua vida. O Panorama resolve isso criando uma camada de síntese que:

- Puxa os dados mais relevantes de TODOS os módulos ativos
- Calcula o Life Sync Score (métrica proprietária do SyncLife)
- Gera insights cross-módulo via IA ("Seus gastos com delivery caíram 20%, mas sua hidratação está abaixo da meta")
- Gamifica o uso do app como um todo (não apenas um módulo)
- Cria senso de comunidade via ranking

### 1.3 Proposta de valor única

**Nenhum app concorrente tem um "cockpit de vida" com gamificação integrada.** O Habitica gamifica tarefas. O Strava gamifica corrida. O Duolingo gamifica idiomas. O SyncLife gamifica **viver bem** — finanças, saúde, metas, carreira, tudo junto. Quando o usuário desbloqueia o badge "3 Meses no Verde" (saldo positivo por 3 meses), isso valida um comportamento financeiro real.

### 1.4 As 3 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Cockpit unificado — Life Score, KPIs cross-módulo, insight IA, ações rápidas | Diária (porta de entrada) |
| 02 | Conquistas | Catálogo de badges com raridades, progresso parcial em bloqueadas, filtros por categoria | Semanal |
| 03 | Ranking | Leaderboard com posição, score por categoria, evolução temporal, próximos marcos | Semanal |

### 1.5 Mudança de Cor — Justificativa

A cor anterior (`#10b981` emerald) era idêntica à do módulo Finanças, causando confusão visual na Module Bar e nos badges. A nova cor **`#6366f1` (Indigo)** foi escolhida porque:

- É distinta de todos os 8 módulos + configurações
- Transmite "inteligência, síntese, visão ampla" — ideal para um cockpit
- O gradiente `#6366f1 → #0055ff` funciona como identidade visual do "meta-layer"
- No Navy Dark theme, indigo cria contraste elegante sem ser gritante

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **Habitica** | RPG completo para produtividade (avatar, party, quests), XP/gold/drops, engajamento altíssimo entre hardcore users. 4M+ downloads | Estética "gamer" afasta profissionais, sem integração com dados reais (finanças, saúde), sistema de punição (HP) gera ansiedade, sem visão holística de vida | Free / $47.99/ano |
| **Duolingo** | Streak é uma das mecânicas de retenção mais poderosas do mundo. 500M+ users. Leaderboards semanais. XP + níveis + ligas | Apenas idiomas. O ranking reseta semanalmente. Sem conexão com outros aspectos da vida | Free / $84/ano |
| **Forest** | Visual encantador (árvore cresce enquanto foca), bloqueio de apps, comunidade planta árvores reais | Apenas foco/timer. Sem dashboard unificado. Sem badges multi-dimensão | ~R$25/ano |
| **Strava** | Leaderboard de segmentos (King of Mountain), clubs, challenges mensais, kudos sociais. Gamificação fitness referência | Apenas corrida/ciclismo. Sem gamificação de outros aspectos da vida | Free / $80/ano |
| **Apple Health** | Hub agregador de saúde, trends adaptativas, Summary inteligente. Integração com todos os wearables iOS | Sem gamificação (zero). Sem conquistas. Sem ranking. Sem insight cross-domínio (só saúde) | Gratuito (iOS only) |
| **Samsung Health** | Points system, challenges, community leaderboard, daily score | Preso ao ecossistema Samsung. Gamifica apenas saúde/fitness | Gratuito (Samsung) |
| **Notion + Templates Gamificados** | Flexibilidade total. Templates de "Life RPG" com XP, skill trees, progress bars. Comunidade cria | Requer setup manual extenso. Sem cálculos automáticos. Sem ranking. Sem dados reais integrados | Free / $10+/mês |
| **TickTick** | Habit tracker + task management + Pomodoro, streaks, achievements | Foco em tarefas e hábitos. Sem integração financeira, sem saúde, sem cockpit unificado | Free / $35.99/ano |
| **Beeminder** | Commitment contracts (perde dinheiro se não cumprir meta). Accountability extremo | Interface intimidadora. Modelo punitivo. Sem gamificação positiva. Nicho | Free / Pay-per-fail |

### 2.2 Diferenciais Competitivos do SyncLife Panorama

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Life Sync Score multi-dimensional** | Uma métrica única (0-100) que pondera Finanças, Futuro, Corpo, Mente, Patrimônio, Carreira, Tempo, Experiências. Não é apenas "hábitos completados" | Ninguém (Samsung Health tem daily score mas só saúde) |
| **Badges baseados em dados REAIS** | "3 Meses no Verde" valida 90 dias de saldo positivo real em Finanças. "Triatleta de Metas" exige 3 metas ativas simultâneas. Não são checkboxes auto-reportados | Ninguém (Habitica é auto-reportado) |
| **Ranking cross-vida** | Posição relativa baseada em Score que pondera TODAS as dimensões. Não é ranking de corrida ou de idiomas — é ranking de "vida organizada" | Ninguém |
| **Insight IA cross-módulo** | "Você gastou R$340 menos que a média. Atenção: 1 meta abaixo do ritmo." Cruza Finanças + Futuro + Corpo num único card | Ninguém |
| **Ações rápidas contextuais** | Dashboard oferece Transação, Evento, Revisão, Foto Recibo — cada uma abre o fluxo correto no módulo certo, sem sair do contexto | Notion (parcial, com templates) |
| **4 raridades de badges** | Comum (10pts), Incomum (25pts), Rara (50pts), Lendária (100pts) — sistema inspirado em jogos que cria aspiração e progressão | Habitica (similar em mecânica, diferente em contexto) |

### 2.3 O que aprendemos com o benchmark

**Do Duolingo:** Streak é a mecânica mais poderosa de retenção. No SyncLife, o streak de uso diário (registrar qualquer dado em qualquer módulo) é o motor principal do Ranking. A pesquisa mostra que streaks do Duolingo aumentam em 15% a conclusão de lições.

**Do Habitica:** O sistema de raridades (comum/raro/épico/lendário) cria aspiração. No SyncLife, adaptamos para 4 níveis com pontuação diferenciada: cada badge lendária vale 10x uma comum, criando incentivo forte para comportamentos de longo prazo.

**Do Strava:** Leaderboards semanais geram engajamento recorrente ("preciso voltar ao top 10 essa semana"). No SyncLife, o ranking tem filtro "Esta semana" que reseta parcialmente, mantendo competição fresca.

**Do Forest:** A simplicidade visual do progresso (árvore crescendo) é poderosa. No SyncLife, o ring do Life Score com animação de preenchimento cria o mesmo efeito de "construção visual".

**Do Beeminder:** Accountability funciona, mas punição gera abandono. No SyncLife, usamos apenas reforço positivo (XP, badges, ranking) — nunca punição. Pesquisas mostram que gamificação positiva retém 30% mais que punitiva (estudo Habitica vs Beeminder).

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                  🌐 PANORAMA — NAVEGAÇÃO PRINCIPAL                    │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Conquistas │ Ranking                                    │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────────┬──────────────┬─────────────────────────────────┘
       │              │              │
       ▼              ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌─────────┐
  │01       │   │02        │   │03       │
  │DASHBOARD│   │CONQUISTAS│   │RANKING  │
  │Life Score│   │Badges    │   │Leader-  │
  │KPIs     │   │Filtros   │   │board    │
  │Insight  │   │Progresso │   │Score    │
  │Ações    │   │          │   │Marcos   │
  └────┬────┘   └────┬─────┘   └─────────┘
       │              │
       │         ┌────┼────┐
       │         │    │    │
       ▼         ▼    ▼    ▼
      04        05   06   07
   REVIEW     BADGE BADGE TODAS
   SEMANAL   DETALHE SHARE  (filtro)
   (modal)   (modal)
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" / Home | — (tela inicial do app) |
| **L1** | 02 Conquistas | Sub-nav "Conquistas" | — |
| **L1** | 03 Ranking | Sub-nav "Ranking" | — |
| **L2** | 04 Review Semanal | CTA "Revisão" no Dashboard ou notificação | ✕ Fecha (volta 01) |
| **L2** | 05 Detalhe da Badge | Tap em card de badge (02) | ← Conquistas (02) |
| **L2** | 06 Compartilhar Badge | Botão "Compartilhar" no detalhe (05) | ← Detalhe (05) |

### 3.3 Padrão de Navegação

**Header do módulo:**
- Ícone do módulo (🌐) + Nome ("Panorama") à esquerda
- Saudação personalizada ("Boa tarde, Thiago!") no Modo Jornada
- Período seletor à direita (Março 2026)

**Sub-nav:**
- Tabs com underline (não pills) — PADRÃO FUTURO
- Tab ativa: texto branco/claro + underline na cor do módulo (`#6366f1`)
- 3 tabs: Dashboard, Conquistas, Ranking

---

## 4. MAPA DE FUNCIONALIDADES

```
🌐 PANORAMA
│
├── 📊 Dashboard (Home)
│   ├── Saudação + streak
│   ├── Life Sync Score (ring animado com nota 0-100)
│   ├── Dimensões do score (grid: Finanças, Futuro, Corpo, Mente...)
│   ├── Insight IA cross-módulo
│   ├── KPIs-resumo (Receitas, Despesas, Saldo, Projetado)
│   ├── Heatmap de gastos do mês (calendário colorido)
│   ├── Alertas do dia (orçamentos atingidos, metas em risco)
│   ├── Ações rápidas (grid 2×2: Transação, Evento, Revisão, Foto Recibo)
│   └── Badge de streak + XP do dia
│
├── 🏆 Conquistas
│   ├── Header com total desbloqueadas / total geral
│   ├── Card-resumo (N/M conquistas, top X% dos usuários, barra)
│   ├── Motivação IA ("Seu próximo marco é...")
│   ├── Seção "Recentes" (últimas badges desbloqueadas)
│   ├── Filtros por categoria (Todas, Financeiras, Metas, Consistência)
│   ├── Seção "Desbloqueadas" (cards com raridade, data, pts)
│   ├── Seção "Bloqueadas" (cards com lock, progresso parcial, dica)
│   ├── Detalhe da badge (modal: critério, progresso, data, pts)
│   └── [PRO] Badges exclusivas PRO
│
└── 📈 Ranking
    ├── Filtros temporais (Geral, Este mês, Esta semana)
    ├── Hero card (posição, avatar, score, top X%)
    ├── Score breakdown por categoria (barras)
    ├── Gráfico de evolução de pontuação
    ├── Leaderboard (lista de posições com avatar, score, trend)
    ├── Destaque do usuário (se fora do top 10, card fixo no bottom)
    ├── Próximos marcos (barras de progresso)
    └── Insight motivacional
```

---

## 5. TELA 01 — DASHBOARD

### 5.1 Objetivo

Ser a **primeira coisa que o usuário vê** ao abrir o SyncLife. Em 5 segundos ele deve saber: qual seu Life Score, como está financeiramente, se tem alertas urgentes, e qual a próxima ação recomendada. É a tela mais importante de toda a aplicação.

### 5.2 Componentes

#### 5.2.1 Saudação + Streak
- "Boa tarde, [Nome]! ✨"
- Data: "Sábado, 7 de março"
- Badge de streak: "🔥 7 dias" (dias consecutivos com pelo menos 1 registro em qualquer módulo)

**Critérios de aceite:**
- Saudação muda por período: "Bom dia" (5-12h), "Boa tarde" (12-18h), "Boa noite" (18-5h)
- Nome vem de `profiles.first_name`
- Streak calcula dias consecutivos com ao menos 1 ação registrada (transação, atividade, peso, sessão, etc.)
- Streak = 0 se ontem não houve nenhuma ação

#### 5.2.2 Life Sync Score (Ring)

**O componente mais importante do SyncLife.**

**Visual:**
- Ring circular SVG grande (animado ao carregar)
- Número central: 0-100 (fonte DM Mono, bold)
- Label: "Life Score"
- Badge abaixo: "↗ +4 pts essa semana" (verde se positivo, vermelho se negativo)
- Abaixo do ring: badges dos módulos com score individual (ex: "🔮 Futuro 43%")

**Critérios de aceite:**
- Ring anima de 0 até o score atual em 1.2s (ease-out)
- Score calcula conforme fórmula da seção 17
- Cor do ring: gradiente `#6366f1 → #0055ff` (indigo → blue)
- Se score < 30: cor vermelha. 30-60: amarela. > 60: gradiente indigo/blue
- Delta vs semana anterior mostra variação
- Módulos inativos não aparecem na lista de dimensões

**Resultado esperado:** O usuário sente que tem um "placar de vida" real. O número motiva ação ("como subo de 18 para 30?"). A animação do ring cria momento de satisfação visual.

#### 5.2.3 Insight IA Cross-Módulo

**Visual:**
- Card com fundo gradiente sutil (indigo → blue)
- Ícone 🤖 "INSIGHT IA"
- Texto personalizado com dados reais e destaques em bold

**Exemplos de insights (baseados nos prints):**
- "Você gastou **R$ 340 menos** que a média este mês. Atenção: **1 meta(s)** abaixo do ritmo."
- "Suas finanças estão excelentes (82 pts). Fortaleça 🏃 Corpo para subir o score."
- "Você está no **Top 15%** do SyncLife com **195 pontos**. Desbloqueie **Reserva Construída** (+100 pts) para subir para o Top 10%."

**Lógica de geração (prioridade):**
1. Se algum módulo está em queda > 10pts vs semana → alerta
2. Se algum orçamento > 85% → aviso financeiro
3. Se meta estagnada > 30 dias → empurrão
4. Se score subiu → celebração com projeção
5. Se streak > 7 dias → reconhecimento
6. Fallback: análise do módulo mais forte vs mais fraco

**Critérios de aceite:**
- Sempre visível
- Muda a cada visita (não repete no mesmo dia)
- Gerado por regras de negócio no MVP (não IA generativa)

#### 5.2.4 Alertas do Dia

**Cards contextuais (fundo colorido conforme módulo):**
- "🔴 **Orçamento Moradia** atingiu 100% — R$ 0 restantes"
- "🟡 **Orçamento Transporte** atingiu 78% — R$ 180 restantes"
- "🟡 **Orçamento Lazer** atingiu 85% — R$ 90 restantes"

**Critérios de aceite:**
- Puxa dados de `budgets` onde % ≥ 75%
- Ordena por % descrescente (mais urgente primeiro)
- Cores: ≥ 100% vermelho, ≥ 85% amarelo, ≥ 75% neutro
- Tap navega para o módulo Finanças > Orçamentos

#### 5.2.5 Heatmap de Gastos do Mês

**Visual (conforme screenshots):**
- Grid de 31 células (dias do mês)
- Cor por intensidade de gasto: sem gasto (escuro), gasto leve (verde), gasto médio (amarelo), gasto alto (vermelho)
- Labels: "Menor gasto" ← → "Maior gasto"
- Dia atual destacado

**Critérios de aceite:**
- Dados de `transactions` agrupados por dia
- Normalização relativa: o dia com mais gasto = 100%, os demais proporcionais
- Cores: 0% = `var(--s3)`, 25% = `#10b981`, 50% = `#f59e0b`, 75% = `#f97316`, 100% = `#f43f5e`
- Dias futuros ficam vazios

#### 5.2.6 Ações Rápidas (Grid 2×2)

| Ação | Ícone | Descrição | Navega para |
|------|-------|-----------|-------------|
| Transação | 💰 | Registrar gasto | `/financas/transacoes` (modal de criação) |
| Evento | 📅 | Agendar compromisso | `/tempo/novo` |
| Revisão | 📊 | Review semanal | Modal de review (tela 04) |
| Foto Recibo | 📷 | OCR automático | Camera → Finanças (reconhecimento) |

**Critérios de aceite:**
- Grid 2×2 com cards clicáveis
- Ícone centralizado + título + descrição curta
- Cada ação redireciona para o fluxo correto
- "Foto Recibo" é PRO only (com gate)

---

## 6. TELA 02 — CONQUISTAS

### 6.1 Objetivo

Mostrar o catálogo completo de badges do SyncLife — desbloqueadas e bloqueadas — com progresso parcial, raridades, e categorias. É onde a gamificação se materializa visualmente.

### 6.2 Componentes

#### 6.2.1 Header com Contagem

- "**Conquistas**" (H1 + ícone lupa de busca)
- "15 de 33 desbloqueadas"

#### 6.2.2 Card-Resumo

**Visual (conforme screenshot 3):**
- Número grande: "15 / 33"
- "Conquistas desbloqueadas"
- "Você está no **Top 15%** dos usuários"
- Barra de progresso: 45% do total desbloqueado
- Gradiente no card (indigo → blue para separar do fundo)

#### 6.2.3 Motivação IA

**Card:**
- 🤖 "MOTIVAÇÃO"
- "Você tem **15 conquistas** e contando. Seu próximo marco é **6 Meses no Verde** — continue assim!"

#### 6.2.4 Seção "Recentes"

**2 cards de badges recentes:**
- Badge mais recente com label "ÚLTIMA CONQUISTA"
- Segunda badge com label "RECENTE"
- Cada card: ícone, nome, data

#### 6.2.5 Filtros por Categoria

**Pills horizontais scrolláveis:**
- Todas (default)
- 💰 Financeiras
- 🎯 Metas
- 📅 Consistência

#### 6.2.6 Badges Desbloqueadas

**Grid 2×2 de cards:**
- Cada card: badge de raridade (COMUM/INCOMUM/RARA/LENDÁRIA)
- Ícone grande da conquista
- Nome
- Descrição curta
- Data de desbloqueio
- Botão "Ver todas (N) ▼"

**Cores por raridade:**
| Raridade | Cor da badge | Borda | Pontos |
|----------|-------------|-------|--------|
| Comum | `#64748b` (slate) | `rgba(100,116,139,0.3)` | 10 pts |
| Incomum | `#10b981` (green) | `rgba(16,185,129,0.3)` | 25 pts |
| Rara | `#8b5cf6` (purple) | `rgba(139,92,246,0.3)` | 50 pts |
| Lendária | `#f59e0b` (amber) | `rgba(245,158,11,0.3)` | 100 pts |

#### 6.2.7 Badges Bloqueadas

**Grid 2×2 de cards com visual "locked":**
- Ícone de cadeado (🔒) no canto
- Ícone da conquista em opacidade reduzida ou silhueta
- Nome e descrição visíveis
- **Barra de progresso parcial** (ex: "75/100" para Reserva Construída)
- Badge de raridade no topo

### 6.3 Catálogo Completo de Badges (33 badges)

#### Financeiras (7 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| Primeiro Passo | Comum | Registrou a primeira transação | 10 |
| Orçamento Cumprido | Comum | Respeitou o orçamento mensal completo | 10 |
| Analista | Comum | Gerou seu primeiro relatório | 10 |
| 3 Meses no Verde | Incomum | Saldo positivo por 3 meses seguidos | 25 |
| 6 Meses no Verde | Rara | Saldo positivo por 6 meses seguidos | 50 |
| Reserva Construída | Lendária | Atingiu meta de reserva de emergência | 100 |
| Investidor Iniciante | Incomum | Registrou primeiro investimento no Patrimônio | 25 |

#### Metas / Futuro (5 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| Primeiro Sonho | Comum | Criou primeiro objetivo no Futuro | 10 |
| Triatleta de Metas | Rara | 3 metas ativas simultaneamente | 50 |
| Marco 50% | Incomum | Atingiu 50% em qualquer objetivo | 25 |
| Objetivo Concluído | Rara | Concluiu um objetivo completo | 50 |
| Arquiteto do Futuro | Lendária | 3 objetivos concluídos | 100 |

#### Corpo / Saúde (6 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| Primeira Atividade | Comum | Registrou primeira atividade física | 10 |
| Semana Completa | Incomum | Atingiu meta semanal de atividades | 25 |
| Check-up Registrado | Comum | Agendou primeira consulta médica | 10 |
| Mês Ativo | Rara | 4 semanas consecutivas atingindo meta de atividades | 50 |
| Peso Meta | Lendária | Atingiu o peso-meta configurado | 100 |
| Hidratação Master | Incomum | 7 dias consecutivos atingindo meta de hidratação | 25 |

#### Mente / Estudo (5 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| Primeira Sessão | Comum | Completou primeiro pomodoro | 10 |
| Trilha Iniciada | Comum | Criou primeira trilha de aprendizado | 10 |
| Trilha Concluída | Rara | Concluiu uma trilha completa | 50 |
| 10 Horas de Foco | Incomum | Acumulou 10 horas de estudo | 25 |
| Biblioteca Rica | Incomum | 10+ recursos na biblioteca | 25 |

#### Consistência (7 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| 7 Dias Consecutivos | Comum | 7 dias de streak de uso | 10 |
| 30 Dias Consecutivos | Incomum | 30 dias de streak | 25 |
| 90 Dias Consecutivos | Rara | 90 dias de streak | 50 |
| 365 Dias | Lendária | 1 ano de streak | 100 |
| Review Semanal | Comum | Completou primeiro review semanal | 10 |
| Multi-módulo | Incomum | Usou 4+ módulos diferentes na mesma semana | 25 |
| Vida Equilibrada | Lendária | Todos os módulos ativos com score > 50 | 100 |

#### Carreira / Experiências (3 badges)
| Badge | Raridade | Critério | Pts |
|-------|----------|----------|-----|
| Perfil Completo | Comum | Preencheu perfil profissional | 10 |
| Primeira Viagem | Incomum | Criou primeira viagem no Experiências | 25 |
| Habilidade Nova | Incomum | Adicionou primeira habilidade no Carreira | 25 |

---

## 7. TELA 03 — RANKING

### 7.1 Objetivo

Criar senso de **comunidade e competição saudável** mostrando a posição relativa do usuário em relação a outros usuários SyncLife. O ranking gamifica o uso consistente e multidimensional do app.

### 7.2 Componentes

#### 7.2.1 Filtros Temporais

**Tabs:**
- Geral (all-time)
- Este mês
- Esta semana

#### 7.2.2 Hero Card (Posição do Usuário)

**Visual (conforme screenshot 5):**
- Avatar grande com gradiente (iniciais)
- Posição: "#38" (grande, DM Mono)
- Total: "de 250 usuários"
- Badge: "Top 15% dos usuários"
- Score total: "195 pts"
- Streak: "🔥 7 dias"

#### 7.2.3 Score Breakdown por Categoria

**4 barras horizontais:**
| Categoria | Ícone | Cor |
|-----------|-------|-----|
| Financeiras | 💰 | `#10b981` |
| Metas | 🎯 | `#0055ff` |
| Consistência | 📅 | `#f59e0b` |
| Agenda | 📆 | `#06b6d4` |

Cada barra mostra: pontos desbloqueados / pontos máximos daquela categoria

#### 7.2.4 Gráfico de Evolução

**Area chart (Recharts):**
- Eixo X: semanas
- Eixo Y: pontuação
- Cor: `#6366f1` (indigo) com gradiente

#### 7.2.5 Leaderboard

**Lista de posições (conforme screenshot 5):**
- Posição (#1 a #20 visíveis)
- Top 3: 🥇🥈🥉 (emojis dourados)
- Avatar (iniciais + cor)
- Nome
- Badges count + streak
- Score (pts, DM Mono)
- Trend: ↑+2 (verde), ↓-1 (vermelho), — (neutro)

**Critérios de aceite:**
- Se o usuário não está no top 20, mostra "— posições 21-37 —" e um card fixo no bottom com a posição do usuário
- Card do usuário tem destaque visual (borda verde, fundo sutil)
- Dados são anonimizados (apenas iniciais, sem email)
- Atualização diária (não real-time)

#### 7.2.6 Próximos Marcos

**Barras de progresso para próximas badges:**
- Nome da badge
- Pts necessários
- Barra de progresso
- Cor da raridade

#### 7.2.7 Sistema de Pontuação

**Como funciona:**
| Raridade | Pontos |
|----------|--------|
| Comum | 10 pts |
| Incomum | 25 pts |
| Rara | 50 pts |
| Lendária | 100 pts |

Score total = soma dos pontos de todas as badges desbloqueadas.

---

## 8. TELAS L2

### 8.1 Detalhe da Badge (Modal/Sheet)

**Ao tocar em uma badge (desbloqueada ou bloqueada):**
- Ícone grande da badge (64px)
- Nome + raridade
- Descrição completa do critério
- Se desbloqueada: data + "✓ Desbloqueada"
- Se bloqueada: barra de progresso + "Faltam X para desbloquear"
- Pontos que concede
- Botão "Compartilhar" (desbloqueada only)

### 8.2 Compartilhar Badge

**Modal com preview:**
- Card visual da badge formatado para compartilhamento
- Preview: ícone + nome + "Desbloqueado no SyncLife" + data
- Opções: copiar imagem, compartilhar via OS
- Compartilhar badge (pós-MVP: gate PRO)

---

## 9. TELA ESPECIAL — REVIEW SEMANAL

### 9.1 Objetivo

Resumo semanal interativo que guia o usuário por seus dados da semana. Inspirado nos reviews do Spotify Wrapped, mas para a vida.

### 9.2 Fluxo

```
PASSO 1 — Capa
├── "Sua semana no SyncLife"
├── Data: "24 Fev — 2 Mar 2026"
├── Animação de entrada

PASSO 2 — Finanças
├── "Você gastou R$ X esta semana"
├── Comparativo vs média
├── Top 3 categorias

PASSO 3 — Metas
├── "X metas avançaram"
├── Progresso visual

PASSO 4 — Corpo
├── "X atividades · Y kcal"
├── Peso tracking

PASSO 5 — Life Score
├── "Seu Life Score foi de X"
├── Delta vs semana anterior
├── "Módulo mais forte: [nome]"

PASSO 6 — Badges
├── "Você desbloqueou X conquista(s)"
├── Preview visual

PASSO 7 — CTA
├── "Continue assim!"
├── "Compartilhar meu review" [PRO]
└── "+50 XP"
```

**Critérios de aceite:**
- Disponível a partir de domingo 20h (fuso do usuário)
- Modo Jornada: +50 XP por completar o review
- PRO: pode compartilhar como imagem
- FREE: acessa o review mas sem compartilhamento
- Review fica disponível até quarta-feira (depois desaparece)

---

## 10. FLUXOS CRUD DETALHADOS

### 10.1 Badges (Sistema Automático)

Badges NÃO são criadas manualmente pelo usuário. Elas são **desbloqueadas automaticamente** quando critérios são atendidos.

#### DESBLOQUEAR BADGE (automático)

```
TRIGGER: Qualquer ação no sistema que modifica dados
├── Ação → verifica todos os critérios de badges não desbloqueadas
├── Se critério atendido:
│   ├── INSERT em `user_badges` com user_id, badge_id, unlocked_at
│   ├── Incrementa score do usuário no ranking
│   ├── Toast de celebração: "🏆 Nova conquista: [nome]!"
│   ├── XP bônus concedido
│   └── Notificação in-app
└── Se critério não atendido: nada acontece

Verificação ocorre:
- Após cada transação salva → verifica badges financeiras
- Após cada atividade registrada → verifica badges de corpo
- Após cada sessão Pomodoro → verifica badges de mente
- Após login diário → verifica badges de consistência
- Após salvar progresso de meta → verifica badges de futuro
```

### 10.2 Life Sync Score (Cálculo)

```
TRIGGER: Qualquer modificação de dados em qualquer módulo
├── Recalcula score parcial do módulo afetado
├── Recalcula score geral (média ponderada)
├── Salva em `life_sync_scores` (histórico diário)
├── Calcula delta vs dia anterior e vs semana anterior
└── Se subiu > 5pts → toast "Seu Life Score subiu!"
```

---

## 11. INTEGRAÇÕES COM OUTROS MÓDULOS

O Panorama é o módulo que **recebe dados de todos os outros** — ele não envia dados para ninguém.

### 11.1 Finanças → Panorama

| Dado recebido | Uso no Panorama |
|--------------|-----------------|
| Saldo mensal | KPI "Saldo" no Dashboard |
| % orçamento consumido | Alertas do dia |
| Transações por dia | Heatmap de gastos |
| Saldo positivo consecutivo | Badge "3/6 Meses no Verde" |
| Reserva de emergência | Badge "Reserva Construída" |

### 11.2 Futuro → Panorama

| Dado recebido | Uso no Panorama |
|--------------|-----------------|
| Objetivos ativos com progresso | Dimensão "Futuro" no Life Score |
| Metas em risco | Insight IA |
| Objetivo concluído | Badge trigger |

### 11.3 Corpo → Panorama

| Dado recebido | Uso no Panorama |
|--------------|-----------------|
| Atividades/semana | Dimensão "Corpo" no Life Score |
| Peso atingiu meta | Badge "Peso Meta" |
| Consultas em dia | Score de saúde preventiva |
| Hidratação diária | Badge "Hidratação Master" |

### 11.4 Mente → Panorama

| Dado recebido | Uso no Panorama |
|--------------|-----------------|
| Horas estudadas/semana | Dimensão "Mente" no Life Score |
| Trilha concluída | Badge "Trilha Concluída" |
| Sessões Pomodoro | Badge "Primeira Sessão", "10 Horas" |

### 11.5 Todos → Panorama (Streak)

| Dado | Cálculo |
|------|---------|
| Qualquer ação registrada em qualquer módulo | Streak = dias consecutivos com ≥1 ação |

---

## 12. DIAGRAMA DE INTEGRAÇÕES

```
┌───────────────────────────────────────────────────────────────────────┐
│                        🌐 PANORAMA (Cockpit)                           │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐    │
│  │ Life Sync Score  │  │ Sistema de Badges │  │ Ranking/Leaderboard│    │
│  │ Cálculo 8 eixos  │  │ 33 conquistas     │  │ Score = Σ badges   │    │
│  │ Histórico diário │  │ 4 raridades       │  │ Top X% relativo    │    │
│  └────────┬─────────┘  └────────┬──────────┘  └────────────────────┘    │
│           │                     │                                       │
│           │   Recebe dados de todos os módulos:                        │
└───────────┼─────────────────────┼───────────────────────────────────────┘
            │                     │
    ┌───────┼─────────────────────┼──────────────────────────────┐
    │       │                     │                              │
    ▼       ▼                     ▼                              ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│💰    │ │🔮    │ │🏃    │ │🧠    │ │📈    │ │💼    │ │⏳    │ │✈️    │
│FINAN.│ │FUTURO│ │CORPO │ │MENTE │ │PATRI.│ │CARR. │ │TEMPO │ │EXPER.│
│      │ │      │ │      │ │      │ │      │ │      │ │      │ │      │
│Saldo │ │Progr.│ │Ativ. │ │Horas │ │Aporte│ │Steps │ │Event.│ │Viag. │
│Orçam.│ │Metas │ │Peso  │ │Streak│ │Divers│ │Skills│ │Consist│ │      │
│Trans.│ │Score │ │Consul│ │Trilha│ │      │ │      │ │      │ │      │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

---

## 13. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| **RN-PAN-01** | Life Sync Score | Score = média ponderada de 8 módulos. Módulos inativos excluídos e pesos redistribuídos. Range: 0-100. |
| **RN-PAN-02** | Score histórico diário | Score é salvo diariamente em `life_sync_scores`. Delta calculado vs dia anterior e vs 7 dias atrás. |
| **RN-PAN-03** | Badge automática | Badges são desbloqueadas automaticamente quando critério é atendido. Não há "claim manual". |
| **RN-PAN-04** | Badge imutável | Uma vez desbloqueada, a badge não pode ser perdida (mesmo que o critério deixe de ser verdadeiro). |
| **RN-PAN-05** | Pontuação de badge | Comum = 10pts, Incomum = 25pts, Rara = 50pts, Lendária = 100pts. Score ranking = soma de todas. |
| **RN-PAN-06** | Ranking atualização | Ranking recalcula diariamente (batch job). Não é real-time. Posição muda 1x/dia. |
| **RN-PAN-07** | Ranking anonimizado | Leaderboard mostra apenas iniciais + avatar. Nunca email ou nome completo de outros usuários. |
| **RN-PAN-08** | Streak de uso | Dias consecutivos com ≥1 ação registrada em qualquer módulo. Dia sem ação = streak reseta para 0. |
| **RN-PAN-09** | Streak timezone | Streak usa fuso horário do usuário (de `profiles.timezone`). Dia = 00:00-23:59 local. |
| **RN-PAN-10** | Heatmap financeiro | Cores do heatmap são relativas (normalização intra-mês). O dia com mais gasto = vermelho intenso. |
| **RN-PAN-11** | Insight IA regras | Insights são gerados por regras de negócio no MVP. Não usam IA generativa. Mudam a cada visita. |
| **RN-PAN-12** | Review semanal | Disponível de domingo 20h a quarta 23:59 (fuso local). Completar concede +50 XP. |
| **RN-PAN-13** | Review compartilhável | Compartilhar review como imagem. (pós-MVP: gate PRO) |
| **RN-PAN-14** | Saudação contextual | Muda por período: Bom dia (5-12h), Boa tarde (12-18h), Boa noite (18-5h). |
| **RN-PAN-15** | Ações rápidas | Grid 2×2 fixo: Transação, Evento, Revisão, Foto Recibo. Foto Recibo: pós-MVP (gate PRO). |
| **RN-PAN-16** | Alertas de orçamento | Mostram orçamentos com % ≥ 75%. Ordenados por % DESC. Tap navega para Finanças. |
| **RN-PAN-17** | Cor do módulo | `#6366f1` (Indigo). Glow: `rgba(99,102,241,0.14)`. Gradiente: `#6366f1 → #0055ff`. |
| **RN-PAN-19** | 33 badges no MVP | Catálogo fixo de 33 badges. Novas badges podem ser adicionadas em updates sem alterar as existentes. |
| **RN-PAN-20** | XP por ações | Review semanal: +50 XP. Badge desbloqueada: XP = pontos da badge. Streak 7d: +20 XP. Streak 30d: +50 XP. |

---

## 14. MODELO DE DADOS

### 14.1 Tabelas do Módulo

```sql
-- badges: Catálogo de badges (seed data, 33 registros)
badges (
    id UUID PK,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- emoji
    category TEXT NOT NULL CHECK ('financial','goals','body','mind','consistency','career'),
    rarity TEXT NOT NULL CHECK ('common','uncommon','rare','legendary'),
    points INTEGER NOT NULL, -- 10, 25, 50, 100
    criteria_type TEXT NOT NULL, -- streak_days, budget_months, goal_count, etc.
    criteria_value JSONB NOT NULL, -- {"field":"streak","operator":">=","value":7}
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
)

-- user_badges: Badges desbloqueadas por usuário
user_badges (
    id UUID PK,
    user_id UUID FK → profiles,
    badge_id UUID FK → badges,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    UNIQUE(user_id, badge_id)
)

-- life_sync_scores: Histórico diário do Life Sync Score
life_sync_scores (
    id UUID PK,
    user_id UUID FK → profiles,
    score DECIMAL(5,2) NOT NULL,
    financas_score DECIMAL(5,2),
    futuro_score DECIMAL(5,2),
    corpo_score DECIMAL(5,2),
    mente_score DECIMAL(5,2),
    patrimonio_score DECIMAL(5,2),
    carreira_score DECIMAL(5,2),
    tempo_score DECIMAL(5,2),
    experiencias_score DECIMAL(5,2),
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP,
    UNIQUE(user_id, recorded_date)
)

-- user_streaks: Tracking de streak do usuário
user_streaks (
    id UUID PK,
    user_id UUID FK → profiles (UNIQUE),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP
)

-- weekly_reviews: Reviews semanais completados
weekly_reviews (
    id UUID PK,
    user_id UUID FK → profiles,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    data JSONB, -- snapshot dos dados da semana
    completed_at TIMESTAMP,
    shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    UNIQUE(user_id, week_start)
)
```

### 14.2 Índices

```sql
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_life_sync_scores_user_date ON life_sync_scores(user_id, recorded_date DESC);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_weekly_reviews_user ON weekly_reviews(user_id, week_start DESC);
```

---

## 15. LIFE SYNC SCORE — MOTOR CENTRAL

### 17.1 Fórmula Geral

```
Life Sync Score = (
    Finanças      × 0.20 +
    Futuro        × 0.20 +
    Corpo         × 0.15 +
    Patrimônio    × 0.10 +
    Mente         × 0.10 +
    Carreira      × 0.10 +
    Tempo         × 0.10 +
    Experiências  × 0.05
) × 100

Módulos inativos são excluídos e pesos redistribuídos proporcionalmente.
```

### 17.2 Score por Módulo

| Módulo | Fórmula | Fonte de dados |
|--------|---------|----------------|
| Finanças | (% orçamento respeitado × 0.4) + (consistência de registro × 0.3) + (tendência vs mês anterior × 0.3) | budgets, transactions |
| Futuro | (% objetivos com progresso no mês × 0.5) + (metas concluídas no trimestre × 0.5) | objectives, objective_goals |
| Corpo | (atividades/semana ÷ meta × 0.3) + (consultas em dia × 0.3) + (peso tracking × 0.2) + (hidratação × 0.2) | activities, weight_entries, appointments, daily_water |
| Mente | (horas estudadas ÷ meta × 0.5) + (streak × 0.3) + (trilhas ativas × 0.2) | focus_sessions, study_tracks |
| Patrimônio | (aporte realizado ÷ planejado × 0.5) + (diversificação × 0.5) | assets, asset_transactions |
| Carreira | (steps do roadmap em progresso × 0.5) + (habilidades evoluindo × 0.5) | roadmap_steps, skills |
| Tempo | (% eventos concluídos × 0.5) + (consistência de uso × 0.5) | calendar_events |
| Experiências | Impacto via Finanças e Futuro (episódico) | trips |

### 17.3 Interpretação

| Score | Label | Cor |
|-------|-------|-----|
| 0-20 | Iniciante | `#f43f5e` (vermelho) |
| 21-40 | Em construção | `#f97316` (laranja) |
| 41-60 | Regular | `#f59e0b` (amarelo) |
| 61-80 | Consistente | `#6366f1` (indigo) |
| 81-100 | Excelente | `#10b981` (verde) |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 18.1 Funcionalidades Futuras

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Seasonal Badges** | Badges temporários por época (ex: "Black Friday Consciente" em novembro, "Verão Ativo" em janeiro). Cria urgência e FOMO | Pesquisas mostram que limited-time rewards aumentam engajamento em 40% (Duolingo). Gera retorno sazonal. | Alta — pós-MVP |
| **Daily Quests** | 3 missões diárias personalizadas ("Registre 1 transação", "Beba 2L de água", "Estude 25min"). Completar as 3 = bônus XP | Duolingo usa daily quests com 15% mais completions vs sem quests. É a feature que transforma check-in em hábito. | Alta — pós-MVP |
| **Friends e Social** | Adicionar amigos, ver score deles, desafiar para competições 1v1 semanais | Strava mostra que social features aumentam frequência em 40%. Cuidado: exige moderação e privacidade. | Média — v3 |
| **Wrapped Anual** | Review do ano completo estilo Spotify Wrapped: quanto gastou, quantos treinos, badges desbloqueadas, evolução do score mês a mês | Feature de viralização. Spotify Wrapped gera 60M+ shares nas redes sociais. No SyncLife, seria "Meu Ano no SyncLife". | Alta — Dez 2026 |
| **Milestones com Animação** | Ao atingir marcos específicos (Score 50, Score 75, 10 badges, etc.), tela de celebração especial com confetti e animação | Pesquisas de UX mostram que celebrações visuais aumentam satisfação e reduzem churn em 15%. | Média — pós-MVP |
| **Widget Mobile** | Widget para tela inicial do celular mostrando Life Score + streak + próxima tarefa/evento | Widgets aumentam retenção D30 em 20% (dados do Google para Android). Requer app nativo ou PWA. | Média — app nativo |
| **Integração com Google Calendar** | Puxar eventos automaticamente para calcular score do Tempo sem input manual | Reduz fricção enormemente. Está no roadmap pós-MVP v2. | Alta — pós-MVP |
| **IA Generativa nos Insights** | Trocar regras de negócio por Claude/Gemini para insights realmente personalizados e contextuais | Transforma o Insight IA de "regras if/else" para "coach real". Custo de API a considerar. | Média — v3 |

### 18.2 Críticas ao Estado Atual (Screenshots)

**1. Cor idêntica a Finanças — CONFUSÃO VISUAL**
A cor `#10b981` do Panorama é a mesma de Finanças. Na Module Bar, os dois módulos parecem iguais. Isso viola o princípio de "cor = identidade do módulo". **Solução: nova cor `#6366f1` (Indigo)**.

**2. Conquistas e Ranking sempre visíveis**
Os prints mostram que Conquistas e Ranking funcionam normalmente, mas a spec diz que são PRO/Jornada. Precisa de gate visual (blur + UpgradeModal) para FREE/Foco.

**3. Dashboard é muito focado em Finanças**
O Dashboard atual mostra: KPIs financeiros, alertas de orçamento, heatmap de gastos. Isso faz parecer que o Dashboard é "Finanças 2.0". Precisa de mais diversidade — cards de Corpo (próxima consulta, atividades da semana), Mente (horas estudadas), Futuro (objetivos em destaque).

**4. Falta empty state do Dashboard**
Se o usuário acabou de criar a conta, o Dashboard deveria ter um wizard de "primeiro uso" guiando para registrar a primeira transação, configurar um orçamento, etc.

**5. Review Semanal não está prototipado**
A ação rápida "Revisão" existe no grid mas o fluxo do review semanal não tem UI definida. Precisa de protótipo (tela 04).

**6. Heatmap de gastos poderia ser mais contextual**
O heatmap mostra intensidade de gastos mas não mostra o valor. Tooltip ao tocar mostrando "5 Mar: R$340 — Supermercado, Uber, iFood" tornaria muito mais útil.

### 18.3 Telas Recomendadas para Prototipagem

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 01 | Dashboard (com nova cor + Life Score) | 🔴 Alta | Tela principal, precisa refletir cor indigo |
| 02 | Conquistas (catálogo) | 🔴 Alta | Já existe mas precisa ajuste de cor |
| 03 | Ranking (leaderboard) | 🔴 Alta | Já existe mas precisa ajuste de cor |
| 04 | Review Semanal (flow cards) | 🟡 Média | Feature diferenciadora, não prototipada |
| 05 | Detalhe da Badge (modal) | 🟡 Média | Interação principal em Conquistas |
| 06 | Dashboard — Empty state | 🟡 Média | Primeiro uso |
| 07 | Empty State (primeiro uso) | 🟢 Baixa | Onboarding visual |
| 08 | Conquistas — Filtros avançados | 🟢 Baixa | Melhorias de UX |

---

*Documento criado em: 07/03/2026*  
*Versão: 1.0 — Especificação Funcional Completa*  
*Base visual: Screenshots do app atual (5 telas)*  
*Referências: modules.ts, dashboard/page.tsx, conquistas/ranking/page.tsx, DOC-FUNCIONAL-FUTURO-COMPLETO.md*  
*Próximo passo: Gerar protótipo v3 (10+ telas) com cor Indigo e prompt para Claude Code*
