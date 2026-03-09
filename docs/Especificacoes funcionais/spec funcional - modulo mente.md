# 🧠 Especificação Funcional — Módulo Mente

> **SyncLife: O Sistema Operacional da Vida Pessoal**  
> **Módulo:** Mente — Estudos e Aprendizado  
> **Versão:** 1.0 — Março 2026  
> **Cor do módulo:** `#eab308` (Yellow/Amber)  
> **Ícone Lucide:** `Brain`  
> **Subtítulo descritivo:** "Estudos e aprendizado"  
> **Pergunta norteadora:** "Como está minha Mente?"
>
> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Benchmark Competitivo](#2-benchmark-competitivo)
3. [Mapa de Navegação](#3-mapa-de-navegação)
4. [Mapa de Funcionalidades](#4-mapa-de-funcionalidades)
5. [Tela 01 — Dashboard](#5-tela-01--dashboard)
6. [Tela 02 — Trilhas de Aprendizado](#6-tela-02--trilhas-de-aprendizado)
7. [Tela 03 — Timer Pomodoro](#7-tela-03--timer-pomodoro)
8. [Tela 04 — Sessões de Estudo](#8-tela-04--sessões-de-estudo)
9. [Tela 05 — Biblioteca de Recursos](#9-tela-05--biblioteca-de-recursos)
10. [Fluxos CRUD Detalhados](#10-fluxos-crud-detalhados)
11. [Integrações com Outros Módulos](#11-integrações-com-outros-módulos)
12. [Diagrama de Integrações](#12-diagrama-de-integrações)
13. [Regras de Negócio Consolidadas](#13-regras-de-negócio-consolidadas)
14. [Modelo de Dados](#14-modelo-de-dados)
15. [Life Sync Score — Componente Mente](#15-life-sync-score)
16. [Insights e Sugestões Adicionais](#16-insights-e-sugestões-adicionais)

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o Módulo Mente

O módulo Mente é o centro de gestão de aprendizado e desenvolvimento intelectual do SyncLife. Ele não é apenas um timer ou uma lista de cursos — é o sistema que conecta o que o usuário estuda com o impacto real na carreira, nas finanças e nos objetivos de vida.

A proposta é responder à pergunta **"Como está minha Mente?"** de forma quantificável: quanto tempo estudo por semana, qual minha consistência, quais habilidades estou desenvolvendo, e como isso se conecta com meus objetivos de vida.

### 1.2 Por que este módulo existe

No mercado atual, as ferramentas de estudo são fragmentadas. O usuário usa o Forest para Pomodoro, o Notion para organizar cursos, o Goodreads para livros, e o LinkedIn Learning para trilhas. Nenhuma dessas ferramentas responde à pergunta: **"meu estudo de React está me aproximando da promoção a Tech Lead?"**. O SyncLife faz isso.

### 1.3 Proposta de valor única

O módulo Mente não compete com o Forest ou o Pomofocus em timer puro. Ele compete na **camada de significado**: cada minuto estudado se conecta a uma trilha, que se conecta a uma habilidade (Carreira), que se conecta a um objetivo (Futuro), que pode ter impacto financeiro (Finanças). Essa é a tese do SyncLife — nenhum aspecto da vida existe isolado.

### 1.4 As 5 Sub-telas

| # | Tela | Finalidade | Frequência de uso |
|---|------|-----------|-------------------|
| 01 | Dashboard | Visão geral do estado mental/intelectual do usuário | Diária |
| 02 | Trilhas de Aprendizado | Organizar percursos de estudo com etapas | Semanal |
| 03 | Timer Pomodoro (Foco) | Cronometrar sessões de estudo focado | Diária |
| 04 | Sessões de Estudo | Histórico e análise de todas as sessões | Semanal |
| 05 | Biblioteca de Recursos | Catálogo de livros, cursos, podcasts, artigos | Episódica |

---

## 2. BENCHMARK COMPETITIVO

### 2.1 Análise de Concorrentes

| App | O que faz bem | O que falta | Preço |
|-----|---------------|-------------|-------|
| **Forest** | Gamificação (árvore cresce enquanto foca), bloqueio de apps, design bonito | Sem trilhas de estudo, sem conexão com objetivos de vida, sem biblioteca de recursos | Free + Premium ~R$25/ano |
| **Focus To-Do** | Pomodoro + task management integrado, analytics detalhados, cross-platform | Sem trilhas de aprendizado, sem streak visual, interface poluída | Freemium |
| **Pomofocus** | Ultra-leve, sem cadastro, gratuito, funciona no browser | Sem mobile nativo, sem histórico longo, sem gamificação | Gratuito |
| **Toggl Track** | Analytics poderosos, integrações com 100+ apps, relatórios profissionais | Focado em trabalho profissional, não em aprendizado pessoal, curva de aprendizado alta | Free até 5 users / $9+/mês |
| **Athenify** | Tracker de estudo com medalhas (ouro/prata/bronze), streaks, gráficos bonitos, Magic Prediction | Focado apenas em estudantes acadêmicos, sem conexão com carreira ou finanças | Pago |
| **TrackIt** | Syllabus tracker multi-nível, flashcards com repetição espaçada, roadmaps pré-carregados | Interface não intuitiva, sem timer bonito, sem gamificação visual | Free com ads |
| **Notion** | Flexibilidade total para organizar qualquer coisa | Sem timer nativo, sem cálculos automáticos, requer setup manual extenso | Free / $10+/mês |
| **Goodreads** | Maior base de livros do mundo, reviews da comunidade, desafio anual de leitura | Apenas livros (sem cursos, podcasts), sem tracking de tempo, sem integração com nada | Gratuito |

### 2.2 Diferenciais Competitivos do SyncLife Mente

| Diferencial | Descrição | Quem mais faz? |
|-------------|-----------|----------------|
| **Trilha → Habilidade → Carreira** | Completar uma trilha de React atualiza automaticamente a habilidade "React" no módulo Carreira, que avança o roadmap de promoção | Ninguém |
| **Sessão → Agenda** | Cada sessão Pomodoro pode ser registrada como bloco de estudo na agenda do módulo Tempo | Toggl (parcial) |
| **Custo → Finanças** | O valor investido em cursos é registrado como despesa na categoria "Educação" em Finanças | Ninguém |
| **Trilha → Objetivo** | Uma trilha pode ser vinculada a um Objetivo no módulo Futuro, atualizando progresso automaticamente | Ninguém |
| **Insight de Produtividade com IA** | A IA analisa padrões (horários, duração, streak) e sugere otimizações personalizadas | Athenify (parcial) |
| **Experiência unificada** | XP, sons ambiente, streak visual estilo GitHub, insights IA | Forest (gamificação apenas) |

### 2.3 O que aprendemos com o benchmark

**Do Forest:** A gamificação visual (árvore crescendo) é poderosa para engajamento. No SyncLife, usamos o streak heatmap (estilo GitHub contributions) + XP/níveis no modo Jornada para gerar o mesmo efeito.

**Do Athenify:** Medalhas por meta atingida são motivadoras. No SyncLife, isso é feito pelo sistema transversal de Conquistas, que já existe no módulo de gamificação.

**Do Toggl:** Relatórios de tempo por categoria são essenciais para quem leva estudo a sério. No SyncLife, a tela de Sessões entrega isso com gráficos de barras por dia da semana e breakdown por trilha.

**Do Pomofocus:** Simplicidade é rei. O timer do SyncLife no modo Foco deve ser tão limpo quanto o Pomofocus, sem poluição visual.

**Do TrackIt:** Roadmaps pré-carregados são um insight valioso para futuras versões (templates de trilhas prontas para "Aprender React", "Certificação AWS", etc.).

---

## 3. MAPA DE NAVEGAÇÃO

### 3.1 Fluxo entre Telas

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🧠 MENTE — NAVEGAÇÃO PRINCIPAL                     │
│                                                                        │
│   Sub-nav (tabs com underline):                                       │
│   Dashboard │ Trilhas │ Timer │ Sessões │ Biblioteca                  │
│                                                                        │
│   Cada tab = uma tela principal. Navegação lateral entre elas.        │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
  ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
  │01       │ │03      │ │07      │ │02      │ │10        │
  │DASHBOARD│ │TRILHAS │ │TIMER   │ │SESSÕES │ │BIBLIOTECA│
  │         │ │(Lista) │ │Foco    │ │Históri.│ │Recursos  │
  └────┬────┘ └───┬────┘ └───┬────┘ └────────┘ └────┬─────┘
       │          │          │                       │
       │    ┌─────┼─────┐    ├──→ 08 PAUSA           │
       │    │     │     │    │                       │
       │    ▼     ▼     ▼    └──→ 09 CONFIG          ▼
       │   04    05    06                           11
       │  DETALHE CRIAR CRIAR                    ADICIONAR
       │  TRILHA  P.1   P.2                      RECURSO
       │    │      │     │
       │    │      └──┬──┘
       │    │         │
       │    └────┬────┘
       │         │
       │         ▼ (ao concluir trilha)
       │        12
       │     CELEBRAÇÃO
       │     Trilha Concluída
       │
       └──→ Quick Start Pomodoro ──→ 07 TIMER
```

### 3.2 Hierarquia de Telas

| Nível | Tela | Acesso via | Voltar para |
|-------|------|-----------|-------------|
| **L1** | 01 Dashboard | Sub-nav "Dashboard" | — (tela inicial) |
| **L1** | 02 Sessões | Sub-nav "Sessões" | — |
| **L1** | 03 Trilhas (Lista) | Sub-nav "Trilhas" | — |
| **L1** | 07 Timer Foco | Sub-nav "Timer" | — |
| **L1** | 10 Biblioteca | Sub-nav "Biblioteca" | — |
| **L2** | 04 Detalhe Trilha | Tap em card de trilha (03) | ← Trilhas (03) |
| **L2** | 05 Criar Trilha P.1 | Botão "+" no header (03) | ✕ Fecha (volta 03) |
| **L2** | 06 Criar Trilha P.2 | Continuar do P.1 | ← Voltar (05) |
| **L2** | 08 Timer Pausa | Automático ao fim do foco | — (volta a 07) |
| **L2** | 09 Timer Config | Ícone ⚙️ no Timer (07) | ← Voltar (07) |
| **L2** | 11 Adicionar Recurso | CTA "+Adicionar" (10) | ✕ Fecha (volta 10) |
| **L2** | 12 Celebração | Automático ao concluir trilha | Botão → Dashboard (01) |

### 3.3 Padrão de Navegação (idêntico ao módulo Futuro)

**Header do módulo:**
- Ícone do módulo (🧠) + Nome ("Mente") à esquerda
- Badge de contagem à direita ("3 trilhas")

**Sub-nav:**
- Tabs com underline (não pills)
- Tab ativa: texto branco/claro + underline na cor do módulo (#eab308)
- Tabs inativas: texto cinza (var(--t3)), sem underline
- 5 tabs: Dashboard, Trilhas, Timer, Sessões, Biblioteca

**Telas internas (L2):**
- Header simplificado: botão voltar (←) + título centralizado + ação contextual
- Sem sub-nav (pois está num nível abaixo)
- Wizards: dots de progresso abaixo do header

---

## 4. MAPA DE FUNCIONALIDADES

### 4.1 Visão Geral por Tela

```
🧠 MENTE
│
├── 📊 Dashboard
│   ├── KPIs (horas semana, streak, trilhas ativas, pomodoros hoje)
│   ├── Streak Heatmap (calendário visual de consistência)
│   ├── Trilhas ativas (resumo com progresso)
│   ├── Quick Start Pomodoro (atalho rápido)
│   └── [Jornada] Insight IA de produtividade
│
├── 📚 Trilhas de Aprendizado
│   ├── Lista de trilhas (ativas, concluídas, pausadas)
│   ├── Filtros por status
│   ├── Card de trilha (nome, categoria, progresso, etapas, próximo passo)
│   ├── Detalhe da trilha (etapas com checkbox, notas, custo, data alvo)
│   ├── Criar nova trilha (wizard)
│   ├── Editar trilha
│   ├── Pausar / Retomar / Concluir / Abandonar trilha
│   └── [PRO] Trilhas ilimitadas (FREE = 3)
│
├── ⏱️ Timer Pomodoro (Foco)
│   ├── Timer circular com countdown
│   ├── Seletor de trilha vinculada (opcional)
│   ├── Configuração de duração (25/15/45/60min) e pausas (5/10/15min)
│   ├── Ciclos com pausa longa (4 ciclos = pausa de 15min)
│   ├── Controles (play/pause/reset/skip)
│   ├── Indicador de ciclos (dots/barras)
│   ├── Stats do dia (pomodoros, foco total, streak)
│   ├── [Jornada] Sons ambiente (chuva, café, biblioteca, fogueira)
│   ├── [Jornada] XP ganho por sessão
│   └── Registro automático de sessão ao completar
│
├── 📈 Sessões de Estudo
│   ├── Resumo semanal (horas/meta, barra de progresso)
│   ├── Gráfico de barras por dia da semana
│   ├── Histórico de sessões (lista cronológica)
│   ├── Filtros (por trilha, por período, estudo livre)
│   ├── Card de sessão (trilha, data, horário, duração, pomodoros, status)
│   └── [Jornada] Insight IA (melhor horário, padrões de produtividade)
│
└── 📖 Biblioteca de Recursos
    ├── Filtros por tipo (Todos, Livros, Cursos, Podcasts, Artigos)
    ├── Seção "Em andamento" (com barra de progresso)
    ├── Seção "Salvos para depois" (wishlist)
    ├── Seção "Concluídos"
    ├── Adicionar recurso (manual, colar link, escanear livro)
    ├── Editar recurso
    ├── Excluir recurso
    └── Vincular recurso a uma trilha (opcional)
```

---

## 4. TELA 01 — DASHBOARD

### 4.1 Objetivo

Fornecer uma **visão instantânea** do estado intelectual do usuário. Em 3 segundos, ele deve saber: quanto estudou esta semana, se está mantendo consistência, e qual a próxima ação recomendada.

É a tela de entrada do módulo — tudo que aparece aqui é resumo. Os detalhes vivem nas sub-telas.

### 4.2 Componentes

#### 4.2.1 KPI Grid (2×2)

| KPI | Valor exemplo | Cor | Lógica de cálculo |
|-----|---------------|-----|-------------------|
| **Horas esta semana** | 8,5h | `#eab308` (mente) | Soma de `focus_minutes` de todas as sessões da semana corrente (seg–dom), convertido em horas |
| **Streak de estudo** | 14 dias | `#f59e0b` (yellow) | Dias consecutivos com ao menos 1 sessão registrada. Recorde pessoal = maior streak já atingido |
| **Trilhas ativas** | 3 | `#0055ff` (blue) | Count de `study_tracks` onde `status = 'in_progress'`. Mostra limite FREE: "Limite FREE: 3" |
| **Pomodoros hoje** | 6 | `#10b981` (green) | Count de `focus_sessions_mente` onde `recorded_at` = hoje. Sub-texto: total de minutos convertido em horas |

**Critérios de aceite:**
- Os 4 KPIs carregam em até 2 segundos
- Cada KPI mostra label, valor principal, e sub-texto contextual
- Valores vazios mostram "0" (nunca fica em branco)
- O sub-texto do Streak mostra "🔥 Recorde pessoal!" quando `current_streak == longest_streak`
- O sub-texto de Trilhas mostra "Limite FREE: 3" para usuários FREE e "Ilimitadas" para PRO

**Resultado esperado:** O usuário vê seus 4 indicadores-chave sem precisar scrollar, entende imediatamente como está sua performance de estudo.

#### 4.2.2 Streak Heatmap

**Objetivo:** Visualizar a consistência de estudo ao longo do mês, inspirado no gráfico de contribuições do GitHub.

**Funcionamento:**
- Grid de quadrados representando cada dia do mês corrente
- Cada quadrado tem opacidade proporcional à quantidade de horas estudadas naquele dia
- Dias sem estudo = cor base escura (`var(--s3)`)
- Dias com estudo leve (< 30min) = opacidade 0.3
- Dias com estudo moderado (30min–1h) = opacidade 0.5
- Dias com estudo bom (1h–2h) = opacidade 0.7
- Dias com estudo intenso (> 2h) = opacidade 0.9
- Dia atual tem borda destacada
- Header mostra o mês e o total de dias de streak

**Critérios de aceite:**
- Heatmap renderiza todos os dias do mês corrente
- Cores são gradações da cor do módulo Mente (`#eab308`)
- O dia atual é visualmente distinto (borda branca semi-transparente)
- Toque em um dia mostra tooltip com horas estudadas naquele dia
- Performance: renderiza em < 1 segundo mesmo com 31 dias

**Resultado esperado:** O usuário sente orgulho ao ver a "mancha roxa" crescer no calendário. O efeito visual de consistência é o principal gatilho de retenção — similar ao GitHub onde desenvolvedores mantêm o streak de contribuições.

#### 4.2.3 Trilhas Ativas (Resumo)

**Objetivo:** Mostrar as trilhas em andamento com progresso rápido, servindo como atalho para a tela de Trilhas.

**Para cada trilha:**
- Ícone/emoji da trilha (ex: ⚛️ para React)
- Nome da trilha
- Categoria e contagem de etapas (ex: "Tecnologia · 12/24 etapas")
- Badge de progresso com porcentagem
- Barra de progresso linear
- A barra muda de cor conforme progresso: < 30% amarelo, 30-70% roxo, > 70% verde

**Critérios de aceite:**
- Mostra no máximo 3 trilhas (as com maior atividade recente)
- Se o usuário tem mais de 3 trilhas ativas, mostra link "Ver todas →" para a tela de Trilhas
- Se não tem nenhuma trilha, mostra empty state com CTA "Criar primeira trilha"
- Tocar em uma trilha navega para o detalhe daquela trilha

**Resultado esperado:** O usuário vê rapidamente onde parou em cada trilha e pode clicar para continuar.

#### 4.2.4 Quick Start Pomodoro

**Objetivo:** Atalho de um toque para iniciar uma sessão de foco, reduzindo a fricção entre "quero estudar" e "estou estudando".

**Funcionamento:**
- Card com gradiente da cor Mente
- Ícone de timer + texto "Iniciar sessão de foco"
- Sub-texto mostra a configuração padrão: "Pomodoro 25 min · [nome da trilha mais recente]"
- Botão play circular que navega direto para o Timer com a trilha pré-selecionada
- Se não há trilha recente, mostra "Pomodoro 25 min · Estudo livre"

**Critérios de aceite:**
- Um toque no card navega para `/mente/timer` com a trilha pré-selecionada
- A trilha pré-selecionada é a última que teve sessão registrada
- Se não há nenhuma trilha, abre o timer sem trilha vinculada (estudo livre)

**Resultado esperado:** Em 2 toques (abrir módulo + clicar no quick start), o usuário já está estudando. Isso é crucial para a retenção diária.

#### 4.2.5 [Jornada] Insight IA de Produtividade

**Objetivo:** Fornecer análise inteligente dos padrões de estudo do usuário, usando dados das sessões para gerar recomendações acionáveis.

**Componente visual:**
- Card com fundo azulado sutil (diferente dos cards normais)
- Ícone de robô (🤖)
- Texto em formato de dica personalizada

**Exemplos de insights:**
- "Você estuda melhor entre 19h–22h. Suas sessões matutinas têm 30% menos foco. Tente agendar React para o período noturno."
- "Sua trilha de Inglês está parada há 5 dias. Que tal uma sessão rápida de 15 minutos?"
- "Você completou 8,5h esta semana. Mais 1,5h e bate sua meta de 10h!"
- "Nas últimas 4 semanas, segundas e quartas foram seus dias mais produtivos."

**Lógica de geração de insights (regras por prioridade):**
1. Se alguma trilha está parada há mais de 5 dias → alerta de inatividade
2. Se está perto da meta semanal (> 80%) → incentivo para completar
3. Se tem dados de 2+ semanas → análise de padrão de horário
4. Se completou uma trilha recentemente → parabenização
5. Fallback: dica genérica sobre a técnica Pomodoro

**Critérios de aceite:**
- Sempre visível
- O insight muda a cada visita (não repete o mesmo insight em visitas consecutivas no mesmo dia)
- O texto é gerado por regras de negócio (não por IA generativa no MVP — performance)
- Se não há dados suficientes para gerar insight, mostra dica genérica

**Resultado esperado:** O usuário sente que o app "conhece" seus hábitos e está ajudando ativamente a melhorar. Isso aumenta perceived value do plano PRO.

---

## 5. TELA 02 — TRILHAS DE APRENDIZADO

### 5.1 Objetivo

Organizar o aprendizado do usuário em **percursos estruturados** com etapas, progresso mensurável, e conexão com objetivos de vida. Uma trilha é como um "roadmap de estudos" que o usuário cria e acompanha.

### 5.2 Conceito de Trilha

Uma trilha representa um caminho de aprendizado com início, meio e fim. Exemplos:

- "React Avançado" (24 etapas: Hooks, Context API, Server Components...)
- "Inglês Avançado" (20 etapas: Business English, IELTS Prep, Conversação...)
- "Certificação AWS" (18 etapas: Cloud Practitioner, Solutions Architect...)
- "Análise de Dados" (15 etapas: Python básico, Pandas, Visualização...)

Cada trilha tem:
- Nome (obrigatório)
- Categoria (obrigatório: tecnologia, idiomas, gestão, marketing, design, finanças, saúde, concurso, graduação, pós-graduação, certificação, outro)
- Etapas (lista ordenada com checkbox de conclusão)
- Status (em progresso, pausada, concluída, abandonada)
- Data-alvo (opcional)
- Custo (opcional — valor investido em cursos/materiais)
- Habilidade vinculada (opcional — conecta com módulo Carreira)
- Notas livres (opcional)

### 5.3 Componentes da Tela

#### 5.3.1 Filtros por Status

**Tabs horizontais scrolláveis:**
- **Ativas** (default) — `status = 'in_progress'`
- **Concluídas** — `status = 'completed'`
- **Explorar** — Sugestões de trilhas (futuro — templates)

**Critérios de aceite:**
- Tab ativa tem fundo da cor do módulo
- Tabs inativas têm fundo escuro com borda
- Ao trocar de tab, a lista atualiza sem recarregar a página
- Contagem entre parênteses: "Ativas (3)"

#### 5.3.2 Indicador de Limite

**Texto:** "MINHAS TRILHAS (3/3 FREE)" para usuários FREE

**Critérios de aceite:**
- Se FREE e tem 3 trilhas ativas, o botão "+" de criar nova trilha fica desabilitado
- Mostra contagem atual vs limite
- Para PRO, mostra apenas "MINHAS TRILHAS (X)" sem limite

#### 5.3.3 Card de Trilha

**Para cada trilha, o card mostra:**
- Ícone/emoji configurável (ex: ⚛️, 🇺🇸, 📊)
- Nome da trilha
- Categoria + tempo desde início (ex: "Tecnologia · Iniciado há 3 semanas")
- Badge de progresso com porcentagem
- Barra de progresso linear
- Contagem de etapas: "12 de 24 etapas"
- Próxima etapa: "Próximo: Hooks avançados →" (em cor do módulo)

**Critérios de aceite:**
- Card é clicável e navega para o detalhe da trilha
- Progresso é calculado: `(etapas concluídas / total de etapas) × 100`
- O campo "Próximo" mostra a primeira etapa não concluída
- Se todas as etapas estão concluídas, o status muda automaticamente para 'completed'
- A barra de progresso usa cor do módulo para ativas, verde para concluídas

**Resultado esperado:** O usuário vê rapidamente o estado de cada trilha e sabe exatamente o que fazer em seguida.

#### 5.3.4 CTA de Upgrade (FREE)

**Para usuários FREE que atingiram o limite de 3 trilhas:**
- Card com gradiente amarelo/roxo
- Ícone 💎
- Texto: "Quer mais trilhas? PRO: trilhas ilimitadas + IA personalizada"
- Clique abre o modal/tela de upgrade

**Critérios de aceite:**
- Só aparece para usuários FREE
- Só aparece quando tem 3 trilhas ativas
- Não aparece se o usuário tem trilhas pausadas/concluídas (limite é sobre ativas)

### 5.4 Tela de Detalhe da Trilha

Ao clicar em um card de trilha, abre o detalhe com:

**Header:**
- Botão voltar (← Trilhas)
- Nome da trilha
- Badge de status (Em progresso / Pausada / Concluída)

**Informações gerais:**
- Categoria
- Data de início
- Data-alvo (se definida) — com contagem regressiva: "Faltam 45 dias"
- Horas acumuladas (soma das sessões vinculadas a esta trilha)
- Custo total (se informado)

**Lista de etapas:**
- Checklist ordenado
- Cada etapa tem: checkbox, título, e data de conclusão (se concluída)
- Etapas concluídas ficam com texto tachado e checkbox preenchido
- O usuário pode reordenar etapas (drag and drop)
- Botão "Adicionar etapa" no final da lista

**Ações disponíveis:**
- "Editar trilha" — abre formulário de edição
- "Pausar" — muda status para 'paused'
- "Retomar" — muda status de volta para 'in_progress'
- "Concluir" — muda status para 'completed', registra `completed_at`
- "Abandonar" — muda status para 'abandoned' com confirmação
- "Excluir" — remove a trilha com confirmação (ação irreversível)

**Critérios de aceite:**
- Marcar uma etapa como concluída recalcula o progresso da trilha
- Se a última etapa for marcada, pergunta: "Todas as etapas concluídas! Deseja marcar a trilha como concluída?"
- Horas acumuladas são calculadas em tempo real da tabela `focus_sessions_mente` onde `track_id = trilha.id`
- A data de conclusão de cada etapa é registrada em `study_track_steps.completed_at`
- Reordenar etapas atualiza o campo `sort_order`

---

## 6. TELA 03 — TIMER POMODORO (FOCO)

### 6.1 Objetivo

Fornecer uma ferramenta de foco temporal que registre automaticamente o tempo de estudo. É a funcionalidade de **maior engajamento diário** do módulo — o ponto de contato mais frequente do usuário com o módulo Mente.

### 6.2 Por que "Timer Pomodoro" e não apenas um cronômetro

A técnica Pomodoro foi escolhida (em vez de um cronômetro livre) por 3 razões:

1. **Estrutura combate procrastinação:** "Estude por 25 minutos" é muito mais fácil de começar do que "estude até acabar"
2. **Pausas previnem burnout:** O ciclo trabalho/pausa mantém a qualidade do foco ao longo de sessões longas
3. **Contagem de ciclos gera progresso:** "Completei 6 pomodoros hoje" é mensurável e motivante

### 6.3 Componentes

#### 6.3.1 Header com Contexto

**Elementos:**
- Botão voltar (← Mente)
- Título "Timer de Foco"
- Botão de configurações do timer (⚙️)

**Badge de contexto:**
- Pill centralizado mostrando a trilha vinculada: "⚛️ React Avançado · Hooks avançados"
- Se nenhuma trilha selecionada: "📝 Estudo livre"
- Clicar na pill abre seletor de trilha

#### 6.3.2 Timer Circular (Ring)

**Elementos visuais:**
- Anel circular SVG com 220px de diâmetro
- Track de fundo cinza escuro (`var(--s3)`)
- Progresso em cor do módulo (`#eab308`) que diminui conforme o tempo passa
- No centro:
  - Countdown em fonte mono grande (48px): "18:47"
  - Texto de estado: "🧠 Foco profundo" (durante trabalho) ou "☕ Pausa" (durante intervalo)
  - Indicador de ciclo: "Sessão 3 de 4"

**Comportamento do timer:**
- **Ciclo padrão:** 25min foco → 5min pausa → 25min foco → 5min pausa → 25min foco → 5min pausa → 25min foco → 15min pausa longa
- Ao acabar o tempo de foco, emite notificação sonora e visual
- Ao acabar a pausa, emite notificação diferente e inicia automaticamente o próximo ciclo (ou espera clique, configurável)
- O anel progride suavemente (não em saltos)

**Critérios de aceite:**
- O timer funciona mesmo com a tela bloqueada (via Web Worker ou notificação do sistema)
- O countdown é preciso (±1 segundo)
- O anel SVG progride proporcionalmente ao tempo restante
- Sons de notificação são distintos para fim de foco vs fim de pausa
- O timer não reinicia se o usuário troca de tab e volta

#### 6.3.3 Controles

**3 botões circulares:**
- **Reset** (esquerda, 52px) — Reinicia o ciclo atual para o início
- **Play/Pause** (centro, 76px, cor do módulo com shadow) — Inicia ou pausa o timer
- **Skip** (direita, 52px) — Pula para o próximo ciclo (foco → pausa, ou pausa → foco)

**Critérios de aceite:**
- Play muda para Pause quando ativo (ícone muda)
- Reset pede confirmação se o timer está em progresso: "Reiniciar este ciclo?"
- Skip pede confirmação: "Pular para a pausa?" / "Pular para o foco?"
- Ao completar um ciclo de foco, os minutos são registrados mesmo se o usuário pulou os últimos 2 minutos

#### 6.3.4 Indicador de Ciclos

**Dots/barras horizontais mostrando os 4 ciclos:**
- Ciclo concluído = cor sólida do módulo
- Ciclo atual = cor sólida do módulo (o que está rodando)
- Ciclo futuro = cor semi-transparente

**Critérios de aceite:**
- Mostra sempre 4 ciclos (configurável para 2, 3, 4, 5, 6)
- Após completar todos os ciclos, pergunta: "Quer iniciar uma nova rodada?"

#### 6.3.5 Stats do Dia

**3 mini-cards em linha horizontal:**
- **Pomodoros:** contagem de ciclos de foco completados hoje (com ícone do módulo)
- **Foco total:** soma de minutos de foco hoje, formatado em horas e minutos
- **Streak:** dias consecutivos com ao menos 1 sessão, com emoji 🔥

**Critérios de aceite:**
- Atualiza em tempo real ao completar um pomodoro
- "Foco total" inclui apenas minutos de foco (exclui pausas)
- Streak conta dias corridos (se hoje não estudou, mostra streak de ontem)

#### 6.3.6 Próxima Pausa

**Card informativo:**
- "Próxima: Pausa de 5 min"
- "Depois da sessão 4 → Pausa longa 15 min"

**Critérios de aceite:**
- Mostra a próxima pausa (curta ou longa)
- Antecipa a pausa longa quando o usuário está na sessão 3 de 4

#### 6.3.7 Configurações do Timer (Tela/Modal)

**Acessível pelo ícone ⚙️ no header:**

| Configuração | Padrão | Opções | Escopo |
|-------------|--------|--------|--------|
| Duração do foco | 25 min | 15, 20, 25, 30, 45, 60 | Todos |
| Pausa curta | 5 min | 3, 5, 10 | Todos |
| Pausa longa | 15 min | 10, 15, 20, 30 | Todos |
| Ciclos até pausa longa | 4 | 2, 3, 4, 5, 6 | Todos |
| Auto-iniciar pausa | Sim | Sim / Não | Todos |
| Auto-iniciar foco | Não | Sim / Não | Todos |
| Sons de notificação | Ativado | Ativado / Desativado | Todos |
| Sons ambiente | Desativado | Chuva, Café, Biblioteca, Fogueira, Nenhum | PRO (Jornada) |
| Registrar na Agenda | Desativado | Sim / Não | Todos |

**Critérios de aceite:**
- Configurações são persistidas por usuário (localStorage + Supabase)
- Mudar configuração durante um timer em progresso não afeta o ciclo atual (só o próximo)
- Sons ambiente reproduzem em loop durante o período de foco e param na pausa

#### 6.3.8 [Jornada] Sons Ambiente

**Objetivo:** Criar atmosfera de foco imersivo.

**Sons disponíveis (PRO):**
- 🌧️ Chuva — sons de chuva leve contínua
- ☕ Café — murmúrio suave de cafeteria
- 📚 Biblioteca — silêncio com sons sutis de páginas e ambiente
- 🔥 Fogueira — crepitar suave de fogo

**Critérios de aceite:**
- Sons tocam em loop suave (sem cortes perceptíveis)
- Volume é controlável (slider)
- Sons param automaticamente durante a pausa
- Seleção de som persiste entre sessões
- Usuário FREE que tenta ativar vê gate PRO com preview de 30 segundos

#### 6.3.9 [Jornada] Sistema de XP

**Objetivo:** Gamificar o estudo com pontos de experiência.

**Regras de XP:**
- +10 XP por cada ciclo de Pomodoro completado
- +5 XP bônus por completar uma rodada inteira (4 ciclos)
- +20 XP bônus por manter streak de 7 dias
- +50 XP bônus por manter streak de 30 dias

**Critérios de aceite:**
- XP acumula no campo `xp` do perfil do usuário (tabela transversal)
- Toast de celebração ao ganhar XP: "+10 XP de foco conquistados!"
- Sempre visível

### 6.4 Registro Automático de Sessão

**Ao completar um ou mais ciclos de foco, o sistema registra automaticamente:**

```
focus_sessions_mente:
  - user_id: [usuário]
  - track_id: [trilha vinculada, se houver]
  - duration_minutes: [tempo total da sessão, incluindo pausas]
  - focus_minutes: [tempo efetivo de foco, excluindo pausas]
  - break_minutes: [tempo total de pausas]
  - cycles_completed: [número de ciclos concluídos]
  - session_notes: [notas do usuário, se preenchidas]
  - recorded_at: [timestamp de quando a sessão iniciou]
```

**Critérios de aceite:**
- A sessão é registrada ao completar pelo menos 1 ciclo de foco
- Se o timer é pausado e retomado, o tempo de pausa (manual) não conta como foco
- Se o usuário fecha o app durante um timer ativo, a sessão não é registrada (dados perdidos)
- Se a opção "Registrar na Agenda" está ativa, chama `createEventFromPomodoro()` para criar evento no módulo Tempo
- Se a trilha vinculada existe, as horas da sessão são somadas ao `total_hours` da trilha

---

## 7. TELA 04 — SESSÕES DE ESTUDO

### 7.1 Objetivo

Oferecer visão analítica de todo o histórico de estudo. É onde o usuário responde à pergunta: **"Quanto eu estudei esta semana/mês? Estou melhorando ou piorando?"**

### 7.2 Componentes

#### 7.2.1 Resumo Semanal

**Card principal:**
- Título: "Esta semana"
- Badge de progresso: "8,5h / 10h" (horas acumuladas / meta semanal)
- Barra de progresso grossa (10px) com gradiente da cor do módulo
- A meta semanal é configurável (padrão: 10h)

**Critérios de aceite:**
- Semana começa na segunda-feira e termina no domingo
- A barra enche de 0% a 100% baseado em (horas estudadas / meta)
- Se exceder a meta, a barra fica 100% e o badge mostra em verde: "10,5h / 10h ✓"
- A meta semanal pode ser alterada nas configurações do módulo

#### 7.2.2 Gráfico de Barras por Dia

**Barras verticais para cada dia da semana (Seg–Dom):**
- Altura proporcional às horas estudadas naquele dia
- Dias passados com estudo: cor sólida do módulo
- Dias passados sem estudo: cor escura mínima
- Dias futuros: borda tracejada (previsão)
- Rótulo de dia abaixo de cada barra

**Critérios de aceite:**
- A barra mais alta define 100% da altura do gráfico (escala dinâmica)
- Tocar em uma barra mostra tooltip com o valor exato: "Qua: 2h 5min"
- Se nenhum dia tem dados, mostra todas as barras com altura mínima e texto: "Nenhuma sessão esta semana"

#### 7.2.3 Histórico de Sessões

**Lista cronológica (mais recentes primeiro):**

**Para cada sessão:**
- Barra lateral colorida (4px) na cor da trilha vinculada (ou cor genérica para estudo livre)
- Título: "[Nome da trilha] — [Etapa/Tópico]" ou "Estudo livre"
- Data e horário: "Hoje · 9:00–11:30 · 4 pomodoros"
- Tags: "⏱️ 1h 40min" (duração de foco) + "✓ Concluída" (status)

**Filtros disponíveis:**
- Por período: Hoje, Esta semana, Este mês, Tudo
- Por trilha: dropdown com todas as trilhas + "Estudo livre" + "Todas"
- Combinação de filtros é possível

**Critérios de aceite:**
- Lista carrega progressivamente (20 sessões por página, load more on scroll)
- Sessões sem trilha vinculada mostram como "Estudo livre"
- A tag de duração usa cor da trilha (ou cor do módulo se estudo livre)
- A tag de status é sempre verde "✓ Concluída" (sessões são sempre concluídas no registro)

#### 7.2.4 [Jornada] Insight IA de Produtividade

**Card com fundo azulado:**
- Ícone 🤖
- Análise textual personalizada baseada nos dados de sessões

**Exemplos:**
- "Você estuda melhor entre 19h–22h. Suas sessões matutinas têm 30% menos foco."
- "Semanas com 4+ dias de estudo correlacionam com 23% mais produtividade."
- "Seu melhor dia é quarta-feira. Tente agendar sessões longas nesse dia."

**Lógica:**
- Requer mínimo de 10 sessões para gerar insights de horário
- Requer mínimo de 4 semanas de dados para gerar insights de padrão semanal
- Compara média de focus_minutes por faixa de horário (manhã 6-12h, tarde 12-18h, noite 18-24h)

**Critérios de aceite:**
- Sempre visível
- Se não tem dados suficientes, mostra: "Continue registrando suas sessões. Após 10 sessões, insights personalizados aparecerão aqui."

---

## 8. TELA 05 — BIBLIOTECA DE RECURSOS

### 8.1 Objetivo

Centralizar todos os materiais de estudo do usuário em um único lugar: livros que está lendo, cursos que está fazendo, podcasts que quer ouvir, artigos que salvou. É o **"Goodreads + Pocket"** do SyncLife.

### 8.2 Conceito de Recurso

Um recurso é qualquer material de aprendizado:

| Tipo | Ícone | Campos específicos |
|------|-------|-------------------|
| Livro (📚) | 📚 | Autor, total de páginas, página atual |
| Curso (🎥) | 🎥 | Plataforma, total de horas, hora atual |
| Podcast (🎧) | 🎧 | Podcast, episódio, duração |
| Artigo (🔗) | 🔗 | Fonte (site/blog), tempo estimado de leitura, URL |

Cada recurso tem:
- Tipo (obrigatório)
- Título (obrigatório)
- Status: em andamento, salvo para depois, concluído
- Progresso (porcentagem ou página/hora atual)
- Trilha vinculada (opcional — conecta o recurso a uma trilha de estudo)
- Notas livres

### 8.3 Componentes

#### 8.3.1 Filtros por Tipo

**Pills horizontais scrolláveis:**
- Todos (default)
- 📚 Livros
- 🎥 Cursos
- 🎧 Podcasts
- 🔗 Artigos

**Critérios de aceite:**
- Pill ativa tem fundo da cor do módulo
- Contagem por tipo entre parênteses: "📚 Livros (3)"
- Filtro persiste durante a sessão (não reseta ao voltar)

#### 8.3.2 Seção "Em Andamento"

**Cards expandidos para recursos com status 'in_progress':**
- Ícone do tipo (📚, 🎥, 🎧, 🔗)
- Título do recurso
- Detalhes (ex: "Udemy · 42h de conteúdo")
- Barra de progresso
- Posição atual: "52% · Seção 8: React Hooks"

**Critérios de aceite:**
- Ordenados por última atualização (mais recente primeiro)
- Clicar no card abre detalhe do recurso para atualizar progresso

#### 8.3.3 Seção "Salvos para Depois"

**Lista compacta para recursos com status 'saved':**
- Ícone do tipo
- Título
- Detalhes breves (plataforma/autor, duração/páginas)
- Ação rápida por tipo:
  - Podcast: botão play (▶) — abre link externo
  - Artigo: botão link (↗) — abre URL
  - Livro/Curso: seta (→) — abre detalhe

#### 8.3.4 Seção "Concluídos"

**Lista compacta para recursos com status 'completed':**
- Ícone do tipo
- Título
- Data de conclusão
- Badge "✓ Concluído" em verde

#### 8.3.5 Adicionar Recurso

**CTA no final da tela:**
- Área tracejada com "+" e texto "Adicionar recurso"
- Sub-texto: "Cole um link, escaneie um livro ou adicione manualmente"

**Fluxo de adição (modal/sheet):**

**Passo 1 — Tipo:**
- Seleção entre: Livro, Curso, Podcast, Artigo
- Grid 2×2 com ícones grandes

**Passo 2 — Informações:**
- Título (obrigatório)
- Campos específicos por tipo (ver tabela acima)
- Trilha vinculada (dropdown com trilhas ativas)
- Status inicial: Em andamento / Salvo para depois
- Notas (texto livre, opcional)

**Atalhos:**
- **Colar link:** Se o usuário cola uma URL, o sistema tenta extrair metadados (título, tipo) automaticamente. Funcionalidade futura — no MVP, apenas salva a URL.
- **Adicionar manualmente:** Formulário completo

**Critérios de aceite:**
- Título é obrigatório (validação antes de salvar)
- Tipo é obrigatório
- Status inicial padrão é "Em andamento"
- Após salvar, o recurso aparece na seção correspondente ao seu status
- Se vinculado a uma trilha, o recurso aparece também na tela de detalhe da trilha

---

## 9. FLUXOS CRUD DETALHADOS

### 9.1 Trilha de Aprendizado

#### CRIAR TRILHA

**Passo a passo do usuário:**

1. Na tela de Trilhas, toca no botão "+" (header)
2. Abre modal/wizard de criação
3. Preenche os campos:
   - Nome da trilha (obrigatório, ex: "React Avançado")
   - Categoria (obrigatório, seleciona de lista dropdown)
   - Ícone/emoji (opcional, picker visual, default: emoji da categoria)
   - Data-alvo (opcional, date picker)
   - Custo total estimado (opcional, campo monetário)
   - Habilidade vinculada (opcional, dropdown com skills do módulo Carreira)
   - Notas (opcional, texto livre)
4. Adiciona etapas:
   - Campo de texto + botão "Adicionar"
   - Pode adicionar múltiplas etapas sequencialmente
   - Mínimo: 1 etapa para criar a trilha
   - Pode reordenar por drag and drop
5. Revisa e confirma
6. Trilha criada com status 'in_progress' e progresso 0%

**Validações:**
- Nome: obrigatório, 1-100 caracteres, não pode duplicar nome de trilha ativa do mesmo usuário
- Categoria: obrigatório, deve ser uma das opções válidas
- Etapas: mínimo 1
- Custo: se preenchido, deve ser ≥ 0
- Data-alvo: se preenchida, deve ser no futuro
- Limite FREE: se o usuário já tem 3 trilhas ativas, não permite criar (mostra gate PRO)

**Integrações disparadas na criação:**
- Se `custo > 0` e integração `mnt_trilha_financas` está ativa → cria transação em Finanças na categoria "Educação"
- Se `linked_skill_id` preenchido → vincula a trilha à habilidade no módulo Carreira

**Resultado esperado:** Trilha aparece na lista de trilhas ativas com progresso 0%.

#### EDITAR TRILHA

**Campos editáveis:**
- Nome, categoria, ícone, data-alvo, custo, habilidade vinculada, notas
- Adicionar/remover/reordenar etapas
- NÃO pode editar: status (tem ações próprias), progresso (calculado)

**Passo a passo:**
1. Na tela de detalhe da trilha, toca em "Editar"
2. Formulário pré-preenchido com dados atuais
3. Altera o que desejar
4. Confirma — dados atualizados, campo `updated_at` registrado

**Validações:** Mesmas da criação.

#### ATUALIZAR PROGRESSO (Marcar Etapa)

**Passo a passo:**
1. Na tela de detalhe da trilha, toca no checkbox de uma etapa
2. Etapa é marcada como concluída, `completed_at` é registrado
3. Progresso da trilha é recalculado: `(etapas concluídas / total) × 100`
4. Se era a última etapa, pergunta se deseja concluir a trilha

**Comportamento especial:**
- Desmarcar uma etapa é possível (recalcula progresso)
- Progresso atualiza visualmente em tempo real (sem reload)
- Se a trilha está vinculada a um Objetivo no Futuro, o progresso do Objetivo é recalculado

#### MUDAR STATUS

| Ação | De | Para | Requer confirmação? | O que acontece |
|------|----|------|---------------------|---------------|
| Pausar | in_progress | paused | Não | Trilha sai da lista "Ativas", libera slot FREE |
| Retomar | paused | in_progress | Não | Trilha volta para "Ativas", ocupa slot FREE |
| Concluir | in_progress | completed | Sim: "Tem certeza? Todas as etapas serão marcadas como concluídas." | Registra `completed_at`, todas as etapas não concluídas são marcadas |
| Abandonar | in_progress / paused | abandoned | Sim: "Esta trilha será marcada como abandonada." | Registra que foi abandonada, libera slot FREE |

#### EXCLUIR TRILHA

**Passo a passo:**
1. Na tela de detalhe, toca em "Excluir"
2. Confirmação com texto: "Tem certeza que deseja excluir a trilha '[nome]'? Esta ação não pode ser desfeita. As sessões de estudo vinculadas serão mantidas."
3. Ao confirmar:
   - Trilha é removida do banco (hard delete)
   - Etapas são removidas em cascata (ON DELETE CASCADE)
   - Sessões de estudo que tinham `track_id` desta trilha mantêm o registro com `track_id = NULL`
   - Se havia vínculo com objetivo no Futuro, o vínculo é removido

### 9.2 Sessão de Estudo (via Timer)

#### CRIAR SESSÃO (automático)

A sessão é criada automaticamente ao completar ao menos 1 ciclo de Pomodoro.

**Dados registrados:**
- `user_id`: usuário logado
- `track_id`: trilha selecionada (ou NULL se estudo livre)
- `duration_minutes`: tempo total (foco + pausas)
- `focus_minutes`: tempo efetivo de foco
- `break_minutes`: tempo total de pausas
- `cycles_completed`: número de ciclos concluídos
- `session_notes`: notas do usuário (campo opcional, preenchido via botão de notas no timer)
- `recorded_at`: timestamp de início da sessão

**Integrações disparadas:**
- Atualiza `total_hours` da trilha vinculada (se houver)
- Se integração `mnt_pomodoro_agenda` está ativa → cria evento na Agenda
- Atualiza streak do usuário (verificação de dias consecutivos)
- [Jornada] Calcula XP ganho

#### EDITAR SESSÃO

**Não é permitido editar uma sessão.** Sessões são registros imutáveis de atividade. Se o usuário registrou errado, pode excluir e o timer gerará uma nova.

Justificativa: manter integridade dos dados de análise. Se sessões pudessem ser editadas, os insights de produtividade seriam não confiáveis.

#### EXCLUIR SESSÃO

**Passo a passo:**
1. Na tela de Sessões, swipe left em uma sessão (ou toque longo)
2. Confirmação: "Excluir esta sessão? As horas serão removidas do total da trilha."
3. Ao confirmar:
   - Sessão removida do banco
   - `total_hours` da trilha vinculada é recalculado
   - Streak é recalculado
   - Se havia evento na Agenda, o evento é mantido (não exclui em cascata)

### 9.3 Recurso da Biblioteca

#### CRIAR RECURSO

**Passo a passo:**
1. Na tela Biblioteca, toca em "+ Adicionar recurso"
2. Seleciona o tipo (Livro, Curso, Podcast, Artigo)
3. Preenche informações:
   - Título (obrigatório)
   - Campos específicos por tipo
   - Status inicial (Em andamento / Salvo para depois)
   - Trilha vinculada (opcional)
   - Notas (opcional)
4. Confirma — recurso aparece na seção correspondente

**Validações:**
- Título: obrigatório, 1-200 caracteres
- Tipo: obrigatório
- URL (artigos): se preenchida, deve ser URL válida (começa com http/https)

#### EDITAR RECURSO

**Campos editáveis:**
- Todos os campos informados na criação
- Atualizar progresso (página atual, hora atual, porcentagem)
- Mudar status

**Passo a passo:**
1. Toca no card do recurso
2. Abre tela/modal de detalhe com dados editáveis
3. Altera o que desejar
4. Salva — dados atualizados

#### ATUALIZAR PROGRESSO

**Fluxo rápido (sem abrir detalhe completo):**
1. Na seção "Em andamento", swipe ou long press no card
2. Aparece campo rápido de atualização:
   - Livro: "Qual página você está?" → input numérico
   - Curso: "Quantas horas completou?" → input numérico
   - Podcast: "Já ouviu?" → toggle concluído
   - Artigo: "Já leu?" → toggle concluído
3. Atualiza progresso e barra visual

#### EXCLUIR RECURSO

**Passo a passo:**
1. Toque longo ou swipe left no card do recurso
2. Confirmação: "Excluir '[título]' da biblioteca?"
3. Ao confirmar: recurso removido do banco

---

## 10. INTEGRAÇÕES COM OUTROS MÓDULOS

### 10.1 Mente → Tempo (Agenda)

**Regra:** RN-MNT-13 — Sessão Pomodoro → Bloco de Estudo na Agenda

**Trigger:** Sessão Pomodoro completada (ao menos 1 ciclo)

**O que acontece:**
- Cria evento na tabela `agenda_events` com:
  - `title`: "📚 Bloco de Estudo — [nome da trilha]" (ou "📚 Bloco de Estudo" se estudo livre)
  - `description`: "Auto — 📚 Mente | Sessão Pomodoro de [X]min"
  - `type`: 'estudo'
  - `status`: 'done'
  - Badge visual: "Auto — 📚 Mente"

**Condição:** Integração `mnt_pomodoro_agenda` deve estar ativa nas Configurações > Integrações

**Opt-in:** O toggle "Registrar sessão na Agenda ao finalizar" aparece no Timer. Padrão: desativado.

**Cenários:**
- Integração ativa + toggle ativo → registra na agenda
- Integração ativa + toggle desativo → não registra
- Integração desativa → toggle não aparece
- Sessão interrompida antes de 1 ciclo → nada registrado

### 10.2 Mente → Finanças

**Regra:** RN-MNT-14 — Custo de Trilha → Transação em Finanças

**Trigger:** Criação ou edição de trilha com campo `custo > 0`

**O que acontece:**
- Cria transação na tabela `transactions` com:
  - `description`: "📚 Trilha: [nome da trilha]"
  - `amount`: valor do custo
  - `type`: 'expense'
  - `category_id`: categoria "Educação" (criada automaticamente se não existir)
  - Badge visual: "Auto — 🧠 Mente"

**Condição:** Integração `mnt_trilha_financas` deve estar ativa nas Configurações > Integrações

**Cenários:**
- Criar trilha com custo de R$ 199,90 → cria despesa de R$ 199,90 em "Educação"
- Editar trilha alterando custo de R$ 199,90 para R$ 299,90 → cria nova transação de R$ 100,00 (diferença)
- Excluir trilha → NÃO exclui a transação (registro financeiro é histórico)

### 10.3 Mente → Carreira

**Regra:** RN-MNT-15 — Trilha concluída → Atualiza Habilidade no Carreira

**Trigger:** Status da trilha muda para 'completed' E a trilha tem `linked_skill_id`

**O que acontece:**
- Busca a habilidade na tabela `skills` pelo `linked_skill_id`
- Incrementa o progresso/nível da habilidade
- Se a habilidade está vinculada a um step do roadmap de carreira, verifica se o step pode ser marcado como concluído

**Condição:** A trilha deve ter `linked_skill_id` preenchido na criação/edição

**Cenários:**
- Trilha "React Avançado" vinculada à skill "React" → ao concluir, skill "React" avança de nível
- Trilha sem skill vinculada → nada acontece no Carreira
- Trilha abandonada → nada acontece no Carreira

### 10.4 Mente → Futuro

**Regra:** RN-MNT-16 — Progresso de Trilha → Atualiza Meta no Futuro

**Trigger:** Progresso de trilha muda (etapa marcada/desmarcada) E a trilha está vinculada a um Objetivo/Meta no Futuro

**O que acontece:**
- A tabela `objective_goals` tem uma meta do tipo `linked` com `linked_entity_type = 'study_track'` e `linked_entity_id = trilha.id`
- O progresso da meta é atualizado com o progresso da trilha
- O progresso do Objetivo é recalculado (média ponderada de todas as metas)

**Cenários:**
- Objetivo "Ser promovido a Tech Lead" tem meta "Completar curso React" vinculada à trilha "React Avançado"
- Ao marcar etapa 13 de 24 (54%), a meta "Completar curso React" no Futuro atualiza para 54%
- O Objetivo recalcula seu progresso geral

### 10.5 Futuro → Mente

**Regra:** RN-FUT-XX — Criar Meta educacional → Sugere criar Trilha

**Trigger:** Usuário cria meta do tipo 'linked' com `target_module = 'mente'` no módulo Futuro

**O que acontece:**
- Se não existe trilha vinculada, sugere: "Quer criar uma trilha de estudo para acompanhar esta meta?"
- Se o usuário aceita, abre o wizard de criação de trilha com o nome pré-preenchido
- Após criar, a trilha é automaticamente vinculada à meta

---

## 11. DIAGRAMA DE INTEGRAÇÕES

```
┌─────────────────────────────────────────────────────────────────┐
│                     🔮 FUTURO (Cockpit)                          │
│                                                                   │
│  Objetivo: "Ser promovido a Tech Lead"                           │
│  ├── Meta: "Completar React Avançado" (🧠 Mente) ← progresso    │
│  ├── Meta: "Certificação AWS" (🧠 Mente) ← progresso            │
│  └── Meta: "Liderar 2 projetos" (💼 Carreira)                   │
│                                                                   │
│  Progresso: recalcula automaticamente quando trilha avança       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ bidirecional
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       🧠 MENTE                                    │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ Trilha: React    │    │ Timer Pomodoro    │                    │
│  │ Avançado         │◄───│ 25min foco        │                    │
│  │ Progresso: 54%   │    │ Registra sessão   │                    │
│  │ Custo: R$199,90  │    └────────┬─────────┘                    │
│  │ Skill: React     │             │                              │
│  └──────┬───────────┘             │                              │
│         │                         │                              │
│         │                         │                              │
└─────────┼─────────────────────────┼──────────────────────────────┘
          │                         │
    ┌─────┼─────────────────────────┼──────────┐
    │     │                         │          │
    ▼     ▼                         ▼          ▼
┌──────┐ ┌──────────┐    ┌──────────┐  ┌──────────────┐
│💰    │ │💼        │    │⏳        │  │📊 Life Sync  │
│FINAN │ │CARREIRA  │    │TEMPO     │  │Score         │
│ÇAS   │ │          │    │(Agenda)  │  │              │
│      │ │Skill     │    │          │  │Mente: 0.10   │
│Trans.│ │"React"   │    │Bloco de  │  │peso no score │
│Educa │ │avança    │    │Estudo    │  │              │
│ção   │ │de nível  │    │19h-21h   │  │Fórmula:      │
│R$199 │ │          │    │          │  │(hrs/meta×0.5)│
│.90   │ │Roadmap   │    │Badge:    │  │+(streak×0.3) │
│      │ │step pode │    │"Auto—    │  │+(trilhas     │
│Badge:│ │completar │    │📚 Mente" │  │  ativas×0.2) │
│"Auto │ │          │    │          │  │              │
│—🧠"  │ │          │    │          │  │              │
└──────┘ └──────────┘    └──────────┘  └──────────────┘
```

---

## 12. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Descrição |
|--------|-------|-----------|
| **RN-MNT-01** | Limite de trilhas FREE | Usuários FREE podem ter no máximo 3 trilhas com status 'in_progress'. Trilhas pausadas, concluídas ou abandonadas não contam no limite. |
| **RN-MNT-02** | Progresso automático | O progresso da trilha é recalculado automaticamente ao marcar/desmarcar etapas: `(concluídas / total) × 100`. Não é editável manualmente. |
| **RN-MNT-03** | Auto-conclusão de trilha | Quando todas as etapas são marcadas como concluídas, o sistema pergunta se deseja concluir a trilha. Se sim, status = 'completed' e registra `completed_at`. |
| **RN-MNT-04** | Horas acumuladas | As horas totais de uma trilha são a soma de `focus_minutes` de todas as sessões com `track_id = trilha.id`, convertidas em horas. |
| **RN-MNT-05** | Streak de estudo | Dias consecutivos com ao menos 1 sessão registrada (qualquer trilha ou estudo livre). Dia atual sem sessão não quebra o streak até 23:59 do fuso do usuário. |
| **RN-MNT-06** | Timer Pomodoro ciclos | O timer segue ciclos configuráveis. Padrão: 25min foco, 5min pausa curta, 15min pausa longa após 4 ciclos. Todos os tempos são configuráveis. |
| **RN-MNT-07** | Registro de sessão | Uma sessão é registrada automaticamente quando ao menos 1 ciclo completo de foco é concluído. Ciclos parciais não são registrados. |
| **RN-MNT-08** | Sessões imutáveis | Sessões de estudo não podem ser editadas após registro. Apenas exclusão é permitida. |
| **RN-MNT-09** | Sons ambiente | Sons ambiente no timer. (pós-MVP: gate PRO) |
| **RN-MNT-10** | XP por sessão | +10 XP por ciclo completado, +5 XP bônus por rodada completa, +20 XP por streak de 7 dias, +50 XP por streak de 30 dias. |
| **RN-MNT-11** | Meta semanal | A meta semanal de horas é configurável pelo usuário (padrão: 10h). Usada para calcular o progresso na barra da tela de Sessões e no KPI do Dashboard. |
| **RN-MNT-12** | Biblioteca sem limites | A biblioteca de recursos não tem limites FREE/PRO. Todos os usuários podem adicionar recursos ilimitados. |
| **RN-MNT-13** | Integração Agenda | Sessão concluída pode criar evento na Agenda (tipo 'estudo'), condicionado ao toggle do Timer + integração ativa. |
| **RN-MNT-14** | Integração Finanças | Custo de trilha pode gerar transação de despesa em Finanças (categoria "Educação"), condicionado à integração ativa. |
| **RN-MNT-15** | Integração Carreira | Trilha concluída com skill vinculada atualiza o progresso da habilidade no módulo Carreira. |
| **RN-MNT-16** | Integração Futuro | Progresso de trilha vinculada a meta do Futuro atualiza automaticamente o progresso da meta e do Objetivo. |
| **RN-MNT-17** | Exclusão de trilha | Ao excluir trilha, etapas são removidas em cascata. Sessões vinculadas mantêm registro com `track_id = NULL`. Transações financeiras não são removidas. |
| **RN-MNT-18** | Categorias de trilha | As 12 categorias são fixas no MVP: technology, languages, management, marketing, design, finance, health, exam, undergraduate, postgraduate, certification, other. |
| **RN-MNT-19** | Nome único de trilha | O nome da trilha deve ser único por usuário para trilhas ativas. Trilhas concluídas/abandonadas podem ter nomes repetidos. |
| **RN-MNT-20** | Insight de produtividade | Insights de produtividade são gerados por regras de negócio, não por IA generativa no MVP. Requerem mínimo de 10 sessões para horário, 4 semanas para padrão semanal. |
| **RN-MNT-21** | Timer em background | O timer deve continuar contando mesmo se o usuário minimiza o app ou troca de aba. Usa Web Worker. Se o app é fechado completamente, a sessão é perdida. |

---

## 14. MODELO DE DADOS

### 14.1 Tabelas do Módulo

```sql
-- study_tracks: Trilhas de aprendizado
study_tracks (
    id UUID PK,
    user_id UUID FK → profiles,
    name TEXT NOT NULL,
    category TEXT CHECK (12 categorias válidas),
    status TEXT DEFAULT 'in_progress' CHECK (in_progress, paused, completed, abandoned),
    target_date DATE,
    progress DECIMAL(5,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(10,2),
    linked_skill_id UUID FK → skills,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- study_track_steps: Etapas de uma trilha
study_track_steps (
    id UUID PK,
    track_id UUID FK → study_tracks (ON DELETE CASCADE),
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    sort_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP
)

-- focus_sessions_mente: Sessões de estudo
focus_sessions_mente (
    id UUID PK,
    user_id UUID FK → profiles,
    track_id UUID FK → study_tracks (nullable),
    duration_minutes INTEGER NOT NULL,
    focus_minutes INTEGER NOT NULL,
    break_minutes INTEGER NOT NULL,
    cycles_completed INTEGER DEFAULT 0,
    session_notes TEXT,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP
)

-- library_items: Recursos da biblioteca
library_items (
    id UUID PK,
    user_id UUID FK → profiles,
    title TEXT NOT NULL,
    item_type TEXT CHECK (book, course, podcast, article),
    status TEXT DEFAULT 'in_progress' CHECK (in_progress, saved, completed),
    author TEXT,
    platform TEXT,
    url TEXT,
    total_pages INTEGER,
    current_page INTEGER,
    total_hours DECIMAL(6,1),
    current_hours DECIMAL(6,1),
    duration_minutes INTEGER,
    progress DECIMAL(5,2) DEFAULT 0,
    track_id UUID FK → study_tracks (nullable),
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### 14.2 Índices Recomendados

```sql
CREATE INDEX idx_study_tracks_user_status ON study_tracks(user_id, status);
CREATE INDEX idx_focus_sessions_user_date ON focus_sessions_mente(user_id, recorded_at);
CREATE INDEX idx_focus_sessions_track ON focus_sessions_mente(track_id);
CREATE INDEX idx_library_items_user_type ON library_items(user_id, item_type);
CREATE INDEX idx_track_steps_track ON study_track_steps(track_id, sort_order);
```

---

## 15. LIFE SYNC SCORE — COMPONENTE MENTE

### 15.1 Peso no Score Geral

O módulo Mente contribui com **10%** do Life Sync Score total.

### 15.2 Fórmula

```
Mente Score = (
    (horas_estudadas_semana / meta_semanal) × 0.50 +
    (streak_normalizado) × 0.30 +
    (trilhas_em_progresso > 0 ? 1.0 : 0.0) × 0.20
) × 100

Onde:
- horas_estudadas_semana: soma de focus_minutes da semana / 60
- meta_semanal: configuração do usuário (padrão 10h)
- streak_normalizado: min(current_streak / 30, 1.0) — normaliza para max 30 dias
- trilhas_em_progresso: count de trilhas com status 'in_progress'

Limitado a 100 (teto)
```

### 15.3 Interpretação

| Score | Significado |
|-------|------------|
| 0-20 | Mente estagnada — sem atividade de estudo |
| 21-40 | Início — alguma atividade esporádica |
| 41-60 | Regular — mantendo ritmo mínimo |
| 61-80 | Bom — estudando com consistência |
| 81-100 | Excelente — desenvolvimento contínuo e disciplinado |

---

## 16. INSIGHTS E SUGESTÕES ADICIONAIS

### 16.1 Funcionalidades que agregam valor para futuras versões

| Funcionalidade | Descrição | Impacto | Prioridade |
|----------------|-----------|---------|------------|
| **Templates de trilhas** | Trilhas pré-montadas ("Aprender React em 12 semanas", "Certificação AWS Cloud Practitioner") que o usuário importa com 1 clique | Reduz drasticamente a fricção de adoção. O TrackIt já faz isso para estudos. | Alta — pós-MVP |
| **Repetição espaçada (Flashcards)** | Criar flashcards vinculados a etapas de trilha, com algoritmo SM-2 para revisão. Feature killer para concurseiros e estudantes de idiomas | Diferencial competitivo forte. O Anki domina, mas é feio e complexo. SyncLife integraria com trilhas. | Média — v4 |
| **Compartilhamento de trilhas** | Usuários PRO podem compartilhar trilhas como templates públicos. Cria rede de efeito e conteúdo orgânico | Gera network effects. Se 100 usuários compartilham trilhas, os próximos 1000 têm valor imediato ao entrar. | Média — v4 |
| **Bloqueio de apps** | No modo Pomodoro, bloquear apps distrativos (Instagram, TikTok) — requer permissão de acessibilidade em mobile nativo | Forest faz isso muito bem. Requer app nativo (PWA não tem essa permissão). Reavaliar quando tiver app nativo. | Baixa — app nativo |
| **Notas por etapa com Markdown** | Cada etapa de trilha pode ter notas formatadas, criando um mini-caderno de estudo vinculado ao percurso | Substitui parcialmente o Notion para notas de estudo. Agrega valor sem complexidade. | Média — pós-MVP |
| **Integração com APIs de livros** | Ao adicionar livro na biblioteca, buscar capa, autor, páginas via Google Books API ou Open Library API | Elimina input manual. UX premium. | Alta — pós-MVP |
| **Timer com música lo-fi** | Além dos sons ambiente, integrar com playlist lo-fi (stream de YouTube ou Spotify embed) | Feature "nice to have" que gera encantamento. Muitos apps de estudo fazem isso (StudyStream, Lofi Girl). | Baixa — cosmético |
| **Relatórios mensais** | Resumo mensal com: horas totais, trilhas avançadas, habilidades desenvolvidas, comparativo com mês anterior | Agrega perceived value para PRO. Pode ser o "email mensal" que traz o usuário de volta. | Alta — pós-MVP |

### 16.2 Críticas e Pontos de Atenção ao Protótipo Atual

**1. Falta tela de "Criar Trilha" no protótipo**
O protótipo atual mostra 5 telas (Dashboard, Trilhas, Timer, Sessões, Biblioteca), mas não prototipa o fluxo de criação de trilha. Para o próximo protótipo, é essencial incluir o wizard de criação (mínimo 2 telas: informações + etapas).

**2. Falta tela de "Detalhe da Trilha"**
O card de trilha é clicável mas não há tela de detalhe prototipada. O detalhe é crítico porque é onde o usuário interage diariamente (marcando etapas como concluídas).

**3. Falta modal de "Adicionar Recurso" na Biblioteca**
O CTA "+ Adicionar recurso" existe mas o modal/wizard de adição não está prototipado.

**4. Timer não mostra estado de pausa**
O protótipo mostra o timer em estado de foco, mas não mostra o visual durante a pausa (que deveria ser visualmente distinto — cor mais suave, texto "☕ Pausa", countdown da pausa).

**5. Falta tela de Configurações do Timer**
O ícone de ⚙️ existe no header do Timer, mas a tela de configurações (duração, pausas, sons, etc.) não está prototipada.

### 16.3 Recomendação de Telas Adicionais para Prototipagem

Com base nesta análise funcional, recomendo prototipar as seguintes telas adicionais antes de iniciar o desenvolvimento:

| # | Tela | Prioridade | Justificativa |
|---|------|-----------|---------------|
| 06 | Criar Trilha (Wizard) | 🔴 Alta | Fluxo principal de criação — sem isso, o módulo não funciona |
| 07 | Detalhe da Trilha | 🔴 Alta | Tela de interação diária mais importante (marcar etapas) |
| 08 | Timer — Estado de Pausa | 🟡 Média | Visual diferente do foco, essencial para UX |
| 09 | Timer — Configurações | 🟡 Média | Permite personalização, impacta retenção |
| 10 | Adicionar Recurso (Modal) | 🟡 Média | Fluxo de adição na Biblioteca |
| 11 | Celebração — Trilha Concluída | 🟢 Baixa (Jornada) | Momento de dopamina que gera screenshot/compartilhamento |
| 12 | Empty States | 🟢 Baixa | Estados vazios para cada tela (primeira vez sem dados) |

---

*Documento criado em: Março 2026*  
*Versão: 1.0 — Documento Funcional Completo*  
*Protótipo base: `proto-mobile-mente.html`*  
*Próximo passo: Validação das funcionalidades → Prototipagem das telas faltantes*
