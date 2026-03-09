-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013 — Módulo Panorama
-- Tabelas: badges, user_badges, life_sync_scores, user_streaks, weekly_reviews
-- Seed: 33 badges catalogadas
-- ─────────────────────────────────────────────────────────────────────────────

-- ── TABELAS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  icon          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('financial','goals','body','mind','consistency','career')),
  rarity        TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','legendary')),
  points        INTEGER NOT NULL CHECK (points IN (10, 25, 50, 100)),
  criteria_type TEXT NOT NULL,
  criteria_value JSONB NOT NULL DEFAULT '{}',
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS life_sync_scores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score               DECIMAL(5,2) NOT NULL DEFAULT 0,
  financas_score      DECIMAL(5,2),
  futuro_score        DECIMAL(5,2),
  corpo_score         DECIMAL(5,2),
  mente_score         DECIMAL(5,2),
  patrimonio_score    DECIMAL(5,2),
  carreira_score      DECIMAL(5,2),
  tempo_score         DECIMAL(5,2),
  experiencias_score  DECIMAL(5,2),
  recorded_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_date)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_activity_date  DATE,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,
  week_end     DATE NOT NULL,
  data         JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  shared       BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ── ÍNDICES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_badges_user   ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge  ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_life_sync_scores_user_date ON life_sync_scores(user_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user  ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user ON weekly_reviews(user_id, week_start DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE badges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_sync_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews  ENABLE ROW LEVEL SECURITY;

-- badges: leitura pública
CREATE POLICY "badges_public_read"
  ON badges FOR SELECT USING (TRUE);

-- user_badges: usuário vê/modifica apenas os próprios
CREATE POLICY "user_badges_select"
  ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert"
  ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- life_sync_scores: usuário vê/modifica apenas os próprios
CREATE POLICY "life_sync_scores_select"
  ON life_sync_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "life_sync_scores_upsert"
  ON life_sync_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "life_sync_scores_update"
  ON life_sync_scores FOR UPDATE USING (auth.uid() = user_id);

-- user_streaks: usuário vê/modifica apenas o próprio
CREATE POLICY "user_streaks_select"
  ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_streaks_upsert"
  ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_streaks_update"
  ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- weekly_reviews: usuário vê/modifica apenas os próprios
CREATE POLICY "weekly_reviews_select"
  ON weekly_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weekly_reviews_upsert"
  ON weekly_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_reviews_update"
  ON weekly_reviews FOR UPDATE USING (auth.uid() = user_id);

-- ── SEED — 33 BADGES ─────────────────────────────────────────────────────────

INSERT INTO badges (name, description, icon, category, rarity, points, criteria_type, criteria_value, sort_order) VALUES

-- Financeiras (7)
('Primeiro Passo',       'Registrou a primeira transação',             '💰', 'financial',   'common',    10,  'first_transaction',       '{}',                              1),
('Orçamento Cumprido',   'Respeitou o orçamento mensal completo',      '🟢', 'financial',   'common',    10,  'budget_respected',        '{"months":1}',                    2),
('Analista',             'Gerou seu primeiro relatório',               '📊', 'financial',   'common',    10,  'first_report',            '{}',                              3),
('3 Meses no Verde',     'Saldo positivo por 3 meses seguidos',        '🌿', 'financial',   'uncommon',  25,  'positive_balance_months', '{"months":3}',                    4),
('6 Meses no Verde',     'Saldo positivo por 6 meses seguidos',        '🔥', 'financial',   'rare',      50,  'positive_balance_months', '{"months":6}',                    5),
('Reserva Construída',   'Atingiu meta de reserva de emergência',      '🏦', 'financial',   'legendary', 100, 'emergency_reserve',       '{}',                              6),
('Investidor Iniciante', 'Registrou primeiro investimento',            '💎', 'financial',   'uncommon',  25,  'first_investment',        '{}',                              7),

-- Metas / Futuro (5)
('Primeiro Sonho',       'Criou primeiro objetivo no Futuro',          '🎯', 'goals',       'common',    10,  'first_goal',              '{}',                              8),
('Triatleta de Metas',   '3 metas ativas simultaneamente',             '⭐', 'goals',       'rare',      50,  'active_goals',            '{"count":3}',                     9),
('Marco 50%',            'Atingiu 50% em qualquer objetivo',           '🚀', 'goals',       'uncommon',  25,  'goal_progress',           '{"pct":50}',                      10),
('Objetivo Concluído',   'Concluiu um objetivo completo',              '🏆', 'goals',       'rare',      50,  'goal_completed',          '{"count":1}',                     11),
('Arquiteto do Futuro',  '3 objetivos concluídos',                     '🌟', 'goals',       'legendary', 100, 'goal_completed',          '{"count":3}',                     12),

-- Corpo / Saúde (6)
('Primeira Atividade',   'Registrou primeira atividade física',        '🏃', 'body',        'common',    10,  'first_activity',          '{}',                              13),
('Semana Completa',      'Atingiu meta semanal de atividades',         '💪', 'body',        'uncommon',  25,  'weekly_activity_goal',    '{"weeks":1}',                     14),
('Check-up Registrado',  'Agendou primeira consulta médica',           '🩺', 'body',        'common',    10,  'first_appointment',       '{}',                              15),
('Mês Ativo',            '4 semanas consecutivas atingindo meta',      '🔄', 'body',        'rare',      50,  'weekly_activity_goal',    '{"weeks":4,"consecutive":true}',  16),
('Peso Meta',            'Atingiu o peso-meta configurado',            '⚖️', 'body',        'legendary', 100, 'weight_goal',             '{}',                              17),
('Hidratação Master',    '7 dias consecutivos com meta de água',       '💧', 'body',        'uncommon',  25,  'hydration_streak',        '{"days":7}',                      18),

-- Mente / Estudo (5)
('Primeira Sessão',      'Completou primeiro pomodoro',                '🍅', 'mind',        'common',    10,  'first_focus_session',     '{}',                              19),
('Trilha Iniciada',      'Criou primeira trilha de aprendizado',       '📚', 'mind',        'common',    10,  'first_study_track',       '{}',                              20),
('Trilha Concluída',     'Concluiu uma trilha completa',               '🎓', 'mind',        'rare',      50,  'study_track_completed',   '{"count":1}',                     21),
('10 Horas de Foco',     'Acumulou 10 horas de estudo',                '⏱️', 'mind',        'uncommon',  25,  'focus_hours',             '{"hours":10}',                    22),
('Biblioteca Rica',      '10+ recursos na biblioteca',                 '📖', 'mind',        'uncommon',  25,  'library_resources',       '{"count":10}',                    23),

-- Consistência (7)
('7 Dias Consecutivos',  '7 dias de streak de uso',                    '🔥', 'consistency', 'common',    10,  'streak',                  '{"days":7}',                      24),
('30 Dias Consecutivos', '30 dias de streak',                          '🏅', 'consistency', 'uncommon',  25,  'streak',                  '{"days":30}',                     25),
('90 Dias Consecutivos', '90 dias de streak',                          '💫', 'consistency', 'rare',      50,  'streak',                  '{"days":90}',                     26),
('365 Dias',             '1 ano de streak',                            '👑', 'consistency', 'legendary', 100, 'streak',                  '{"days":365}',                    27),
('Review Semanal',       'Completou primeiro review semanal',          '📋', 'consistency', 'common',    10,  'weekly_review',           '{"count":1}',                     28),
('Multi-módulo',         'Usou 4+ módulos diferentes na semana',       '🌐', 'consistency', 'uncommon',  25,  'modules_used_week',       '{"count":4}',                     29),
('Vida Equilibrada',     'Todos módulos ativos com score > 50',        '⚡', 'consistency', 'legendary', 100, 'all_modules_score',       '{"min_score":50}',                30),

-- Carreira / Experiências (3)
('Perfil Completo',      'Preencheu perfil profissional',              '💼', 'career',      'common',    10,  'career_profile_complete', '{}',                              31),
('Primeira Viagem',      'Criou primeira viagem no Experiências',      '✈️', 'career',      'uncommon',  25,  'first_trip',              '{}',                              32),
('Habilidade Nova',      'Adicionou primeira habilidade no Carreira',  '🛠️', 'career',      'uncommon',  25,  'first_skill',             '{}',                              33)

ON CONFLICT DO NOTHING;
