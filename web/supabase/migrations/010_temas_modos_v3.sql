-- Migration: 010_temas_modos_v3
-- Atualiza profiles para suportar 6 temas (3 FREE + 3 PRO) e modos foco/jornada
-- Spec: docs/20-TEMAS-E-MODOS-DEV-SPEC.md

-- 1. Remove constraints antigos se existirem
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_mode_check;

-- 2. Migra valores antigos para novos
UPDATE profiles SET
  theme = 'system'
WHERE theme IN ('dark', 'light') OR theme IS NULL;

UPDATE profiles SET
  mode = CASE
    WHEN mode = 'focus' THEN 'foco'
    WHEN mode = 'journey' THEN 'jornada'
    ELSE 'foco'
  END
WHERE mode IN ('focus', 'journey') OR mode IS NULL;

-- 3. Define defaults
ALTER TABLE profiles
  ALTER COLUMN theme SET DEFAULT 'system',
  ALTER COLUMN mode SET DEFAULT 'foco';

-- 4. Adiciona constraints com valores válidos
ALTER TABLE profiles
  ADD CONSTRAINT profiles_theme_check
    CHECK (theme IN ('navy-dark', 'clean-light', 'mint-garden', 'obsidian', 'rosewood', 'arctic', 'system'));

ALTER TABLE profiles
  ADD CONSTRAINT profiles_mode_check
    CHECK (mode IN ('foco', 'jornada'));
