-- =============================================
-- SyncLife Migration 001 — MVP V2
-- Rodar no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Colunas de onboarding/personalização em profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS life_moments TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_modules TEXT[] DEFAULT '{financas}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sidebar_state TEXT DEFAULT 'open'
  CHECK (sidebar_state IN ('open', 'collapsed'));

-- 2. Garantir trigger de criação automática de profile (recria se não existir)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END;
$$;

-- 3. Corrigir policy RLS de INSERT em profiles
-- A versão anterior acessava auth.users diretamente, causando "permission denied for table users"
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Verificação: confirmar colunas adicionadas
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;
