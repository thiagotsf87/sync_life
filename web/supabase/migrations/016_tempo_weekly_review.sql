-- Migration: 016_tempo_weekly_review
-- Purpose: Weekly review table for Tempo module

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  total_events INT DEFAULT 0,
  completed_events INT DEFAULT 0,
  focus_minutes INT DEFAULT 0,
  module_distribution JSONB DEFAULT '{}',
  pending_tasks JSONB DEFAULT '[]',
  notes TEXT,
  xp_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own weekly reviews"
  ON weekly_reviews
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
