-- supabase/migrations/003_session_state.sql
-- Stores per-turn algorithmic state between turns so SDSM gets correct signals

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS session_state JSONB DEFAULT '{}';
