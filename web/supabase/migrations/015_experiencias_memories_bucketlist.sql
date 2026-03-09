-- =============================================================================
-- 015: Experiências — Memórias, Bucket List, Passport Badges
-- =============================================================================

-- ── trip_memories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_memories (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id          UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating           SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  favorite_moment  TEXT,
  best_food        TEXT,
  most_beautiful   TEXT,
  lesson_learned   TEXT,
  emotion_tags     TEXT[]      NOT NULL DEFAULT '{}',
  budget_planned   NUMERIC(10,2),
  budget_actual    NUMERIC(10,2),
  xp_awarded       INTEGER     NOT NULL DEFAULT 30,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── bucket_list_items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bucket_list_items (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_country  TEXT         NOT NULL,
  destination_city     TEXT,
  country_code         CHAR(2),
  flag_emoji           TEXT,
  continent            TEXT,
  priority             TEXT         NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  estimated_budget     NUMERIC(10,2),
  target_year          INTEGER,
  trip_type            TEXT         CHECK (trip_type IN ('solo','couple','family','friends')),
  motivation           TEXT,
  status               TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','visited')),
  trip_id              UUID         REFERENCES trips(id) ON DELETE SET NULL,
  visited_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── passport_badges ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS passport_badges (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type   TEXT         NOT NULL,
  badge_name   TEXT         NOT NULL,
  xp_awarded   INTEGER      NOT NULL DEFAULT 0,
  achieved_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trip_memories_trip_id   ON trip_memories(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_memories_user_id   ON trip_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_user_id     ON bucket_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_passport_badges_user_id ON passport_badges(user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE trip_memories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_badges    ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trip_memories' AND policyname = 'trip_memories_own'
  ) THEN
    CREATE POLICY trip_memories_own ON trip_memories FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bucket_list_items' AND policyname = 'bucket_list_items_own'
  ) THEN
    CREATE POLICY bucket_list_items_own ON bucket_list_items FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'passport_badges' AND policyname = 'passport_badges_own'
  ) THEN
    CREATE POLICY passport_badges_own ON passport_badges FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
