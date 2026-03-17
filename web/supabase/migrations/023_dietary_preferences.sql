-- 023: Cardápio Wizard — Preferências Alimentares
-- Adiciona colunas ao health_profiles para wizard do cardápio IA

ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS preferred_proteins TEXT[];
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS meals_per_day INT DEFAULT 3;
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS pre_workout_meal BOOLEAN DEFAULT FALSE;
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS post_workout_meal BOOLEAN DEFAULT FALSE;
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS supplements TEXT[];
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS cardapio_wizard_completed BOOLEAN DEFAULT FALSE;
