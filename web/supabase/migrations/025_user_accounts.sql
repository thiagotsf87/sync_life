-- Migration 025: User bank accounts + transfer account references
-- Used for tracking transfer origin/destination in transactions

CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking'
    CHECK (type IN ('checking', 'savings', 'investment', 'wallet')),
  icon TEXT NOT NULL DEFAULT '🏦',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts"
  ON user_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Colunas opcionais em transactions (preenchidas só quando type='transfer')
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_from_id UUID REFERENCES user_accounts(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_to_id UUID REFERENCES user_accounts(id);
