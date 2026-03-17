-- ═══════════════════════════════════════════════════════════════
-- Migration 024 — User Integrations: OAuth tokens storage
-- + Add source/external_id to agenda_events for Google Calendar sync
-- ═══════════════════════════════════════════════════════════════

-- ── Tabela de integrações OAuth ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Colunas extras em agenda_events para sync externo ────────────────────

ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Unique constraint para upsert de eventos externos (evita duplicatas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_events_user_external
  ON agenda_events(user_id, external_id)
  WHERE external_id IS NOT NULL;
