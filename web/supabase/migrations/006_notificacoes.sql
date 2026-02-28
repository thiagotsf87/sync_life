-- ============================================================
-- Migração 006 — Sistema de Notificações In-App
-- Criado em: 2026-02-27
-- Regras: RN-FUT-51/52/54, RN-CRP-05
-- ============================================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  -- Tipos:
  --   deadline_risk       → objetivo com ritmo insuficiente
  --   goal_stale          → meta parada 14+ dias
  --   followup_due        → retorno médico pendente 30+ dias
  --   objective_completed → objetivo atingiu 100%
  --   trip_upcoming       → viagem em 7 dias
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  module        TEXT,          -- 'futuro' | 'corpo' | 'experiencias' | etc.
  action_url    TEXT,          -- rota de destino ao clicar
  read_at       TIMESTAMPTZ,   -- NULL = não lida
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, read_at)
  WHERE read_at IS NULL;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notif_insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notif_delete" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);
