-- =============================================
-- SyncLife Migration 001 — MVP V2
-- Rodar no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Adicionar colunas de onboarding/personalização em profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS life_moments TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_modules TEXT[] DEFAULT '{financas}';

-- 2. Verificação: confirmar colunas adicionadas
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;
