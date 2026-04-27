-- supabase/migrations/001_initial.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  turns_count INT DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  turn_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  depth_reached TEXT NOT NULL CHECK (depth_reached IN ('SURFACE', 'CONCEPTUAL', 'ANALYTICAL', 'SYNTHESIS')),
  clarity_score INT NOT NULL DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  bkt_pL FLOAT DEFAULT 0.20,
  bkt_pT FLOAT DEFAULT 0.12,
  bkt_pS FLOAT DEFAULT 0.10,
  bkt_pG FLOAT DEFAULT 0.08,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insight_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  insight TEXT NOT NULL,
  gaps TEXT[] DEFAULT '{}',
  clarity_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast session lookups
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_concepts_session_id ON concepts(session_id);
CREATE INDEX idx_insight_cards_session_id ON insight_cards(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_cards ENABLE ROW LEVEL SECURITY;

-- Open policies for hackathon (no auth required)
CREATE POLICY "allow_all_sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_concepts" ON concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_insight_cards" ON insight_cards FOR ALL USING (true) WITH CHECK (true);
