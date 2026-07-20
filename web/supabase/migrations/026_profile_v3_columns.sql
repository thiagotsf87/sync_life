-- Adiciona colunas faltantes no profile para Configurações v3
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'dd/mm/yyyy',
  ADD COLUMN IF NOT EXISTS week_start TEXT DEFAULT 'monday';

COMMENT ON COLUMN profiles.preferred_name IS 'Como o usuário prefere ser chamado (apelido)';
COMMENT ON COLUMN profiles.phone IS 'Telefone usado apenas para 2FA';
COMMENT ON COLUMN profiles.bio IS 'Bio opcional exibida no perfil público de Conquistas';
COMMENT ON COLUMN profiles.language IS 'Idioma preferido (pt-BR, en-US, etc.)';
COMMENT ON COLUMN profiles.date_format IS 'Formato de data (dd/mm/yyyy, mm/dd/yyyy, etc.)';
COMMENT ON COLUMN profiles.week_start IS 'Primeiro dia da semana (monday, sunday)';
