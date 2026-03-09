-- Migration 018: Remove dual mode system (Foco/Jornada)
-- All users now have a single unified experience (what was previously "Jornada").
-- The mode column is kept for backwards compatibility but defaults to 'jornada'.
-- Date: 2026-03-08

-- 1. Set all existing users to 'jornada' (if any were on 'foco')
UPDATE profiles SET mode = 'jornada' WHERE mode IS DISTINCT FROM 'jornada';

-- 2. Set default to 'jornada' for new users
ALTER TABLE profiles ALTER COLUMN mode SET DEFAULT 'jornada';
