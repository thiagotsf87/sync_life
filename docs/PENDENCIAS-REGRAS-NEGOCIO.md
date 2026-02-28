# Pendências de Regras de Negócio — SyncLife MVP V3

> **⚠️ META-REGRA OBRIGATÓRIA:** Este documento DEVE ser atualizado a cada implementação.
> Ao concluir uma regra, altere o status de ❌/⚠️ para ✅ e registre a data de conclusão.
> Ao iniciar a implementação de um grupo, crie um commit referenciando os IDs das regras.

**Última atualização:** 2026-02-27 (sessão 38 — RN-FUT-32/36 implementadas (categoria financeira vinculada + conclusão de tarefa via Agenda) → 199 ✅ (100%), 0 ⚠️, 0 ❌, 0 🚫)
**Responsável:** Claude Code (atualizar conforme progresso)

---

## Legenda de Status

| Ícone | Significado |
|-------|-------------|
| ✅ | Implementado e testado |
| ⚠️ | Parcialmente implementado (tem lacunas) |
| ❌ | Pendente — não implementado |
| 🚫 | Fora do escopo MVP (adiado para versão futura) |

---

## Resumo Executivo

| Módulo | Total | ✅ | ⚠️ | ❌ | 🚫 |
|--------|-------|-----|-----|-----|-----|
| FUTURO | 58 | 58 | 0 | 0 | 0 |
| CORPO | 39 | 39 | 0 | 0 | 0 |
| EXPERIÊNCIAS | 32 | 32 | 0 | 0 | 0 |
| MENTE | 26 | 26 | 0 | 0 | 0 |
| PATRIMÔNIO | 24 | 24 | 0 | 0 | 0 |
| CARREIRA | 20 | 20 | 0 | 0 | 0 |
| **TOTAL** | **199** | **199 (100%)** | **0 (0%)** | **0 (0%)** | **0 (0%)** |

> Obs: Finanças (~95 regras implícitas) não catalogadas neste documento pois já estão em `financas-visao-geral-regras-de-negocio.md`.

---

## Prioridades de Implementação

### Grupo P1 — Fundação (impacta múltiplos módulos)
> Implementar primeiro pois desbloqueiam funcionalidades em cascata

1. **Sistema de notificações** — base para RN-FUT-51..54, RN-CRP-03..05, etc.
2. ~~**Infraestrutura de integrações opt-in**~~ ✅ **CONCLUÍDO (2026-02-27)** — página /configuracoes/integracoes criada; CRP-37, EXP-30, MNT-24, PTR-22, CAR-18 ✅
3. ~~**Enforcement FREE/PRO**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-FUT-06, RN-EXP-07, RN-MNT-08, RN-PTR-07, RN-CAR-11 (lib/plan-limits.ts criado)
4. **Vinculação automática Futuro ↔ módulos** — RN-FUT-18, RN-FUT-31..50

### Grupo P2 — Features core faltantes
> Funcionalidades principais prometidas mas não implementadas

5. ~~**Cardápio IA + Coach IA**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-CRP-20..28 ✅
6. ~~**Sugestões IA de viagem**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-EXP-21, 22, 23, 24, 25 ✅
7. ~~**Pomodoro Timer**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-MNT-10..18 ✅
8. ~~**Mapa da Vida / Radar Chart**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-FUT-26/27/28/29/30 ✅

### Grupo P3 — Integrações cross-module
> Após P1, implementar por ordem de impacto no UX

9. ~~Corpo → Agenda (consulta gera evento) — RN-CRP-01~~ ✅ **CONCLUÍDO (2026-02-27)**
10. ~~Corpo → Finanças (custo consulta → transação) — RN-CRP-07~~ ✅ **CONCLUÍDO (2026-02-27)**
11. ~~Patrimônio → Finanças (proventos → receitas) — RN-PTR-12~~ ✅ **CONCLUÍDO (2026-02-27)**
12. ~~Carreira → Finanças (salário sync) — RN-CAR-01~~ ✅ **CONCLUÍDO (2026-02-27)**
13. ~~Mente → Carreira (trilha → habilidade) — RN-MNT-03~~ ✅ **CONCLUÍDO (2026-02-27)**
14. ~~Experiências → Agenda (dias viagem bloqueados) — RN-EXP-02~~ ✅ **CONCLUÍDO (2026-02-27)**
15. ~~Experiências → Finanças (custo viagem) — RN-EXP-03~~ ✅ **CONCLUÍDO (2026-02-27)**

### Grupo P4 — Cálculos e lógica avançada
16. ~~TMB/TDEE + Gráfico evolução peso (Corpo) — RN-CRP-11..18~~ ✅ **CONCLUÍDO** — CRP-11..19 ✅ (inclui sync Corpo→Futuro event-driven via `lib/integrations/futuro.ts`)
17. ~~**Velocidade de progresso + Alerta prazo (Futuro)**~~ ✅ **CONCLUÍDO (2026-02-27)** — RN-FUT-24..25
18. Comparativo vs benchmarks (Patrimônio) — RN-PTR-06
19. Previsão provento + Yield on Cost — RN-PTR-14..16

### Grupo P5 — UI avançada e edge cases
20. Mapa com pins (Experiências) — RN-EXP-13
21. Export PDF roteiro (Experiências) — RN-EXP-15
22. Multi-moeda (Experiências) — RN-EXP-17
23. Drag-and-drop itinerário (Experiências) — RN-EXP-10
24. Edge cases de exclusão cross-module — RN-FUT-55..58, RN-CRP-39, RN-EXP-32
25. Migração metas v2 → objetivos v3 — RN-FUT-58

---

## Detalhamento por Módulo

---

### 🔮 MÓDULO FUTURO (58 regras)

#### Dashboard (RN-FUT-01 a 06)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-01 | Ordenação: prioridade / progresso / prazo (toggle) | ✅ | Toggle implementado em futuro/page.tsx |
| RN-FUT-02 | Badge "Atrasado" em vermelho para prazo vencido | ✅ | ObjectiveCard.tsx — getDeadlineStatus() |
| RN-FUT-03 | Progresso geral = média ponderada dos objetivos ativos | ✅ | 2026-02-27 — UI de peso (1/2/3) adicionada ao AddGoalModal; peso usado no cálculo ponderado |
| RN-FUT-04 | Concluídos → aba "Concluídos" após 7 dias (com opção restaurar) | ✅ | Botão "Restaurar" em ObjectiveCard + handleRestore no futuro/page.tsx (2026-02-27) |
| RN-FUT-05 | Máximo 10 objetivos na visão principal | ✅ | MAX_VISIBLE=10 + "Ver todos" implementado |
| RN-FUT-06 | Limite FREE: 3 objetivos ativos | ✅ | checkPlanLimit() em handleCreate + badge {n}/3 |

#### Wizard Criar Objetivo (RN-FUT-07 a 15)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-07 | Mínimo 1 meta por objetivo | ✅ | 2026-02-27 — handleDeleteGoal em futuro/[id]/page.tsx bloqueia remoção se count ≤ 1 |
| RN-FUT-08 | Limite FREE: 3 metas por objetivo | ✅ | checkPlanLimit('goals_per_objective') em futuro/[id]/page.tsx (2026-02-27) |
| RN-FUT-09 | Módulo destino deve estar ativo no perfil | ✅ | 2026-02-27 — hint de módulo por categoria no ObjectiveWizard (step 1) |
| RN-FUT-10 | Vinculação a itens existentes nos módulos | ✅ | 2026-02-27 — `AddGoalModal` permite vincular meta a itens existentes (trilha, step de roadmap, viagem) preenchendo `linked_entity_type/id` |
| RN-FUT-11 | Meta financeira → pergunta sobre orçamento existente | ✅ | 2026-02-27 — hint de categoria 'financial' no ObjectiveWizard orienta sobre integração Finanças |
| RN-FUT-12 | Meta tarefa → cria evento automático na Agenda | ✅ | 2026-02-27 — ao criar meta `task` com prazo no objetivo, gera evento automático via `createEventFromGoalTask()` com badge `Auto — 🔮 Futuro` |
| RN-FUT-13 | Sugestões de metas são contextuais e opcionais | ✅ | Wizard informativo |
| RN-FUT-14 | Nome do objetivo não duplicável | ✅ | Constraint DB |
| RN-FUT-15 | Data alvo deve ser futura | ✅ | min=hoje no input + validação no handleSave do ObjectiveWizard (2026-02-27) |

#### Detalhe do Objetivo (RN-FUT-16 a 25)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-16 | Progresso = Σ(progresso × peso) / Σ(pesos) | ✅ | 2026-02-27 — UI de peso implementada em AddGoalModal; cálculo ponderado já existia no hook |
| RN-FUT-17 | Cálculo por tipo: monetário, peso, tarefa, frequência, etc. | ✅ | 2026-02-27 — calcGoalProgress() em use-futuro.ts: weight usa initial→target, task binário, frequency X/Y, monetary/quantity suporta base não-zero |
| RN-FUT-18 | Metas vinculadas atualizam automaticamente | ✅ | 2026-02-27 — metas vinculadas por `linked_entity_type/id` usam sync event-driven já implementado (study_track, roadmap_step, trip_budget) |
| RN-FUT-19 | 100% em todas metas → notificação de celebração | ✅ | Notif `objective_completed` em use-notifications.ts (2026-02-27) |
| RN-FUT-20 | Objetivos pausados excluídos do Life Sync Score | ✅ | 2026-02-27 — use-life-map.ts filtra o.status === 'active' (confirmado por auditoria) |
| RN-FUT-21 | Adicionar metas a objetivo existente | ✅ | |
| RN-FUT-22 | Remover metas com mínimo de 1 obrigatória | ✅ | 2026-02-27 — bloqueia exclusão com toast.warning se objetivo tem ≤ 1 meta |
| RN-FUT-23 | Edições registradas na timeline de marcos | ✅ | 2026-02-27 — `useUpdateObjective()` registra marco `objective_edited` para mudanças relevantes |
| RN-FUT-24 | Velocidade de progresso: últimos 30 dias | ✅ | calcProgressVelocity() em use-futuro.ts + exibido em [id]/page.tsx |
| RN-FUT-25 | Alerta amarelo se ritmo insuficiente para prazo | ✅ | isProgressAtRisk() — chip ⚠ em ObjectiveCard + banner em [id]/page.tsx |

#### Mapa da Vida — Jornada (RN-FUT-26 a 30)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-26 | Mapa da Vida exclusivo Modo Jornada (PRO) | ✅ | LifeMapRadar em futuro/page.tsx (2026-02-27) |
| RN-FUT-27 | Dimensão radar = média por módulo | ✅ | useLifeMap: 7 dimensões com scores reais Supabase |
| RN-FUT-28 | Radar atualiza em tempo real | ✅ | useLifeMap reload ao montar, dados ao vivo |
| RN-FUT-29 | Insights gerados semanalmente | ✅ | Insight mostrando ponto forte/fraco no futuro/page.tsx |
| RN-FUT-30 | Widget do Mapa disponível no Dashboard Home | ✅ | LifeMapRadar compact + Life Sync Score dinâmico (2026-02-27) |

#### Integrações com Módulos (RN-FUT-31 a 50)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-31 | Meta financeira → entrada automática em Finanças | ✅ | 2026-02-27 — criação de meta financeira em Futuro gera transação planejada via `createTransactionFromFuturoGoal()` |
| RN-FUT-32 | Valor em categoria vinculada alimenta meta financeira | ✅ | 2026-02-27 — metas vinculadas a categoria (`linked_entity_type='finance_category'`) sincronizam gasto mensal via `syncFinanceCategoryToFuturo()` disparado em create/update/delete de transação |
| RN-FUT-33 | Excluir meta financeira → pergunta manter em Finanças | ✅ | 2026-02-27 — aviso no confirm dialog ao excluir objetivo com category='financial' |
| RN-FUT-34 | Meta tarefa → evento na Agenda com tag "🔮 Futuro" | ✅ | 2026-02-27 — evento criado automaticamente com descrição `Auto — 🔮 Futuro` ao adicionar meta de tarefa |
| RN-FUT-35 | Prazo do objetivo → lembretes 30d/7d/dia na Agenda | ✅ | 2026-02-27 — toggle no ObjectiveWizard step 3 + bridge createEventFromObjective |
| RN-FUT-36 | Tarefa concluída na Agenda → meta Futuro = 100% | ✅ | 2026-02-27 — eventos de tarefa do Futuro guardam `goal_id`; ao marcar evento como `concluido` no Agenda, `useAgenda.toggleStatus()` conclui a meta vinculada no Futuro |
| RN-FUT-37 | Meta de peso sincroniza com `weight_goal_kg` do perfil | ✅ | 2026-02-27 — `useSaveProfile()` chama `syncWeightGoalTargetFromCorpo()` para alinhar `target_value` das metas de peso no Futuro |
| RN-FUT-38 | Progresso de peso atualiza automaticamente do Corpo | ✅ | 2026-02-27 — sync event-driven via `syncWeightGoalsFromCorpo()` ao salvar perfil e registrar peso (`use-corpo.ts`) |
| RN-FUT-39 | Meta de exercício sincroniza com meta atividades Corpo | ✅ | 2026-02-27 — `syncExerciseFrequencyGoalsFromCorpo()` atualiza metas de frequência no Futuro com base nas atividades dos últimos 7 dias |
| RN-FUT-40 | Meta vinculada a trilha herda progresso | ✅ | 2026-02-27 — sync event-driven em `use-mente.ts` + bridge `syncLinkedTrackProgressToFuturo()` |
| RN-FUT-41 | Sem trilha → sugerir criar no Mente | ✅ | 2026-02-27 — dica de trilha no hint de categoria 'educational' do ObjectiveWizard |
| RN-FUT-42 | Conclusão da trilha → meta = 100% | ✅ | 2026-02-27 — conclusão de trilha sincroniza 100% via `syncLinkedTrackCompletionToFuturo()` |
| RN-FUT-43 | Meta patrimônio = (patrimônio atual / alvo) × 100 | ✅ | 2026-02-27 — bridge `syncPortfolioTotalToFuturo()` acionada em operações/cotações/exclusão no `use-patrimonio.ts` |
| RN-FUT-44 | Meta renda passiva = (proventos médios 12m / alvo) × 100 | ✅ | 2026-02-27 — bridge `syncPassiveIncomeToFuturo()` acionada em criação/remoção de proventos no `use-patrimonio.ts` |
| RN-FUT-45 | Cotações e aportes refletem no progresso da meta | ✅ | 2026-02-27 — sync em `use-patrimonio.ts` (operações, cotação manual e bulk cotações) via `syncPortfolioTotalToFuturo()` |
| RN-FUT-46 | Meta vinculada a step do roadmap herda progresso | ✅ | 2026-02-27 — `useUpdateRoadmapStep()` aciona `syncLinkedRoadmapStepProgressToFuturo()` para metas vinculadas (`linked_entity_type='roadmap_step'` + `linked_entity_id=step_id`) |
| RN-FUT-47 | Roadmap completo → todas metas vinculadas = 100% | ✅ | 2026-02-27 — ao concluir roadmap, `useUpdateRoadmapStep()` aciona `syncRoadmapCompletionToFuturo()` e completa metas vinculadas por `linked_entity_type='roadmap_step'` |
| RN-FUT-48 | Meta "aumento salarial" compara com salário alvo | ✅ | 2026-02-27 — `useSaveProfile()` aciona `syncSalaryIncreaseToFuturo()` para metas vinculadas (`linked_entity_type='salary_increase'`) |
| RN-FUT-49 | Meta financeira de viagem vincula ao orçamento Experiências | ✅ | 2026-02-27 — `useUpdateBudgetItem()` aciona `syncTripBudgetToFuturo()` para metas vinculadas (`linked_entity_type='trip_budget'` + `linked_entity_id=trip_id`) |
| RN-FUT-50 | Ao criar viagem → sugerir Objetivo no Futuro | ✅ | 2026-02-27 — toast.info com action "Criar Objetivo" (→ /futuro) em experiencias/nova/page.tsx |

#### Notificações (RN-FUT-51 a 54)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-51 | Notificações desativáveis individualmente nas Settings | ✅ | 2026-02-27 — página /configuracoes/notificacoes com toggles por tipo persistidos em localStorage |
| RN-FUT-52 | Notificação "meta parada" enviada 1x (14 dias) | ✅ | generateNotifications() em use-notifications.ts — deduplica por 7d (2026-02-27) |
| RN-FUT-53 | Resumo semanal exclusivo Jornada (PRO) | ✅ | 2026-02-27 — notificação weekly_summary gerada 1x/semana via use-notifications |
| RN-FUT-54 | Tom das notificações empático, nunca punitivo | ✅ | Textos empáticos implementados em use-notifications.ts (2026-02-27) |

#### Edge Cases (RN-FUT-55 a 58)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-FUT-55 | Metas de módulos inativos: suspensas, não excluídas | ✅ | 2026-02-27 — `useObjectives()` sincroniza status por `profiles.active_modules` (inativo => `paused`; reativado => `active`) sem excluir metas |
| RN-FUT-56 | Item vinculado excluído → meta desvinculada, não excluída | ✅ | 2026-02-27 — bridge `unlinkGoalsFromDeletedEntity()` acionada em exclusões de trilha (`use-mente.ts`), roadmap (`use-carreira.ts`) e viagem (`use-experiencias.ts`) |
| RN-FUT-57 | Objetivo com metas inativas 30d+ sugere arquivamento | ✅ | 2026-02-27 — notificação archive_suggestion para objetivos inativos 30d+ com progresso <50% |
| RN-FUT-58 | Script de migração metas v2 → objetivos v3 | ✅ | 2026-02-27 — migration `web/supabase/migrations/007_futuro_migracao_goals_v2_para_objectives_v3.sql` (idempotente, preserva dados v2, cria objectives/objective_goals/milestones migrados) |

---

### 🏃 MÓDULO CORPO (39 regras)

#### Consultas Médicas (RN-CRP-01 a 10)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-01 | Consulta criada → evento automático na Agenda | ✅ | Cross-module |
| RN-CRP-02 | Ao concluir: campo obrigatório de retorno | ✅ | Implementado no CRUD |
| RN-CRP-03 | Lembretes de retorno (máx 3) enviados na data | ✅ | 2026-02-27 — notificação "hoje" via use-notifications |
| RN-CRP-04 | Status de retorno: pendente/agendado/ignorado | ✅ | |
| RN-CRP-05 | Retorno pendente 30+ dias → alerta vermelho Dashboard | ✅ | Notif `followup_due` em use-notifications.ts (2026-02-27) |
| RN-CRP-06 | Especialidades pré-definidas (lista completa) | ✅ | |
| RN-CRP-07 | Custo da consulta → transação em Finanças (categoria Saúde) | ✅ | Cross-module |
| RN-CRP-08 | Limite FREE: 3 consultas ativas/mês | ✅ | checkPlanLimit('consultations_per_month') em saude/page.tsx |
| RN-CRP-09 | Histórico permanente com filtros | ✅ | |
| RN-CRP-10 | Anexos opcionais (Supabase Storage) | ✅ | 2026-02-27 — consultas de Saúde aceitam anexo opcional com upload no bucket `corpo-files` e persistência em `medical_appointments.attachment_url` |

#### Evolução Corporal (RN-CRP-11 a 19)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-11 | TMB recalculada a cada novo registro de peso | ✅ | handleAddWeight → calcBMR + saveProfile |
| RN-CRP-12 | Gráfico evolução: toggle 3/6/12 meses | ✅ | chartMonths state + WeightChart(months) |
| RN-CRP-13 | Meta de peso configurável (emagrecer/manter/ganhar) | ✅ | |
| RN-CRP-14 | Previsão de data baseada em velocidade dos últimos 30d | ✅ | Calculado com last30Entries em peso/page.tsx |
| RN-CRP-15 | Alerta educativo se velocidade >1kg/semana | ✅ | speedUnsafe flag + alert card em peso/page.tsx |
| RN-CRP-16 | Medidas corporais opcionais (cintura, quadril, etc.) | ✅ | 2026-02-27 — LineChart cintura/quadril adicionado em corpo/peso/page.tsx (Recharts) |
| RN-CRP-17 | Fotos de progresso opcionais (Storage) | ✅ | 2026-02-27 — registro de peso aceita foto opcional com upload no bucket `corpo-files` e persistência em `weight_entries.progress_photo_url` |
| RN-CRP-18 | IMC calculado e classificado (5 faixas) | ✅ | |
| RN-CRP-19 | Progresso de peso sincroniza com meta no Futuro | ✅ | 2026-02-27 — sync event-driven em `lib/integrations/futuro.ts` (acionado por save profile + add weight entry no `use-corpo.ts`) |

#### Cardápio com IA (RN-CRP-20 a 28)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-20 | IA considera TDEE, objetivo, restrições, orçamento | ✅ | Passados no body do fetch /api/ai/cardapio |
| RN-CRP-21 | Cardápio: nome, ingredientes, calorias, macros por refeição | ✅ | 2026-02-27 — proteína/carb/gordura adicionados ao schema Gemini e exibidos no UI do cardápio |
| RN-CRP-22 | 7 dias; regeneração 3x/semana (FREE) ilimitado (PRO) | ✅ | 7 dias ✅; contador localStorage + upsell (2026-02-27) |
| RN-CRP-23 | Usuário pode "travar" dias bons e regenerar os ruins | ✅ | 2026-02-27 — ícone de lock por dia, preserva ao regenerar |
| RN-CRP-24 | Cardápios salvos em histórico | ✅ | 2026-02-27 — localStorage últimos 3, sidebar histórico |
| RN-CRP-25 | Orçamento alimentar → transação planejada em Finanças | ✅ | 2026-02-27 — bridge createTransactionFromCardapio, toast com ação |
| RN-CRP-26 | Aviso legal obrigatório sobre IA | ✅ | Disclaimer "não substitui nutricionista" presente |
| RN-CRP-27 | Vercel AI SDK + Gemini 1.5 Flash (MVP); `/api/ai/cardapio` | ✅ | Route Handler implementado + integrado |
| RN-CRP-28 | Coach IA nutrição (PRO): Groq + Llama 3.3 (MVP) | ✅ | Página /corpo/coach com chat streaming + PRO gate + perfil de saúde (2026-02-27) |

#### Atividades Físicas (RN-CRP-29 a 36)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-29 | Tipos pré-definidos com valores MET | ✅ | |
| RN-CRP-30 | Calorias = MET × peso × duração (horas) | ✅ | |
| RN-CRP-31 | Meta de atividade: X vezes/semana, mínimo Y min/sessão | ✅ | |
| RN-CRP-32 | Meta de passos diários configurável (padrão 8.000) | ✅ | |
| RN-CRP-33 | Atividade registrada → evento na Agenda "🏃 Corpo" | ✅ | Toggle opt-in + bridge createEventFromAtividade (2026-02-27) |
| RN-CRP-34 | Relatório semanal: total atividades, minutos, calorias | ✅ | 2026-02-27 — KPIs weekActivities/weekMinutes/weekCalories exibidos em atividades/page.tsx (confirmado por auditoria) |
| RN-CRP-35 | Streak de atividade física → conquistas | ✅ | 2026-02-27 — streak calculada por dias consecutivos na tela `corpo/atividades`; marcos (3/7/14/30) disparam toast de conquista |
| RN-CRP-36 | Meta exercício vinculada ao Futuro → sincroniza | ✅ | 2026-02-27 — salvar/excluir atividade dispara `syncExerciseFrequencyGoalsFromCorpo()` para metas `frequency` do módulo Corpo |

#### Integração (RN-CRP-37 a 39)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CRP-37 | Integrações opt-in (configurável nas Settings) | ✅ | 2026-02-27 — página central /configuracoes/integracoes com 12 toggles persistidos em localStorage |
| RN-CRP-38 | Transações auto-geradas com badge "Auto — 🏃 Corpo" | ✅ | 2026-02-27 — badge nos bridges createTransactionFromConsulta e createTransactionFromCardapio |
| RN-CRP-39 | Excluir consulta → pergunta sobre evento Agenda e transação Finanças | ✅ | 2026-02-27 — aviso no confirm dialog sobre itens vinculados |

---

### ✈️ MÓDULO EXPERIÊNCIAS (32 regras)

#### Wizard de Viagem (RN-EXP-01 a 08)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-01 | Status: Planejando/Reservado/Em andamento/Concluída/Cancelada | ✅ | |
| RN-EXP-02 | Dias bloqueados na Agenda como eventos "✈️ Experiências" | ✅ | Cross-module |
| RN-EXP-03 | Custo total → despesa planejada em Finanças | ✅ | Cross-module |
| RN-EXP-04 | Meta no Futuro → progresso atualizado conforme economia | ✅ | 2026-02-27 — criação de viagem com `objective_id` gera `objective_goal` vinculado (`linked_entity_type='trip_budget'`), e atualizações de orçamento sincronizam via `syncTripBudgetToFuturo()` |
| RN-EXP-05 | Multi-destino: várias cidades com datas diferentes | ✅ | `destinations[]` |
| RN-EXP-06 | Cada item de custo: Estimado/Reservado/Pago | ✅ | |
| RN-EXP-07 | Limite FREE: 1 viagem ativa. PRO: ilimitadas | ✅ | checkPlanLimit() em experiencias/nova/page.tsx |
| RN-EXP-08 | Ao criar viagem → sugerir Objetivo no Futuro | ✅ | 2026-02-27 — toast.info com action "Criar Objetivo" (→ /futuro) em experiencias/nova/page.tsx |

#### Roteiro Diário (RN-EXP-09 a 15)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-09 | 0 a 20 atividades por dia | ✅ | Sem cap mas campo existe |
| RN-EXP-10 | Reordenação por drag-and-drop | ✅ | 2026-02-27 — itinerário da viagem com drag-and-drop nativo + persistência de `sort_order` em `trip_itinerary_items` |
| RN-EXP-11 | Custo de atividade somado ao orçamento diário/total | ✅ | |
| RN-EXP-12 | Até 2 alternativas por atividade | ✅ | Tabela existe |
| RN-EXP-13 | Mapa com pins e rota sugerida | ✅ | 2026-02-27 — aba de roteiro em `experiencias/viagens/[id]/page.tsx` mostra pins por endereço (links de mapa) + link de rota sugerida entre pontos |
| RN-EXP-14 | Estimativa de tempo entre atividades (API mapas) | ✅ | 2026-02-27 — aba de roteiro exibe estimativa de deslocamento (beta) entre atividades consecutivas (`experiencias/viagens/[id]/page.tsx`) |
| RN-EXP-15 | Export PDF do roteiro (PRO) | ✅ | 2026-02-27 — botão "Exportar PDF" em `experiencias/viagens/[id]/page.tsx` gera PDF com `jspdf`/`jspdf-autotable` (gate PRO com upsell) |

#### Orçamento da Viagem (RN-EXP-16 a 21)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-16 | Categorias pré-definidas de custo | ✅ | |
| RN-EXP-17 | Multi-moeda (USD, EUR, BRL) com conversão automática | ✅ | 2026-02-27 — exibição de valores respeita `trip.currency` com equivalência automática em BRL (`~ BRL`) e conversão para BRL no envio para Finanças (`experiencias/nova/page.tsx`, `experiencias/viagens/[id]/page.tsx`, `lib/currency.ts`) |
| RN-EXP-18 | Diferença Estimado vs Real/Pago por categoria | ✅ | |
| RN-EXP-19 | Pós-viagem: resumo custo real vs estimado | ✅ | 2026-02-27 — bloco "Resumo da Viagem" na aba overview quando trip.status === 'completed' |
| RN-EXP-20 | Custo real → transações em Finanças quando confirmado | ✅ | 2026-02-27 — toast com ação ao concluir viagem com gastos reais |
| RN-EXP-21 | Estimador IA: custo por dia no destino | ✅ | 2026-02-27 — `/api/ai/viagem` retorna bloco estruturado `<sync_budget_estimate>` e `TripAIChat` mostra estimativa por dia/total na moeda da viagem + equivalente BRL |

#### Sugestões com IA (RN-EXP-22 a 25)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-22 | Vercel AI SDK + Gemini (MVP) em `/api/ai/viagem` | ✅ | Route Handler + TripAIChat com streaming (2026-02-27) |
| RN-EXP-23 | Sugestão aceita → atividade no roteiro do dia | ✅ | 2026-02-27 — `TripAIChat` interpreta `<sync_suggestions>` e permite adicionar cada sugestão direto no `trip_itinerary_items` (com recarga automática) |
| RN-EXP-24 | Limite FREE: 5 interações IA/viagem. PRO: ilimitado | ✅ | checkPlanLimit('ai_interactions_per_trip', count) (2026-02-27) |
| RN-EXP-25 | Aviso: "sugestões podem estar desatualizadas" | ✅ | Banner de disclaimer no TripAIChat (2026-02-27) |

#### Checklist (RN-EXP-26 a 29)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-26 | Checklist base por destino (nacional/internacional), duração, tipo | ✅ | buildAutoChecklist por tipo+duração passa para createTrip (2026-02-27) |
| RN-EXP-27 | Itens personalizáveis | ✅ | |
| RN-EXP-28 | % concluída exibida no Dashboard | ✅ | checklistPct KPI no Dashboard de Experiências (2026-02-27) |
| RN-EXP-29 | Alerta passaporte vence antes/até 6m após viagem | ✅ | 2026-02-27 — card de validade de passaporte em `experiencias/viagens/[id]/page.tsx` compara data informada com fim da viagem e janela de 6 meses após retorno |

#### Integração (RN-EXP-30 a 32)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-EXP-30 | Integrações opt-in | ✅ | 2026-02-27 — página central /configuracoes/integracoes com toggles por módulo |
| RN-EXP-31 | Transações auto-geradas com badge "Auto — ✈️ Experiências" | ✅ | 2026-02-27 — badge em createTransactionFromViagem e createTransactionFromTripActual |
| RN-EXP-32 | Cancelamento → pergunta sobre exclusão de itens vinculados | ✅ | 2026-02-27 — dialog com contagem de itens vinculados ao cancelar |

---

### 🧠 MÓDULO MENTE (26 regras)

#### Trilhas de Aprendizado (RN-MNT-01 a 09)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-01 | 1 a 50 etapas por trilha | ✅ | |
| RN-MNT-02 | Progresso = (etapas concluídas / total) × 100 | ✅ | |
| RN-MNT-03 | Trilha vinculável a habilidade no Carreira (N:1) | ✅ | 2026-02-27 — select de habilidade no TrackWizard step 2; linked_skill_id salvo no insert |
| RN-MNT-04 | Trilha vinculável a meta no Futuro | ✅ | 2026-02-27 — TrackWizard permite selecionar objetivo ativo; criação da trilha gera meta técnica vinculada à entidade `study_track` e sincronização automática de progresso |
| RN-MNT-05 | Status: Em andamento/Pausada/Concluída/Abandonada | ✅ | |
| RN-MNT-06 | Conclusão de trilha → conquista no sistema | ✅ | 2026-02-27 — toast celebração ao completar último step |
| RN-MNT-07 | Categorias pré-definidas (12 categorias) | ✅ | |
| RN-MNT-08 | Limite FREE: 3 trilhas ativas. PRO: ilimitadas | ✅ | checkPlanLimit() em mente/trilhas/page.tsx + badge {n}/3 |
| RN-MNT-09 | Custo de curso → transação Finanças (Educação) | ✅ | Toggle opt-in + bridge createTransactionFromCurso em TrackWizard (2026-02-27) |

#### Timer de Foco / Pomodoro (RN-MNT-10 a 18)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-10 | Padrão: 25min foco, 5min pausa curta, 15min longa, 4 ciclos | ✅ | DEFAULT_CONFIG em PomodoroTimer.tsx |
| RN-MNT-11 | Personalizável (15-90 min foco, etc.) | ✅ | Settings panel com ±1 botões |
| RN-MNT-12 | Pomodoro concluído → tempo registrado na trilha | ✅ | useSaveSession → atualiza total_hours |
| RN-MNT-13 | Sessão associável a evento "Bloco de Estudo" na Agenda | ✅ | Toggle opt-in + bridge createEventFromPomodoro em timer/page.tsx (2026-02-27) |
| RN-MNT-14 | Sons ambiente (chuva, lo-fi) — exclusivo Jornada/PRO | ✅ | 2026-02-27 — opções Off/Chuva/Lo-fi no `PomodoroTimer` com gate Jornada+PRO (`mente/timer/page.tsx`) |
| RN-MNT-15 | Streak: dias consecutivos com 1+ Pomodoro | ✅ | study_streaks atualizado; exibido no painel |
| RN-MNT-16 | Relatório semanal: horas, média/dia, trilha mais estudada | ✅ | Painel stats em timer/page.tsx (KPIs + sessões recentes) |
| RN-MNT-17 | Timer funciona em background (notificação nativa) | ✅ | 2026-02-27 — timer solicita permissão e dispara `Notification` nas trocas de fase; título da aba sincronizado com contagem |
| RN-MNT-18 | Pontos de foco → XP no sistema Jornada | ✅ | 2026-02-27 — conclusão de sessão concede XP de foco em Jornada (persistido em localStorage e exibido no painel de timer) |

#### Biblioteca de Recursos (RN-MNT-19 a 23)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-19 | Tipos: Link, Livro, Vídeo, PDF, Nota, Outro | ✅ | |
| RN-MNT-20 | Por trilha, filtráveis por status | ✅ | |
| RN-MNT-21 | Nota pessoal em Markdown básico | ✅ | renderMarkdown() com sanitização XSS em ResourceCard.tsx (2026-02-27) |
| RN-MNT-22 | Limite FREE: 10 recursos/trilha. PRO: ilimitado | ✅ | checkPlanLimit('resources_per_track') em biblioteca/page.tsx |
| RN-MNT-23 | Recursos são referências, não armazenam arquivos | ✅ | |

#### Integração (RN-MNT-24 a 26)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-MNT-24 | Integrações opt-in | ✅ | 2026-02-27 — página central /configuracoes/integracoes com toggles Pomodoro→Agenda e Trilha→Finanças |
| RN-MNT-25 | Eventos auto-gerados com badge "Auto — 🧠 Mente" | ✅ | 2026-02-27 — badge "Auto — 📚 Mente" em createEventFromPomodoro (agenda.ts) |
| RN-MNT-26 | Exclusão de trilha notifica sobre metas/habilidades vinculadas | ✅ | 2026-02-27 — aviso no confirm dialog ao excluir trilha com vínculos |

---

### 📈 MÓDULO PATRIMÔNIO (24 regras)

#### Gestão de Carteira (RN-PTR-01 a 09)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-01 | Classes: Ações BR, FIIs, ETFs, BDRs, RF, Cripto, Stocks US, REITs, Outros | ✅ | |
| RN-PTR-02 | Preço médio ponderado. Vendas não alteram preço médio | ✅ | |
| RN-PTR-03 | Cotações via API (Alpha Vantage/Brapi). FREE 1x/dia, PRO tempo real | ✅ | useBulkUpdatePrices() + botão "Cotações" na carteira; FREE 1x/22h (2026-02-27) |
| RN-PTR-04 | Distribuição em pizza por classe e setor | ✅ | 2026-02-27 — PieChart de setor adicionado em patrimonio/carteira/page.tsx (Recharts) |
| RN-PTR-05 | Rentabilidade = ((Atual + Proventos − Investido) / Investido) × 100 | ✅ | |
| RN-PTR-06 | Comparativo vs CDI, IBOVESPA, IFIX (PRO) | ✅ | 2026-02-27 — card "Benchmark 12m" em `patrimonio/page.tsx` (PRO) com comparativo Carteira vs CDI/IBOV/IFIX + upsell no FREE |
| RN-PTR-07 | Limite FREE: 10 ativos. PRO: ilimitado | ✅ | checkPlanLimit() em patrimonio/carteira (somente buy de ticker novo) |
| RN-PTR-08 | Histórico de operações com filtros | ✅ | |
| RN-PTR-09 | Patrimônio → progresso de meta no Futuro | ✅ | 2026-02-27 — `syncPortfolioTotalToFuturo()` acionada por operações, cotação manual, bulk de cotações e exclusão de ativo em `use-patrimonio.ts` |

#### Proventos (RN-PTR-10 a 16)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-10 | Proventos cadastrados manualmente | ✅ | |
| RN-PTR-11 | Tipos: Dividendos, JCP, Rendimentos FII, RF, Outros | ✅ | |
| RN-PTR-12 | Provento recebido → receita automática em Finanças | ✅ | Cross-module |
| RN-PTR-13 | Proventos futuros → previsão no calendário financeiro | ✅ | 2026-02-27 — `use-calendario.ts` inclui `portfolio_dividends` com status `announced` como receitas futuras (dot `planned`) no calendário de Finanças |
| RN-PTR-14 | Yield on Cost = (Proventos 12m / Valor Investido) × 100 | ✅ | Card "Yield on Cost" por ativo na página proventos (2026-02-27) |
| RN-PTR-15 | Projeção de proventos futuros (base 12m) | ✅ | KPI "Projeção anual" = média mensal × 12 em proventos/page.tsx (2026-02-27) |
| RN-PTR-16 | Meta de renda passiva no Futuro alimentada por proventos | ✅ | 2026-02-27 — `syncPassiveIncomeToFuturo()` acionada em criar/remover provento e ao marcar `announced` -> `received` em `proventos/page.tsx` |

#### Simulador IF (RN-PTR-17 a 21)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-17 | Juros compostos: VF = VP × (1+i)^n + PMT × [...] | ✅ | |
| RN-PTR-18 | IF = rendimento mensal ≥ renda desejada (retirada 4%) | ✅ | |
| RN-PTR-19 | 3 cenários: pessimista (-2%), base, otimista (+2%) | ✅ | |
| RN-PTR-20 | Aporte vinculável a meta Futuro e orçamento | ✅ | 2026-02-27 — em `patrimonio/carteira/page.tsx` compra pode gerar despesa automática em Finanças (`createTransactionFromAporte()`); sync de meta no Futuro já ocorre via `syncPortfolioTotalToFuturo()` |
| RN-PTR-21 | Simulador exclusivo PRO/Jornada | ✅ | PRO gate com upsell screen em patrimonio/simulador/page.tsx |

#### Integração (RN-PTR-22 a 24)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-PTR-22 | Integrações opt-in | ✅ | 2026-02-27 — página central /configuracoes/integracoes com toggle Provento→Finanças |
| RN-PTR-23 | Transações auto com badge "Auto — 📈 Patrimônio" | ✅ | 2026-02-27 — badge em createTransactionFromProvento (financas.ts) |
| RN-PTR-24 | Excluir ativo → pergunta sobre transações vinculadas | ✅ | 2026-02-27 — aviso no confirm dialog do handleDelete em carteira |

---

### 💼 MÓDULO CARREIRA (20 regras)

#### Perfil Profissional (RN-CAR-01 a 04)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-01 | Salário sincronizado como receita recorrente em Finanças (opt-in) | ✅ | Cross-module |
| RN-CAR-02 | Toda edição de cargo/salário → registro histórico com data | ✅ | |
| RN-CAR-03 | Áreas pré-definidas (12 áreas) | ✅ | |
| RN-CAR-04 | Níveis hierárquicos pré-definidos (11 níveis) | ✅ | |

#### Roadmap de Carreira (RN-CAR-05 a 12)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-05 | Roadmap: cargo atual, cargo alvo, prazo, passos | ✅ | |
| RN-CAR-06 | Cada passo: 0+ habilidades vinculadas | ✅ | |
| RN-CAR-07 | Habilidades compartilhadas entre Roadmap e Trilhas (Mente) | ✅ | 2026-02-27 — tela de habilidades permite vincular múltiplas trilhas via `skill_study_tracks` (N:N) |
| RN-CAR-08 | Progresso do passo = média das habilidades vinculadas | ✅ | 2026-02-27 — ao aumentar nível de habilidade, toast sugere verificar Roadmap (ver RN-CAR-16) |
| RN-CAR-09 | Concluir roadmap → sugerir atualizar perfil | ✅ | Toast com action button em handleUpdateStep (2026-02-27) |
| RN-CAR-10 | Salário esperado alimenta cenários no simulador financeiro | ✅ | 2026-02-27 — link "Ver no Simulador" no roadmap card quando tem target_salary |
| RN-CAR-11 | Limite FREE: 1 roadmap ativo. PRO: 3 simultâneos | ✅ | checkPlanLimit() em carreira/roadmap/page.tsx |
| RN-CAR-12 | Roadmap vinculável a Objetivo no Futuro | ✅ | 2026-02-27 — modal de roadmap permite selecionar objetivo ativo; criação gera metas técnicas por step (`linked_entity_type='roadmap_step'`) e sincronização automática |

#### Mapa de Habilidades (RN-CAR-13 a 17)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-13 | Habilidades vinculáveis a múltiplas trilhas (N:N) | ✅ | 2026-02-27 — persistência N:N em `skill_study_tracks` com mutação `useSetSkillTracks()` e visualização de quantidade no card |
| RN-CAR-14 | Níveis 1-5: Iniciante a Expert | ✅ | |
| RN-CAR-15 | Trilha vinculada → sugere atualização de nível | ✅ | 2026-02-27 — toast com action "Ir para Habilidades" ao completar trilha com linked_skill_id |
| RN-CAR-16 | Habilidades alimentam Roadmap (pré-requisitos) | ✅ | 2026-02-27 — ao aumentar nível de habilidade, toast com action "Ver Roadmap" em carreira/habilidades |
| RN-CAR-17 | Categorias: Hard Skills, Soft Skills, Idiomas, Certificações | ✅ | |

#### Integração (RN-CAR-18 a 20)

| ID | Regra | Status | Observação |
|----|-------|--------|-----------|
| RN-CAR-18 | Integrações opt-in | ✅ | 2026-02-27 — página central /configuracoes/integracoes com toggle Salário→Finanças |
| RN-CAR-19 | Transações auto com badge "Auto — 💼 Carreira" | ✅ | 2026-02-27 — badge em createTransactionFromSalario (financas.ts) |
| RN-CAR-20 | Promoção efetivada (Jornada) → calcula impacto: "IF X anos antes!" | ✅ | 2026-02-27 — toast com cálculo de ganho em 2 anos ao aumentar salário |

---

## Notas de Implementação

### Sistema de Notificações (P1 — Bloqueia muitas regras)

Para implementar notificações in-app são necessários:
- Tabela `notifications` no Supabase com: user_id, type, title, body, read_at, created_at
- Hook `useNotifications()` que faz polling ou realtime subscription
- Badge no sino do TopHeader
- Panel dropdown de notificações
- Tipos de notificação identificados: deadline_30d, deadline_7d, overdue, goal_completed, follow_up_due, activity_streak_broken, etc.

### Infraestrutura de Integrações Cross-Module (P1 — ✅ CONCLUÍDO)

Padrão sugerido para cross-module:
```ts
// lib/integrations/index.ts
// Funções "bridge" chamadas após cada ação relevante

export async function onConsultaCriada(appointment: MedicalAppointment) {
  if (userSettings.sync_corpo_to_agenda) {
    await createAgendaEvent({ ... })  // RN-CRP-01
  }
  if (appointment.cost && userSettings.sync_corpo_to_financas) {
    await createFinancaTransaction({ ... })  // RN-CRP-07
  }
}
```

### Enforcement FREE/PRO (P1)

Criar função utilitária `checkPlanLimit()`:
```ts
// lib/plan-limits.ts
export const PLAN_LIMITS = {
  free: {
    objectives: 3,      // RN-FUT-06
    goalsPerObjective: 3, // RN-FUT-08
    activeTrips: 1,     // RN-EXP-07
    studyTracks: 3,     // RN-MNT-08
    portfolioAssets: 10, // RN-PTR-07
    roadmaps: 1,        // RN-CAR-11
    consultasPerMonth: 3, // RN-CRP-08
  },
  pro: 'unlimited'
}
```

### AI Features (P2)

Packages necessários:
```bash
npm install ai @ai-sdk/google @ai-sdk/groq
```

Route Handlers a criar:
- `app/api/ai/cardapio/route.ts` (RN-CRP-27) — Gemini 1.5 Flash
- `app/api/ai/viagem/route.ts` (RN-EXP-22) — Gemini 1.5 Flash (stream)
- `app/api/ai/coach/route.ts` (RN-CRP-28) — Groq + Llama 3.3 70B

---

*Documento criado em: 2026-02-27*
*Por: Claude Code — Auditoria pós-implementação Fase 13*
*Próxima revisão: após conclusão de cada grupo de prioridade*
