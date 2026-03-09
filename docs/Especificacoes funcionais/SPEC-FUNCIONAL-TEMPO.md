# ⏳ Especificação Funcional — Módulo Tempo

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Tempo — Agenda e Compromissos  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#06b6d4` (Cyan)  
> **Ícone Lucide:** `Clock`  
> **Subtítulo descritivo:** "Agenda e compromissos"  
> **Pergunta norteadora:** "Como está meu Tempo?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Agenda Diária](#6-tela-02--agenda-diária)
7. [Tela 03 — Visão Semanal](#7-tela-03--visão-semanal)
8. [Tela 04 — Visão Mensal](#8-tela-04--visão-mensal)
9. [Tela 05 — Gestão de Eventos e Tarefas](#9-tela-05--gestão-de-eventos-e-tarefas)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações com Outros Módulos](#11-integrações-com-outros-módulos)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Componente Tempo](#15-life-sync-score)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Tempo

O módulo Tempo é o **organizador central do dia a dia** do usuário no SyncLife. Ele não é apenas um calendário — é o sistema que conecta o que o usuário faz com cada hora do seu dia ao impacto real nos seus objetivos de vida, nas suas finanças, na sua saúde e no seu desenvolvimento pessoal.

A proposta é responder à pergunta **"Como está meu Tempo?"** de forma quantificável: quantos compromissos tenho hoje, qual minha taxa de conclusão, como estou distribuindo minhas horas entre as áreas da vida, e como isso se conecta aos meus objetivos no módulo Futuro.

Enquanto o Futuro cuida dos sonhos de longo prazo e cada módulo cuida de uma dimensão específica (Finanças cuida do dinheiro, Corpo cuida da saúde, Mente cuida do aprendizado), o Tempo é onde tudo se concretiza no dia a dia. É onde "estudar React" (Mente), "ir ao dentista" (Corpo), "revisão de investimentos" (Patrimônio) e "reunião com o chefe" (Carreira) ocupam espaço real na rotina do usuário.

O nome "Tempo" foi escolhido em vez de "Agenda" porque o módulo vai além de simplesmente listar compromissos. Uma agenda mostra o que você tem marcado. O módulo Tempo responde "como estou usando meu tempo?" — e com base nisso, ajuda o usuário a tomar decisões melhores sobre onde investir suas horas.

### 1.2 Por que este módulo existe

No mercado atual, as ferramentas de calendário são desconectadas da vida. O Google Calendar não sabe que a consulta médica do usuário é parte do objetivo "melhorar a saúde". O Todoist não cruza suas tarefas com seu orçamento financeiro. O Sunsama ajuda a planejar o dia de trabalho, mas não ajuda a planejar a vida inteira.

Sem o Tempo, os outros módulos do SyncLife seriam aspirações sem execução. De que adianta ter um objetivo de "aprender React em 6 meses" (Futuro) se o usuário nunca bloqueia 2h por dia para estudar? O Tempo é a ponte entre intenção e ação — ele transforma metas abstratas em blocos concretos no calendário.

### 1.3 Proposta de valor única

O módulo Tempo não compete com Google Calendar em sincronização. Ele compete na **camada de significado**: cada evento é vinculado a um módulo da vida, e o sistema calcula automaticamente quanto tempo o usuário dedicou a cada dimensão — gerando insights como "Você dedicou 85% do tempo a Carreira e apenas 3% a Corpo neste mês". Além disso, eventos com custo (dentista R$ 280) geram transações automáticas no Finanças, e sessões de foco registram horas nas metas do Futuro. Essa é a tese do SyncLife — nenhum aspecto da vida existe isolado.

### 1.4 As 5 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Visão geral do dia e semana, KPIs, próximos eventos, distribuição de tempo | Diária |
| 02 | Agenda (dia) | Lista cronológica de eventos do dia com week strip de navegação | Diária |
| 03 | Visão Semanal | Grid de 7 dias com time blocks posicionados por hora | 2-3x/semana |
| 04 | Visão Mensal | Grid do mês com indicadores de ocupação e dots coloridos por módulo | 1-2x/mês |
| 05 | Review Semanal | Retrospectiva guiada com métricas, distribuição por módulo e planejamento | 1x/semana |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **Google Calendar** | Sincronização impecável entre dispositivos, multi-calendário, views (dia/semana/mês/agenda), compartilhamento, integrações com Gmail e Meet, detecção automática de eventos em emails | Sem análise de como o tempo é gasto, sem vínculo com metas, sem tarefas integradas, sem categorização por área da vida | Gratuito |
| **Fantastical** | Natural language parsing ("Almoço com Casey às 12h no Park Place"), design premium, integração profunda com Apple Watch/Mac/iPhone, views customizáveis, weather overlay | Sem conexão com objetivos de vida, exclusivo ecossistema Apple, sem gamificação, sem análise de tempo por área | $4.75/mês |
| **Todoist** | Captura rápida de tarefas, projetos com hierarquia, labels e filtros avançados, Karma (sistema de pontos), cross-platform, linguagem natural parcial | Calendário é add-on fraco (apenas integração com GCal), sem time blocking nativo, sem análise de tempo por área | Grátis / $4/mês PRO |
| **Sunsama** | Daily planning ritual (guiado toda manhã), estimativa de duração por tarefa, time blocking com drag-and-drop, weekly review com métricas, integração com Todoist/Asana/Jira | Não conecta a finanças ou saúde, sem gamificação, caro para uso pessoal ($16/mês), sem vínculo com objetivos de vida | $16/mês anual |
| **Akiflow** | Command bar ultrarrápido, consolidação de tarefas de Gmail/Slack/Notion/Todoist em um inbox, Focus Mode que esconde distrações, time blocking com keyboard shortcuts | Sem análise de dimensões da vida, sem review semanal guiada, sem vínculo com metas, preço alto ($15/mês) | $15/mês |
| **Morgen** | Calendar-first design, sincronização multi-provider (Google+Outlook+Apple), scheduling links para agendar reuniões, Frames (templates de rotina ideal), cross-platform (Mac/Win/Linux/iOS/Android) | Sem conexão com metas ou finanças, tarefas básicas sem profundidade, sem gamificação | $6/mês individual |
| **Motion** | IA que auto-agenda tarefas baseada em prioridade e deadline, reorganiza o dia quando surgem conflitos, project management com estimativa de tempo | Caro ($19/mês), perda de controle manual (IA decide por você), sem conexão com vida pessoal, focado em trabalho | $19/mês |
| **TickTick** | Tarefas + calendário + Pomodoro + hábitos tudo em um app, preço acessível, widgets de calendário, Eisenhower matrix, multiple views | Sem análise de dimensões da vida, sem vínculo com objetivos macro, design datado em comparação com concorrentes premium | Grátis / $3/mês |
| **Notion Calendar** | Integração profunda com bases do Notion, design moderno e limpo, grátis, sync bidirecional com Google Calendar, scheduling links | Sem tarefas nativas (depende de databases do Notion), sem timer, sem análise de tempo por categoria, sem gamificação | Gratuito |

### 2.2 Diferenciais Competitivos do SyncLife Tempo

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Eventos vinculados a módulos** | Cada evento tem badge visual do módulo: 💰 Finanças, 🏃 Corpo, 🧠 Mente, 💼 Carreira, etc. O calendário ganha significado — não é só "onde estou" mas "qual dimensão da vida estou nutrindo" | Ninguém |
| **Distribuição de tempo por dimensão** | Gráfico que mostra % de horas dedicadas a cada área da vida na semana. "Carreira 55%, Mente 22%, Corpo 13%, Finanças 10%" — visualização que nenhum calendário oferece | Ninguém |
| **Custo de eventos → Finanças** | Evento "Dentista R$ 280" cria transação pendente automaticamente no módulo Finanças. O calendário sabe quanto o dia custou | Ninguém |
| **Criação automática de eventos** | Consulta médica no Corpo → evento automático no Tempo. Sessão Pomodoro no Mente → bloco de estudo registrado. Viagem no Experiências → dias bloqueados. Outros módulos alimentam o Tempo | Parcialmente (Sunsama com Todoist/Asana) |
| **Review Semanal cross-módulo** | Retrospectiva que cruza dados de todos os módulos: "Semana: 12h Carreira, 4h Mente, 0h Corpo — Corpo precisa de atenção" | Sunsama (review, mas sem cross-módulo) |
| **Time blocking vinculado a metas** | Bloquear 2h para "Estudar React" vincula diretamente à meta no Futuro, registrando horas automaticamente no progresso | Ninguém |
| **Score de Tempo** | Nota 0-100 de quão bem o usuário está distribuindo e cumprindo seus compromissos, alimentando o Life Sync Score geral | Ninguém |

### 2.3 O que aprendemos com o benchmark

**Do Google Calendar:** A sincronização multi-dispositivo é mandatória. No pós-MVP, o SyncLife deve sincronizar bidirecionalmente com Google Calendar para não forçar o usuário a abandonar sua agenda principal. No MVP, funciona standalone.

**Do Sunsama:** O ritual de planejamento diário é poderoso para retenção. A daily planning session do Sunsama ("escolha o que é realista para hoje") tem engajamento altíssimo. No SyncLife, o equivalente é o Dashboard do Tempo que mostra a agenda do dia com sugestões IA no modo Jornada.

**Do Akiflow:** Consolidação de tarefas de múltiplos apps é o futuro. No SyncLife, isso acontece nativamente — eventos são criados automaticamente por outros módulos (Corpo → consulta, Mente → estudo, Futuro → deadline de meta).

**Do Motion:** IA que auto-agenda é poderosa mas divisiva. Usuários querem sugestão, não controle total. No SyncLife, a IA sugere ("Que tal 30min de Corpo na terça?") mas o usuário decide.

**Do TickTick:** Ter calendário + tarefas + timer em um só app reduz context switching. O SyncLife faz isso nativamente com Tempo + Mente (Timer) + Futuro (metas/tarefas).

**Do Fantastical:** Natural language é amado por power users. Feature para v4: "Dentista amanhã às 15h R$ 280 Corpo" → cria evento completo com módulo e custo.

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ⏳ TEMPO — NAVEGAÇÃO PRINCIPAL                     │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Agenda │ Semanal │ Mensal │ Review                     │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
  ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
  │01       │ │02      │ │03      │ │04      │ │08        │
  │DASHBOARD│ │AGENDA  │ │SEMANAL │ │MENSAL  │ │REVIEW    │
  │KPIs,    │ │Dia +   │ │Grid 7d │ │Grid mês│ │Métricas, │
  │Timeline,│ │Week    │ │Time    │ │Dots por│ │Distrib., │
  │Distrib. │ │Strip   │ │blocks  │ │módulo  │ │Pendências│
  └────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └──────────┘
       │          │          │          │
       │    ┌─────┼──────────┼──────────┘
       │    │     │          │
       │    ▼     ▼          ▼
       │   05    06→07      Tap dia → 02
       │  CRIAR  CRIAR      (navega para
       │  P.1    P.2        Agenda do dia)
       │   │      │
       │   └──┬───┘
       │      │
       │      ▼ (tap em evento)
       │     DETALHE DO EVENTO
       │      │
       │      ├──→ Editar Evento
       │      ├──→ Concluir (tarefa)
       │      └──→ Excluir (confirmação)
       │
       ├──→ Timer Foco (PRO) ──→ Registra horas no Futuro
       └──→ Configurações do Tempo
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Agenda | Sub-nav "Agenda" | — |
| **L1** | 03 Visão Semanal | Sub-nav "Semanal" | — |
| **L1** | 04 Visão Mensal | Sub-nav "Mensal" | — |
| **L1** | 08 Review Semanal | Sub-nav "Review" | — |
| **L2** | 05 Criar Evento P.1 | FAB "+" (qualquer tab) | ✕ Fecha (volta tab anterior) |
| **L2** | 06 Criar Evento P.2 | Continuar do P.1 | ← Voltar (05) |
| **L2** | 07 Detalhe do Evento | Tap em event card (02/03/04) | ← Voltar (tab anterior) |
| **L2** | Editar Evento | Botão ✏️ no Detalhe (07) | ← Voltar (07) |
| **L2** | 09 Timer Foco | Botão "Iniciar foco" no Dashboard | ← Voltar (01) |
| **L2** | 10 Config. do Tempo | Ícone ⚙️ no header | ← Voltar (01) |
| **L2** | 12 Celebração | Automático ao concluir Review | Botão → Dashboard (01) |

### 3.3 Padrão de Navegação (idêntico ao módulo Futuro)

**Header do módulo:**
- Ícone do módulo (⏳) + Nome ("Tempo") à esquerda
- Badge de contagem à direita ("5 hoje")

**Sub-nav:**
- Tabs com underline (não pills)
- Tab ativa: texto branco/claro + underline na cor do módulo (#06b6d4)
- Tabs inativas: texto cinza (var(--t3)), sem underline
- 5 tabs: Dashboard, Agenda, Semanal, Mensal, Review

**Telas internas (L2):**
- Header simplificado: botão voltar (←) + título centralizado + ação contextual
- Sem sub-nav (pois está num nível abaixo)
- Wizards: dots de progresso abaixo do header

---

## 4. MAPA DE FUNCIONALIDADES

### 4.1 Visão Geral por Tela

```
⏳ TEMPO
│
├── 📊 Dashboard
│   ├── KPIs (eventos hoje, horas planejadas, taxa conclusão, próximo)
│   ├── Timeline do dia (mini agenda com próximos 5 eventos)
│   ├── Distribuição semanal por módulo (barras horizontais coloridas)
│   ├── Quick Foco (atalho para iniciar sessão focada)
│   └── [Jornada] Insight IA de distribuição de tempo
│
├── 📅 Agenda Diária
│   ├── Week strip (7 dias com dots coloridos por módulo)
│   ├── Lista de eventos do dia selecionado (cronológica)
│   ├── Event card (hora, título, local, módulo badge, custo badge)
│   ├── Separadores de período (Manhã / Tarde / Noite)
│   ├── Preview do dia seguinte (colapsado)
│   ├── FAB criar evento (+)
│   └── [Jornada] Missões do dia (XP por cumprir agenda)
│
├── 📆 Visão Semanal
│   ├── Header com navegação ← Semana →
│   ├── Grid com colunas por dia e linhas por hora (8h-22h)
│   ├── Blocos de eventos posicionados na hora correta (cor do módulo)
│   ├── Indicador "agora" (linha horizontal vermelha)
│   ├── Tap em slot vazio → criar evento com hora pré-preenchida
│   ├── Tap em bloco → detalhe do evento
│   ├── Mobile: 3 dias visíveis com scroll horizontal
│   └── Resumo da semana no rodapé (total de horas, módulos)
│
├── 🗓️ Visão Mensal
│   ├── Header com navegação ← Mês →
│   ├── Grid 7×5 do mês
│   ├── Dots coloridos por módulo em cada dia (max 3 dots)
│   ├── Dia atual com destaque cyan
│   ├── Tap em dia → navega para Agenda daquele dia
│   ├── Mini preview do dia selecionado no rodapé
│   └── Dias fora do mês com opacidade reduzida
│
├── 📋 Review Semanal [PRO]
│   ├── Resumo numérico (total eventos, % concluídos, horas, streak)
│   ├── Distribuição por módulo (barras horizontais com %)
│   ├── Top conquistas da semana
│   ├── Pendências arrastadas (eventos não concluídos)
│   ├── Planejamento da próxima semana
│   ├── [Jornada] Insight IA semanal
│   └── [Jornada] XP bônus por completar o review
│
├── ➕ Criar Evento (L2 — Wizard 2 passos)
│   ├── Passo 1: Info básica
│   │   ├── Título (obrigatório)
│   │   ├── Tipo (Compromisso, Tarefa, Foco, Lembrete)
│   │   ├── Data e hora início
│   │   ├── Duração rápida (30min, 1h, 2h, Dia todo)
│   │   └── Quick repeat (Só hoje, Todo dia, Toda semana)
│   └── Passo 2: Detalhes
│       ├── Módulo vinculado (select com ícones dos 8 módulos)
│       ├── Local (texto livre)
│       ├── Custo associado (R$, opcional → cria transação em Finanças)
│       ├── Repetição (nunca, diário, semanal, mensal, anual, custom)
│       ├── Lembrete (nenhum, 5min, 15min, 30min, 1h, 1dia)
│       ├── Notas (texto livre)
│       └── Cor (automática pelo módulo ou custom)
│
├── 📄 Detalhe do Evento (L2)
│   ├── Header com cor gradient do módulo
│   ├── Informações completas (data, hora, local, duração, custo)
│   ├── Badge do módulo vinculado
│   ├── Link para entidade no módulo (ex: "→ Ver trilha no Mente")
│   ├── Ações: Editar | Concluir | Excluir
│   └── Histórico de alterações (se editado)
│
├── 🎯 Timer Foco (L2) [PRO]
│   ├── Seleção de atividade (vincular a evento ou meta)
│   ├── Timer countdown circular (SVG ring)
│   ├── Controles (pausar, parar, pular)
│   ├── Stats da sessão (sessões hoje, streak, tempo acumulado)
│   ├── Registro automático de horas ao concluir
│   └── [Jornada] XP por sessão completada
│
└── ⚙️ Configurações do Tempo (L2)
    ├── Horário de trabalho (início/fim)
    ├── Dia início da semana (Domingo/Segunda)
    ├── Duração padrão de eventos (30min/1h)
    ├── Lembrete padrão
    ├── Timer Foco padrão (25min/45min/1h)
    ├── Google Calendar sync [PRO, pós-MVP — card "Em breve"]
    └── Notificações push (toggle)
```

---

## 5. TELA 01 — DASHBOARD

### 5.1 Objetivo

Fornecer uma **visão instantânea** do estado temporal do usuário. Em 3 segundos, ele deve saber: quantos compromissos tem hoje, se está equilibrando as áreas da vida, e qual o próximo passo.

É a tela de entrada do módulo — tudo que aparece aqui é resumo. Os detalhes vivem nas sub-telas. O Dashboard responde: "O que tenho para hoje? Estou dedicando tempo ao que realmente importa?"

### 5.2 Componentes

#### 5.2.1 KPI Grid (2×2)

| KPI | Valor exemplo | Cor | Lógica de cálculo |
|-----|---------------|-----|-------------------|
| **Eventos hoje** | 5 | `#06b6d4` (tempo) | Count de `calendar_events` onde `start_date = today` e `status != 'deleted'`. Sub-texto: "3 concluídos" (count com `status = 'completed'`) |
| **Horas planejadas** | 6,5h | `var(--t1)` (branco) | Soma de `(end_time - start_time)` de todos os eventos do dia com horário definido. Exclui eventos "dia todo". Sub-texto: "de 8h disponíveis" (baseado no horário de trabalho configurado) |
| **Conclusão semana** | 78% | `#10b981` (verde) | `(eventos_concluidos_semana / total_eventos_semana) × 100`. Semana = segunda a domingo. Sub-texto: "18 de 23 eventos". Cor muda: verde se ≥ 70%, amarelo se 40-69%, vermelho se < 40% |
| **Próximo** | Daily | `var(--t1)` | Primeiro evento com `start_time > now()`. Sub-texto: hora e duração ("09:00 — 30min"). Se sem eventos futuros: valor = "Livre" com sub-texto "Dia livre 🎉" |

**Critérios de aceite:**
- Os 4 KPIs carregam em até 2 segundos
- Cada KPI mostra label (uppercase, DM Mono 10px), valor principal (DM Mono 20px), e sub-texto contextual (DM Sans 11px)
- Valores vazios mostram "0" (nunca fica em branco)
- A cor do valor de "Conclusão semana" é dinâmica baseada no percentual
- O KPI "Próximo" atualiza automaticamente quando o evento atual termina (sem reload manual)
- Se o dia não tem nenhum evento, "Eventos hoje" mostra "0" com sub-texto "Dia livre!"

**Resultado esperado:** O usuário vê seus 4 indicadores-chave sem precisar scrollar, entende imediatamente a carga do dia e a performance da semana.

#### 5.2.2 Timeline do Dia (Mini Agenda)

**Objetivo:** Mostrar os próximos eventos do dia em formato compacto, funcionando como preview da tab Agenda.

**Funcionamento:**
- Lista vertical dos próximos 5 eventos do dia (cronológica)
- Cada item é um EventCard compacto com: hora início, título, barra de cor do módulo (3px lateral), e badge do módulo
- Evento em andamento (start_time ≤ now ≤ end_time) tem destaque visual: borda esquerda glow cyan, fundo com gradiente sutil rgba(6,182,212,0.06)
- Eventos passados do dia aparecem com opacidade reduzida (0.5) e texto tachado se concluídos
- Se o evento tem custo, mostra badge adicional "💰 R$ [valor]"
- Se o evento tem local, mostra "📍 [local]" como sub-texto

**Critérios de aceite:**
- Mostra no máximo 5 eventos mais próximos do momento atual
- Se o dia tem mais de 5 eventos futuros, mostra link "Ver todos na Agenda →" que navega para tab Agenda
- Se zero eventos hoje, mostra empty state inline: ícone 📅 + "Dia livre! Que tal agendar algo produtivo?" + CTA "Criar evento"
- Tocar em qualquer EventCard navega para o Detalhe do Evento (tela L2)
- A lista atualiza em tempo real quando um evento é concluído ou novo evento é criado

**Resultado esperado:** O usuário enxerga a programação do dia sem precisar sair do Dashboard. Em 80% dos casos, essa mini agenda é suficiente para saber o que vem a seguir.

#### 5.2.3 Distribuição Semanal por Módulo

**Objetivo:** Visualizar como o tempo está sendo distribuído entre as áreas da vida na semana corrente. É o componente que transforma o Tempo de "calendário" em "cockpit de vida".

**Funcionamento:**
- Barras horizontais, uma por módulo que tem pelo menos 1 evento na semana
- Cada barra tem a cor do respectivo módulo (Carreira = #ec4899, Mente = #eab308, Corpo = #f97316, etc.)
- Largura da barra proporcional ao total de horas
- À esquerda da barra: nome do módulo (60px fixo)
- À direita da barra: valor em horas (ex: "12h")
- Barras ordenadas de maior para menor tempo
- Background de fundo: var(--s3) para mostrar a proporção visualmente

**Critérios de aceite:**
- Mostra apenas módulos com pelo menos 1 evento na semana (não mostra módulos com 0h)
- A barra mais larga ocupa 100% da largura disponível, as demais são proporcionais
- Se nenhum evento da semana tem módulo vinculado, mostra mensagem: "Vincule eventos a módulos para ver sua distribuição de tempo"
- O gráfico recalcula em tempo real quando eventos são criados ou editados
- Máximo de 8 barras (1 por módulo). Se todos os 8 módulos têm eventos, todos aparecem

**Resultado esperado:** O usuário vê imediatamente se está desequilibrado. "Puxa, 55% Carreira e 0% Corpo — preciso agendar academia". Esse é o insight mais poderoso do módulo Tempo e o principal diferencial competitivo.

#### 5.2.4 Quick Foco (Atalho)

**Objetivo:** Atalho de um toque para iniciar uma sessão de foco, reduzindo a fricção entre "quero focar" e "estou focando".

**Funcionamento:**
- Card com gradiente da cor Tempo (cyan→azul)
- Ícone de timer + texto "Iniciar sessão de foco"
- Sub-texto mostra a configuração padrão: "25 min · [nome da meta/evento mais recente]"
- Botão play circular que navega direto para o Timer Foco (tela L2)
- Se há evento do tipo "Foco" agendado para agora, pré-seleciona esse evento

**Critérios de aceite:**
- Um toque no card navega para `/tempo/foco` com a meta/evento pré-selecionado
- O evento pré-selecionado é o do tipo "Foco" mais recente ou o próximo agendado
- Se não há nenhum evento de Foco, abre o timer sem vínculo ("Sessão livre")
- Só aparece se o usuário é PRO. FREE: card com texto "Desbloqueie sessões de Foco — PRO" + ícone 🔒

**Resultado esperado:** Em 2 toques (abrir módulo + clicar no Quick Foco), o usuário já está em sessão focada. Crucial para engajamento diário do PRO.

#### 5.2.5 [Jornada] Insight IA de Distribuição de Tempo

**Objetivo:** Fornecer análise inteligente de como o usuário está usando seu tempo, com recomendações acionáveis baseadas nos dados reais.

**Componente visual:**
- Card com fundo azulado sutil (rgba(0,85,255,0.06)) — diferente dos cards normais
- Borda com cor azul sutil (rgba(0,85,255,0.15))
- Ícone de robô (🤖) à esquerda
- Texto em formato de dica personalizada

**Exemplos de insights:**
- "Você dedicou 85% do tempo a Carreira e apenas 3% a Corpo. Que tal 30min de atividade física na terça?"
- "Sua semana tem 4 slots livres à tarde. Perfeito para blocos de estudo de React."
- "Você concluiu 18 de 23 eventos — 78% de taxa! Continue assim, a consistência é sua força."
- "O módulo Mente está sem eventos há 5 dias. Sua trilha 'React Avançado' espera por você."
- "Eventos de Corpo geram R$ 280 em custos este mês. Quer que eu vincule ao orçamento de Saúde?"

**Lógica de geração de insights (regras por prioridade):**
1. Se algum módulo com trilha/meta ativa não tem eventos há mais de 5 dias → alerta de desequilíbrio
2. Se um módulo concentra mais de 60% do tempo → sugestão de diversificação
3. Se a taxa de conclusão está acima de 75% → incentivo de consistência
4. Se há slots livres na semana → sugestão de blocos de foco
5. Se há eventos com custo total alto no mês → insight de impacto financeiro
6. Fallback: dica genérica sobre planejamento semanal

**Critérios de aceite:**
- Só aparece no Modo Jornada (PRO)
- O insight muda a cada visita (não repete o mesmo insight em visitas consecutivas no mesmo dia)
- O texto é gerado por regras de negócio (não por IA generativa no MVP — performance)
- Se não há dados suficientes para gerar insight (< 5 eventos na semana), mostra dica genérica: "Continue agendando seus compromissos. Após 1 semana completa, insights personalizados aparecerão aqui."
- Botão de ação contextual: "Agendar agora →" (abre wizard com módulo pré-selecionado baseado na sugestão)

**Resultado esperado:** O usuário sente que o app "conhece" seus hábitos temporais e está ajudando ativamente a equilibrar as áreas da vida. Isso aumenta perceived value do plano PRO.

---

## 6. TELA 02 — AGENDA DIÁRIA

### 6.1 Objetivo

Mostrar todos os eventos de um dia específico em formato de lista cronológica, com navegação rápida entre dias via week strip. É a tela de maior uso diário — o usuário abre o Tempo e olha "o que tenho hoje" nesta tela.

### 6.2 Componentes

#### 6.2.1 Week Strip (Navegação de Dias)

**Objetivo:** Permitir navegação rápida entre os dias da semana sem sair da tela de Agenda.

**Funcionamento:**
- Barra horizontal com 7 bolhas representando os dias da semana (DOM a SÁB ou SEG a DOM, conforme configuração do usuário)
- Cada bolha mostra: abreviação do dia (DOM, SEG...), número do dia, e dots coloridos indicando presença de eventos por módulo
- O dia atualmente selecionado tem fundo destacado
- O dia de hoje tem tratamento visual especial permanente

**Visual de cada bolha:**
- **Dia normal:** fundo var(--s1), borda var(--border), texto var(--t1)
- **Dia hoje:** fundo var(--tempo-g) (rgba(6,182,212,0.14)), borda rgba(6,182,212,0.4), nome e número em cor cyan
- **Dia selecionado (não hoje):** fundo var(--s2), borda var(--border-h)
- **Dots:** até 3 dots coloridos (5px × 5px, circular) abaixo do número, cada dot na cor de um módulo que tem evento naquele dia

**Critérios de aceite:**
- Exibe 7 dias de cada vez — todos visíveis sem scroll horizontal (flex com flex:1 por bolha)
- Ao tocar em um dia, a lista de eventos abaixo atualiza instantaneamente para aquele dia
- Dots coloridos são calculados: para cada dia, verifica quais módulos distintos têm eventos e mostra 1 dot por módulo (máximo 3)
- Se um dia tem eventos de 4+ módulos, mostra apenas os 3 com mais eventos
- O dia de hoje sempre tem destaque cyan, mesmo se não está selecionado
- Swipe horizontal na área do week strip navega para a semana anterior/seguinte
- Ao navegar para outra semana, o primeiro dia daquela semana é selecionado automaticamente

**Resultado esperado:** O usuário navega entre dias com um toque. Os dots coloridos servem como preview — "quarta tem dot rosa (Carreira) e laranja (Corpo), sexta tem dot amarelo (Mente)". Isso dá visão de sobrevoo sem precisar clicar em cada dia.

#### 6.2.2 Lista de Eventos do Dia

**Objetivo:** Exibir todos os eventos do dia selecionado em ordem cronológica, com informações suficientes para o usuário entender o que cada compromisso envolve.

**Para cada evento, o EventCard mostra:**
- **Coluna de hora** (esquerda, 44px): hora início em DM Mono 13px, hora fim logo abaixo em fonte menor (11px). Se "dia todo": mostra "DIA TODO"
- **Barra de módulo** (3px largura): barra vertical colorida na cor do módulo vinculado. Se sem módulo, usa var(--tempo) cyan
- **Área de informações** (flex: 1):
  - Título do evento (DM Sans 14px, font-weight 500)
  - Sub-texto: "📍 [local] · [duração]" — se tem local e duração
  - Tags: badges do módulo + badge de custo (se houver)

**Separadores de período:**
- Seção "Manhã" (eventos 6h–12h)
- Seção "Tarde" (eventos 12h–18h)
- Seção "Noite" (eventos 18h–24h)
- Cada seção tem section-title em Syne 13px uppercase

**Critérios de aceite:**
- Eventos de "dia todo" aparecem no topo, antes dos com horário, em seção separada
- Eventos são ordenados por start_time
- Evento concluído (type=tarefa, status=completed) mostra ✓ no título e opacidade 0.5
- Evento em andamento (start_time ≤ now ≤ end_time) tem borda esquerda glow na cor do módulo
- Evento com custo mostra badge adicional: "💰 R$ 280 alocado" (badge verde)
- Tocar em qualquer EventCard navega para o Detalhe do Evento
- Se zero eventos no dia selecionado: empty state com ícone 📅, texto "Nenhum evento neste dia", e CTA "Criar evento"

**Resultado esperado:** O usuário vê a programação completa do dia com clareza visual. Badges de módulo e custo agregam contexto que nenhum calendário tradicional oferece.

#### 6.2.3 Preview do Dia Seguinte

**Objetivo:** Antecipar o que vem amanhã, reduzindo a ansiedade de "o que tenho para amanhã?" sem forçar a troca de dia.

**Funcionamento:**
- Bloco separado com section-title "Amanhã — [N] eventos"
- Mostra os primeiros 2 eventos do dia seguinte com opacidade reduzida (0.6)
- Se mais de 2 eventos, mostra "e mais [N-2]" em texto link
- Tap no bloco navega para o dia seguinte no week strip

**Critérios de aceite:**
- Aparece apenas quando o dia selecionado é o dia atual (hoje)
- Não aparece se amanhã não tem eventos
- Não aparece se o usuário selecionou um dia diferente de hoje
- Os eventos do preview usam o mesmo formato EventCard mas com opacidade reduzida

**Resultado esperado:** O usuário fecha o dia sabendo o que vem amanhã. Essa feature reduz a consulta repetitiva ao calendário — uma visita ao Tempo é suficiente para ter contexto do dia atual e do seguinte.

---

## 7. TELA 03 — VISÃO SEMANAL

### 7.1 Objetivo

Oferecer visão panorâmica de 7 dias lado a lado com blocos de tempo posicionados verticalmente, permitindo identificar conflitos, espaços livres e o equilíbrio da semana. É a tela para quem planeja olhando a semana inteira.

### 7.2 Conceito de Visualização

A visão semanal funciona como um grid de calendário tradicional: colunas representam dias, linhas representam horas, e eventos são renderizados como blocos retangulares posicionados na interseção correta. A cor de cada bloco é a cor do módulo vinculado ao evento.

No mobile (375px), não é viável mostrar 7 colunas completas. A solução é mostrar 3 dias visíveis com scroll horizontal suave para revelar os demais.

### 7.3 Componentes

#### 7.3.1 Header de Navegação Semanal

**Elementos:**
- Seta ← (navega para semana anterior)
- Texto centralizado: "1 – 7 Mar 2026" (range da semana visível)
- Seta → (navega para semana seguinte)

**Critérios de aceite:**
- Range atualiza ao navegar entre semanas
- Ao navegar, a visualização do grid atualiza com os eventos da nova semana
- Se a semana atual contém o dia de hoje, o header mostra ícone de "hoje" sutil

#### 7.3.2 Grid Semanal

**Estrutura:**
- Coluna fixa à esquerda com rótulos de hora (DM Mono 10px): 08:00, 09:00, 10:00... 22:00
- 3 colunas de dias visíveis (mobile) ou 7 colunas (desktop)
- Header de cada coluna: "DOM 1", "SEG 2" etc. O dia atual tem header em cor cyan

**Blocos de eventos:**
- Posicionados por start_time (topo do bloco) e dimensionados por duração (altura)
- Background na cor do módulo vinculado com opacidade 0.9
- Texto dentro do bloco: título truncado em 10px font-weight 500, cor #000 (preto para contraste)
- Blocos com menos de 30min de altura mostram apenas o título sem sub-info
- Blocos com 1h+ mostram título + hora

**Conflitos (sobreposição):**
- Eventos sobrepostos ficam lado a lado (split de largura). Exemplo: 2 eventos às 14h dividem a coluna em 2 metades

**Linha "agora":**
- Linha horizontal fina (2px) vermelha (#f43f5e) que indica a hora atual
- Posicionada dinamicamente na hora correta
- Atualiza a cada 60 segundos

**Critérios de aceite:**
- Mobile: 3 dias visíveis, scroll horizontal suave para revelar os 7
- Desktop: 7 dias visíveis simultaneamente
- Blocos posicionados proporcionalmente: 1h de evento = mesma altura que 1h de grid
- Tap em bloco → navega para Detalhe do Evento
- Tap em slot vazio → abre wizard de Criar Evento com data e hora pré-preenchidas
- A linha "agora" é visível apenas quando a semana exibida contém o dia atual
- Scroll vertical dentro do grid se as horas 8h-22h não cabem no viewport

**Resultado esperado:** O usuário vê a semana inteira como um mapa de tempo. Blocos coloridos por módulo revelam imediatamente: "segunda e terça são dominadas por rosa (Carreira), quarta está livre, quinta tem laranja (Corpo) à tarde". É o view mais poderoso para planejamento.

#### 7.3.3 Resumo da Semana (Card Rodapé)

**Card informativo abaixo do grid:**
- Texto em 12px com dados consolidados: "📊 Esta semana: [X]h planejadas em [Y] módulos. [Dia] tem [N] slots livres à tarde."
- Background sutil var(--tempo-g) com borda cyan
- Gerado por regras de negócio simples (soma de horas, contagem de módulos, identificação de dias com < 2h de eventos)

**Critérios de aceite:**
- Atualiza quando eventos são criados/editados
- Se semana está vazia: "Nenhum evento esta semana. Planeje agora!"

---

## 8. TELA 04 — VISÃO MENSAL

### 8.1 Objetivo

Visão de alto nível do mês com indicadores de ocupação por dia, permitindo planejamento de médio prazo. O usuário usa essa tela para escolher o melhor dia para agendar algo novo ou identificar semanas sobrecarregadas.

### 8.2 Componentes

#### 8.2.1 Header de Navegação Mensal

**Elementos:**
- Botão ← (mês anterior)
- Nome do mês em Syne 16px bold: "Março 2026"
- Botão → (mês seguinte)

**Critérios de aceite:**
- Navegar atualiza o grid e os dots de eventos
- Animação de transição suave entre meses (fade ou slide)

#### 8.2.2 Grid Mensal

**Estrutura:**
- Header com 7 colunas: D, S, T, Q, Q, S, S (ou S, T, Q, Q, S, S, D conforme config)
- Grid de 5-6 linhas com células para cada dia
- Cada célula mostra: número do dia (DM Mono 13px) + até 3 dots coloridos

**Dots coloridos:**
- Cada dot (5px circular) representa 1 módulo que tem evento naquele dia
- Se um dia tem eventos de Carreira + Mente + Corpo, mostra 3 dots: rosa, amarelo, laranja
- Se mais de 3 módulos, mostra os 3 com mais eventos
- Dots são centralizados abaixo do número, em linha horizontal com gap de 2px

**Visual dos dias:**
- **Hoje:** background var(--tempo-g), borda cyan, número em cor cyan e bold
- **Dia com 5+ eventos:** background ligeiramente mais escuro (rgba(255,255,255,0.02)) indicando "dia cheio"
- **Dias do mês anterior/seguinte:** opacidade 0.3

**Critérios de aceite:**
- Grid renderiza corretamente para meses de 28, 29, 30 e 31 dias
- Dots são calculados em real-time baseado nos eventos da tabela calendar_events
- Tap em qualquer dia → navega para tab Agenda com aquele dia selecionado no week strip
- O dia atual sempre tem o destaque cyan, independente de estar selecionado ou não
- Dias sem eventos não mostram dots (célula fica limpa, apenas o número)

**Resultado esperado:** O usuário identifica rapidamente quais dias do mês estão ocupados (muitos dots), quais estão livres (sem dots), e qual a distribuição de módulos. É como um "heatmap de agenda".

#### 8.2.3 Mini Preview do Dia Selecionado

**Objetivo:** Ao tocar em um dia no grid, mostrar um preview rápido dos eventos sem sair da visão mensal.

**Funcionamento:**
- Card que aparece no rodapé da tela (acima do bottom bar)
- Header: "Hoje, 1 de Março — 3 eventos" (ou data do dia selecionado)
- Lista inline dos eventos: "09:00 Daily · 15:00 Dentista · 19:00 Inglês"
- Botão "Ver dia completo →"

**Critérios de aceite:**
- Mostra no máximo 3 eventos em formato de texto inline
- Se mais de 3: "09:00 Daily · 15:00 Dentista · e mais 3"
- Tap em "Ver dia completo →" navega para tab Agenda com o dia selecionado
- Se o dia não tem eventos: "Dia livre — sem compromissos"
- O preview atualiza ao tocar em diferentes dias (substitui o anterior)

---

## 9. TELA 05 — GESTÃO DE EVENTOS E TAREFAS

### 9.1 Objetivo

Permitir ao usuário criar, visualizar, editar, concluir, repetir e excluir eventos e tarefas no calendário, com vinculação opcional a módulos do SyncLife e criação automática de transações financeiras.

### 9.2 Tipos de Evento

Cada evento no módulo Tempo pertence a um dos 4 tipos:

| Tipo | Ícone | Comportamento | Exemplo |
|------|-------|--------------|---------|
| **Compromisso** | 📅 | Horário fixo, pode ter local, não tem checkbox | "Reunião com cliente", "Dentista", "Jantar com amigos" |
| **Tarefa** | ✅ | Pode ser marcada como concluída (checkbox), tem deadline | "Enviar relatório", "Comprar presente", "Pagar conta" |
| **Foco** | 🎯 | Time block com timer vinculado, registra horas em meta | "Estudar React 2h", "Preparar apresentação", "Meditar" |
| **Lembrete** | 🔔 | Sem duração, apenas notificação no horário | "Tomar remédio", "Ligar para médico", "Revisar orçamento" |

**Por que 4 tipos:** A diferenciação permite lógica específica por tipo. Compromissos são passivos (você participa). Tarefas são ativas (você executa e marca como feita). Foco é produtividade pura (timer + registro de horas). Lembretes são alertas pontuais.

### 9.3 Conceito de Vinculação a Módulo

Cada evento pode ser opcionalmente vinculado a um dos 8 módulos do SyncLife. Isso gera 3 efeitos:

1. **Visual:** O evento ganha a cor do módulo (barra lateral e badge)
2. **Analítico:** As horas do evento contam na distribuição semanal por módulo
3. **Integração:** Dependendo do módulo, ações adicionais são disparadas (custo → Finanças, horas → Futuro)

Se o evento não é vinculado a nenhum módulo, ele usa a cor padrão cyan (var(--tempo)) e aparece como "Geral" na distribuição.

### 9.4 Wizard de Criação (2 Passos)

#### Passo 1 — Informações Básicas

**Campos:**
- **Título** (texto, obrigatório, max 100 chars): placeholder "Ex: Reunião com cliente"
- **Tipo** (seleção em grid 2×2): Compromisso | Tarefa | Foco | Lembrete. Default: Compromisso. Cada opção tem ícone + label
- **Data** (date picker): default = hoje. Permite selecionar data passada (para registro retroativo)
- **Hora início** (time picker): default = próxima hora cheia
- **Duração rápida** (pills horizontais): "30min" | "1h" | "2h" | "Dia todo". Ao selecionar, calcula hora fim automaticamente. Pill selecionada tem fundo var(--tempo-g) e borda cyan
- **Quick repeat** (opcional): "Só hoje" (default) | "Todo dia" | "Toda semana"

**Botões:**
- "Continuar →" — avança para Passo 2
- "Criar rápido (pular detalhes)" — cria o evento apenas com os dados do Passo 1, sem módulo/custo/lembrete

**Validações:**
- Título obrigatório (mostra erro inline se vazio)
- Se "Dia todo" selecionado, hora início e duração ficam desabilitados
- Se tipo = "Lembrete", duração fica desabilitada (lembrete é pontual)

#### Passo 2 — Detalhes

**Campos:**
- **Módulo vinculado** (select dropdown com ícones): "Sem módulo" | 💰 Finanças | ⏳ Tempo | 🔮 Futuro | 🏃 Corpo | 🧠 Mente | 📈 Patrimônio | 💼 Carreira | ✈️ Experiências. Ao selecionar, a cor do preview muda
- **Local** (texto, opcional, max 200 chars): placeholder "Endereço ou link de reunião"
- **Custo associado** (campo monetário, opcional): formato R$ XX,XX. Se preenchido, mostra alerta inline: "💰 Será criada transação de R$ [valor] em Finanças"
- **Repetição** (select): Nunca | Diário | Semanal | Mensal | Anual | Personalizado. "Personalizado" abre sub-campos: a cada X dias/semanas/meses, dias da semana (seg/ter/qua...), fim (nunca/após N vezes/em data)
- **Lembrete** (select): Nenhum | 5 minutos | 15 minutos | 30 minutos | 1 hora | 1 dia antes
- **Notas** (textarea, opcional, max 1000 chars): texto livre para observações
- **Cor** (automática pelo módulo, ou paleta custom): se módulo selecionado, cor é automática. Botão "cor personalizada" permite override

**Botão:** "Criar evento" (primário, background var(--tempo), texto preto #000)

**Validações:**
- Custo deve ser ≥ 0 se preenchido
- Se tipo = "Foco" e módulo = Mente: sugere vincular a trilha existente com autocomplete
- Repetição "Personalizado" requer pelo menos 1 dia da semana selecionado
- Se custo > 0 e módulo não selecionado: sugere vincular a Finanças automaticamente

**O que acontece ao criar:**
1. Evento salvo na tabela `calendar_events`
2. Se custo > 0: cria transação pendente na tabela `transactions` (Finanças)
3. Se repetição: gera próximas N ocorrências (max 52 para semanal, 12 para mensal, 365 para diário)
4. Se lembrete: agenda notificação push no horário configurado
5. [Jornada] Concede +5 XP e mostra toast: "Evento criado! +5 XP"
6. Redireciona para tab anterior com toast de sucesso

### 9.5 Detalhe do Evento

**Header:**
- Botão voltar (← tab anterior)
- Título "Detalhe"
- Botão editar (✏️)

**Hero Card:**
- Background gradiente: do módulo vinculado (rgba(cor_modulo, 0.12)) misturado com var(--tempo-g)
- Ícone grande (44×44px, border-radius 12px) com emoji representativo ou ícone do tipo
- Título do evento (Syne 17px bold)
- Sub-texto: tipo do evento ("Compromisso", "Tarefa", "Foco", "Lembrete")
- Badges: módulo vinculado + custo (se houver)

**Informações detalhadas (lista vertical):**
- 📅 Data completa + horário + duração: "Domingo, 1 de Março 2026 · 15:00–16:30 (1h30)"
- 📍 Local: "Clínica Central, Rua das Flores 123" (se preenchido)
- 🔔 Lembrete: "1 hora antes" (se configurado)
- 🔄 Repetição: "Toda semana" (se configurado)
- 📝 Notas: texto livre (se preenchido)
- 🔗 Vínculo: "→ Ver consulta no módulo Corpo" (link clicável para a entidade vinculada)

**Ações:**
- **Concluir** (botão primário, var(--tempo)): disponível para tipo Tarefa e Foco. Marca como completed
- **Excluir** (botão vermelho): abre confirmação
- **Editar** (via ícone no header): abre tela de edição com campos preenchidos

**Critérios de aceite:**
- Todas as informações preenchidas na criação aparecem aqui
- Campos vazios não aparecem (o bloco é omitido, não mostra "—")
- O link de vínculo com outro módulo navega para a entidade correta (consulta, trilha, step, viagem)
- Se o evento é recorrente, mostra badge "🔄 Recorrente" e ações de edição perguntam escopo (este/futuros/todos)

---

## 10. FLUXOS CRUD DETALHADOS

### 10.1 Evento

#### CRIAR EVENTO

**Passo a passo do usuário:**

1. Em qualquer tab L1, toca no FAB "+" (canto inferior direito)
   - Alternativa: na Visão Semanal, tap em slot vazio → abre wizard com data/hora pré-preenchidas
2. Abre wizard de criação (tela cheia L2)
3. Preenche Passo 1: título, tipo, data, hora, duração
4. Opção: "Criar rápido" → cria evento com dados mínimos (título + data + hora)
5. Ou "Continuar →" → Passo 2: módulo, local, custo, repetição, lembrete, notas
6. Confirma → evento criado

**Validações:**
- Título: obrigatório, 1-100 caracteres
- Data: obrigatória, aceita data passada (registro retroativo)
- Hora: obrigatória exceto para "Dia todo"
- Custo: se preenchido, deve ser ≥ 0, formato decimal com 2 casas
- Repetição "Personalizado": requer pelo menos 1 dia da semana
- Limite FREE: se o usuário já tem 30 eventos no mês corrente, mostra UpgradeModal no 31º

**Integrações disparadas na criação:**
- Se `custo > 0` e módulo vinculado → cria transação pendente em Finanças na categoria correspondente ao módulo
- Se `custo > 0` e sem módulo → cria transação em Finanças na categoria "Geral"
- Se tipo = "Foco" e meta vinculada no Futuro → registra horas no campo `current_value` da meta ao concluir
- Se `recurrence_rule` definido → gera próximas N ocorrências como eventos filhos (`recurrence_parent_id`)
- Se `reminder_minutes` definido → agenda push notification
- [Jornada] Concede +5 XP

**Resultado esperado:** Evento aparece na Agenda do dia correspondente, na Visão Semanal como bloco, e na Visão Mensal como dot colorido.

#### EDITAR EVENTO

**Campos editáveis:** Todos os campos informados na criação.

**Passo a passo:**
1. Na tela de Detalhe do Evento, toca no ícone ✏️ (header)
2. Abre formulário pré-preenchido com dados atuais (mesmo layout do wizard)
3. Altera o que desejar
4. Confirma — dados atualizados, campo `updated_at` registrado

**Comportamento especial para eventos recorrentes:**
- Ao editar um evento que tem `recurrence_parent_id`, pergunta:
  - "Alterar só este evento" → edita apenas o evento selecionado, desvincula da recorrência
  - "Este e todos os futuros" → edita este + todos os filhos com data futura
  - "Todos os eventos desta série" → edita todos os filhos incluindo passados

**Validações:** Mesmas da criação.

**Integrações:**
- Se custo mudou de 0 para valor: cria nova transação em Finanças
- Se custo mudou de valor para 0: pergunta se exclui transação existente
- Se custo mudou de valor A para valor B: atualiza transação vinculada com novo valor
- Se módulo mudou: atualiza cor do evento e recalcula distribuição

#### CONCLUIR EVENTO (Tarefas e Foco)

**Passo a passo:**
1. Na Agenda ou Detalhe, toca no checkbox do evento (tipo Tarefa) ou botão "Concluir" (tipo Foco)
2. Status muda para 'completed', `completed_at` = now()
3. Se vinculado a meta no Futuro via `linked_entity_id`:
   - Tipo Tarefa: progress da meta atualiza para 100% (tarefa é binária)
   - Tipo Foco: horas da sessão somam ao `current_value` da meta
4. Feedback visual: título com tachado, opacidade 0.5, ícone ✓
5. [Jornada] Concede +3 XP por tarefa, +8 XP por sessão de foco

**Comportamento especial:**
- Desmarcar (tocar de novo no checkbox) é possível: reverte para status 'active', reverte progresso da meta
- Ao concluir evento de Foco: registra em `focus_sessions` com minutos efetivos

#### MUDAR STATUS

| Ação | De | Para | Confirmação? | O que acontece |
|------|----|------|-------------|----------------|
| Concluir | active | completed | Não | Marca como feito, registra `completed_at`, atualiza metas |
| Cancelar | active | cancelled | Sim: "Cancelar este evento?" | Evento fica cinza, não conta na taxa de conclusão |
| Reativar | cancelled | active | Não | Volta ao estado normal |

#### EXCLUIR EVENTO

**Passo a passo:**
1. Na tela de Detalhe, toca em "Excluir" (botão vermelho)
2. Confirmação: "Tem certeza que deseja excluir '[título]'? Esta ação não pode ser desfeita."
3. Se o evento é recorrente, pergunta:
   - "Excluir só este evento"
   - "Este e todos os futuros"
   - "Todos os eventos desta série"
4. Ao confirmar:
   - Soft delete: `status = 'deleted'` (evento permanece no banco mas invisível)
   - Se transação vinculada em Finanças: pergunta "Deseja excluir também a transação de R$ [valor] em Finanças?"
   - Se meta vinculada no Futuro: desvincula (meta permanece, apenas o `linked_entity_id` é limpo)
5. Toast: "Evento excluído"

**Justificativa do soft delete:** Preservar histórico para analytics. Se o usuário excluiu 10 eventos num mês, isso é dado relevante para o Score de Tempo.

### 10.2 Review Semanal

#### CRIAR/COMPLETAR REVIEW

**Passo a passo:**
1. Na tab Review, o sistema pré-carrega dados da semana anterior automaticamente
2. Usuário vê métricas, distribuição, conquistas e pendências (tudo calculado)
3. Seção de pendências: para cada evento não concluído, escolhe "Mover para próxima semana" (cria novo evento) ou "Descartar"
4. Seção de planejamento: pode adicionar eventos para a próxima semana (atalho para wizard)
5. Toca em "Concluir Review" → salva em `weekly_reviews`
6. [Jornada] +10 XP, toast de celebração

**Validações:**
- Apenas 1 review por semana por usuário (UNIQUE constraint)
- Se a semana não tem nenhum evento, o review mostra empty state: "Semana sem eventos registrados"
- Pendências movidas criam novos eventos com `start_date = próxima segunda`

#### EDITAR REVIEW

Não é permitido editar um review após conclusão. Reviews são registros imutáveis de reflexão semanal. Justificativa: manter integridade dos dados de análise e streak de reviews.

### 10.3 Sessão de Foco

#### CRIAR SESSÃO (via Timer)

**Passo a passo:**
1. Acessa Timer Foco via Dashboard (Quick Foco) ou Detalhe de evento tipo Foco
2. Seleciona duração: 25min (Pomodoro), 45min, 1h, 2h, custom
3. Opcionalmente vincula a evento ou meta do Futuro (autocomplete)
4. Inicia timer → countdown visual (SVG ring)
5. Pode pausar/retomar sem perder progresso
6. Ao concluir (timer chega a 0 ou usuário toca "Parar"):
   - Registra em `focus_sessions`: planned_minutes, actual_minutes, status
   - Se vinculado a meta: atualiza `objective_goals.current_value` com horas
   - [Jornada] +8 XP
   - Toast: "Sessão concluída! [X]h registradas"

**Se o usuário abandona antes de 5 minutos:** sessão não é registrada (considerada falsa partida).

---

## 11. INTEGRAÇÕES COM OUTROS MÓDULOS

### 11.1 Tempo → Finanças

**Regra:** RN-TMP-04 — Custo de Evento → Transação em Finanças

**Trigger:** Criação ou edição de evento com campo `custo > 0`

**O que acontece:**
- Cria transação na tabela `transactions` com:
  - `description`: "📅 [título do evento]"
  - `amount`: valor do custo
  - `type`: 'expense'
  - `category_id`: mapeado pelo módulo vinculado (Corpo → "Saúde", Mente → "Educação", etc.). Se sem módulo, categoria "Geral"
  - `status`: 'pending' (pendente até o evento ser concluído)
  - Badge visual: "Auto — ⏳ Tempo"

**Condição:** A integração é automática quando custo é preenchido (não depende de toggle). O toggle em Configurações > Integrações controla apenas se a transação deve ser 'pending' (padrão) ou 'confirmed' (imediata).

**Cenários:**
- Criar evento "Dentista R$ 280" com módulo Corpo → cria despesa de R$ 280 em "Saúde", status pendente
- Editar custo de R$ 280 para R$ 350 → atualiza transação para R$ 350
- Excluir evento → pergunta se exclui transação. Se sim: soft delete na transação. Se não: transação permanece como registro
- Concluir evento → transação muda de 'pending' para 'confirmed'
- Cancelar evento → transação muda para 'cancelled'

### 11.2 Tempo → Futuro (Metas)

**Regra:** RN-TMP-11 — Evento concluído com meta vinculada atualiza progresso

**Trigger:** Evento com `linked_entity_type = 'objective_goal'` muda status para 'completed'

**O que acontece:**
- Busca a meta na tabela `objective_goals` pelo `linked_entity_id`
- Se tipo do evento = Tarefa: meta.progress atualiza para 100% (tarefa é binária)
- Se tipo do evento = Foco: soma horas efetivas ao `current_value` da meta
- O Objetivo pai recalcula seu progresso geral (média ponderada)

**Condição:** O evento deve ter `linked_entity_id` preenchido E `auto_sync = TRUE` na meta

**Cenários:**
- Meta "Completar relatório" (tipo tarefa) vinculada a evento "Escrever relatório" → ao concluir evento, meta vai para 100%
- Meta "Estudar 100h de React" (tipo horas) vinculada a evento de Foco de 2h → ao concluir, current_value += 2, recalcula progress
- Evento desvinculado (sem linked_entity_id) → nada acontece no Futuro

### 11.3 Tempo ← Corpo (Consultas)

**Regra:** RN-TMP-19 — Consulta médica no Corpo → Evento automático no Tempo

**Trigger:** Criação de consulta no módulo Corpo

**O que acontece:**
- Cria evento na tabela `calendar_events` com:
  - `title`: "[Especialidade] — [Nome do médico]" (ex: "Dentista — Dr. Silva")
  - `event_type`: 'appointment'
  - `start_date` e `start_time`: data e hora da consulta
  - `end_time`: hora + duração estimada da consulta
  - `linked_module`: 'corpo'
  - `linked_entity_type`: 'appointment'
  - `linked_entity_id`: ID da consulta
  - `cost`: custo da consulta (se informado)
  - `location`: endereço do consultório (se informado)
  - `reminder_minutes`: 60 (1h antes, padrão)

**Condição:** Toggle `crp_consulta_tempo` ativo em Configurações > Integrações

**Cenários:**
- Criar consulta "Dentista, Dr. Silva, 01/03 15h, R$ 280, Clínica Central" no Corpo → cria evento "Dentista — Dr. Silva" no Tempo com todos os dados + transação de R$ 280 em Finanças
- Lembrete de retorno (30 dias após consulta sem retorno agendado) → cria lembrete "Marcar retorno [especialidade]" no Tempo
- Editar consulta no Corpo → atualiza evento no Tempo
- Excluir consulta no Corpo → pergunta se exclui evento no Tempo

### 11.4 Tempo ← Mente (Sessões de Estudo)

**Regra:** RN-TMP-12 — Sessão Pomodoro do Mente → Bloco de estudo no Tempo

**Trigger:** Sessão Pomodoro completada no módulo Mente (ao menos 1 ciclo)

**O que acontece:**
- Cria evento na tabela `calendar_events` com:
  - `title`: "📚 Estudo — [nome da trilha]" (ou "📚 Estudo livre")
  - `event_type`: 'focus'
  - `start_date` e `start_time`: início real da sessão
  - `end_time`: fim real da sessão
  - `linked_module`: 'mente'
  - `linked_entity_type`: 'focus_session'
  - `linked_entity_id`: ID da sessão
  - `status`: 'completed' (já concluída)

**Condição:** Toggle `mnt_pomodoro_agenda` ativo em Configurações > Integrações E toggle "Registrar na Agenda" ativo no Timer do Mente

**Cenários:**
- Sessão de 4 Pomodoros (1h40 de foco) na trilha "React Avançado" → cria evento "📚 Estudo — React Avançado" de 1h40 no Tempo
- Sessão de estudo livre (sem trilha) → cria "📚 Estudo livre"
- Sessão interrompida antes de 1 ciclo → nada registrado

### 11.5 Tempo ← Futuro (Deadlines e Reviews)

**Regra:** RN-TMP-11b — Meta tipo tarefa no Futuro → Evento com deadline no Tempo

**Trigger:** Criação de meta tipo "task" (tarefa) ou "hours" (horas) em `objective_goals`

**O que acontece:**
- Meta tipo tarefa: cria evento tipo Tarefa no Tempo com `start_date = meta.target_date` (deadline)
- Meta tipo horas: sugere criar blocos de Foco recorrentes ("Criar blocos de 2h semanais para [meta]?")
- Check-in semanal do Futuro (se ativado): cria evento recorrente "Review semanal 📊" às segundas

**Condição:** `auto_sync = TRUE` na meta E toggle `fut_meta_tempo` ativo

### 11.6 Tempo ← Experiências (Viagens)

**Regra:** RN-TMP-20 — Viagem planejada → Bloqueio de dias + Roteiro

**Trigger:** Criação de viagem no módulo Experiências com datas definidas

**O que acontece:**
- Cria evento "dia todo" para cada dia da viagem: "✈️ [Nome da viagem] — Dia [N]"
- Se a viagem tem roteiro por dia: cria eventos com horários dentro de cada dia
- Eventos são vinculados a `linked_module: 'experiencias'`, `linked_entity_type: 'trip'`

**Condição:** Toggle `exp_viagem_tempo` ativo

**Cenários:**
- Viagem "Japão 10-22 Jul" → cria 13 eventos de dia todo "✈️ Japão — Dia 1" até "Dia 13"
- Se roteiro: "Dia 1: 09:00 Templo Senso-ji, 14:00 Akihabara" → cria eventos com hora dentro do dia bloqueado

### 11.7 Tempo ← Patrimônio (Proventos)

**Regra:** RN-TMP-20b — Data de proventos → Lembrete no Tempo

**Trigger:** Ativo na carteira do Patrimônio com data de provento registrada

**O que acontece:**
- Cria lembrete no Tempo: "💰 Proventos [ticker] amanhã" no dia anterior ao pagamento
- Se proventos recorrentes (mensais): cria lembrete recorrente

**Condição:** Toggle `ptr_proventos_tempo` ativo

### 11.8 Tempo ← Carreira (Steps do Roadmap)

**Regra:** RN-TMP-11c — Step do roadmap com prazo → Tarefa no Tempo

**Trigger:** Step do roadmap de carreira com `deadline` definida

**O que acontece:**
- Cria evento tipo Tarefa no Tempo: "💼 [nome do step]" com start_date = deadline
- Vincula: `linked_module: 'carreira'`, `linked_entity_type: 'roadmap_step'`

**Condição:** Toggle `car_step_tempo` ativo

---

## 12. DIAGRAMA DE INTEGRAÇÕES

```
                    ┌─────────────────────┐
                    │     ⏳ TEMPO          │
                    │   (Hub de Eventos)    │
                    │                      │
                    │  Agenda + Calendar   │
                    │  Timer Foco + Review │
                    │  Score + Análise     │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ 💰 FINANÇAS │     │ 🔮 FUTURO   │     │ 🧠 MENTE    │
    │             │     │             │     │             │
    │• Transação  │     │• Deadlines  │     │• Blocos de  │
    │  automática │     │  de metas   │     │  estudo     │
    │  de custo   │     │• Horas de   │     │  registrados│
    │• Lembrete   │     │  foco →     │     │• Pomodoro   │
    │  vencimento │◄───►│  progresso  │◄───►│  → evento   │
    │  de conta   │     │• Review     │     │  no Tempo   │
    └─────────────┘     │  semanal    │     └─────────────┘
                        └──────┬──────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ 🏃 CORPO    │     │ 💼 CARREIRA  │     │ ✈️EXPERIÊNC.│
    │             │     │             │     │             │
    │• Consulta → │     │• Step do    │     │• Viagem →   │
    │  evento     │     │  roadmap →  │     │  bloqueio   │
    │• Retorno →  │     │  tarefa     │     │  de dias    │
    │  lembrete   │     │• Entrevista │     │• Roteiro →  │
    │• Treino →   │     │  → evento   │     │  eventos    │
    │  sugestão   │     │             │     │             │
    └─────────────┘     └─────────────┘     └──────┬──────┘
                                                   │
                                            ┌──────▼──────┐
                                            │ 📈PATRIMÔNIO │
                                            │             │
                                            │• Proventos →│
                                            │  lembrete   │
                                            └─────────────┘
```

---

## 13. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Contexto |
|--------|-------|----------|
| RN-TMP-01 | Título do evento é obrigatório, 1-100 caracteres | Criação/Edição |
| RN-TMP-02 | Data é obrigatória, hora opcional para eventos "dia todo" | Criação/Edição |
| RN-TMP-03 | Módulo vinculado determina cor do evento automaticamente. Sem módulo = cyan padrão | Visual |
| RN-TMP-04 | Custo > 0 cria transação pendente em Finanças na categoria correspondente ao módulo | Integração Finanças |
| RN-TMP-05 | Eventos por mês | (pós-MVP) Eventos ilimitados no MVP. |
| RN-TMP-06 | Eventos ilimitados | Sem limite no MVP. |
| RN-TMP-07 | Repetição gera até 52 ocorrências futuras (semanal), 12 (mensal), 365 (diário) | Recorrência |
| RN-TMP-08 | Editar evento recorrente: opção "só este" / "este e futuros" / "todos" | Edição |
| RN-TMP-09 | Exclusão é soft delete (status = 'deleted'). Evento permanece no banco, invisível ao usuário | Exclusão |
| RN-TMP-10 | Excluir evento com transação vinculada pergunta se exclui transação também | Integração Finanças |
| RN-TMP-11 | Evento concluído com meta vinculada atualiza progresso. Tarefa → 100%, Foco → horas | Integração Futuro |
| RN-TMP-12 | Sessão de Foco registra horas na meta do Futuro quando auto_sync = TRUE | Integração Futuro |
| RN-TMP-13 | Review Semanal | Sempre disponível no MVP. |
| RN-TMP-14 | Timer de Foco | Sempre disponível no MVP. |
| RN-TMP-15 | Week strip mostra máximo 3 dots coloridos por dia. Se 4+ módulos, mostra os 3 com mais eventos | Visual |
| RN-TMP-16 | Visão Semanal mobile: 3 dias visíveis com scroll horizontal para os 7 | Responsividade |
| RN-TMP-17 | Indicador "agora" na Visão Semanal é linha vermelha que atualiza a cada 60 segundos | Real-time |
| RN-TMP-18 | Score Tempo = (conclusão × 0.4) + (diversidade_módulos × 0.3) + (consistência × 0.3) | Cálculo |
| RN-TMP-19 | Consulta do Corpo com toggle ativo → cria evento automático no Tempo | Integração Corpo |
| RN-TMP-20 | Viagem do Experiências → bloqueia dias no Tempo como eventos "dia todo" | Integração Experiências |
| RN-TMP-21 | Lembrete push é enviado no horário configurado (5min/15min/30min/1h/1dia antes) | Notificação |
| RN-TMP-22 | Evento tipo Foco sem módulo vinculado: usa cor cyan padrão var(--tempo) | Visual |
| RN-TMP-23 | Data passada é permitida para registro retroativo de eventos | Flexibilidade |
| RN-TMP-24 | Google Calendar sync é pós-MVP. Card "Em breve" nas Configurações | Roadmap |
| RN-TMP-25 | XP por evento criado: +5 XP | Gamificação |
| RN-TMP-26 | XP por tarefa concluída: +3 XP | Gamificação |
| RN-TMP-27 | XP por Review Semanal completado: +10 XP | Gamificação |
| RN-TMP-28 | XP por sessão de Foco completada: +8 XP | Gamificação |
| RN-TMP-29 | Pendência arrastada = evento tipo Tarefa da semana anterior com status != 'completed' | Review |
| RN-TMP-30 | Dashboard Timeline mostra máximo 5 eventos futuros mais próximos | Visual |
| RN-TMP-31 | Ao cancelar evento com transação vinculada, transação muda para status 'cancelled' | Integração |
| RN-TMP-32 | Eventos de "dia todo" aparecem antes dos eventos com horário, em seção separada | Ordenação |
| RN-TMP-33 | Concluir evento tipo Foco registra sessão em focus_sessions com minutos efetivos | Registro |
| RN-TMP-34 | Sessão de Foco com menos de 5 minutos não é registrada (falsa partida) | Qualidade dados |
| RN-TMP-35 | Review semanal é UNIQUE por (user_id, week_start) — apenas 1 por semana | Integridade |

---

## 14. MODELO DE DADOS

### 14.1 Schema SQL

```sql
-- calendar_events: Tabela principal de eventos do módulo Tempo
calendar_events (
    id UUID PK DEFAULT gen_random_uuid(),
    user_id UUID FK → profiles NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'appointment' CHECK (appointment, task, focus, reminder),
    start_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    cost DECIMAL(10,2),
    linked_module TEXT CHECK (financas, tempo, futuro, corpo, mente, patrimonio, carreira, experiencias),
    linked_entity_type TEXT CHECK (objective_goal, study_track, appointment, roadmap_step, trip, asset, focus_session),
    linked_entity_id UUID,
    linked_transaction_id UUID FK → transactions,
    color TEXT,
    status TEXT DEFAULT 'active' CHECK (active, completed, cancelled, deleted),
    completed_at TIMESTAMP,
    recurrence_rule TEXT,
    recurrence_parent_id UUID FK → calendar_events,
    reminder_minutes INTEGER CHECK (5, 15, 30, 60, 1440),
    priority TEXT DEFAULT 'medium' CHECK (low, medium, high),
    notes TEXT,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
)

-- focus_sessions: Sessões de foco (Timer)
focus_sessions (
    id UUID PK DEFAULT gen_random_uuid(),
    user_id UUID FK → profiles NOT NULL,
    event_id UUID FK → calendar_events,
    goal_id UUID FK → objective_goals,
    planned_minutes INTEGER NOT NULL,
    actual_minutes INTEGER,
    status TEXT DEFAULT 'active' CHECK (active, paused, completed, abandoned),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    breaks_taken INTEGER DEFAULT 0,
    notes TEXT,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
)

-- weekly_reviews: Reviews semanais
weekly_reviews (
    id UUID PK DEFAULT gen_random_uuid(),
    user_id UUID FK → profiles NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_events INTEGER,
    completed_events INTEGER,
    total_hours DECIMAL(5,1),
    hours_by_module JSONB,
    highlights TEXT[],
    pending_items UUID[],
    next_week_plan JSONB,
    ai_insight TEXT,
    score DECIMAL(5,2),
    xp_awarded INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, week_start)
)
```

### 14.2 Índices Recomendados

```sql
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, start_date);
CREATE INDEX idx_calendar_events_user_status ON calendar_events(user_id, status);
CREATE INDEX idx_calendar_events_module ON calendar_events(user_id, linked_module);
CREATE INDEX idx_calendar_events_recurrence ON calendar_events(recurrence_parent_id);
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id, started_at);
CREATE INDEX idx_focus_sessions_goal ON focus_sessions(goal_id);
CREATE INDEX idx_weekly_reviews_user ON weekly_reviews(user_id, week_start);
```

---

## 15. LIFE SYNC SCORE — COMPONENTE TEMPO

### 15.1 Peso no Score Geral

O módulo Tempo contribui com **10%** do Life Sync Score total.

### 15.2 Fórmula

```
Tempo Score = (
    (conclusão) × 0.40 +
    (diversidade) × 0.30 +
    (consistência) × 0.30
) × 100

Onde:
- conclusão = eventos_concluidos_semana / total_eventos_semana
  (razão de tarefas completadas sobre total agendado)
- diversidade = módulos_com_eventos / módulos_ativos
  (recompensa quem distribui tempo entre áreas da vida)
  (normalizado: min(ratio, 1.0))
- consistência = dias_com_eventos_concluidos / 7
  (recompensa uso regular, não concentrado em 1-2 dias)

Limitado a 100 (teto)
```

### 15.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Crítico — agenda vazia ou completamente ignorada |
| 21-40 | Atenção — poucos eventos, baixa conclusão, tempo concentrado em 1 área |
| 41-60 | Regular — uso moderado, espaço para diversificar e ser mais consistente |
| 61-80 | Bom — agenda ativa, tempo diversificado entre módulos, boa taxa de conclusão |
| 81-100 | Excelente — tempo bem distribuído, alta consistência, compromissos cumpridos |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 16.1 Funcionalidades que agregam valor para futuras versões

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Google Calendar Sync** | Importar/exportar eventos bidirecionalmente com Google Calendar via OAuth. Elimina a barreira de adoção: o usuário não precisa abandonar sua agenda principal | Altíssimo — elimina barreira de adoção. Usuários não migram de calendário facilmente. Sync bidirecional resolve isso | Alta — pós-MVP |
| **Smart Scheduling IA** | IA analisa padrões (horários livres, preferências, energia) e sugere o melhor horário para novos eventos. "Agendar React? Sugiro terça 19h — seu horário mais produtivo" | Alto — diferencial competitivo. Motion faz isso a $19/mês de forma mandatória. SyncLife faria como sugestão, não imposição | V4 |
| **Heatmap de tempo mensal** | Mapa de calor mostrando intensidade de ocupação por dia do mês. Similar ao GitHub contributions. Escala de cor: vazio → pouco → moderado → intenso | Médio — visual poderoso para identificar semanas sobrecarregadas vs subutilizadas. Complementa a Visão Mensal | V3 |
| **Drag & drop time blocking** | Na Visão Semanal, arrastar tarefas pendentes (do Todoist style) para slots no calendário, criando eventos automaticamente | Alto — UX premium que Sunsama e Akiflow já oferecem. Diferencial: ao arrastar, vincula automaticamente ao módulo | V3 |
| **Compartilhar disponibilidade** | Link público tipo Calendly onde outros podem agendar horários com o usuário, integrado ao SyncLife | Médio — feature social/profissional. Morgen e Cal.com já fazem isso standalone | V4 |
| **Widgets de tempo** | Widget no Dashboard Home (Panorama) mostrando próximos 3 eventos e distribuição de hoje | Alto — engajamento diário. O widget é o primeiro contato do usuário com o app | V3 |
| **Natural language creation** | Digitar "Dentista amanhã 15h R$ 280 Corpo" → cria evento completo com módulo e custo. Igual ao Fantastical | Alto — power user feature. Reduz criação de evento de 30s para 5s | V4 |
| **Relatórios mensais** | Resumo mensal com: total de horas, distribuição por módulo, comparativo com mês anterior, gastos em eventos | Médio — agrega perceived value para PRO. Pode ser o "email mensal" que traz o usuário de volta | Alta — pós-MVP |

### 16.2 Críticas e Pontos de Atenção ao Protótipo Atual

**1. Protótipo original tinha apenas 1 tela (Tela 06 do proto-mobile-synclife-fixed)**
O protótipo original mostrava apenas a agenda diária com week strip. Faltavam completamente: Dashboard com KPIs, Visão Semanal, Visão Mensal, Review, Timer Foco, Wizard de criação, Detalhe do evento, Empty states, Configurações. O protótipo v3 gerado nesta sessão cobre todas essas 12 telas.

**2. Protótipo original não tinha sub-nav tabs**
O header era simples ("Tempo" + data + botão +) sem as tabs Dashboard/Agenda/Semanal/Mensal/Review. Isso foi corrigido no v3 seguindo o padrão do módulo Futuro com underline tabs.

**3. Faltava diferenciação de tipos de evento**
O protótipo original tratava todos os eventos como "compromissos" iguais. O v3 diferencia 4 tipos (Compromisso, Tarefa, Foco, Lembrete) com ícones e comportamentos distintos.

**4. Faltava vinculação visual de custo**
Eventos com custo não tinham badge de valor. No v3, o badge "💰 R$ 280 alocado" é visível no EventCard.

**5. Faltava Timer de Foco como tela dedicada**
O timer existia apenas no módulo Mente (Pomodoro). O módulo Tempo agora tem seu próprio Timer de Foco para sessões genéricas (não apenas estudo), vinculado a qualquer meta do Futuro.

### 16.3 Recomendação de Telas Adicionais para Prototipagem

Com base nesta análise funcional, o protótipo v3 já cobre as 12 telas essenciais. Para futuras iterações:

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 13 | Notificação de Lembrete (push) | 🟡 Média | Visual da notificação quando o lembrete dispara |
| 14 | Conflito de Horário (modal) | 🟡 Média | O que acontece quando o usuário agenda sobre horário já ocupado |
| 15 | Evento Recorrente — Modal de Escopo | 🟡 Média | "Editar só este / futuros / todos" — modal de decisão |
| 16 | Paywall do Timer (FREE) | 🟢 Baixa | Tela que o FREE vê ao tentar acessar Timer Foco |
| 17 | Paywall do Review (FREE) | 🟢 Baixa | Preview borrado do Review Semanal com CTA de upgrade |

---

*Documento criado em: Março 2026*  
*Versão: 1.0 — Documento Funcional Completo*  
*Protótipo base: `proto-mobile-synclife-fixed.html` (Tela 06)*  
*Protótipo gerado: `proto-mobile-tempo-v3.html` (12 telas)*  
*Próximo passo: Validação das funcionalidades → Implementação via Claude Code*
