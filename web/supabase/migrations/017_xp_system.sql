-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 017 — XP System + Plan Type
-- Tables: user_xp_log, adds plan_type to profiles
-- ─────────────────────────────────────────────────────────────────────────────

-- ── XP LOG TABLE ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_xp_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  points     INTEGER NOT NULL DEFAULT 0,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_xp_log_user ON user_xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_log_user_date ON user_xp_log(user_id, created_at DESC);

-- ── PLAN TYPE ON PROFILES ───────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free'
      CHECK (plan_type IN ('free', 'pro'));
  END IF;
END $$;

-- ── LIBRARY RESOURCES TABLE (for Mente badges) ─────────────────────────────

CREATE TABLE IF NOT EXISTS library_resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT,
  type        TEXT NOT NULL DEFAULT 'article' CHECK (type IN ('article', 'video', 'podcast', 'book', 'course', 'other')),
  track_id    UUID REFERENCES study_tracks(id) ON DELETE SET NULL,
  notes       TEXT,
  tags        TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_resources_user ON library_resources(user_id);

-- ── CAREER PROFILES TABLE (for badge checks) ───────────────────────────────

CREATE TABLE IF NOT EXISTS career_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_role      TEXT,
  target_role       TEXT,
  industry          TEXT,
  years_experience  INTEGER,
  education_level   TEXT,
  linkedin_url      TEXT,
  bio               TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_profiles_user ON career_profiles(user_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE user_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_xp_log_select"
  ON user_xp_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_xp_log_insert"
  ON user_xp_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_resources_select"
  ON library_resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "library_resources_insert"
  ON library_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "library_resources_update"
  ON library_resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "library_resources_delete"
  ON library_resources FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "career_profiles_select"
  ON career_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "career_profiles_insert"
  ON career_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "career_profiles_update"
  ON career_profiles FOR UPDATE USING (auth.uid() = user_id);
