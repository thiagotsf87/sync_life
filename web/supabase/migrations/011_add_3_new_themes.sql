-- Migration: 011_add_3_new_themes
-- Adiciona 3 novos temas PRO: graphite, twilight, sahara
-- Spec: docs/21-TEMAS-E-MODOS-DEV-SPEC (ATUALIZADO).md

-- 1. Remove constraint de tema existente
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- 2. Recria com os 9 temas (3 FREE + 6 PRO)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_theme_check
    CHECK (theme IN ('navy-dark', 'clean-light', 'mint-garden', 'obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara', 'system'));
