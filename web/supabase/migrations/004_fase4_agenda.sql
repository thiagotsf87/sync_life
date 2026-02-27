-- ═══════════════════════════════════════════════════════════════
-- Migration 004 — Fase 4: Módulo Agenda
-- Tabelas: agenda_events + focus_sessions
-- ═══════════════════════════════════════════════════════════════

-- ── Tabela de eventos de agenda ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agenda_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'pessoal',
  -- trabalho | meta | saude | pessoal | financeiro | estudo
  date        TEXT NOT NULL,     -- YYYY-MM-DD
  all_day     BOOLEAN DEFAULT FALSE,
  start_time  TEXT,              -- HH:MM
  end_time    TEXT,              -- HH:MM
  priority    TEXT NOT NULL DEFAULT 'normal',
  -- baixa | normal | alta | urgente
  status      TEXT NOT NULL DEFAULT 'pendente',
  -- pendente | concluido | cancelado
  reminder    TEXT,              -- 5m | 15m | 30m | 1h | 1d
  recurrence  TEXT DEFAULT 'none',
  -- none | daily | weekly | monthly
  goal_id     UUID REFERENCES goals(id) ON DELETE SET NULL,
  location    TEXT,
  checklist   JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de sessões de foco ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS focus_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id          UUID REFERENCES goals(id) ON DELETE SET NULL,
  event_id         UUID REFERENCES agenda_events(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  date             TEXT NOT NULL,  -- YYYY-MM-DD
  start_time       TEXT,           -- HH:MM
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agenda_events_user_date
  ON agenda_events(user_id, date);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date
  ON focus_sessions(user_id, date);

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own events"
  ON agenda_events
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own focus"
  ON focus_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Trigger updated_at em agenda_events ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_agenda_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agenda_events_updated_at
  BEFORE UPDATE ON agenda_events
  FOR EACH ROW EXECUTE FUNCTION update_agenda_events_updated_at();
