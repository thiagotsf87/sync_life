-- ============================================================
-- RN-FUT-58: Migração de metas v2 (goals) -> Futuro v3
-- ============================================================
-- Objetivo:
--   - Migrar registros legados de public.goals para:
--       1) public.objectives
--       2) public.objective_goals
--       3) public.objective_milestones
--
-- Características:
--   - Idempotente (pode ser executado mais de uma vez sem duplicar dados).
--   - Não remove dados da v2.
--   - Desativa auto_sync nas metas migradas (sem vínculo cross-module automático).
--
-- Pré-condições:
--   - Tabelas v2 existentes: public.goals
--   - Tabelas v3 existentes: public.objectives, public.objective_goals, public.objective_milestones
--
-- Execução recomendada:
--   1) Rodar em homologação.
--   2) Validar contagens (queries no final).
--   3) Rodar em produção com janela controlada.

BEGIN;

-- 1) Inserir objetivos v3 a partir das metas v2
INSERT INTO public.objectives (
  user_id,
  name,
  description,
  icon,
  category,
  priority,
  target_date,
  target_date_reason,
  status,
  completed_at,
  progress,
  created_at,
  updated_at
)
SELECT
  g.user_id,
  g.name,
  COALESCE(g.description, 'Objetivo migrado automaticamente da tabela goals (v2).'),
  COALESCE(NULLIF(g.icon, ''), '🎯'),
  CASE
    WHEN lower(COALESCE(g.category, '')) IN ('financeiro', 'financas', 'financial', 'dinheiro') THEN 'financial'
    WHEN lower(COALESCE(g.category, '')) IN ('saude', 'health', 'corpo') THEN 'health'
    WHEN lower(COALESCE(g.category, '')) IN ('carreira', 'professional', 'profissional') THEN 'professional'
    WHEN lower(COALESCE(g.category, '')) IN ('educacao', 'educational', 'estudos', 'mente') THEN 'educational'
    WHEN lower(COALESCE(g.category, '')) IN ('experiencias', 'experience', 'viagem', 'viagens') THEN 'experience'
    WHEN lower(COALESCE(g.category, '')) IN ('pessoal', 'personal') THEN 'personal'
    ELSE 'other'
  END,
  'medium',
  g.target_date,
  'Migrado do goals v2',
  CASE
    WHEN g.status IN ('active', 'paused', 'completed', 'archived') THEN g.status
    ELSE 'active'
  END,
  CASE
    WHEN g.status = 'completed' THEN COALESCE(g.completed_at, g.updated_at, g.created_at, NOW())
    ELSE NULL
  END,
  CASE
    WHEN COALESCE(g.target_amount, 0) > 0
      THEN LEAST(100, GREATEST(0, ROUND((COALESCE(g.current_amount, 0) / g.target_amount) * 100)))
    ELSE 0
  END,
  COALESCE(g.created_at, NOW()),
  COALESCE(g.updated_at, NOW())
FROM public.goals g
ON CONFLICT (user_id, name) DO NOTHING;

-- 2) Inserir meta técnica v3 (objective_goals) para cada objetivo migrado
INSERT INTO public.objective_goals (
  objective_id,
  user_id,
  name,
  target_module,
  indicator_type,
  target_value,
  current_value,
  initial_value,
  target_unit,
  weight,
  status,
  progress,
  completed_at,
  last_progress_update,
  auto_sync,
  created_at,
  updated_at
)
SELECT
  o.id,
  g.user_id,
  CONCAT('Migrado v2: ', g.name),
  CASE
    WHEN lower(COALESCE(g.category, '')) IN ('saude', 'health', 'corpo') THEN 'corpo'
    WHEN lower(COALESCE(g.category, '')) IN ('educacao', 'educational', 'estudos', 'mente') THEN 'mente'
    WHEN lower(COALESCE(g.category, '')) IN ('carreira', 'professional', 'profissional') THEN 'carreira'
    WHEN lower(COALESCE(g.category, '')) IN ('experiencias', 'experience', 'viagem', 'viagens') THEN 'experiencias'
    WHEN lower(COALESCE(g.category, '')) IN ('patrimonio', 'investimentos', 'investimento') THEN 'patrimonio'
    WHEN lower(COALESCE(g.category, '')) IN ('agenda', 'tempo') THEN 'tempo'
    ELSE 'financas'
  END,
  CASE
    WHEN g.goal_type = 'habit' THEN 'quantity'
    ELSE 'monetary'
  END,
  CASE
    WHEN COALESCE(g.target_amount, 0) > 0 THEN g.target_amount
    ELSE NULL
  END,
  COALESCE(g.current_amount, 0),
  CASE
    WHEN g.goal_type = 'monetary' THEN 0
    ELSE NULL
  END,
  CASE
    WHEN g.goal_type = 'monetary' THEN 'BRL'
    ELSE NULL
  END,
  1.0,
  CASE
    WHEN g.status = 'completed' THEN 'completed'
    WHEN g.status = 'paused' OR g.status = 'archived' THEN 'paused'
    ELSE 'active'
  END,
  CASE
    WHEN COALESCE(g.target_amount, 0) > 0
      THEN LEAST(100, GREATEST(0, ROUND((COALESCE(g.current_amount, 0) / g.target_amount) * 100)))
    ELSE 0
  END,
  CASE
    WHEN g.status = 'completed' THEN COALESCE(g.completed_at, g.updated_at, g.created_at, NOW())
    ELSE NULL
  END,
  COALESCE(g.updated_at, NOW()),
  FALSE,
  COALESCE(g.created_at, NOW()),
  COALESCE(g.updated_at, NOW())
FROM public.goals g
JOIN public.objectives o
  ON o.user_id = g.user_id
 AND o.name = g.name
LEFT JOIN public.objective_goals og
  ON og.objective_id = o.id
 AND og.name = CONCAT('Migrado v2: ', g.name)
WHERE og.id IS NULL;

-- 3) Marco inicial de migração
INSERT INTO public.objective_milestones (
  objective_id,
  goal_id,
  event_type,
  description,
  progress_snapshot,
  created_at
)
SELECT
  o.id,
  og.id,
  'created',
  CONCAT('Objetivo migrado do goals v2 (goal_id=', g.id, ')'),
  og.progress,
  COALESCE(g.created_at, NOW())
FROM public.goals g
JOIN public.objectives o
  ON o.user_id = g.user_id
 AND o.name = g.name
JOIN public.objective_goals og
  ON og.objective_id = o.id
 AND og.name = CONCAT('Migrado v2: ', g.name)
LEFT JOIN public.objective_milestones om
  ON om.objective_id = o.id
 AND om.goal_id = og.id
 AND om.event_type = 'created'
 AND om.description = CONCAT('Objetivo migrado do goals v2 (goal_id=', g.id, ')')
WHERE om.id IS NULL;

COMMIT;

-- ===========================================
-- Queries de validação (rodar manualmente)
-- ===========================================
-- SELECT COUNT(*) AS goals_v2 FROM public.goals;
-- SELECT COUNT(*) AS objectives_v3_migrados FROM public.objectives WHERE target_date_reason = 'Migrado do goals v2';
-- SELECT COUNT(*) AS objective_goals_v3_migradas FROM public.objective_goals WHERE name LIKE 'Migrado v2:%';
