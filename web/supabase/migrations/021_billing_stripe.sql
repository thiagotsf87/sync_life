-- 021: Add Stripe billing columns to profiles
-- Fase 3 — Monetização

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN stripe_customer_id TEXT UNIQUE,
      ADD COLUMN stripe_subscription_id TEXT UNIQUE,
      ADD COLUMN subscription_status TEXT DEFAULT 'none'
        CHECK (subscription_status IN ('none','trialing','active','past_due','canceled','unpaid')),
      ADD COLUMN trial_ends_at TIMESTAMPTZ,
      ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_sub
  ON profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
