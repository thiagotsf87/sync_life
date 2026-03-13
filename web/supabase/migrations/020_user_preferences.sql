-- Migration 020: Persist user preferences in Supabase (multi-device sync)
-- Previously stored in localStorage only

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pinned_modules TEXT[] DEFAULT '{financas,tempo}',
  ADD COLUMN IF NOT EXISTS integration_settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';
