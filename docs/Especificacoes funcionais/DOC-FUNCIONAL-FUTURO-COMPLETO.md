# DOCUMENTO FUNCIONAL — Módulo Futuro
## Especificação Completa de Funcionalidades

**Versão:** 1.0  
**Data:** 06/03/2026  
**Módulo:** 🔮 Futuro (Cockpit de Vida)  
**Cor:** `#8b5cf6` (Purple)  
**Status:** 📋 Especificação funcional para desenvolvimento  
**Referências:** ADR-001, MVP-V3-ESPECIFICACAO-COMPLETA-V2, migrations 005/007/008

> **Atualizado pós MIGRATION-ELIMINAR-MODO-DUAL (08/03/2026).** Experiência unificada. Gates PRO desativados no MVP. Limites FREE vs PRO serão redefinidos pós-MVP.

---

## ÍNDICE

1. [Visão Geral e Propósito](#1-visão-geral-e-propósito)
2. [Glossário de Conceitos](#2-glossário)
3. [Modelo de Dados](#3-modelo-de-dados)
4. [FUT-01: Gestão de Objetivos](#4-fut-01-gestão-de-objetivos)
5. [FUT-02: Gestão de Metas](#5-fut-02-gestão-de-metas)
6. [FUT-03: Progresso Bidirecional](#6-fut-03-progresso-bidirecional)
7. [FUT-04: Marcos (Milestones)](#7-fut-04-marcos)
8. [FUT-05: Simulador de Cenários IA](#8-fut-05-simulador-ia)
9. [FUT-06: Check-in Periódico](#9-fut-06-check-in-periódico)
10. [FUT-07: Mapa da Vida (Radar)](#10-fut-07-mapa-da-vida)
11. [FUT-08: Dashboard e Score](#11-fut-08-dashboard-e-score)
12. [FUT-09: Arquivo e Celebração](#12-fut-09-arquivo-e-celebração)
13. [FUT-10: Notificações e Alertas](#13-fut-10-notificações)
14. [FUT-11: Gamificação](#14-fut-11-gamificação)
15. [Diagrama de Integrações Cross-Módulo](#15-diagrama-de-integrações)
16. [Regras de Negócio Consolidadas](#16-regras-de-negócio)
17. [Arquitetura de Navegação](#17-arquitetura-de-navegação)
18. [Índice de Protótipos](#18-índice-de-protótipos)

> **Documento único e completo.** Toda especificação funcional, navegação, regras de negócio e mapa de protótipos estão neste arquivo.

---

## 1. VISÃO GERAL E PROPÓSITO

### 1.1 O que é o módulo Futuro

O Futuro é o **cockpit central da vida** do usuário no SyncLife. Enquanto cada módulo gerencia uma dimensão específica (Finanças cuida do dinheiro, Corpo cuida da saúde, Mente cuida do aprendizado), o Futuro é onde todas as dimensões convergem sob um único propósito: **os sonhos e objetivos de vida do usuário**.

### 1.2 Propósito

O módulo responde a uma pergunta que nenhum outro app no mercado responde de forma integrada:

> **"Como está o meu progresso rumo aos meus sonhos, considerando TODAS as dimensões da minha vida?"**

### 1.3 Por que existe

Sem o Futuro, o SyncLife seria uma coleção de apps separados colados numa interface. O Futuro é a "cola" que transforma 8 módulos independentes em um sistema integrado. Ele dá contexto — "por que estou economizando R$ 800/mês?" — e visibilidade — "estudar React me aproxima da promoção que me aproxima do apartamento".

### 1.4 Diferencial competitivo

Nenhum app concorrente conecta "estudar para certificação AWS" (Mente) com "ser promovido a Tech Lead" (Carreira) com "ganhar 20% a mais" (Finanças) com "comprar apartamento mais rápido" (Futuro) num fluxo automatizado. O SyncLife faz isso.

---

## 2. GLOSSÁRIO

| Termo | Definição | Exemplo |
|-------|-----------|---------|
| **Objetivo** | Aspiração qualitativa de vida. O sonho com intenção. Vive no módulo Futuro. | "Comprar meu apartamento" |
| **Meta** | Indicador quantitativo e mensurável vinculado a um Objetivo. Vive em um módulo específico. | "Juntar R$ 80.000" (Finanças) |
| **Marco** | Checkpoint intermediário dentro de um Objetivo ou Meta. | "R$ 40.000 — metade do caminho" |
| **Módulo destino** | O módulo onde a meta efetivamente vive e é gerenciada. | Finanças, Corpo, Mente, etc. |
| **Progresso bidirecional** | Atualização automática que funciona nos dois sentidos: módulo → Futuro e Futuro → módulo. | Registro de peso no Corpo atualiza meta no Futuro |
| **Peso (weight)** | Importância relativa de uma meta no cálculo do progresso do Objetivo. | Meta de R$ 80k tem peso 2.0, meta de pesquisar bairros tem peso 0.5 |
| **Entidade vinculada** | Item concreto criado em outro módulo quando a meta é criada. | Envelope no Finanças, trilha no Mente, step no Carreira |
| **Check-in** | Revisão periódica onde o usuário avalia progresso e recalibra seus objetivos. | Semanal (5 min) ou Mensal (10 min) |
| **Score Futuro** | Pontuação de 0-100 que reflete a saúde geral dos objetivos do usuário. | 58 pts = progresso razoável com pontos de atenção |
| **Simulador** | Ferramenta IA que cruza dados de todos os módulos para sugerir cenários de aceleração. | "Cortar R$ 200 em Lazer adianta apartamento em 3 semanas" |

---

## 3. MODELO DE DADOS

### 3.1 Tabelas principais (já existentes no schema)

**`objectives`** — Tabela principal dos objetivos
```sql
objectives (
  id UUID PK,
  user_id UUID FK → profiles,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  category TEXT NOT NULL, -- financial, health, professional, educational, experience, personal, other
  priority TEXT DEFAULT 'medium', -- high, medium, low
  target_date DATE,
  target_date_reason TEXT,
  status TEXT DEFAULT 'active', -- active, paused, completed, archived
  completed_at TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, name)
)
```

**`objective_goals`** — Metas vinculadas a cada objetivo
```sql
objective_goals (
  id UUID PK,
  objective_id UUID FK → objectives,
  user_id UUID FK → profiles,
  name TEXT NOT NULL,
  target_module TEXT NOT NULL, -- financas, tempo, corpo, mente, patrimonio, carreira, experiencias
  indicator_type TEXT NOT NULL, -- monetary, weight, task, frequency, percentage, quantity, linked
  target_value DECIMAL(15,2),
  current_value DECIMAL(15,2) DEFAULT 0,
  initial_value DECIMAL(15,2),
  target_unit TEXT,
  linked_entity_type TEXT, -- envelope, track, roadmap_step, trip, task, habit, asset
  linked_entity_id UUID,
  weight DECIMAL(3,1) DEFAULT 1.0, -- 0.5 a 3.0
  frequency_period TEXT, -- daily, weekly, monthly
  frequency_target INTEGER,
  status TEXT DEFAULT 'active', -- active, completed, paused
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP,
  last_progress_update TIMESTAMP,
  auto_sync BOOLEAN DEFAULT TRUE,
  agenda_event_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**`objective_milestones`** — Marcos de cada objetivo
```sql
objective_milestones (
  id UUID PK,
  objective_id UUID FK → objectives,
  goal_id UUID FK → objective_goals (nullable),
  event_type TEXT NOT NULL, -- milestone, progress_update, status_change, contribution
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(15,2),
  achieved_at TIMESTAMP,
  projected_date DATE,
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP
)
```

### 3.2 Relações

```
profiles (1) ──── (N) objectives
objectives (1) ──── (N) objective_goals
objectives (1) ──── (N) objective_milestones
objective_goals (1) ──── (0..1) [entidade vinculada em outro módulo]
```

---

## 4. FUT-01: GESTÃO DE OBJETIVOS

### 4.1 Objetivo da funcionalidade

Permitir ao usuário criar, visualizar, editar, pausar, retomar, concluir e excluir objetivos de vida. Cada objetivo é o "sonho com intenção" que agrupa metas concretas distribuídas nos módulos do SyncLife.

### 4.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-01 | Usuário pode criar objetivo com nome, tipo, prazo e pelo menos 1 meta | Wizard completo salva no banco |
| CA-02 | Nome do objetivo é único por usuário | Banco rejeita duplicata, UI mostra erro |
| CA-03 | Objetivo aparece no Dashboard imediatamente após criação | Lista atualiza sem reload |
| CA-04 | Objetivo pode ter 1 a N metas em diferentes módulos | Não há limite de módulos por objetivo |
| CA-05 | Progresso é calculado como média ponderada das metas | Fórmula: Σ(meta.progress × meta.weight) / Σ(meta.weight) |
| CA-06 | Status muda automaticamente para "completed" quando progress = 100% | Trigger no banco ou verificação no frontend |
| CA-07 | Pausar objetivo pausa TODAS as metas vinculadas | Cascade de status |
| CA-08 | Excluir objetivo remove metas vinculadas MAS mantém entidades nos módulos | Envelope no Finanças permanece, apenas a vinculação é desfeita |
| CA-09 | FREE: máximo 3 objetivos ativos | UI bloqueia com UpgradeModal no 4º |
| CA-10 | PRO: objetivos ilimitados | Sem restrição |

### 4.3 Resultado esperado

Após criar um objetivo, o usuário vê um card no Dashboard com nome, ícone, progresso geral, tags dos módulos vinculados, status e prazo. Ao clicar, abre o Detalhe com todas as metas individuais, contribuições por módulo, marcos e projeção IA.

### 4.4 Manual passo a passo

#### CRIAR OBJETIVO

```
PASSO 1 — Iniciar criação
├── Onde: Dashboard → botão "+ Novo objetivo" OU tab Objetivos → botão "+"
├── Ação: Sistema abre o Wizard (tela cheia em mobile, modal em desktop)
└── Estado: Wizard Step 1 visível

PASSO 2 — Escolher tipo (Wizard Step 1)
├── UI: Grid 2×3 com tipos de objetivo
│   ├── 🏠 Aquisição (casa, carro, moto)
│   ├── ✈️ Experiência (viagem, evento)
│   ├── 🎓 Desenvolvimento (MBA, certificação)
│   ├── 🛡️ Segurança (reserva, fundo)
│   ├── 🚀 Liberdade (FIRE, independência)
│   └── ✨ Outro (livre)
├── Ação: Usuário seleciona um tipo (radio, só 1 ativo)
├── Validação: Tipo obrigatório
├── Modo Jornada: Cada tipo tem tag de missão ("💫 Conquista", "🌍 Vivência")
│   Preview: "Criar esta missão vale +50 XP"
└── Botão: "Continuar →"

PASSO 3 — Definir objetivo (Wizard Step 2)
├── Campos:
│   ├── Nome do objetivo (texto, obrigatório, max 100 chars)
│   │   Placeholder Foco: "Ex: Comprar meu primeiro apartamento"
│   │   Placeholder Jornada: "Dê um nome ao seu sonho"
│   ├── Descrição (texto, opcional, max 500 chars)
│   │   Placeholder: "Por que esse objetivo é importante para você?"
│   ├── Ícone/Emoji (seletor, default baseado no tipo)
│   ├── Prazo desejado (date picker, obrigatório)
│   │   Sugestão IA: "Baseado no seu perfil, 24 meses é realista"
│   └── Prioridade (Alta / Média / Baixa, default Média)
├── Validação:
│   ├── Nome obrigatório e único
│   ├── Prazo não pode ser passado
│   └── Prazo mínimo: 30 dias
└── Botão: "Continuar →"

PASSO 4 — Adicionar metas (Wizard Step 3) ← STEP CRÍTICO
├── Instrução: "Quais caminhos concretos levam a esse sonho?"
├── Lista de metas (começa vazia, mínimo 1 para concluir)
├── Para cada meta:
│   ├── Botão "+ Adicionar meta"
│   ├── Modal/Drawer de criação da meta:
│   │   ├── Nome da meta (texto, obrigatório)
│   │   │   Ex: "Juntar entrada de R$ 80.000"
│   │   ├── Módulo destino (select, obrigatório)
│   │   │   Opções: 💰 Finanças, 📈 Patrimônio, 🏃 Corpo,
│   │   │           🧠 Mente, 💼 Carreira, ✈️ Experiências, ⏳ Tempo
│   │   ├── Tipo de medição (select, varia por módulo)
│   │   │   Finanças/Patrimônio: Monetário (R$)
│   │   │   Corpo: Numérico (kg, %) ou Frequência (x/semana)
│   │   │   Mente: Etapas (módulos) ou Quantidade (livros, horas)
│   │   │   Carreira: Percentual (%) ou Steps (roadmap)
│   │   │   Experiências: Monetário (R$)
│   │   │   Tempo: Tarefa (sim/não) ou Horas
│   │   ├── Valor alvo (numérico, obrigatório para tipos mensuráveis)
│   │   │   Ex: 80000 (para R$ 80.000)
│   │   ├── Valor inicial (numérico, opcional, default 0)
│   │   │   Ex: 34800 (já tenho R$ 34.800)
│   │   ├── Unidade (auto-preenchida baseado no tipo)
│   │   │   Ex: "R$", "kg", "módulos", "livros", "x/semana"
│   │   └── Peso/Importância (slider 0.5 a 3.0, default 1.0)
│   │       Explicação: "Quanto essa meta impacta no objetivo geral"
│   └── Botão "Adicionar" → meta aparece na lista
├── Lista mostra:
│   ├── [ícone módulo] Nome da meta — Valor alvo — Peso
│   ├── Botões: Editar | Remover
│   └── Indicador de "entidade que será criada"
│       Ex: "💰 Será criado envelope 'Apartamento' no Finanças"
│       Ex: "🧠 Será criada trilha 'React Avançado' no Mente"
├── Validação:
│   ├── Mínimo 1 meta para prosseguir
│   ├── FREE: máximo 3 metas por objetivo
│   └── PRO: metas ilimitadas
└── Botão: "Continuar →"

PASSO 5 — Configurar contribuição (Wizard Step 4, condicional)
├── EXIBIDO APENAS SE: Objetivo tem meta monetária (Finanças ou Patrimônio)
├── Campos:
│   ├── Contribuição mensal (slider R$ 100 – R$ 10.000)
│   │   Recomendação IA: "Para atingir até [prazo], sugerimos R$ [valor]/mês"
│   ├── Projeção automática:
│   │   ├── Prazo projetado (com contribuição definida)
│   │   ├── Total com rendimento (se Patrimônio vinculado)
│   │   ├── % da renda mensal
│   │   └── Avaliação: "Saudável" / "Alto" / "Acima da capacidade"
│   └── Modo Jornada adicional:
│       ├── XP mensal estimado
│       └── Impacto projetado no Life Score
├── Módulos aliados (toggles, pré-selecionados baseado nas metas):
│   ├── 💰 Finanças → "Cria envelope automático de R$ [valor]/mês"
│   ├── 📈 Patrimônio → "Vincula ao acompanhamento de carteira"
│   └── 💼 Carreira → "Conecta metas de renda para acelerar"
└── Botão: "🚀 Criar objetivo" (Foco) / "🚀 Iniciar missão → +50 XP" (Jornada)

PASSO 6 — Confirmação
├── Sistema:
│   ├── Salva objetivo na tabela `objectives`
│   ├── Salva metas na tabela `objective_goals`
│   ├── Cria entidades vinculadas nos módulos destino:
│   │   ├── Finanças: cria envelope com meta mensal
│   │   ├── Mente: cria trilha de aprendizado
│   │   ├── Carreira: cria step no roadmap
│   │   ├── Corpo: cria meta de peso/hábito
│   │   ├── Experiências: cria viagem com orçamento
│   │   ├── Tempo: cria tarefa com deadline
│   │   └── Patrimônio: vincula ativo para tracking
│   ├── Cria marcos automáticos (25%, 50%, 75%, 100%)
│   ├── Calcula progresso inicial
│   ├── Jornada: concede +50 XP e mostra animação
│   └── Redireciona para Dashboard com toast de sucesso
├── Feedback: "Objetivo '[nome]' criado com sucesso!"
└── Estado: Objetivo visível no Dashboard com progresso inicial
```

#### EDITAR OBJETIVO

```
PASSO 1 — Acessar edição
├── Onde: Detalhe do Objetivo → botão "Editar" (ícone ⚙️)
├── Ação: Abre tela de edição com dados preenchidos
└── Campos editáveis:
    ├── Nome (texto)
    ├── Descrição (texto)
    ├── Ícone/Emoji
    ├── Prazo (date picker)
    │   Impacto: Recalcula projeção e marcos futuros
    ├── Prioridade (Alta/Média/Baixa)
    ├── Contribuição mensal (se monetário)
    │   Impacto: Recalcula projeção
    ├── Metas:
    │   ├── Adicionar nova meta → abre modal de criação
    │   ├── Editar meta existente → abre modal com dados
    │   ├── Remover meta → confirmação "Deseja manter o [envelope/trilha/etc] no [módulo]?"
    │   └── Reordenar metas (drag & drop) → altera peso visual
    └── Peso das metas (slider por meta)

PASSO 2 — Salvar alterações
├── Validação: Nome continua único, prazo válido
├── Sistema:
│   ├── Atualiza `objectives` no banco
│   ├── Atualiza `objective_goals` conforme mudanças
│   ├── Se contribuição mudou → atualiza envelope no Finanças
│   ├── Se prazo mudou → recalcula marcos e projeção
│   └── Recalcula progresso geral
├── Feedback: Toast "Objetivo atualizado com sucesso"
└── Estado: Volta para Detalhe com dados atualizados
```

#### PAUSAR OBJETIVO

```
PASSO 1 — Iniciar pausa
├── Onde: Detalhe → menu ⋯ → "Pausar objetivo"
├── Confirmação: "Pausar '[nome]'? Todas as metas vinculadas serão pausadas."
└── Ação do usuário: Confirma

PASSO 2 — Sistema executa
├── Atualiza `objectives.status` → 'paused'
├── Atualiza todas as `objective_goals.status` → 'paused'
├── Entidades vinculadas:
│   ├── Envelope no Finanças → fica inativo (para de debitar)
│   ├── Trilha no Mente → status "pausada"
│   └── Demais → mantém como estão (não exclui)
├── Objetivo sai do Dashboard ativo → vai para Arquivo
├── Jornada: Streak do objetivo é congelado (não quebra)
└── Feedback: Toast "Objetivo '[nome]' pausado. Você pode retomá-lo quando quiser."
```

#### RETOMAR OBJETIVO

```
PASSO 1 — Iniciar retomada
├── Onde: Arquivo → card do objetivo pausado → botão "Retomar"
├── Ação: Sistema pergunta "Quer manter o prazo original ou ajustar?"
│   ├── Opção A: "Manter prazo (pode ficar atrasado)"
│   └── Opção B: "Ajustar prazo" → abre date picker
└── Usuário escolhe

PASSO 2 — Sistema executa
├── Atualiza `objectives.status` → 'active'
├── Atualiza `objective_goals.status` → 'active'
├── Se prazo foi ajustado → recalcula projeção e marcos
├── Reativa entidades vinculadas (envelope volta a debitar)
├── Objetivo volta para Dashboard ativo
└── Feedback: Toast "Objetivo '[nome]' reativado!"
```

#### CONCLUIR OBJETIVO

```
CENÁRIO A — Conclusão automática
├── Trigger: Quando progress >= 100% (todas as metas atingidas)
├── Sistema:
│   ├── Atualiza `objectives.status` → 'completed'
│   ├── Registra `completed_at` → NOW()
│   ├── Cria milestone do tipo 'status_change' com título "Objetivo concluído"
│   ├── Dispara modal de Celebração (ver FUT-09)
│   └── Jornada: Concede XP de conclusão (+200 a +500)
└── Usuário vê modal de celebração automaticamente

CENÁRIO B — Conclusão manual
├── Onde: Detalhe → menu ⋯ → "Marcar como concluído"
├── Confirmação: "Concluir '[nome]' mesmo que as metas não estejam 100%?"
│   Mostra progresso atual: "3 de 4 metas concluídas (78%)"
├── Sistema: Mesmo que cenário A, mas com progress atual (não 100%)
└── Uso: Para quando o objetivo foi atingido por outra via que o sistema não rastreia
```

#### EXCLUIR OBJETIVO

```
PASSO 1 — Iniciar exclusão
├── Onde: Editar Objetivo → seção "Danger Zone" → botão "Excluir objetivo"
├── Confirmação DUPLA:
│   ├── 1ª: "Tem certeza? Esta ação é permanente."
│   └── 2ª: "As metas e marcos serão removidos. As entidades nos módulos (envelopes, trilhas, etc) serão MANTIDAS. Digite o nome do objetivo para confirmar: [____]"
└── Usuário digita nome e confirma

PASSO 2 — Sistema executa
├── Desfaz vinculação: `objective_goals.linked_entity_id` → NULL
│   (entidades nos módulos permanecem intactas)
├── Remove `objective_milestones` do objetivo
├── Remove `objective_goals` do objetivo
├── Remove `objectives` (soft delete ou hard delete, decidir)
├── Feedback: Toast "Objetivo '[nome]' excluído. Envelopes e trilhas nos módulos foram mantidos."
└── Redireciona para Dashboard
```

---

## 5. FUT-02: GESTÃO DE METAS

### 5.1 Objetivo da funcionalidade

Permitir ao usuário criar, editar, reordenar e remover metas dentro de cada objetivo. Cada meta é um indicador concreto e mensurável que vive em um módulo específico do SyncLife e contribui para o progresso do objetivo pai.

### 5.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-11 | Cada meta tem um módulo destino obrigatório | Select obrigatório no formulário |
| CA-12 | Tipo de medição é restrito por módulo | UI mostra apenas tipos válidos para o módulo selecionado |
| CA-13 | Ao criar meta, sistema cria entidade no módulo destino | Envelope aparece no Finanças, trilha aparece no Mente |
| CA-14 | Ao remover meta, sistema pergunta sobre a entidade vinculada | "Manter envelope no Finanças?" sim/não |
| CA-15 | Peso da meta afeta cálculo do progresso geral | Alterar peso recalcula % do objetivo |
| CA-16 | Meta pode ser concluída independentemente do objetivo | Status 'completed' na meta, objetivo recalcula |
| CA-17 | FREE: máximo 3 metas por objetivo | UI bloqueia + UpgradeModal |
| CA-18 | PRO: metas ilimitadas por objetivo | Sem restrição |
| CA-19 | Progresso da meta é atualizado pelo módulo destino, não pelo Futuro | auto_sync = TRUE por default |

### 5.3 Tipos de meta por módulo

| Módulo destino | indicator_type | target_unit | Como mede progresso | Entidade criada |
|---------------|---------------|-------------|---------------------|-----------------|
| 💰 Finanças | `monetary` | `R$` | current_value / target_value × 100 | Envelope (`budgets` com meta e contribuição mensal) |
| 📈 Patrimônio | `monetary` | `R$` | Valor do ativo / target_value × 100 | Ativo na carteira (`assets`) |
| 🏃 Corpo (peso) | `weight` | `kg` | (initial_value - current_value) / (initial_value - target_value) × 100 | Meta de peso (`weight_entries` tracking) |
| 🏃 Corpo (frequência) | `frequency` | `x/semana` | check-ins da semana / frequency_target × 100 | Hábito recorrente (`activities`) |
| 🧠 Mente (etapas) | `quantity` | `módulos` | Módulos concluídos / total × 100 | Trilha de aprendizado (`study_tracks`) |
| 🧠 Mente (leitura) | `quantity` | `livros` | Livros lidos / target × 100 | Meta de leitura (`library_items` tracking) |
| 💼 Carreira (steps) | `linked` | `steps` | Steps concluídos / total × 100 | Step no roadmap (`roadmap_steps`) |
| 💼 Carreira (%) | `percentage` | `%` | current_value (% aumento) / target_value × 100 | Marco no roadmap |
| ✈️ Experiências | `monetary` | `R$` | Orçamento guardado / target_value × 100 | Viagem (`trips` com orçamento) |
| ⏳ Tempo (tarefa) | `task` | — | 0% (pendente) ou 100% (concluída) | Tarefa (`calendar_events` tipo task) |
| ⏳ Tempo (horas) | `quantity` | `horas` | Horas registradas / target × 100 | Blocos de tempo no calendário |

### 5.4 Manual passo a passo

#### CRIAR META (dentro de um objetivo existente)

```
PASSO 1 — Acessar criação
├── Onde: Detalhe do Objetivo → seção "Metas" → botão "+ Adicionar meta"
├── OU: Wizard Step 3 durante criação do objetivo
└── Ação: Abre modal/drawer de criação

PASSO 2 — Preencher dados
├── Campo: Nome da meta (obrigatório)
│   Ex: "Juntar entrada de R$ 80.000"
├── Campo: Módulo destino (select obrigatório)
│   Ao selecionar, UI filtra tipos de medição disponíveis
├── Campo: Tipo de medição (select, filtrado por módulo)
│   Ex: Finanças selecionado → mostra apenas "Monetário (R$)"
│   Ex: Corpo selecionado → mostra "Numérico (kg)" e "Frequência (x/semana)"
├── Campo: Valor alvo (numérico, obrigatório para tipos mensuráveis)
│   Rótulo dinâmico: "Qual o valor alvo?" / "Quantos kg?" / "Quantos livros?"
├── Campo: Valor inicial (numérico, opcional)
│   Ex: "Já tenho R$ 34.800 guardados"
├── Campo: Frequência (se tipo = frequency)
│   Select: Diária / Semanal / Mensal
│   Input: Quantas vezes? Ex: 4
├── Campo: Peso/Importância (slider 0.5 a 3.0, default 1.0)
│   Tooltip: "Meta com peso 2.0 conta o dobro no progresso geral"
└── Preview: "Será criado: [emoji] [entidade] no módulo [nome]"
    Ex: "💰 Envelope 'Apartamento' com meta de R$ 800/mês no Finanças"

PASSO 3 — Confirmar
├── Validação:
│   ├── Nome obrigatório
│   ├── Módulo obrigatório
│   ├── Valor alvo > 0 (para tipos mensuráveis)
│   ├── Valor inicial < valor alvo (para tipos crescentes)
│   └── FREE: máximo 3 metas por objetivo
├── Sistema:
│   ├── Insere em `objective_goals`
│   ├── Cria entidade no módulo destino:
│   │   Se Finanças → INSERT em budgets/envelopes
│   │   Se Mente → INSERT em study_tracks
│   │   Se Carreira → INSERT em roadmap_steps
│   │   Se Corpo → INSERT em activities ou configura weight tracking
│   │   Se Experiências → INSERT em trips
│   │   Se Tempo → INSERT em calendar_events
│   │   Se Patrimônio → INSERT em assets ou vincula existente
│   ├── Atualiza `linked_entity_type` e `linked_entity_id` na meta
│   ├── Recalcula progresso do objetivo pai
│   └── Jornada: +20 XP por meta adicionada
├── Feedback: Meta aparece na lista com módulo, progresso e link
└── Estado: Detalhe do Objetivo atualizado com nova meta
```

#### EDITAR META

```
PASSO 1 — Onde: Detalhe do Objetivo → lista de metas → ícone ✏️ na meta
PASSO 2 — Modal abre com dados preenchidos
├── Editável: Nome, valor alvo, peso, frequência
├── NÃO editável: Módulo destino (para mudar módulo, remover e recriar)
├── Se valor alvo muda → recalcula progresso da meta e do objetivo
└── Se peso muda → recalcula progresso do objetivo
PASSO 3 — Salvar
├── Atualiza `objective_goals`
├── Se valor alvo mudou e há entidade vinculada → atualiza entidade no módulo
├── Recalcula progresso do objetivo
└── Feedback: Toast "Meta atualizada"
```

#### REMOVER META

```
PASSO 1 — Onde: Detalhe do Objetivo → lista de metas → ícone 🗑️ na meta
PASSO 2 — Confirmação com escolha:
├── "Remover meta '[nome]' do objetivo?"
├── Opção A: "Remover meta E excluir [envelope/trilha] do [módulo]"
│   → Remove tudo (objective_goal + entidade vinculada)
└── Opção B: "Remover meta mas MANTER [envelope/trilha] no [módulo]"
    → Remove apenas a vinculação (objective_goal)
    → Entidade continua existindo no módulo de forma independente
PASSO 3 — Sistema executa
├── Remove ou desvíncula conforme escolha
├── Recalcula progresso do objetivo (sem a meta removida)
├── Se era a última meta → alerta: "Objetivo '[nome]' ficou sem metas"
└── Feedback: Toast com resultado da ação
```

#### REORDENAR METAS

```
PASSO 1 — Onde: Detalhe do Objetivo → lista de metas
PASSO 2 — Drag & drop (mobile: long press + arrastar)
PASSO 3 — Nova ordem é salva automaticamente
├── Ordem visual muda
├── Peso NÃO muda automaticamente (é independente da ordem)
└── Feedback: Animação de reposição suave
```

---

## 6. FUT-03: PROGRESSO BIDIRECIONAL

### 6.1 Objetivo da funcionalidade

Automatizar a atualização de progresso entre os módulos e o Futuro. Quando o usuário interage com qualquer módulo, o progresso reflete automaticamente nos objetivos do Futuro — e vice-versa.

### 6.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-20 | Atualização no módulo → atualiza meta no Futuro automaticamente | Em ≤ 5 segundos (realtime ou polling) |
| CA-21 | Atualização manual no Futuro → atualiza entidade no módulo | Apenas para tipos que permitem (monetary, task) |
| CA-22 | Progresso do objetivo recalcula sempre que uma meta muda | Trigger ou computed |
| CA-23 | Score Futuro recalcula quando qualquer objetivo muda | Automático |
| CA-24 | auto_sync pode ser desativado por meta individual | Toggle na edição da meta |
| CA-25 | Histórico de atualizações é registrado | Log em objective_milestones tipo 'progress_update' |

### 6.3 Fluxos de sincronização

#### MÓDULO → FUTURO (automático)

```
CENÁRIO: Usuário registra peso no módulo Corpo

1. Corpo: Usuário registra peso de 82kg (meta: 75kg, inicial: 90kg)
2. Corpo: Salva em weight_entries
3. Sistema: Detecta que existe objective_goal com:
   - linked_entity_type = 'weight_tracking'
   - target_module = 'corpo'
   - auto_sync = TRUE
4. Sistema: Calcula progresso da meta:
   - (90 - 82) / (90 - 75) × 100 = 53.3%
5. Sistema: Atualiza objective_goals.current_value = 82
6. Sistema: Atualiza objective_goals.progress = 53.3
7. Sistema: Atualiza objective_goals.last_progress_update = NOW()
8. Sistema: Recalcula objectives.progress (média ponderada de todas as metas)
9. Sistema: Se progress mudou significativamente (+5%):
   - Cria milestone tipo 'progress_update'
   - Jornada: Concede XP proporcional
10. Sistema: Recalcula Score Futuro
11. UI: Dashboard atualiza em tempo real (ou no próximo acesso)
```

```
CENÁRIO: Usuário conclui módulo 3 de 5 de uma trilha no Mente

1. Mente: Usuário marca módulo 3 como concluído na trilha "React"
2. Mente: Atualiza study_tracks.completed_modules = 3
3. Sistema: Detecta objective_goal vinculada:
   - linked_entity_type = 'track'
   - linked_entity_id = [id da trilha]
4. Sistema: Calcula: 3/5 × 100 = 60%
5. Sistema: Atualiza objective_goals.current_value = 3, progress = 60
6. Sistema: Recalcula objetivo "Ser promovido" (ex: 45% → 50%)
7. Jornada: "+30 XP — Missão 'Promoção' avançou!"
```

```
CENÁRIO: Envelope no Finanças recebe depósito

1. Finanças: Usuário registra transação de R$ 800 na categoria do envelope
2. Finanças: Atualiza saldo do envelope
3. Sistema: Detecta objective_goal vinculada:
   - linked_entity_type = 'envelope'
   - target_module = 'financas'
4. Sistema: current_value = saldo atual do envelope (ex: R$ 35.600)
5. Sistema: progress = 35600 / 80000 × 100 = 44.5%
6. Sistema: Recalcula objetivo "Apartamento"
7. Se atingiu marco (ex: R$ 35.000):
   - Marca milestone como achieved
   - Jornada: "+80 XP — Marco 'R$ 35.000' atingido!"
```

#### FUTURO → MÓDULO (manual, com confirmação)

```
CENÁRIO: Usuário marca meta tipo 'task' como concluída no Futuro

1. Futuro: Usuário clica ✓ na meta "Pesquisar bairros"
2. Sistema: Confirmação "Marcar como concluída?"
3. Sistema:
   - Atualiza objective_goals.status = 'completed'
   - Atualiza objective_goals.progress = 100
   - Atualiza entidade vinculada:
     calendar_events.status = 'completed' (tarefa no Tempo)
4. Recalcula progresso do objetivo
5. Feedback: "Meta concluída! Objetivo avançou para [X]%"
```

### 6.4 Diagrama de sincronização

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO FUTURO                             │
│                                                              │
│   objective.progress = Σ(goal.progress × goal.weight)       │
│                          ÷ Σ(goal.weight)                   │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ Meta A   │  │ Meta B   │  │ Meta C   │  │ Meta D   │  │
│   │ 44.5%    │  │ 50%      │  │ 60%      │  │ 100%     │  │
│   │ peso:2.0 │  │ peso:1.0 │  │ peso:1.5 │  │ peso:0.5 │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│        │              │              │              │        │
└────────│──────────────│──────────────│──────────────│────────┘
         │              │              │              │
    auto_sync      auto_sync      auto_sync      auto_sync
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ 💰       │  │ 📈       │  │ 🧠       │  │ ⏳       │
   │ FINANÇAS │  │PATRIMÔNIO│  │  MENTE   │  │  TEMPO   │
   │          │  │          │  │          │  │          │
   │ Envelope │  │ Ativo    │  │ Trilha   │  │ Tarefa   │
   │ R$35.600 │  │ R$2.300  │  │ 3/5 mód  │  │ ✓ Done   │
   │          │  │          │  │          │  │          │
   └──────────┘  └──────────┘  └──────────┘  └──────────┘
        ▲              ▲              ▲              ▲
        │              │              │              │
   Usuário         Usuário        Usuário        Usuário
   registra        verifica       conclui         marca
   transação       carteira       módulo          tarefa
```

---

## 7. FUT-04: MARCOS (MILESTONES)

### 7.1 Objetivo da funcionalidade

Fornecer checkpoints intermediários que celebram progresso parcial, mantêm o usuário motivado e criam uma sensação de avanço contínuo. Marcos são os "mini-wins" na jornada rumo ao objetivo.

### 7.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-26 | Marcos automáticos são criados em 25%, 50%, 75% e 100% do objetivo | Criados automaticamente no wizard |
| CA-27 | Usuário pode criar marcos manuais adicionais | Modal de criação disponível no Detalhe |
| CA-28 | Marco é atingido automaticamente quando progresso ultrapassa seu valor | Verificação a cada atualização de progresso |
| CA-29 | Atingir marco dispara notificação e celebração mini | Toast + animação |
| CA-30 | Jornada: Marco concede XP | +80 a +200 XP por marco |
| CA-31 | Marcos são exibidos na Timeline como dots em linha vertical | Componente visual padrão |

### 7.3 Tipos de marco

| Tipo | Automático? | Descrição |
|------|-------------|-----------|
| `milestone` | Sim (25/50/75/100%) + manual | Checkpoint com título e valor |
| `progress_update` | Sim | Registro automático quando progresso muda ≥5% |
| `status_change` | Sim | Quando objetivo muda de status (paused, completed) |
| `contribution` | Sim | Registro de contribuição significativa |

### 7.4 Manual passo a passo

#### CRIAR MARCO MANUAL

```
PASSO 1 — Onde: Detalhe do Objetivo → seção "Marcos" → botão "+ Novo marco"
PASSO 2 — Preencher:
├── Título (texto, obrigatório) Ex: "Dar entrada no financiamento"
├── Valor de referência (numérico, opcional) Ex: R$ 60.000
├── Data projetada (date, opcional) Ex: Set 2027
└── Vinculado a qual meta? (select, opcional)
PASSO 3 — Salvar → INSERT em objective_milestones
```

#### MARCO ATINGIDO (automático)

```
TRIGGER: objective.progress ultrapassa threshold do marco
1. Sistema detecta: progress 48% → 52% (marco de 50% existe)
2. Sistema: milestone.achieved_at = NOW()
3. Sistema: Cria notificação in-app
4. UI: Animação de celebração (confete mini)
5. Jornada: "+120 XP — Marco 'Metade do caminho' atingido! 🎉"
6. Estado: Dot na timeline muda de futuro (🔒) para concluído (✓)
```

---

## 8. FUT-05: SIMULADOR DE CENÁRIOS IA

### 8.1 Objetivo da funcionalidade

Analisar dados cruzados de TODOS os módulos do SyncLife para sugerir 3 cenários concretos de como o usuário pode acelerar ou ajustar um objetivo específico. É a feature mais diferenciada do produto.

### 8.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-32 | Simulador gera exatamente 3 cenários | Sempre 3 opções |
| CA-33 | Cenários usam dados reais do usuário (gastos, renda, investimentos) | Cross-query com Finanças, Patrimônio, Carreira |
| CA-34 | Cada cenário mostra: novo prazo, esforço necessário, impacto na vida | 3 métricas mínimas |
| CA-35 | Jornada: Cenários mostram impacto no Life Score | Projeção numérica |
| CA-36 | Aplicar cenário executa as mudanças sugeridas | Envelope atualizado, prazo ajustado, etc. |
| CA-37 | FREE: Apenas 1 cenário detalhado (outros borrados) | UI mostra blur + UpgradeModal |
| CA-38 | PRO: 3 cenários completos com IA recomendando o melhor | Badge "⭐ Recomendado" |

### 8.3 Dados que a IA cruza

```
┌─────────────────────────────────────────────────────┐
│              DADOS DE ENTRADA DO SIMULADOR           │
├──────────────────┬──────────────────────────────────┤
│ FONTE            │ DADOS UTILIZADOS                  │
├──────────────────┼──────────────────────────────────┤
│ 💰 Finanças      │ • Orçamento mensal por categoria  │
│                  │ • Gastos reais últimos 3 meses    │
│                  │ • Categorias com sobra ou excesso  │
│                  │ • Renda líquida mensal             │
├──────────────────┼──────────────────────────────────┤
│ 📈 Patrimônio    │ • Rendimento dos investimentos    │
│                  │ • Taxa de retorno mensal           │
│                  │ • Aportes recorrentes              │
├──────────────────┼──────────────────────────────────┤
│ 💼 Carreira      │ • Salário atual                   │
│                  │ • Projeção de aumento (roadmap)    │
│                  │ • Histórico de promoções           │
├──────────────────┼──────────────────────────────────┤
│ ⏳ Tempo         │ • Horas livres por semana          │
│                  │ • Compromissos fixos               │
├──────────────────┼──────────────────────────────────┤
│ 🔮 Futuro        │ • Contribuição atual              │
│                  │ • Prazo original vs projetado      │
│                  │ • Histórico de consistência        │
│                  │ • Outros objetivos concorrentes    │
└──────────────────┴──────────────────────────────────┘
```

### 8.4 Templates de cenários por tipo de objetivo

| Tipo | Cenário A (Menor esforço) | Cenário B (Esforço médio) | Cenário C (Sem mudança) |
|------|--------------------------|--------------------------|------------------------|
| Financeiro | Cortar gastos em categorias específicas | Aumentar renda (freelance, promoção) | Ajustar prazo |
| Desenvolvimento | Aumentar horas de estudo/semana | Mudar formato (presencial→EAD) | Estender prazo |
| Saúde | Intensificar treinos (3→5x/sem) | Contratar personal + dieta | Reduzir meta para mais realista |
| Carreira | Networking + visibilidade interna | Desenvolver skills + pedir promoção | Mudar de empresa |
| Experiência | Reduzir escopo da viagem | Buscar promoções/milhas/datas baratas | Adiar 6 meses |

### 8.5 Como acessar o Simulador

O Simulador NÃO é uma tab — é um sub-fluxo acessado a partir de outras telas. Existem 5 caminhos:

```
CAMINHO 1 — Via Detalhe do Objetivo (principal)
  Dashboard → [clica card do objetivo] → Detalhe → [botão "Simular cenários"]
  └── Botão fica na área de CTAs do Detalhe, ao lado de "Editar"
  └── ← Voltar do Simulador → retorna para o Detalhe

CAMINHO 2 — Via Coach/AI Card no Dashboard
  Dashboard → Coach diz "Apartamento está 2 meses atrasado"
           → CTA "Ver simulador →"
           → Simulador abre diretamente para o objetivo mencionado
  └── ← Voltar → retorna para o Dashboard

CAMINHO 3 — Via Tab Objetivos
  Tab Objetivos → [clica card] → Detalhe → [Simular cenários]
  └── Mesmo fluxo do Caminho 1, origem diferente

CAMINHO 4 — Via Notificação Push
  Push "⚠ Objetivo 'Apartamento' está atrasado. Quer ver opções?"
  → toque → abre app → Detalhe do objetivo → [Simular cenários]
  └── Ou link direto para o Simulador (deep link)

CAMINHO 5 — Via Check-in
  Check-in mostra objetivo atrasado → Sugestão: "Usar simulador"
  → link direto → Simulador do objetivo
  └── ← Voltar → retorna para o Check-in
```

**Pré-condição para acessar:** O objetivo precisa ter pelo menos 1 meta com algum progresso (não faz sentido simular cenários para objetivo recém-criado sem dados).

**Comportamento do botão ← Voltar:** Sempre retorna para a tela que originou a abertura do Simulador. Se veio do Detalhe, volta para o Detalhe. Se veio do Dashboard (via Coach), volta para o Dashboard.

### 8.6 Manual passo a passo

#### USAR SIMULADOR

```
PASSO 1 — Acessar (ver seção 8.5 para todos os caminhos)
├── Caminho mais comum: Detalhe do Objetivo → botão "Simular cenários"
├── Pré-condição: Objetivo tem pelo menos 1 meta com progresso
└── Ação: Sistema inicia análise (loading 2-3 segundos)

PASSO 2 — Análise IA
├── Sistema coleta dados:
│   ├── Orçamento e gastos dos últimos 3 meses (Finanças)
│   ├── Rendimento dos investimentos (Patrimônio)
│   ├── Salário e projeção de carreira (Carreira)
│   ├── Horas livres na agenda (Tempo)
│   └── Status atual do objetivo e metas
├── IA gera 3 cenários baseados nos dados
├── Cada cenário contém:
│   ├── Título e ícone
│   ├── Descrição do que mudar
│   ├── Novo prazo projetado
│   ├── Esforço necessário (R$/mês ou horas/semana)
│   ├── Impacto na vida (Baixo/Médio/Alto)
│   ├── Categorias específicas para cortar/ajustar
│   └── Jornada: Impacto projetado no Life Score
└── IA marca 1 cenário como "⭐ Recomendado" (menor esforço/maior impacto)

PASSO 3 — Usuário analisa e escolhe
├── UI: 3 cards de cenário com radio de seleção
├── Card selecionado: destaque visual (border + background)
├── Jornada: Cada card mostra "Life Score: 58 → [X] pts em 3 meses"
└── Botão: "Aplicar: [nome do cenário] →"

PASSO 4 — Aplicar cenário
├── Confirmação: "Aplicar '[cenário]'? As seguintes mudanças serão feitas:"
│   ├── "Contribuição: R$ 800 → R$ 1.000/mês"
│   ├── "Envelope 'Apartamento' será atualizado"
│   └── "Prazo projetado: Fev 2029 → Dez 2028"
├── Sistema executa:
│   ├── Atualiza contribuição no objetivo
│   ├── Atualiza envelope vinculado no Finanças
│   ├── Recalcula projeção e marcos
│   ├── Cria milestone tipo 'status_change': "Cenário '[nome]' aplicado"
│   └── Jornada: +30 XP por usar simulador
├── Feedback: Toast "Cenário aplicado! Novo prazo: Dez 2028 ✓"
└── Estado: Detalhe atualizado com novos valores
```

---

## 9. FUT-06: CHECK-IN PERIÓDICO

### 9.1 Objetivo da funcionalidade

Criar momentos recorrentes de reflexão onde o usuário avalia seu progresso, recalibra prioridades e mantém engajamento ativo com seus objetivos. Funciona como uma "reunião de alinhamento" consigo mesmo.

### 9.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-39 | Check-in semanal fica disponível a partir de domingo 00:00 (fuso do usuário) | Sistema calcula baseado em `profiles.timezone` |
| CA-40 | Check-in mensal fica disponível a partir do dia 1 de cada mês, 00:00 | Idem |
| CA-41 | Check-in permanece disponível até ser concluído OU até o próximo ciclo iniciar | Semanal: disponível dom→sáb. Mensal: dia 1→dia 28/30/31 |
| CA-42 | Check-in mostra progresso de cada objetivo desde o último check-in | Delta calculado: `progress_atual - progress_no_ultimo_checkin` |
| CA-43 | Usuário pode pular check-in com 1 toque | Botão "Pular esta semana" / "Pular este mês" |
| CA-44 | Pular NÃO penaliza o usuário, mas quebra streak de check-ins (Jornada) | Streak reseta para 0 |
| CA-45 | FREE: Apenas check-in mensal | Semanal: card borrado + UpgradeModal ao clicar |
| CA-46 | PRO: Semanal + Mensal | Ambos disponíveis |
| CA-47 | Jornada: Check-in concede XP | +10 semanal, +50 mensal |
| CA-48 | Check-in NUNCA bloqueia acesso ao Dashboard ou qualquer funcionalidade | É sempre opcional e dispensável |
| CA-49 | Usuário pode acessar check-in proativamente a qualquer momento | Via menu ou atalho, não apenas quando disponível |
| CA-50 | Se não há objetivos ativos, check-in não aparece | Sem dados = sem revisão |

### 9.3 Resultado esperado

Ao completar o check-in, o usuário sai com: clareza de onde está em cada objetivo, ações concretas para a próxima semana/mês, e sensação de estar no controle. O check-in deve levar no máximo 5 minutos (semanal) ou 10 minutos (mensal).

### 9.4 Quando e onde o check-in é exibido

#### 9.4.1 Janela de disponibilidade

```
CHECK-IN SEMANAL (PRO only)
├── Disponível: Domingo 00:00 → Sábado 23:59 (fuso do usuário)
├── Se concluído: Desaparece até o próximo domingo
├── Se pulado: Desaparece até o próximo domingo
├── Se ignorado (não clicou pular nem concluiu): Continua aparecendo
│   a cada acesso ao módulo Futuro até sábado 23:59
└── Novo ciclo: Próximo domingo 00:00 automaticamente

CHECK-IN MENSAL (FREE + PRO)
├── Disponível: Dia 1, 00:00 → último dia do mês, 23:59
├── Se concluído: Desaparece até o dia 1 do mês seguinte
├── Se pulado: Desaparece até o dia 1 do mês seguinte
├── Se ignorado: Continua aparecendo a cada acesso ao Futuro
│   durante todo o mês, com lembrete discreto a partir do dia 15
└── Novo ciclo: Dia 1 do mês seguinte

SOBREPOSIÇÃO
├── Se semanal E mensal estão disponíveis no mesmo momento
│   (ex: dia 1 cai num domingo):
│   → Mensal tem prioridade, aparece primeiro
│   → Após concluir mensal, semanal aparece na sequência
│   → Ou pode concluir ambos em sequência (opção "Fazer ambos")
└── Nunca mostrar os dois cards simultaneamente (confuso)
```

#### 9.4.2 Pontos de exibição (onde aparece)

```
PONTO 1 — Card no Dashboard do Futuro (PRINCIPAL)
├── Localização: TOPO do conteúdo, antes do Score e dos objetivos
├── Visual: Card destacado com fundo gradient sutil
│   Foco: background rgba(139,92,246,0.08), borda rgba(139,92,246,0.2)
│   Jornada: background com gradient purple, XP prometido visível
├── Conteúdo do card:
│   ├── Ícone: 📋 (Foco) / 🧭 (Jornada)
│   ├── Título: "Revisão semanal disponível" / "Revisão mensal disponível"
│   ├── Subtítulo: "~5 minutos" / "~10 minutos"
│   ├── Jornada: "⚡ Completar vale +10 XP" / "+50 XP"
│   └── Ações: [Iniciar revisão] [Pular esta semana ✕]
├── Comportamento:
│   ├── NÃO é modal — NÃO bloqueia o Dashboard
│   ├── NÃO é sticky — scrolla junto com o conteúdo
│   ├── Pode ser dispensado (botão ✕ ou "Pular")
│   └── Se dismissado, NÃO reaparece naquela sessão
│       (reaparece na próxima vez que abrir o módulo Futuro)
└── Animação: Slide-in sutil de cima ao carregar o Dashboard

PONTO 2 — Notificação Push (se habilitada)
├── Quando: Domingo 09:00 (semanal) / Dia 1, 09:00 (mensal)
├── Título: "📋 Revisão semanal do Futuro"
├── Body: "Como foram seus objetivos esta semana? 5 minutos."
├── Ação ao tocar: Abre o app → módulo Futuro → tela de check-in
├── Configurável: Usuário pode desativar em Config → Notificações → Futuro
└── Frequência: Máximo 1 push por check-in pendente (não repete)

PONTO 3 — Badge numérico na tab "Futuro" (sutil)
├── Quando: Check-in disponível e não concluído
├── Visual: Dot roxo pequeno (6px) no ícone do módulo Futuro na Module Bar
│   Similar ao badge de notificação em apps como WhatsApp
├── Desaparece: Quando check-in é concluído ou pulado
└── NÃO aparece: Na bottom bar mobile (só na Module Bar desktop/tablet)

PONTO 4 — Acesso proativo (a qualquer momento)
├── Onde: Tab "Arquivo" → seção inferior → link "Histórico de revisões"
├── OU: Menu ⋯ no header do módulo → "Fazer revisão agora"
├── Comportamento: Abre a mesma tela de check-in, mas:
│   ├── Se já fez o check-in do período: mostra o último check-in salvo
│   │   com opção "Refazer revisão" (sobrescreve)
│   └── Se não fez: abre normalmente
├── Jornada: XP só é concedido 1 vez por período
│   (refazer não concede XP novamente)
└── Histórico: Todas as revisões passadas ficam acessíveis
    para o usuário ver sua evolução ao longo do tempo
```

#### 9.4.3 Diagrama de estados do check-in

```
┌──────────────────────────────────────────────────────────────┐
│                  CICLO DE VIDA DO CHECK-IN                    │
└──────────────────────────────────────────────────────────────┘

  Domingo 00:00 (ou Dia 1)
         │
         ▼
  ┌──────────────┐
  │  DISPONÍVEL  │ ← Card aparece no Dashboard
  │              │   Push enviado às 09:00
  │              │   Badge no ícone Futuro
  └──────┬───────┘
         │
    ┌────┴─────────────────┐
    │                      │
    ▼                      ▼
┌──────────┐        ┌──────────┐
│ CONCLUÍDO│        │  PULADO  │
│          │        │          │
│ +10 XP   │        │ 0 XP     │
│ Streak++ │        │ Streak=0 │
│          │        │          │
│ Card     │        │ Card     │
│ desaparece│       │ desaparece│
│          │        │          │
│ Salva    │        │ Registra │
│ respostas│        │ skip     │
└──────────┘        └──────────┘
    │                      │
    └────────┬─────────────┘
             │
             ▼
      ┌──────────────┐
      │  AGUARDANDO  │ ← Sem card, sem push
      │  PRÓX. CICLO │   Badge removido
      └──────┬───────┘
             │
             ▼
      Próximo Domingo 00:00
      (ou Dia 1 do mês seguinte)
             │
             ▼
      ┌──────────────┐
      │  DISPONÍVEL  │ ← Novo ciclo inicia
      └──────────────┘


  CENÁRIO: Usuário ignora (não clica nada)
  ┌──────────────┐
  │  DISPONÍVEL  │ ← Card continua aparecendo
  │              │   a cada acesso ao Futuro
  │  (ignorado)  │
  └──────┬───────┘
         │
         ▼ Sábado 23:59 (fim do ciclo)
  ┌──────────────┐
  │   EXPIRADO   │ ← Card desaparece
  │              │   Registra "não realizado"
  │  Streak = 0  │   Sem penalidade além do streak
  └──────────────┘
```

#### 9.4.4 Regras de exibição consolidadas

| Regra | Descrição |
|-------|-----------|
| RN-CI-01 | Check-in NUNCA bloqueia acesso a qualquer funcionalidade do módulo |
| RN-CI-02 | Card aparece APENAS no Dashboard do Futuro, não em outros módulos |
| RN-CI-03 | Se usuário dismissar o card (✕), ele NÃO reaparece naquela sessão de uso |
| RN-CI-04 | Se usuário fechar o app e reabrir, o card reaparece (se check-in ainda pendente) |
| RN-CI-05 | Push notification é enviada UMA VEZ por check-in disponível, às 09:00 local |
| RN-CI-06 | Se usuário não tem nenhum objetivo ativo, check-in NÃO é gerado |
| RN-CI-07 | Se usuário tem apenas 1 objetivo, check-in é simplificado (1 card em vez de múltiplos) |
| RN-CI-08 | Mensal tem prioridade sobre semanal se ambos coincidirem |
| RN-CI-09 | XP é concedido 1 vez por período, mesmo que o usuário refaça a revisão |
| RN-CI-10 | Respostas do check-in ("Sem tempo", "Esqueci") alimentam IA para insights futuros |
| RN-CI-11 | Histórico de check-ins é acessível em Arquivo → "Histórico de revisões" |
| RN-CI-12 | FREE vê card do semanal borrado com cadeado + "PRO" badge — clique abre UpgradeModal |

### 9.5 Modelo de dados do check-in

```sql
-- Tabela sugerida (NÃO existe no schema atual — precisa ser criada)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,        -- Domingo da semana ou Dia 1 do mês
  period_end DATE NOT NULL,          -- Sábado ou último dia do mês
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped', 'expired')),
  completed_at TIMESTAMP,
  
  -- Dados coletados
  objectives_reviewed INTEGER DEFAULT 0,
  objectives_with_progress INTEGER DEFAULT 0,
  score_at_checkin DECIMAL(5,2),     -- Score Futuro no momento do check-in
  score_delta DECIMAL(5,2),          -- Diferença vs check-in anterior
  
  -- Respostas por objetivo (JSON array)
  -- Ex: [{"objective_id":"uuid","delta":2.3,"activity":true,"skip_reason":null},
  --      {"objective_id":"uuid","delta":0,"activity":false,"skip_reason":"no_time"}]
  responses JSONB,
  
  -- Plano gerado (mensal)
  -- Ex: [{"action":"Contribuir R$ 1.000","objective_id":"uuid","accepted":true}]
  action_plan JSONB,
  
  -- XP
  xp_awarded INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, type, period_start)
);

-- Índices
CREATE INDEX checkins_user_type_idx ON checkins(user_id, type, period_start DESC);
```

### 9.6 Manual passo a passo

#### CHECK-IN SEMANAL (5 min) — PRO only

```
PASSO 1 — Acesso
├── AUTOMÁTICO: Ao abrir módulo Futuro quando check-in está disponível
│   ├── Card aparece no topo do Dashboard:
│   │   "📋 Revisão semanal disponível — ~5 minutos"
│   │   [Iniciar revisão]  [Pular ✕]
│   ├── Card NÃO bloqueia o Dashboard — pode scrollar e usar tudo normalmente
│   └── Card desaparece da sessão se clicar ✕ (reaparece na próx abertura)
│
├── PROATIVO: A qualquer momento
│   ├── Menu ⋯ do header → "Fazer revisão agora"
│   └── Arquivo → "Histórico de revisões" → "Fazer nova revisão"
│
├── VIA PUSH: Domingo 09:00 local
│   ├── Notificação: "📋 Revisão semanal — como foram seus objetivos?"
│   └── Tocar → abre app → Futuro → tela de check-in direto
│
└── Ação do usuário: Clica "Iniciar revisão"
    → Abre tela dedicada de check-in (full screen em mobile)

PASSO 2 — Revisão por objetivo (1 card por objetivo ativo)
├── Para cada objetivo:
│   ├── Nome + ícone + progresso atual
│   ├── Delta desde último check-in: "+2.3% esta semana"
│   ├── Atividades da semana (auto-coletadas dos módulos):
│   │   Ex: "💰 Contribuiu R$ 200 para Apartamento ✓"
│   │   Ex: "🧠 Concluiu 2 aulas da trilha React ✓"
│   │   Ex: "✈️ Sem atividade esta semana"
│   └── Pergunta rápida (APENAS para objetivos SEM atividade):
│       "O que impediu?" → [Esqueci] [Sem tempo] [Sem dinheiro] [Mudei prioridade]
├── Resposta é salva em `checkins.responses` como JSON
└── Scroll vertical entre objetivos (não é wizard multi-step)

PASSO 3 — Resumo
├── "Sua semana em números:"
│   ├── Objetivos com progresso: X de Y
│   ├── Score Futuro: [valor] (↑ ou ↓ vs semana passada)
│   └── Sugestão IA: "Foco da próxima semana: [objetivo com mais potencial]"
├── Botão: "Concluir revisão"
└── Jornada: "+10 XP — Check-in semanal concluído 🎉"

PASSO 4 — Sistema registra
├── INSERT em `checkins` com status = 'completed'
├── Salva respostas e score snapshot
├── Se 4 check-ins seguidos → badge "Consistente" (Jornada)
├── Card desaparece do Dashboard
├── Badge desaparece do ícone Futuro
├── Dados alimentam IA para insights melhores
└── Próximo check-in: Domingo seguinte
```

#### CHECK-IN MENSAL (10 min) — FREE + PRO

```
PASSO 1 — Acesso
├── Mesmos pontos do semanal (Dashboard card, push, proativo)
├── Card mensal tem visual diferenciado (maior, mais destaque)
│   "📊 Revisão mensal disponível — ~10 minutos"
│   "Seu mês em retrospectiva e planejamento do próximo"
└── Se coincide com semanal → mensal aparece primeiro

PASSO 2 — Retrospectiva do mês
├── Score Futuro: [valor] vs mês passado
├── Melhor avanço: "[objetivo] (+15%)"
├── Atenção: "[objetivo] (estagnado / atrasado)"
├── Gráfico mini: evolução do score nos últimos 6 meses

PASSO 3 — Revisão por objetivo (mais detalhada que semanal)
├── Para cada objetivo:
│   ├── Progresso: [antes] → [agora] (+X%)
│   ├── Metas: quais avançaram, quais estagnaram
│   ├── Marcos atingidos no mês
│   └── Projeção atualizada: "No ritmo, conclui em [data]"

PASSO 4 — Perguntas estratégicas
├── "Seus prazos ainda fazem sentido?" → [Sim] [Quero ajustar → abre editor]
├── "Quer adicionar um novo objetivo?" → [Sim → wizard] [Não agora]
├── "Algum objetivo perdeu relevância?" → [Sim, qual → sugere pausar] [Não]
└── "Qual sua prioridade para o próximo mês?" → ranking drag & drop

PASSO 5 — Plano do mês
├── Sistema sugere 3 ações concretas baseadas nos dados:
│   Ex: "1. Contribuir R$ 1.000 para Apartamento (atrasado)"
│   Ex: "2. Concluir módulo 3 da trilha React"
│   Ex: "3. Pesquisar bairros — tarefa pendente há 45 dias"
├── Usuário pode aceitar, ajustar ou ignorar cada ação
└── Ações aceitas viram lembretes/tarefas no Tempo

PASSO 6 — Concluir
├── INSERT em `checkins` com status = 'completed' e action_plan
├── "Check-in mensal concluído!"
├── Jornada: "+50 XP"
├── Ações aceitas são criadas como calendar_events no Tempo
└── Próximo check-in mensal: Dia 1 do mês seguinte
```

---

## 10. FUT-07: MAPA DA VIDA (RADAR CHART)

### 10.1 Objetivo da funcionalidade

Visualização radial que mostra o equilíbrio entre todas as 8 dimensões da vida do usuário. Funciona como um diagnóstico visual — áreas fortes (radar expandido) e áreas negligenciadas (radar retraído) ficam imediatamente visíveis.

### 10.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-46 | Radar mostra 8 eixos (1 por módulo ativo) | Módulos inativos são omitidos |
| CA-47 | Valor de cada eixo = score do módulo (0-100) | Cálculo por módulo |
| CA-48 | Disponível apenas para PRO | FREE vê preview borrado + UpgradeModal |
| CA-49 | Modo Jornada only (PRO + Jornada) | Não aparece no Foco |
| CA-50 | Interativo: tocar em eixo mostra detalhes do módulo | Tooltip ou drawer |

### 10.3 Cálculo por eixo

| Módulo | Fórmula do score | Dados utilizados |
|--------|-----------------|------------------|
| Finanças | (% orçamento respeitado × 0.4) + (consistência × 0.3) + (tendência × 0.3) | budgets, transactions |
| Futuro | (% objetivos com progresso no mês × 0.5) + (metas concluídas no trimestre × 0.5) | objectives, objective_goals |
| Corpo | (atividades/semana ÷ meta × 0.3) + (consultas em dia × 0.3) + (peso tracking × 0.2) + (passos × 0.2) | activities, weight_entries, appointments |
| Mente | (horas estudadas ÷ meta × 0.5) + (streak × 0.3) + (trilhas ativas × 0.2) | track_sessions, study_tracks |
| Patrimônio | (aporte realizado ÷ planejado × 0.5) + (diversificação × 0.5) | assets, asset_transactions |
| Carreira | (steps do roadmap em progresso × 0.5) + (habilidades evoluindo × 0.5) | roadmap_steps, skills |
| Tempo | (% eventos concluídos × 0.5) + (consistência de uso × 0.5) | calendar_events |
| Experiências | Impacto via Finanças e Futuro (episódico) | trips |

### 10.4 Manual passo a passo

```
PASSO 1 — Onde: Dashboard do Futuro → card "Mapa da Vida" (Jornada + PRO)
PASSO 2 — UI: Radar chart SVG com 8 eixos
├── Cada eixo rotulado com ícone + nome do módulo + score
├── Área preenchida mostra o "formato" da vida do usuário
├── Cores: gradiente do módulo Futuro (purple→blue)
└── Animação: radar se desenha ao aparecer (1s)
PASSO 3 — Interação: Tocar em eixo
├── Mostra drawer com resumo do módulo:
│   ├── Score: [valor]
│   ├── Tendência: ↑ ou ↓ vs mês passado
│   ├── Sugestão: "Aumentar [ação] melhoraria este eixo"
│   └── Link: "Ir para [módulo] →"
PASSO 4 — Insight IA:
├── "Seu radar está forte em Finanças e Mente, mas Corpo está abaixo de 40%"
├── "Equilibrar Corpo aumentaria seu Life Score em +8 pts"
└── Jornada: "Desbloqueie o badge 'Equilibrado' completando todos os eixos acima de 50%"
```

---

## 11. FUT-08: DASHBOARD E SCORE

### 11.1 Objetivo da funcionalidade

Ser a primeira tela que o usuário vê ao acessar o módulo Futuro. Deve dar uma visão completa e acionável do estado de todos os seus objetivos em 5 segundos de leitura.

### 11.2 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-51 | Score Futuro é exibido em ring circular proeminente | Componente SVG |
| CA-52 | Score atualiza em real-time quando metas mudam | Realtime ou polling ≤ 30s |
| CA-53 | Lista de objetivos ativos ordenada por prioridade | High → Medium → Low |
| CA-54 | Cada card de objetivo mostra mini-preview das metas | "💰 43% · 📈 50% · 💼 20%" |
| CA-55 | AI Card (Foco) / Coach (Jornada) mostra insight contextual | Baseado nos dados reais |
| CA-56 | CTAs: Criar novo + Ver arquivo sempre visíveis | Fixados na parte inferior do content |

### 11.3 Cálculo do Score Futuro

```
Score Futuro = (
  Σ(objetivo.progress × objetivo.priority_weight)
  ÷ Σ(objetivo.priority_weight)
) × fator_consistência

Onde:
  priority_weight = { high: 3, medium: 2, low: 1 }
  fator_consistência = 0.8 a 1.2 (baseado em check-ins e streak)
```

### 11.4 Componentes do Dashboard

```
┌──────────────────────────────────────┐
│ Header: 🎯 Futuro    [badge: 3 ativos] │
├──────────────────────────────────────┤
│ Tabs: Dashboard* | Objetivos | Timeline | Arquivo │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ SCORE RING (58 pts)              │ │
│ │ "2 no prazo · 1 atrasado"       │ │
│ │ [↑ +4 pts] [⚠ 1 atenção]       │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ AI CARD / COACH                  │ │
│ │ "Você economizou R$ 340 a mais"  │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ MAPA DA VIDA (Jornada+PRO only) │ │
│ │ [radar chart das 8 dimensões]    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Objetivos Ativos          [+ Novo]   │
│ ┌──────────────────────────────────┐ │
│ │ 🏠 Comprar apartamento           │ │
│ │ ⚠ Atrasado  43%                  │ │
│ │ 💰 44% · 📈 50%                  │ │  ← mini-preview metas
│ │ ████████░░░░░░░░                 │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ✈️ Viagem Europa                 │ │
│ │ ✓ No prazo  65%                  │ │
│ │ 💰 65%                           │ │
│ │ █████████████░░░                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Criar novo objetivo] [Ver arquivo]  │
└──────────────────────────────────────┘
```

---

## 12. FUT-09: ARQUIVO E CELEBRAÇÃO

### 12.1 Objetivo — Arquivo

Preservar o histórico de objetivos concluídos e pausados, permitindo ao usuário revisitar suas conquistas e retomar objetivos pausados.

### 12.2 Objetivo — Celebração

Criar um momento de reconhecimento emocional quando o usuário conclui um objetivo. A celebração reforça o comportamento positivo e incentiva a criação de novos objetivos (loop de engajamento).

### 12.3 Critérios de aceite

| # | Critério | Validação |
|---|---------|-----------|
| CA-57 | Arquivo mostra total acumulado e número de conclusões | Banner no topo |
| CA-58 | Filtros: Todos / Concluídos / Pausados | Pills funcionais |
| CA-59 | Pausados têm CTAs "Retomar" e "Arquivar" | Botões no card |
| CA-60 | Celebração é modal auto-exibido ao atingir 100% | Overlay não bloqueante |
| CA-61 | Foco: Stats + Life Score boost + Próximos passos | Celebração discreta |
| CA-62 | Jornada: XP explosion + Achievements + Coach celebra | Celebração épica |
| CA-63 | Coach sugere próximo passo (redirecionar recursos) | CTA "Ver próxima missão" |

---

## 13. FUT-10: NOTIFICAÇÕES E ALERTAS

### 13.1 Tipos de notificação

| Notificação | Trigger | Canal | Prioridade |
|-------------|---------|-------|------------|
| Marco próximo | 7 dias antes do marco projetado | Push + In-app | Alta |
| Marco atingido | Progresso ultrapassa threshold | Push + In-app | Alta |
| Meta estagnada | 30 dias sem progresso na meta | In-app | Média |
| Objetivo atrasado | Projeção ultrapassa prazo | Push + In-app | Alta |
| Check-in disponível | Domingo (semanal) / Dia 1 (mensal) | Push | Média |
| Conflito de recursos | Contribuições > 40% da renda | In-app | Média |
| Oportunidade | Sobra no orçamento > R$ 200 | In-app | Baixa |
| Celebração | Objetivo conclui | Modal in-app | Alta |
| Sugestão de vinculação | Novo item em módulo se encaixa em objetivo existente | In-app | Baixa |

### 13.2 Configuração

Usuário pode ativar/desativar cada tipo em Configurações → Notificações → Futuro.

---

## 14. FUT-11: GAMIFICAÇÃO (Modo Jornada)

### 14.1 Sistema de XP

| Ação | XP | Frequência |
|------|-----|-----------|
| Criar objetivo | +50 | Por objetivo |
| Adicionar meta | +20 | Por meta |
| Concluir marco | +80 a +200 | Por marco (varia com tamanho) |
| Concluir meta | +100 | Por meta |
| Concluir objetivo | +200 a +500 | Por objetivo (varia com duração/complexidade) |
| Check-in semanal | +10 | Semanal |
| Check-in mensal | +50 | Mensal |
| Usar simulador | +30 | Por uso |
| Manter streak (diário) | +5 | Por dia |

### 14.2 Níveis

| Nível | Nome | XP mínimo |
|-------|------|-----------|
| 1 | Sonhador | 0 |
| 2 | Planejador | 200 |
| 3 | Construtor | 500 |
| 4 | Estrategista | 1.000 |
| 5 | Arquiteto do Futuro | 2.000 |
| 6 | Mestre do Destino | 4.000 |
| 7 | Lendário | 8.000 |

### 14.3 Badges

| Badge | Critério | XP bônus |
|-------|----------|----------|
| 🎯 Primeiro Sonho | Criar primeiro objetivo | +50 |
| 🏗️ Arquiteto | 3 objetivos ativos simultaneamente | +80 |
| 🛡️ Protetor | Reserva de emergência completa | +150 |
| 📅 Consistente | 6 meses sem pausar nenhum objetivo | +200 |
| 💯 Superador | Atingir >100% de um objetivo | +100 |
| 🌍 Multidimensional | Metas em 4+ módulos diferentes | +120 |
| ⚡ Velocista | Concluir objetivo antes do prazo | +150 |
| 🏆 Volta ao Futuro | 5 objetivos concluídos | +300 |
| 🧭 Equilibrado | Todos os eixos do Mapa da Vida > 50% | +200 |
| 📊 Analista | Usar simulador 5 vezes | +80 |

---

## 15. DIAGRAMA DE INTEGRAÇÕES CROSS-MÓDULO

### 15.1 Diagrama geral

```
                    ┌─────────────────────┐
                    │    🔮 FUTURO         │
                    │  (Cockpit Central)   │
                    │                      │
                    │  Objetivos + Metas   │
                    │  Score + Timeline    │
                    │  Simulador + Radar   │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ 💰 FINANÇAS │     │ 🧠 MENTE    │     │ 💼 CARREIRA │
    │             │     │             │     │             │
    │• Envelope   │     │• Trilha     │     │• Roadmap    │
    │  automático │     │  aprendizado│     │  step       │
    │• Orçamento  │     │• Sessões    │     │• Habilidades│
    │• Gastos     │◄───►│• Biblioteca │◄───►│• Salário    │
    │  (simulador)│     │  (livros)   │     │  (simulador)│
    └─────┬───────┘     └──────┬──────┘     └──────┬──────┘
          │                    │                    │
    ┌─────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ 📈PATRIMÔNIO│     │ 🏃 CORPO    │     │ ✈️EXPERIÊNC.│
    │             │     │             │     │             │
    │• Ativo      │     │• Meta peso  │     │• Viagem     │
    │  carteira   │     │• Hábito     │     │  orçamento  │
    │• Rendimento │     │  exercício  │     │• Roteiro    │
    │• Proventos  │     │• Consultas  │     │  (agenda)   │
    └─────────────┘     └─────────────┘     └──────┬──────┘
                                                   │
                               ┌───────────────────┘
                         ┌─────▼──────┐
                         │ ⏳ TEMPO    │
                         │             │
                         │• Tarefas    │
                         │• Deadlines  │
                         │• Eventos    │
                         │  revisão    │
                         └─────────────┘
```

### 15.2 Tabela detalhada de integrações

| Futuro cria | No módulo | Entidade criada | Sincronização |
|-------------|-----------|-----------------|---------------|
| Meta monetária | 💰 Finanças | Envelope com meta mensal e contribuição automática | Saldo do envelope → current_value da meta |
| Meta de investimento | 📈 Patrimônio | Ativo na carteira para acompanhar ou vincula existente | Valor do ativo → current_value |
| Meta de peso | 🏃 Corpo | Config de tracking de peso (target_weight) | Último weight_entry → current_value |
| Meta de frequência | 🏃 Corpo | Atividade recorrente (4x/semana academia) | Check-ins da semana → current_value |
| Meta de aprendizado | 🧠 Mente | Trilha de aprendizado com módulos | Módulos concluídos → current_value |
| Meta de leitura | 🧠 Mente | Meta de biblioteca (12 livros/ano) | library_items lidos → current_value |
| Meta de carreira | 💼 Carreira | Step no roadmap de carreira | Step concluído → progress = 100% |
| Meta de viagem | ✈️ Experiências | Viagem com orçamento vinculado | Orçamento guardado → current_value |
| Meta tipo tarefa | ⏳ Tempo | Evento/tarefa com deadline no calendário | calendar_event.status → progress (0 ou 100) |
| Meta tipo horas | ⏳ Tempo | Blocos de tempo no calendário | Horas registradas → current_value |

### 15.3 O que outros módulos enviam para o Futuro

| Módulo | Dado enviado | Uso no Futuro |
|--------|-------------|---------------|
| 💰 Finanças | Saldo de envelopes, gastos por categoria, sobra mensal | Progresso de metas monetárias, dados para simulador |
| 📈 Patrimônio | Valor de ativos, rendimento mensal, proventos | Progresso de metas patrimoniais, projeção com rendimentos |
| 🏃 Corpo | Peso atual, frequência de treinos, consultas em dia | Progresso de metas de saúde, score do Mapa da Vida |
| 🧠 Mente | Módulos concluídos, horas estudadas, livros lidos | Progresso de metas de aprendizado |
| 💼 Carreira | Steps do roadmap, salário atual, projeção de aumento | Progresso de metas profissionais, dados para simulador |
| ✈️ Experiências | Orçamento guardado, status da viagem | Progresso de metas de experiência |
| ⏳ Tempo | Status de tarefas, horas registradas | Progresso de metas de prazo/tarefa |

---

## 16. REGRAS DE NEGÓCIO CONSOLIDADAS

| Código | Regra | Módulo |
|--------|-------|--------|
| RN-FUT-01 | Nome do objetivo é único por usuário | Objetivos |
| RN-FUT-02 | Prazo mínimo de 30 dias para novos objetivos | Objetivos |
| RN-FUT-03 | Progresso = média ponderada das metas (weight 0.5-3.0) | Cálculo |
| RN-FUT-04 | Status muda para 'completed' automaticamente quando progress ≥ 100% | Status |
| RN-FUT-05 | Pausar objetivo pausa todas as metas vinculadas | Cascade |
| RN-FUT-06 | Excluir objetivo mantém entidades nos módulos destino | Desvinculação segura |
| RN-FUT-07 | FREE: máximo 3 objetivos ativos | Monetização |
| RN-FUT-08 | FREE: máximo 3 metas por objetivo | Monetização |
| RN-FUT-09 | Marcos automáticos em 25%, 50%, 75%, 100% | Marcos |
| RN-FUT-10 | Simulador usa dados reais de Finanças, Patrimônio e Carreira | Inteligência |
| RN-FUT-11 | Check-in semanal: PRO only. Mensal: FREE + PRO | Periodicidade |
| RN-FUT-12 | Mapa da Vida: PRO + Jornada only | Restrição |
| RN-FUT-13 | Progresso bidirecional requer auto_sync = TRUE | Configuração |
| RN-FUT-14 | Score Futuro = média ponderada por prioridade × fator consistência | Cálculo |
| RN-FUT-15 | Celebração é modal auto-exibido, não tela permanente | UX |
| RN-FUT-16 | Contribuição mensal só se aplica a metas monetárias | Wizard |
| RN-FUT-17 | Conflito de recursos alertado quando contribuições > 40% da renda | Alerta |
| RN-FUT-18 | Meta estagnada = 30 dias sem atualização de progresso | Alerta |
| RN-FUT-19 | XP só é concedido no modo Jornada (PRO) | Gamificação |
| RN-FUT-20 | Simulador FREE mostra 1 cenário, PRO mostra 3 | Monetização |
| RN-FUT-21 | Check-in semanal: disponível dom 00:00 → sáb 23:59 (fuso do usuário) | Check-in |
| RN-FUT-22 | Check-in mensal: disponível dia 1 → último dia do mês | Check-in |
| RN-FUT-23 | Check-in NUNCA bloqueia acesso ao Dashboard ou funcionalidades | Check-in |
| RN-FUT-24 | Card de check-in aparece APENAS no Dashboard do Futuro | Check-in |
| RN-FUT-25 | Se dismissado (✕), card NÃO reaparece naquela sessão de uso | Check-in |
| RN-FUT-26 | Push notification enviada 1 vez por check-in, às 09:00 local | Check-in |
| RN-FUT-27 | Se sem objetivos ativos, check-in NÃO é gerado | Check-in |
| RN-FUT-28 | Mensal tem prioridade sobre semanal se coincidirem | Check-in |
| RN-FUT-29 | XP de check-in concedido 1 vez por período (refazer não duplica) | Check-in |
| RN-FUT-30 | Pular check-in reseta streak de check-ins para 0 | Check-in |
| RN-FUT-31 | Respostas do check-in alimentam IA para insights futuros | Inteligência |
| RN-FUT-32 | Histórico de check-ins acessível em Arquivo → Histórico de revisões | Check-in |

---

## 17. ARQUITETURA DE NAVEGAÇÃO

### 17.1 Sitemap completo

```
MÓDULO FUTURO
│
├── TAB 1: DASHBOARD ← tela inicial ao entrar no módulo
│   ├── [Card Check-in] → Check-in Semanal/Mensal
│   ├── [Score Ring] → informativo
│   ├── [Mapa da Vida] → toque no eixo abre drawer (Jornada+PRO)
│   ├── [AI Card / Coach CTA] → Simulador do objetivo sugerido
│   ├── [Card de Objetivo] → Detalhe do Objetivo
│   ├── [Botão "+ Novo"] → Wizard Step 1
│   └── [Botão "Ver arquivo"] → Tab Arquivo
│
├── TAB 2: OBJETIVOS (lista filtrável)
│   ├── [Filtros: Todos/Ativos/Concluídos/Pausados]
│   ├── [Card de Objetivo] → Detalhe do Objetivo
│   └── [FAB +] → Wizard Step 1
│
├── TAB 3: TIMELINE (visão cronológica)
│   ├── [Filtros por objetivo]
│   └── [Marco] → Detalhe do Objetivo correspondente
│
├── TAB 4: ARQUIVO (concluídos + pausados)
│   ├── [Card concluído] → Detalhe (modo leitura)
│   ├── [Card pausado → "Retomar"] → reativa, volta Dashboard
│   ├── [Card pausado → "Arquivar"] → confirmação, remove
│   └── ["Histórico de revisões"] → Histórico Check-ins
│
├── SUB-TELA: DETALHE DO OBJETIVO
│   ├── [← Voltar] → tela de origem
│   ├── [Seção Metas → "+ Meta"] → Modal Adicionar Meta
│   ├── [Meta → ✏️] → Modal Editar Meta
│   ├── [Meta → "Ver no Finanças →"] → deep link módulo destino
│   ├── [Simular cenários] → Simulador IA
│   ├── [Editar] → Editar Objetivo
│   └── [Menu ⋯] → Pausar / Concluir / Excluir
│
├── SUB-TELA: WIZARD (4 steps)
│   ├── Step 1: Tipo → Step 2: Nome/prazo → Step 3: Metas → Step 4: Contribuição
│   ├── [✕ Fechar] → confirmação → Dashboard
│   └── [Criar objetivo] → confirma → Dashboard com novo objetivo
│
├── SUB-TELA: SIMULADOR IA
│   ├── [← Voltar] → tela de origem (Detalhe ou Dashboard)
│   └── [Aplicar cenário] → confirmação → Detalhe atualizado
│
├── SUB-TELA: EDITAR OBJETIVO
│   ├── [Salvar] → Detalhe atualizado
│   └── [Excluir] → confirmação dupla → Dashboard
│
├── SUB-TELA: CHECK-IN SEMANAL/MENSAL
│   ├── [Concluir] → Dashboard (card removido, +XP)
│   └── [Pular] → Dashboard (card removido, streak=0)
│
├── MODAL: ADICIONAR META → [Adicionar] → fecha, Detalhe atualiza
├── MODAL: EDITAR META → [Salvar] → atualiza · [Remover] → confirmação
├── MODAL: CELEBRAÇÃO (auto) → [Criar novo] → Wizard · [Fechar] → Dashboard
└── SUB-TELA: HISTÓRICO CHECK-INS → lista + [Fazer revisão]
```

### 17.2 Caminhos de acesso por funcionalidade

| Funcionalidade | Caminhos de acesso | Tela destino |
|---|---|---|
| Criar objetivo | Dashboard [+ Novo] · Objetivos [+] · FAB | Wizard Step 1 |
| Ver detalhe | Clique em card (Dashboard, Objetivos, Timeline, Arquivo) | Detalhe |
| Adicionar meta | Detalhe → [+ Meta] | Modal sobre Detalhe |
| Editar meta | Detalhe → meta → ✏️ | Modal sobre Detalhe |
| Ir ao módulo da meta | Detalhe → meta → "Ver no [módulo] →" | Módulo destino |
| Simular cenários | Detalhe [Simular] · Coach CTA · Push · Check-in link | Simulador |
| Editar objetivo | Detalhe → [Editar] | Editar Objetivo |
| Pausar/Concluir/Excluir | Detalhe → menu ⋯ | Ações no Detalhe |
| Retomar pausado | Arquivo → card → [Retomar] | Arquivo (ação) |
| Check-in | Dashboard card · Push · Menu ⋯ · Arquivo link | Check-in |
| Ver histórico revisões | Arquivo → "Histórico de revisões" | Histórico |

### 17.3 Fluxos principais

```
CRIAR: [+ Novo] → Step 1 → Step 2 → Step 3 (metas) → Step 4 (contribuição) → Dashboard
SIMULAR: Card → Detalhe → [Simular] → 3 cenários → [Aplicar] → Detalhe atualizado
META: Card → Detalhe → [+ Meta] → Modal (módulo+tipo+valor) → [Adicionar] → Detalhe atualizado
CROSS: Detalhe → Meta → [Ver no Finanças →] → Finanças · Envelope "Apartamento"
CHECK-IN: Dashboard card → Revisão por objetivo → Resumo → [Concluir] → +XP → Dashboard
```

---

## 18. ÍNDICE DE PROTÓTIPOS

| Arquivo | Telas | Phones | Status |
|---------|-------|--------|--------|
| `proto-futuro-v2-parte1.html` | Dashboard + Tab Objetivos + Detalhe com metas | 6 | A gerar |
| `proto-futuro-v2-parte2.html` | Wizard Step 1 + Wizard Step 3 + Simulador IA | 6 | ✅ Pronto |
| `proto-futuro-v2-parte3.html` | Timeline + Check-in Semanal + Arquivo/Celebração | 6 | ✅ Pronto |
| `proto-futuro-v2-parte4.html` | Wizard Step 2 + Wizard Step 4 + Modal Adicionar Meta | 6 | A gerar |
| `proto-futuro-v2-parte5.html` | Editar Objetivo + Check-in Mensal + Modal Editar Meta | 6 | A gerar |
| **TOTAL** | **15 telas × 2 modos** | **30 phones** | |

**Cobertura de funcionalidades:**

| # | Tela | Parte |
|---|------|-------|
| 1 | Dashboard (score + radar + cards com preview metas) | Parte 1 |
| 2 | Tab Objetivos (lista filtrável) | Parte 1 |
| 3 | Detalhe (hero + metas individuais + marcos) | Parte 1 |
| 4 | Wizard Step 1 (tipo de objetivo) | Parte 2 ✅ |
| 5 | Wizard Step 3 (metas por módulo) ★ | Parte 2 ✅ |
| 6 | Simulador IA (3 cenários) | Parte 2 ✅ |
| 7 | Timeline (visão cronológica) | Parte 3 ✅ |
| 8 | Check-in Semanal | Parte 3 ✅ |
| 9 | Arquivo + Celebração | Parte 3 ✅ |
| 10 | Wizard Step 2 (nome/prazo/descrição) | Parte 4 |
| 11 | Wizard Step 4 (contribuição/projeção) | Parte 4 |
| 12 | Modal: Adicionar Meta | Parte 4 |
| 13 | Editar Objetivo | Parte 5 |
| 14 | Check-in Mensal | Parte 5 |
| 15 | Modal: Editar Meta | Parte 5 |

---

*Documento criado em: 06/03/2026*  
*Atualizado em: 07/03/2026 — Seções 18 (Navegação) e 19 (Protótipos) adicionadas*  
*Versão: 1.1*  
*Referências: ADR-001, MVP-V3-ESPECIFICACAO-COMPLETA-V2, migrations 005/007/008*
