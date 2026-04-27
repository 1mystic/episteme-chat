-- supabase/migrations/002_learner_profiles.sql
-- Run this in your Supabase SQL editor after 001_initial.sql

CREATE TABLE IF NOT EXISTS learner_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  strength_areas   JSONB DEFAULT '[]',
  urgent_gaps      JSONB DEFAULT '[]',
  next_session_starter TEXT,
  learning_trajectory  TEXT CHECK (learning_trajectory IN ('accelerating', 'plateauing', 'regressing')),
  recommended_depth    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learner_profiles_session ON learner_profiles(session_id);

ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open access" ON learner_profiles FOR ALL USING (true) WITH CHECK (true);
