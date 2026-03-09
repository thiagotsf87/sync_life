# PROMPT — Implementação do Módulo Futuro
## Para execução pelo Claude Code

**Data:** 07/03/2026  
**Módulo:** 🔮 Futuro (Cockpit de Vida)  
**Prioridade:** Máxima — módulo que conecta todos os outros

---

## INSTRUÇÃO PRINCIPAL

Você vai implementar o módulo **Futuro** do SyncLife. Antes de escrever qualquer código:

1. **Leia o CLAUDE.md** na raiz do projeto — ele define stack, convenções e design system
2. **Leia o DOC-FUNCIONAL-FUTURO-COMPLETO.md** — ele contém TODAS as 19 seções de especificação: funcionalidades, critérios de aceite, manuais passo a passo, modelo de dados, regras de negócio (RN-FUT-01 a RN-FUT-32), navegação e índice de protótipos
3. **Abra os 5 protótipos HTML** no browser para referência visual:
   - `proto-futuro-v2-parte1.html` — Dashboard, Tab Objetivos, Detalhe com metas
   - `proto-futuro-v2-parte2.html` — Wizard Step 1, Wizard Step 3 (metas por módulo), Simulador IA
   - `proto-futuro-v2-parte3.html` — Timeline, Check-in Semanal, Arquivo/Celebração
   - `proto-futuro-v2-parte4.html` — Wizard Step 2, Wizard Step 4 (contribuição), Modal Adicionar Meta
   - `proto-futuro-v2-parte5.html` — Editar Objetivo, Check-in Mensal, Modal Editar Meta
4. **Leia as migrations existentes** em `web/supabase/migrations/`:
   - `005_fase6_infra_v3.sql` — tabelas `objectives`, `objective_goals`, `objective_milestones`
   - `007_futuro_migracao.sql` — migração goals v2 → objectives v3
   - `008_link_objectives.sql` — vínculos com tracks/roadmaps

Somente depois de ler tudo, planeje e execute.

---

## STACK (confirmar no CLAUDE.md)

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| UI | React 19 + shadcn/ui (new-york) |
| Estilo | Tailwind CSS v4 |
| Ícones | lucide-react |
| Forms | react-hook-form + zod |
| Backend | Supabase (SSR) |
| Gráficos | recharts |
| Estado | zustand |
| Testes | Playwright |

---

## ESTRUTURA DE PASTAS A CRIAR

```
web/src/
├── app/(dashboard)/futuro/
│   ├── layout.tsx              ← Layout do módulo com tabs
│   ├── page.tsx                ← Tab Dashboard (tela inicial)
│   ├── objetivos/
│   │   └── page.tsx            ← Tab Objetivos (lista filtrável)
│   ├── timeline/
│   │   └── page.tsx            ← Tab Timeline
│   ├── arquivo/
│   │   └── page.tsx            ← Tab Arquivo
│   ├── novo/
│   │   └── page.tsx            ← Wizard (4 steps)
│   ├── [id]/
│   │   ├── page.tsx            ← Detalhe do Objetivo
│   │   ├── editar/
│   │   │   └── page.tsx        ← Editar Objetivo
│   │   └── simulador/
│   │       └── page.tsx        ← Simulador IA
│   └── checkin/
│       └── page.tsx            ← Check-in Semanal/Mensal
│
├── components/futuro/
│   ├── score-ring.tsx          ← Ring SVG do score
│   ├── mapa-vida.tsx           ← Radar chart (recharts)
│   ├── objetivo-card.tsx       ← Card do objetivo com mini-preview metas
│   ├── meta-item.tsx           ← Item de meta com progresso e deep link
│   ├── meta-form-modal.tsx     ← Modal adicionar/editar meta
│   ├── milestone-timeline.tsx  ← Timeline vertical de marcos
│   ├── cenario-card.tsx        ← Card de cenário do simulador
│   ├── checkin-objetivo.tsx    ← Card de revisão por objetivo
│   ├── wizard-steps.tsx        ← Stepper visual do wizard
│   ├── tipo-grid.tsx           ← Grid de tipos de objetivo (step 1)
│   ├── meta-builder.tsx        ← Builder de metas por módulo (step 3)
│   ├── contribuicao-slider.tsx ← Slider + projeção (step 4)
│   ├── celebracao-modal.tsx    ← Modal de celebração
│   └── ai-insight-card.tsx     ← Card de insight IA / Coach
│
├── hooks/
│   ├── use-objectives.ts       ← CRUD de objetivos
│   ├── use-objective-goals.ts  ← CRUD de metas
│   ├── use-milestones.ts       ← CRUD de marcos
│   ├── use-score-futuro.ts     ← Cálculo do score
│   ├── use-checkin.ts          ← Lógica de check-in
│   └── use-simulador.ts       ← Lógica do simulador IA
│
├── lib/futuro/
│   ├── types.ts                ← Interfaces TypeScript (Objective, Goal, etc.)
│   ├── schemas.ts              ← Schemas zod para validação
│   ├── constants.ts            ← Categorias, tipos de indicador, limites FREE/PRO
│   ├── calculos.ts             ← Funções de cálculo (progresso, score, projeção)
│   └── actions.ts              ← Server actions (create, update, delete)
│
└── e2e/
    └── futuro/
        ├── dashboard.spec.ts
        ├── criar-objetivo.spec.ts
        ├── detalhe-metas.spec.ts
        ├── simulador.spec.ts
        ├── checkin.spec.ts
        └── arquivo.spec.ts
```

---

## PLANO DE IMPLEMENTAÇÃO — 8 FASES

Execute cada fase na ordem. Cada fase deve compilar e passar nos testes da fase anterior antes de avançar.

### FASE 1 — Tipos, schemas e constantes (estimativa: 1h)

```
1.1  Criar lib/futuro/types.ts com interfaces:
     - Objective (mapeia tabela objectives)
     - ObjectiveGoal (mapeia tabela objective_goals)
     - ObjectiveMilestone (mapeia tabela objective_milestones)
     - ObjectiveCategory ('financial' | 'health' | 'professional' | 'educational' | 'experience' | 'personal' | 'other')
     - IndicatorType ('monetary' | 'weight' | 'task' | 'frequency' | 'percentage' | 'quantity' | 'linked')
     - TargetModule ('financas' | 'tempo' | 'corpo' | 'mente' | 'patrimonio' | 'carreira' | 'experiencias')
     - CheckinType, CheckinStatus
     
1.2  Criar lib/futuro/schemas.ts com schemas zod:
     - objectiveSchema (validação do wizard)
     - goalSchema (validação do modal de meta)
     - checkinResponseSchema
     
1.3  Criar lib/futuro/constants.ts:
     - CATEGORY_CONFIG: { icon, label, labelJornada, color } por categoria
     - MODULE_CONFIG: { icon, label, color, indicatorTypes[] } por módulo
     - LIMITS: { FREE: { maxObjectives: 3, maxGoalsPerObjective: 3, maxScenarios: 1 }, PRO: { ... } }
     - MILESTONE_THRESHOLDS: [25, 50, 75, 100]
     
1.4  Criar lib/futuro/calculos.ts:
     - calcProgress(goals: ObjectiveGoal[]): number
       → Σ(goal.progress × goal.weight) / Σ(goal.weight)
     - calcScoreFuturo(objectives: Objective[]): number
       → média ponderada por prioridade × fator consistência
     - calcProjecao(targetValue, currentValue, monthlyContribution, monthlyReturn): Date
     - calcMetaProgress(goal: ObjectiveGoal): number
       → Lógica por indicator_type (ver DOC-FUNCIONAL seção 5.3)
```

**Teste de validação:** Criar unit tests para cada função de cálculo em `calculos.test.ts`.

### FASE 2 — Server actions e hooks de dados (estimativa: 2h)

```
2.1  Criar lib/futuro/actions.ts com server actions:
     - createObjective(data) → INSERT objectives + objective_goals + milestones automáticos
       IMPORTANTE: Também cria entidades nos módulos destino (ver DOC-FUNCIONAL seção 4.4 passo 6)
     - updateObjective(id, data) → UPDATE objectives
     - pauseObjective(id) → UPDATE status='paused' + cascade para goals
     - resumeObjective(id, newDate?) → UPDATE status='active' + reativa goals
     - completeObjective(id) → UPDATE status='completed' + completed_at
     - deleteObjective(id) → Desvincular goals (NOT delete entidades dos módulos)
     - addGoal(objectiveId, data) → INSERT objective_goals + criar entidade no módulo
     - updateGoal(id, data) → UPDATE objective_goals
     - removeGoal(id, keepEntity: boolean) → DELETE/desvincular
     - recordCheckin(data) → INSERT checkins
     
2.2  Criar hooks:
     - useObjectives() → lista com filtros (status, category)
     - useObjective(id) → detalhe com goals e milestones
     - useScoreFuturo() → score calculado
     - useCheckin() → lógica de disponibilidade e submit
     
2.3  Verificar tabela checkins:
     Se NÃO existir no schema, criar migration:
     → Ver DOC-FUNCIONAL seção 9.5 para o CREATE TABLE completo
```

**Teste de validação:** Verificar que `createObjective` com 4 metas cria 4 registros em `objective_goals` e os marcos automáticos em `objective_milestones`.

### FASE 3 — Layout e navegação do módulo (estimativa: 2h)

```
3.1  Criar app/(dashboard)/futuro/layout.tsx:
     - Header do módulo com ícone e badge
       Foco: "🎯 Futuro" + badge "[N] ativos"
       Jornada: "✦ [nível]" + badge "[XP] XP"
     - Tabs: Dashboard | Objetivos | Timeline | Arquivo
       Jornada: Dashboard | Missões | Timeline | Arquivo
     - Usar componente <Tabs> do shadcn/ui
     - Active tab com borda var(--color-fut) = #8b5cf6
     
3.2  Criar page.tsx (Dashboard) com estrutura:
     - [Card Check-in] (condicional — ver RN-CI-01 a RN-CI-12)
     - [Score Ring] (componente score-ring.tsx)
     - [Mapa da Vida] (condicional — Jornada + PRO only)
     - [AI Insight Card / Coach]
     - [Lista de objetivos com mini-preview]
     - [CTAs: Criar novo + Ver arquivo]
     
3.3  Validar layout vs protótipo:
     ABRIR proto-futuro-v2-parte1.html no browser e comparar:
     - Espaçamentos (padding 16px 20px no content)
     - Cores (--fut: #8b5cf6, backgrounds var(--s1) = #07112b)
     - Tipografia (Syne 17px bold para título, DM Sans 12px para body)
     - Border radius (16px para cards, 48px para phone)
     - Score ring: SVG com stroke-dasharray proporcional
```

**Teste de validação:** Navegar entre as 4 tabs. Verificar que a URL muda corretamente. Verificar que o header mostra modo Foco vs Jornada.

### FASE 4 — Telas de CRUD (estimativa: 4h)

```
4.1  Wizard de criação (app/(dashboard)/futuro/novo/page.tsx):
     REFERÊNCIA: proto-futuro-v2-parte2.html (Step 1 e 3) + parte4.html (Step 2 e 4)
     
     Step 1 — Tipo de objetivo
     - Grid 2×3 com categorias (ver constants.ts CATEGORY_CONFIG)
     - Seleção radio (1 ativo)
     - Jornada: Tags de missão + XP preview
     
     Step 2 — Nome, prazo, descrição
     - Emoji picker (grid de emojis por categoria)
     - Input nome (max 100, obrigatório)
     - Textarea descrição (max 500, opcional)
     - Date picker prazo (mínimo hoje + 30 dias)
     - Select prioridade (Alta/Média/Baixa)
     
     Step 3 — Metas por módulo ★ (TELA MAIS CRÍTICA)
     REFERÊNCIA VISUAL: proto-futuro-v2-parte2.html, tela 5
     - Lista de metas (começa vazia)
     - Botão "+ Adicionar meta" abre inline ou modal:
       → Select módulo destino (7 opções com ícone)
       → Select tipo medição (filtrado pelo módulo — ver DOC-FUNCIONAL seção 5.3)
       → Input valor alvo (numérico)
       → Input valor inicial (opcional)
       → Select peso (0.5 a 3.0)
     - Preview: "✨ Será criado: [entidade] no [módulo] automaticamente"
     - Validação: mínimo 1 meta. FREE: máximo 3.
     
     Step 4 — Contribuição (condicional)
     REFERÊNCIA VISUAL: proto-futuro-v2-parte4.html, tela 11
     - Exibido APENAS se há meta monetária (Finanças ou Patrimônio)
     - Slider R$ 100 – R$ 10.000
     - Projeção automática: prazo, total com rendimento, % da renda
     - Toggles de módulos aliados
     - Jornada: XP mensal estimado + impacto no Life Score
     
     Confirmação:
     - Salvar via createObjective() (server action)
     - Redirecionar para Dashboard com toast
     - Jornada: +50 XP + animação
     
4.2  Detalhe do Objetivo (app/(dashboard)/futuro/[id]/page.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte1.html, tela 3
     
     - Hero card: ícone, nome, status badge, KPIs (ring + 4 métricas)
     - Seção "Metas deste objetivo" com lista de meta-item.tsx:
       → Ícone do módulo + nome + "Finanças · Envelope automático"
       → Progresso % com mini bar
       → Link "Ver no Finanças →" (deep link para o módulo)
       → Botão [+ Meta] abre meta-form-modal.tsx
     - Seção "Marcos" com milestone-timeline.tsx
     - CTAs: [Simular cenários] [Editar]
     - Menu ⋯: Pausar | Concluir manualmente | Excluir
     
4.3  Editar Objetivo (app/(dashboard)/futuro/[id]/editar/page.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte5.html, tela 13
     
     - Campos preenchidos: nome, descrição, prazo, prioridade, contribuição
     - Lista de metas editáveis com botões ✏️ e 🗑
     - Botão "+ Adicionar meta"
     - [Salvar alterações] → updateObjective()
     - Danger Zone: [Excluir objetivo] → confirmação dupla
     
4.4  Modal Adicionar/Editar Meta (components/futuro/meta-form-modal.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte4.html, tela 12 + parte5.html, tela 15
     
     - Usar shadcn/ui Dialog
     - Modo adicionar: campos vazios, botão "Adicionar"
     - Modo editar: campos preenchidos, módulo disabled, botão "Salvar" + "Remover"
     - Ao remover: pergunta "Manter [entidade] no [módulo]?"
```

**Teste de validação (Playwright):**
```
Fluxo: Criar objetivo completo com 3 metas em módulos diferentes
1. Navegar para /futuro
2. Clicar "+ Novo objetivo"
3. Selecionar tipo "Aquisição" → Continuar
4. Preencher nome "Teste E2E", prazo, prioridade → Continuar
5. Adicionar meta Finanças (R$ 50.000) → verificar preview
6. Adicionar meta Mente (5 módulos) → verificar preview
7. Adicionar meta Tempo (tarefa) → verificar preview
8. Continuar → Step 4 → ajustar slider → Criar
9. Verificar: objetivo aparece no Dashboard com 3 mini-pills de metas
10. Clicar no objetivo → verificar 3 metas na seção "Metas deste objetivo"
11. Verificar: cada meta mostra link "Ver no [módulo] →"
```

### FASE 5 — Simulador IA (estimativa: 3h)

```
5.1  Criar app/(dashboard)/futuro/[id]/simulador/page.tsx:
     REFERÊNCIA VISUAL: proto-futuro-v2-parte2.html, tela 6
     
     - Carregar dados: objetivo + metas + dados cross-módulo
     - Chamar IA (Vercel AI SDK + Gemini free tier):
       Prompt: dados do objetivo + gastos (Finanças) + rendimentos (Patrimônio) + salário (Carreira)
       Output: 3 cenários estruturados (JSON)
     - UI: 3 cenário-card.tsx com radio selection
     - Cada cenário: título, descrição, novo prazo, esforço, impacto
     - Jornada: impacto projetado no Life Score
     - Botão [Aplicar] → confirmação → executa mudanças → volta Detalhe
     
5.2  Acessos ao Simulador (ver DOC-FUNCIONAL seção 8.5):
     - Detalhe → botão [Simular cenários]
     - Dashboard → Coach CTA "Ver simulador →"
     - Check-in → link quando objetivo está atrasado
     - Comportamento ← Voltar: retorna à tela de origem
     
5.3  FREE vs PRO:
     - FREE: 1 cenário visível + 2 borrados com cadeado
     - PRO: 3 cenários + badge "⭐ Recomendado" no melhor
```

**Teste de validação:** Acessar simulador de um objetivo. Verificar 3 cenários renderizados. Selecionar cenário. Clicar aplicar. Verificar que valores do objetivo mudaram.

### FASE 6 — Check-in periódico (estimativa: 3h)

```
6.1  Criar app/(dashboard)/futuro/checkin/page.tsx:
     REFERÊNCIA VISUAL: proto-futuro-v2-parte3.html (tela 8, semanal) + parte5.html (tela 14, mensal)
     
     Lógica de disponibilidade (ver DOC-FUNCIONAL seção 9.4):
     - Semanal: dom 00:00 → sáb 23:59 (fuso do usuário). PRO only.
     - Mensal: dia 1 → último dia do mês. FREE + PRO.
     - Se ambos coincidem: mensal primeiro.
     
6.2  Card no Dashboard:
     - Exibido no topo do Dashboard quando check-in está disponível
     - NÃO bloqueia o Dashboard (scrollável)
     - Botão [Iniciar revisão] e [Pular ✕]
     - Se dismissado: não reaparece naquela sessão (reaparece ao reabrir)
     
6.3  Tela de Check-in Semanal (~5 min):
     - Card por objetivo ativo:
       → Nome, progresso, delta desde último check-in
       → Atividades da semana (auto-coletadas dos módulos)
       → Pergunta para objetivos SEM atividade: "O que impediu?"
     - Resumo: objetivos com progresso X de Y, score, sugestão IA
     - [Concluir revisão] → salva checkin → +10 XP (Jornada)
     
6.4  Tela de Check-in Mensal (~10 min):
     - Retrospectiva: score vs mês passado, mini gráfico 6 meses
     - Cards por objetivo (mais detalhado que semanal)
     - Perguntas estratégicas: prazos, novo objetivo, prioridades
     - Plano do mês: 3 ações sugeridas com toggle aceitar/ignorar
     - [Concluir] → salva + cria tarefas aceitas no Tempo → +50 XP
     
6.5  Acessos (ver DOC-FUNCIONAL seção 9.4.2):
     - Dashboard card (automático)
     - Push notification (dom/dia1 às 09:00 — configurar se push habilitado)
     - Menu ⋯ → "Fazer revisão agora" (qualquer momento)
     - Arquivo → "Histórico de revisões" → "Fazer nova revisão"
```

**Teste de validação:**
```
Fluxo: Check-in semanal completo
1. Simular data = domingo
2. Navegar para /futuro → verificar card de check-in no topo
3. Clicar [Iniciar revisão]
4. Verificar: N cards de objetivo com delta e atividades
5. Para objetivo sem atividade: selecionar motivo "Sem tempo"
6. Scroll até resumo → clicar [Concluir revisão]
7. Verificar: volta ao Dashboard, card removido
8. Verificar: registro em tabela checkins com status='completed'
```

### FASE 7 — Timeline + Arquivo + Celebração (estimativa: 2h)

```
7.1  Tab Timeline (app/(dashboard)/futuro/timeline/page.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte3.html, tela 7
     - Filtros por objetivo (pills)
     - Agrupamento por objetivo
     - Marcador "Hoje" na timeline
     - Marcos: concluído (✓) / atual (📍) / futuro (🔒)
     - Jornada: XP em cada marco
     
7.2  Tab Arquivo (app/(dashboard)/futuro/arquivo/page.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte3.html, tela 9
     - Banner com total acumulado e conclusões
     - Filtros: Todos / Concluídos / Pausados
     - Cards com stats (Foco) / XP e badges (Jornada)
     - Pausados: botões [Retomar] [Arquivar]
     - Link "Histórico de revisões" → lista de check-ins passados
     
7.3  Modal Celebração (components/futuro/celebracao-modal.tsx):
     REFERÊNCIA VISUAL: proto-futuro-v2-parte3.html, tela 9 (representação do modal)
     - Auto-exibido quando objective.progress >= 100%
     - Foco: emoji + stats + Life Score boost + CTA
     - Jornada: XP explosion + badges desbloqueados + Coach + CTA
     - Não bloqueante: usuário pode fechar
     - CTAs: [Criar novo objetivo] ou [Fechar]
```

**Teste de validação:** Navegar para Timeline. Verificar marcos agrupados por objetivo. Verificar filtros funcionam. Navegar para Arquivo. Verificar card pausado tem [Retomar].

### FASE 8 — Validação visual e testes E2E finais (estimativa: 3h)

```
8.1  Validação visual por protótipo (OBRIGATÓRIO):
     Para CADA tela implementada, abrir o protótipo lado a lado e verificar:
     
     CHECKLIST POR TELA:
     □ Cores: fundo var(--bg)=#03071a, cards var(--s1)=#07112b, módulo var(--fut)=#8b5cf6
     □ Tipografia: Syne para títulos (font-weight:700-800), DM Sans para body, DM Mono para valores
     □ Espaçamento: padding 16px 20px no content area, gap 10px entre cards
     □ Border radius: 16px para cards, 10px para inputs, 48px para phone shape
     □ Modo Foco: cores sóbrias, labels técnicos ("Objetivos", "Metas", "Score")
     □ Modo Jornada: gradientes purple, labels narrativos ("Missões", "Aliados", "XP")
     □ Score ring: SVG com stroke-dasharray proporcional ao valor
     □ Mini-preview de metas: pills com cor do módulo (💰 44% em verde, 📈 50% em azul)
     □ Deep links: "Ver no Finanças →" com cor var(--fut) / #c4b5fd (Jornada)
     □ Bottom bar: 5 items, FAB central, Futuro tab ativa
     
8.2  Testes responsivos:
     □ 375px (iPhone SE) — mobile-first, sem overflow horizontal
     □ 390px (iPhone 14 Pro) — valores não cortados
     □ 768px (iPad) — layout tablet
     □ 1024px+ (desktop) — layout completo com sidebar
     
8.3  Testes E2E completos (Playwright):
     
     teste-01: Dashboard carrega com score e objetivos
     teste-02: Score ring reflete progresso real
     teste-03: Mapa da Vida aparece APENAS em Jornada + PRO
     teste-04: Card check-in aparece no domingo (semanal) / dia 1 (mensal)
     teste-05: Card check-in NÃO bloqueia o Dashboard
     teste-06: Navegar entre 4 tabs mantém estado
     teste-07: Filtros da tab Objetivos funcionam
     teste-08: Criar objetivo completo (wizard 4 steps)
     teste-09: Wizard Step 3: adicionar 3 metas em módulos diferentes
     teste-10: Wizard Step 3: FREE bloqueia na 4ª meta
     teste-11: Wizard Step 4: slider muda projeção
     teste-12: Detalhe mostra metas individuais com progresso
     teste-13: Deep link "Ver no Finanças →" navega corretamente
     teste-14: Modal adicionar meta: módulo filtra tipos
     teste-15: Modal adicionar meta: preview mostra entidade
     teste-16: Modal editar meta: campos preenchidos + módulo disabled
     teste-17: Remover meta: pergunta sobre entidade vinculada
     teste-18: Simulador gera 3 cenários
     teste-19: Simulador FREE mostra 1 + 2 borrados
     teste-20: Aplicar cenário atualiza valores do objetivo
     teste-21: Check-in semanal: cards por objetivo + delta
     teste-22: Check-in semanal: pergunta para objetivo sem atividade
     teste-23: Check-in mensal: perguntas estratégicas + plano
     teste-24: Check-in mensal: ações aceitas viram tarefas
     teste-25: Timeline: marcos agrupados e filtráveis
     teste-26: Arquivo: banner + filtros + retomar pausado
     teste-27: Celebração: auto-exibe ao atingir 100%
     teste-28: Celebração Jornada: mostra XP + badges
     teste-29: Editar objetivo: campos editáveis + salvar
     teste-30: Excluir objetivo: confirmação dupla + entidades mantidas
     teste-31: Pausar objetivo: cascade para metas
     teste-32: Retomar objetivo: reativa metas + opção ajustar prazo
     teste-33: Modo Foco vs Jornada: componentes condicionais
     teste-34: FREE vs PRO: limites de 3 objetivos e 3 metas
     teste-35: Progresso bidirecional: atualizar envelope → meta atualiza
```

---

## REGRAS DE IMPLEMENTAÇÃO

### Código
1. **TypeScript strict** — sem `any`, props tipadas com `interface`
2. **Server Components por padrão** — `'use client'` só para interatividade
3. **Tailwind classes** — nunca CSS inline. Usar tokens do globals.css
4. **Imports @/** — nunca `../../`
5. **shadcn/ui primeiro** — Dialog, Card, Button, Tabs, Badge, Progress do shadcn
6. **Fontes**: Syne para títulos/scores, DM Mono para valores monetários e %

### Design System
7. **Cor do módulo**: `--color-fut: #8b5cf6` (já deve existir no globals.css)
8. **Foco gradient**: `linear-gradient(135deg, #8b5cf6, #0055ff)`
9. **Jornada gradient**: `linear-gradient(135deg, #8b5cf6, #ec4899)`
10. **Modo Foco vs Jornada**: usar `<ModeVisible mode="jornada">` para componentes exclusivos
11. **FREE vs PRO**: verificar plano do usuário antes de renderizar features PRO

### Navegação
12. **Tabs**: `/futuro` (Dashboard), `/futuro/objetivos`, `/futuro/timeline`, `/futuro/arquivo`
13. **Wizard**: `/futuro/novo` com steps internos (estado local, não URL)
14. **Detalhe**: `/futuro/[id]`
15. **Simulador**: `/futuro/[id]/simulador`
16. **Check-in**: `/futuro/checkin`
17. **← Voltar**: sempre retorna à tela de origem (usar router.back() ou referrer)

### Dados
18. **RLS**: todas as queries filtram por `auth.uid() = user_id`
19. **Progresso bidirecional**: ao atualizar `objective_goals.current_value`, recalcular `objectives.progress`
20. **Marcos automáticos**: criar em 25%, 50%, 75%, 100% ao criar objetivo
21. **Entidades vinculadas**: ao criar meta, criar entidade no módulo destino (envelope, trilha, step, etc.)

---

## CRITÉRIO DE CONCLUSÃO

O módulo Futuro está completo quando:

- [ ] 15 telas implementadas e navegáveis
- [ ] Layout visual confere com os 5 protótipos HTML
- [ ] Modo Foco e Jornada funcionam em todas as telas
- [ ] 35 testes E2E passando no Playwright
- [ ] Zero erros no `npm run build`
- [ ] Zero erros de TypeScript
- [ ] Responsivo: 375px, 390px, 768px, 1024px+
- [ ] Progresso bidirecional testado (módulo → Futuro)

---

*Prompt criado em: 07/03/2026*  
*Documentos de referência: DOC-FUNCIONAL-FUTURO-COMPLETO.md + 5 protótipos HTML*  
*Estimativa total: ~20h de desenvolvimento*
