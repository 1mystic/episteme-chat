-- supabase/migrations/004_auth.sql
-- Attach sessions to authenticated users

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_email TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
