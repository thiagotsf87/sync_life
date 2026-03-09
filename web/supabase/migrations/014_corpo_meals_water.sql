-- ============================================================
-- 014 — Corpo: meals + daily_water_intake
-- Tabelas de rastreamento manual de refeições e hidratação
-- ============================================================

-- Adicionar meta de água diária ao perfil de saúde
ALTER TABLE health_profiles
  ADD COLUMN IF NOT EXISTS daily_water_goal_ml INTEGER DEFAULT 2500;

-- ─── Tabela de refeições ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_slot     TEXT NOT NULL CHECK (meal_slot IN ('breakfast','lunch','snack','dinner')),
  description   TEXT NOT NULL,
  calories_kcal INTEGER NOT NULL,
  protein_g     DECIMAL(6,1),
  carbs_g       DECIMAL(6,1),
  fat_g         DECIMAL(6,1),
  meal_time     TEXT,
  recorded_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meals_user_policy" ON meals
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Tabela de hidratação diária ─────────────────────────────
CREATE TABLE IF NOT EXISTS daily_water_intake (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  intake_ml     INTEGER NOT NULL DEFAULT 0,
  goal_ml       INTEGER NOT NULL DEFAULT 2500,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recorded_date)
);

ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_water_user_policy" ON daily_water_intake
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
