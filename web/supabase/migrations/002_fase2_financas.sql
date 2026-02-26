-- =============================================
-- SyncLife Migration 002 — Fase 2: Módulo Finanças
-- Rodar no SQL Editor do Supabase Dashboard (homol e prod)
-- =============================================

-- ─── 1. Colunas adicionais em transactions ────────────────────────────────
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT
    CHECK (payment_method IN ('pix','credit','debit','cash','transfer','boleto'));

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS is_future BOOLEAN DEFAULT FALSE;
-- TRUE = lançamento previsto (ainda não ocorreu), usado no fluxo de caixa futuro

-- recurring_transaction_id é adicionado DEPOIS da tabela recurring_transactions
-- (ver seção 3 abaixo)

-- ─── 2. Colunas adicionais em budgets ─────────────────────────────────────
ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS rollover BOOLEAN DEFAULT FALSE;

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ─── 3. Tabela recurring_transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly','quarterly','annual')),
  day_of_month    INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  start_date      DATE NOT NULL,
  end_date        DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  is_paused       BOOLEAN DEFAULT FALSE,
  last_paid_at    DATE,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FK de transactions → recurring_transactions (agora que a tabela existe)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID
    REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- ─── 4. Tabela planning_events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  planned_date    DATE NOT NULL,
  is_confirmed    BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 5. Colunas adicionais em profiles ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS savings_goal_pct  INTEGER DEFAULT 20
    CHECK (savings_goal_pct BETWEEN 0 AND 100);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_balance   DECIMAL(12,2) DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS month_start_day   INTEGER DEFAULT 1
    CHECK (month_start_day BETWEEN 1 AND 31);

-- ─── 6. Índices ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_recurring_user_active
  ON recurring_transactions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_recurring_user_type
  ON recurring_transactions(user_id, type, is_active);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date_type
  ON transactions(user_id, date DESC, type);

CREATE INDEX IF NOT EXISTS idx_transactions_future
  ON transactions(user_id, is_future, date);

CREATE INDEX IF NOT EXISTS idx_planning_user_date
  ON planning_events(user_id, planned_date);

-- ─── 7. RLS ───────────────────────────────────────────────────────────────
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_events        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recurring" ON recurring_transactions;
CREATE POLICY "Users can manage own recurring" ON recurring_transactions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own planning events" ON planning_events;
CREATE POLICY "Users can manage own planning events" ON planning_events
  FOR ALL USING (auth.uid() = user_id);

-- ─── 8. Triggers updated_at ───────────────────────────────────────────────
DROP TRIGGER IF EXISTS recurring_transactions_updated_at ON recurring_transactions;
CREATE TRIGGER recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 9. Verificação ───────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
