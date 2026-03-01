-- Migration: 012_add_carbon_blossom_serenity
-- Adiciona 3 novos temas PRO: carbon, blossom, serenity
-- Temas agora: 3 FREE + 9 PRO = 12 total
-- Spec: docs/proto-12-temas-synclife.html

-- 1. Remove constraint de tema existente
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- 2. Recria com os 12 temas (3 FREE + 9 PRO) + system
ALTER TABLE profiles
  ADD CONSTRAINT profiles_theme_check
    CHECK (theme IN (
      'navy-dark', 'clean-light', 'mint-garden',
      'obsidian', 'rosewood', 'arctic', 'graphite', 'twilight', 'sahara',
      'carbon', 'blossom', 'serenity',
      'system'
    ));
