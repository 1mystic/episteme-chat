# EPISTEME — COMPLETE AI BUILD PROMPT SYSTEM
## For use with Claude Sonnet / GPT-4o / Any capable LLM
## Read every word of MASTER CONTEXT before using any phase prompt

---

# ═══════════════════════════════════════════════════════
# MASTER CONTEXT DOCUMENT
# Paste this at the start of EVERY new session
# ═══════════════════════════════════════════════════════

```
MASTER CONTEXT — EPISTEME PROJECT
You are an expert senior full-stack engineer building "Episteme" — a Socratic AI tutor.
Read this entire document before writing a single line of code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT EPISTEME IS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Episteme is an AI learning tool that refuses to directly answer questions.
Instead it runs a Socratic dialogue: probing the user's existing understanding,
guiding them to reason through the concept themselves, then generating an
"insight card" summarizing what they now understand and what gaps remain.

CORE USER FLOW:
1. User selects a domain (ML / Statistics / Economics / CS / General)
2. User types any question (e.g. "What is overfitting?")
3. Episteme classifies the question's depth: SURFACE | CONCEPTUAL | ANALYTICAL | SYNTHESIS
4. Episteme responds with a probing question (never a direct answer on turn 1)
5. User answers the probe. Episteme continues Socratic dialogue (4-6 turns)
6. Clarity score (0-100) rises as user demonstrates understanding
7. Session ends with a generated "insight card" + updated knowledge map

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Framework: Next.js 15 with App Router (TypeScript)
- Styling: Tailwind CSS v3 + shadcn/ui components
- Animation: Framer Motion
- AI: Anthropic Claude API (model: claude-sonnet-4-20250514) via streaming
- Database: Supabase (PostgreSQL + Auth + Realtime)
- Deployment: Vercel
- Package manager: npm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STRUCTURE (create exactly this)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
episteme/
├── app/
│   ├── layout.tsx              ← root layout, fonts, global styles
│   ├── page.tsx                ← landing / domain selector
│   ├── session/
│   │   └── [sessionId]/
│   │       └── page.tsx        ← main chat + panels UI
│   └── api/
│       ├── session/
│       │   └── route.ts        ← POST: create session, GET: fetch session
│       ├── chat/
│       │   └── route.ts        ← POST: streaming Socratic response
│       ├── classify/
│       │   └── route.ts        ← POST: classify question depth
│       └── insights/
│           └── route.ts        ← POST: generate insight card
├── components/
│   ├── ui/                     ← shadcn components (auto-generated)
│   ├── ChatPanel.tsx           ← right panel: chat bubbles + input
│   ├── SidePanel.tsx           ← left panel: depth meter, clarity, knowledge map
│   ├── DepthMeter.tsx          ← animated depth level indicator
│   ├── ClarityScore.tsx        ← 0-100 animated score bar
│   ├── KnowledgeMap.tsx        ← visual graph of concepts explored
│   ├── InsightCard.tsx         ← end-of-session insight card component
│   ├── DomainSelector.tsx      ← landing page domain picker
│   └── StreamingMessage.tsx    ← handles streaming text rendering
├── lib/
│   ├── supabase.ts             ← Supabase client (browser)
│   ├── supabase-server.ts      ← Supabase client (server/API routes)
│   ├── anthropic.ts            ← Anthropic client singleton
│   ├── prompts.ts              ← ALL system prompts and prompt builders
│   ├── scoring.ts              ← clarity score calculation logic
│   └── types.ts                ← all TypeScript interfaces
├── hooks/
│   ├── useSession.ts           ← session state management
│   ├── useChat.ts              ← chat state + streaming logic
│   └── useClarity.ts           ← clarity score tracking
├── .env.local                  ← secrets (never commit)
└── supabase/
    └── migrations/
        └── 001_initial.sql     ← database schema

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLES (.env.local)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANTHROPIC_API_KEY=<user will provide>
NEXT_PUBLIC_SUPABASE_URL=<user will provide>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<user will provide>
SUPABASE_SERVICE_ROLE_KEY=<user will provide>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE SCHEMA (exact SQL, no deviations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File: supabase/migrations/001_initial.sql

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

-- Index for fast session lookups
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_concepts_session_id ON concepts(session_id);
CREATE INDEX idx_insight_cards_session_id ON insight_cards(session_id);

-- Enable Row Level Security (but allow all for hackathon — no auth)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_cards ENABLE ROW LEVEL SECURITY;

-- For hackathon: open policies (no user auth required)
CREATE POLICY "allow_all_sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_concepts" ON concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_insight_cards" ON insight_cards FOR ALL USING (true) WITH CHECK (true);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM (follow exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aesthetic: "Dark Academia Terminal" — serious, warm, archival

Colors (CSS variables in globals.css):
  --bg:           #0a0a0a
  --bg-surface:   #111111
  --bg-elevated:  #1a1a1a
  --border:       rgba(255,255,255,0.08)
  --border-strong: rgba(255,255,255,0.15)
  --text:         #f0ede6
  --text-muted:   #8a8a8a
  --text-dim:     #555555
  --amber:        #f5a623   ← primary accent (depth upgrades, scores)
  --amber-soft:   rgba(245,166,35,0.12)
  --amber-glow:   rgba(245,166,35,0.25)
  --green:        #4ade80   ← clarity/success states
  --red:          #f87171   ← gaps/warnings
  --blue:         #60a5fa   ← links, secondary info

Fonts (import from Google Fonts):
  Display/Headers: 'Playfair Display' (serif, italic for insight cards)
  Mono/Labels:     'JetBrains Mono' (for scores, depth labels, code)
  Body/Chat:       'Instrument Sans' (clean, readable chat text)

Spacing scale: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
Border radius: 4px (sharp, angular — not rounded pill buttons)
Shadows: amber-tinted glow for active states

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE AI PROMPTS (use these exactly — do not modify)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOCRATIC SYSTEM PROMPT (used in /api/chat):
---
You are Episteme — a Socratic tutor. Your singular purpose is to help
users develop genuine understanding, not to provide answers.

CORE RULES — follow these without exception:
1. NEVER directly answer the user's question on turn 1. Always probe first.
2. Begin by asking what the user already thinks or knows about the topic.
3. Build each response on what the user said — acknowledge, then probe deeper.
4. Use the user's own language and examples when reflecting back.
5. After 5 exchanges, offer to consolidate with: "Want me to summarize what you've worked out?"
6. NEVER say "Great question!" or give hollow praise.
7. NEVER lecture. Every response must end with a question.
8. If the user is clearly lost (very short or confused answers for 2+ turns),
   gently shift: "Let me give you a foothold — [brief hint] — now what does that suggest?"

DEPTH STRATEGIES by question type:
- SURFACE ("What is X?"): Ask what they already think. "Before I explain — what's your intuition?"
- CONCEPTUAL ("How does X work?"): Ask them to reason from parts. "What do you think each piece does?"
- ANALYTICAL ("Why does X fail?"): Ask for edge cases. "When would that break?"
- SYNTHESIS ("X vs Y?"): Ask for trade-off reasoning. "What would you sacrifice if you chose X?"

TONE: Warm, curious, intellectually rigorous. Never condescending.
Wrong answers are treated as data: "Interesting — what makes you think that?"

Current domain: {DOMAIN}
Turn number: {TURN_NUMBER}
Concepts discussed: {CONCEPTS_COVERED}
---

DEPTH CLASSIFIER PROMPT (used in /api/classify):
---
Classify the following question into exactly one depth level.

DEPTH LEVELS:
- SURFACE: Asks for a definition or basic description ("What is X?")
- CONCEPTUAL: Asks how something works or why it exists ("How does X work?", "Why is X used?")
- ANALYTICAL: Asks about failure modes, edge cases, or comparisons ("When does X fail?", "Why is X better than Y?")
- SYNTHESIS: Asks for judgment, design decisions, or application ("When would you use X?", "How would you design X?")

Question: "{QUESTION}"

Respond with ONLY valid JSON, no markdown, no explanation:
{"depth": "CONCEPTUAL", "confidence": 0.87, "keywords": ["concept", "mechanism"]}
---

INSIGHT CARD GENERATOR PROMPT (used in /api/insights):
---
Based on the following Socratic conversation, generate an insight card.

Domain: {DOMAIN}
Conversation summary: {CONVERSATION_SUMMARY}
Main concept explored: {MAIN_CONCEPT}
User's strongest responses: {STRONG_RESPONSES}
User's gaps or hesitations: {GAPS}

Generate a precise insight card as ONLY valid JSON, no markdown:
{
  "concept": "string — the main concept explored",
  "insight": "string — 2-3 sentences: what the user now genuinely understands, written directly to them",
  "gaps": ["array", "of", "specific", "adjacent concepts", "they haven't explored"],
  "clarity_score": 72,
  "next_question": "string — one question to start their next session"
}

Rules:
- insight must be specific, not generic. Reference their actual reasoning.
- gaps must be concrete concept names, not vague observations.
- clarity_score: 0-40 = surface grasp, 41-70 = conceptual understanding, 71-90 = analytical, 91-100 = synthesis mastery
- next_question must feel like a natural continuation of THIS conversation.
---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPESCRIPT TYPES (lib/types.ts — create this first)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type DepthLevel = 'SURFACE' | 'CONCEPTUAL' | 'ANALYTICAL' | 'SYNTHESIS'
export type Domain = 'ml' | 'statistics' | 'economics' | 'cs' | 'general'
export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  turn_number: number
  created_at: string
}

export interface Session {
  id: string
  domain: Domain
  created_at: string
  updated_at: string
  turns_count: number
  is_complete: boolean
}

export interface Concept {
  id: string
  session_id: string
  name: string
  depth_reached: DepthLevel
  clarity_score: number
  created_at: string
}

export interface InsightCard {
  id: string
  session_id: string
  concept: string
  insight: string
  gaps: string[]
  clarity_score: number
  created_at: string
}

export interface ClassifyResponse {
  depth: DepthLevel
  confidence: number
  keywords: string[]
}

export interface ChatRequest {
  sessionId: string
  message: string
  turnNumber: number
  domain: Domain
  conversationHistory: { role: MessageRole; content: string }[]
  conceptsCovered: string[]
}

export interface InsightRequest {
  sessionId: string
  domain: Domain
  conversationHistory: { role: MessageRole; content: string }[]
  mainConcept: string
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR THE AI BUILDING THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Write COMPLETE files every time — no "..." or "// rest of code here"
2. Every API route must handle errors and return proper HTTP status codes
3. All Supabase calls must be try/catch wrapped
4. Streaming must use ReadableStream with proper SSE format
5. Never hardcode secrets — always use process.env.*
6. Never use 'any' TypeScript type — use proper interfaces from lib/types.ts
7. Every component must be a named export, not default export (except pages)
8. Tailwind classes only — no inline styles except for dynamic CSS variables
9. Test imports: if a file imports from another file, that file must exist
10. When creating a new file, state its full path explicitly as a comment at top

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD SEQUENCE — ALWAYS FOLLOW THIS ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Project initialization + DB + types + lib files
Phase 2: API routes (session, classify, chat streaming, insights)
Phase 3: Core UI layout + design system + landing page
Phase 4: Chat panel + streaming UI + session page
Phase 5: Side panel components (depth, clarity, knowledge map, insight cards)
Phase 6: Polish, animations, error states, final wiring
```

---

# ═══════════════════════════════════════════════════════
# PHASE 1 PROMPT
# Project Init + Database + Foundation Files
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 TASK: PROJECT INITIALIZATION & FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are building Phase 1 of Episteme. Your job in this phase is ONLY
to create the foundation files. Do not build any UI yet.

DELIVER EXACTLY THESE FILES IN THIS ORDER:

─────────────────────────────────
FILE 1: package.json
─────────────────────────────────
Create package.json with these exact dependencies:
{
  "dependencies": {
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@anthropic-ai/sdk": "^0.36.0",
    "@supabase/supabase-js": "^2.47.0",
    "framer-motion": "^11.15.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "uuid": "^11.0.3",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/uuid": "^10",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10.0.1"
  }
}
Include all standard Next.js scripts.

─────────────────────────────────
FILE 2: tsconfig.json
─────────────────────────────────
Standard Next.js tsconfig with:
- strict: true
- paths: { "@/*": ["./*"] }

─────────────────────────────────
FILE 3: tailwind.config.ts
─────────────────────────────────
Extend Tailwind with the Episteme design tokens:
- Add custom colors: amber (#f5a623), amber-soft, amber-glow, bg-surface (#111111), bg-elevated (#1a1a1a), text-primary (#f0ede6), text-muted (#8a8a8a)
- Add custom font families: 'playfair' (Playfair Display), 'jetbrains' (JetBrains Mono), 'instrument' (Instrument Sans)
- content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]

─────────────────────────────────
FILE 4: app/globals.css
─────────────────────────────────
Import Tailwind directives.
Import Google Fonts: Playfair Display (400, 400i, 700, 700i), JetBrains Mono (400, 500, 600), Instrument Sans (400, 500, 600).
Define ALL CSS custom properties from the design system.
Add these global base styles:
- body: bg-[#0a0a0a], text-[#f0ede6], font-instrument, antialiased
- ::selection: amber background, dark text
- scrollbar styling: thin, amber thumb, transparent track
- Add a subtle grain texture overlay using pseudo-element on body

─────────────────────────────────
FILE 5: lib/types.ts
─────────────────────────────────
Write the complete TypeScript types exactly as specified in MASTER CONTEXT.
Add these additional types:

export interface ChatState {
  messages: Message[]
  isStreaming: boolean
  currentStreamContent: string
  sessionId: string | null
  domain: Domain | null
  clarityScore: number
  depthLevel: DepthLevel | null
  conceptsCovered: string[]
  isComplete: boolean
  insightCard: InsightCard | null
}

export interface SidePanelState {
  concepts: Concept[]
  clarityHistory: number[]  // array of scores per turn
  depthHistory: DepthLevel[]
}

─────────────────────────────────
FILE 6: lib/anthropic.ts
─────────────────────────────────
// lib/anthropic.ts
Create a singleton Anthropic client:

import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set')
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export default anthropic

─────────────────────────────────
FILE 7: lib/supabase.ts (browser client)
─────────────────────────────────
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

─────────────────────────────────
FILE 8: lib/supabase-server.ts (server client)
─────────────────────────────────
// lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

─────────────────────────────────
FILE 9: lib/prompts.ts
─────────────────────────────────
Write ALL prompts from MASTER CONTEXT as exported functions:

export function buildSocraticSystemPrompt(domain: string, turnNumber: number, conceptsCovered: string[]): string
  → interpolate {DOMAIN}, {TURN_NUMBER}, {CONCEPTS_COVERED} into the Socratic system prompt

export function buildDepthClassifierPrompt(question: string): string
  → interpolate {QUESTION} into the depth classifier prompt

export function buildInsightCardPrompt(domain: string, conversationSummary: string, mainConcept: string, strongResponses: string, gaps: string): string
  → interpolate all fields into the insight card generator prompt

export const SOCRATIC_SYSTEM_PROMPT_TEMPLATE = `...` (the raw template)

─────────────────────────────────
FILE 10: lib/scoring.ts
─────────────────────────────────
// Clarity score calculation
// Score increases based on: response length, reasoning keywords, turn depth

export const REASONING_KEYWORDS = [
  'because', 'therefore', 'since', 'which means', 'this causes',
  'as a result', 'leads to', 'implies', 'suggests', 'however',
  'but', 'although', 'on the other hand', 'compared to', 'unlike',
  'for example', 'specifically', 'in other words', 'that is'
]

export const DEPTH_SCORE_MAP: Record<DepthLevel, number> = {
  SURFACE: 15,
  CONCEPTUAL: 35,
  ANALYTICAL: 65,
  SYNTHESIS: 85
}

export function calculateTurnScore(
  userResponse: string,
  currentDepth: DepthLevel,
  turnNumber: number
): number {
  // Algorithm:
  // 1. Base score from depth level
  // 2. Bonus: +2 per reasoning keyword found (max 20)
  // 3. Bonus: +1 per 20 chars of response (max 15)
  // 4. Bonus: +3 per turn number (capped at turn 5)
  // 5. Return clamped 0-100
  // Write the complete implementation.
}

export function calculateSessionClarity(turnScores: number[]): number {
  // Weighted average: later turns weighted higher (exponential)
  // Write the complete implementation.
}

─────────────────────────────────
FILE 11: supabase/migrations/001_initial.sql
─────────────────────────────────
Write the EXACT SQL from MASTER CONTEXT. No modifications.

─────────────────────────────────
FILE 12: .env.local.example
─────────────────────────────────
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

─────────────────────────────────
VERIFICATION CHECKLIST before finishing Phase 1:
─────────────────────────────────
□ All imports reference files that exist within this phase
□ No 'any' TypeScript types
□ lib/types.ts exports are used correctly in other files
□ All environment variable accesses use process.env.*
□ Scoring algorithm in scoring.ts is fully implemented (no stubs)
□ Both supabase clients are different (browser vs server)
□ All prompts in prompts.ts are complete strings (no truncation)

When done, say: "PHASE 1 COMPLETE — 12 files created. Ready for Phase 2."
```

---

# ═══════════════════════════════════════════════════════
# PHASE 2 PROMPT
# API Routes — Session, Classify, Chat (Streaming), Insights
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 TASK: ALL API ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1 is complete. The following files exist and are correct:
lib/types.ts, lib/anthropic.ts, lib/supabase-server.ts,
lib/prompts.ts, lib/scoring.ts

Your task: Build all 4 API routes. Each must be a complete, working
Next.js 15 App Router route handler.

IMPORTANT RULES FOR ALL ROUTES:
- Use 'export async function POST(request: Request)' syntax
- Return Response objects with proper status codes
- Always try/catch every external call (Supabase, Anthropic)
- Log errors to console.error with context
- Never expose stack traces to clients

─────────────────────────────────
ROUTE 1: app/api/session/route.ts
─────────────────────────────────
POST /api/session
- Body: { domain: Domain }
- Validates domain is one of: 'ml' | 'statistics' | 'economics' | 'cs' | 'general'
- Creates a new row in sessions table using server Supabase client
- Returns: { session: Session }
- Error cases: invalid domain (400), DB error (500)

GET /api/session?id={sessionId}
- Fetches session + all its messages + all its concepts
- Returns: { session: Session, messages: Message[], concepts: Concept[] }
- Error cases: missing id param (400), not found (404), DB error (500)

─────────────────────────────────
ROUTE 2: app/api/classify/route.ts
─────────────────────────────────
POST /api/classify
- Body: { question: string }
- Validates question is non-empty string, max 500 chars
- Calls Claude API (NOT streaming):
  model: 'claude-sonnet-4-20250514'
  max_tokens: 150
  system: buildDepthClassifierPrompt(question) — wait, correct approach:
    messages: [{ role: 'user', content: buildDepthClassifierPrompt(question) }]
    (no system prompt for classifier — the instruction is in the user message)
- Parses response as JSON (ClassifyResponse type)
- If JSON parsing fails, default to { depth: 'SURFACE', confidence: 0.5, keywords: [] }
- Saves concept to concepts table with the classified depth
- Returns: ClassifyResponse & { conceptId: string }
- Error cases: validation error (400), API error (500)

NOTE: The classifier prompt asks Claude to return ONLY JSON. Strip any
possible markdown fences before JSON.parse():
  const clean = text.replace(/```json|```/g, '').trim()

─────────────────────────────────
ROUTE 3: app/api/chat/route.ts  ← MOST COMPLEX
─────────────────────────────────
POST /api/chat — STREAMING RESPONSE
- Body: ChatRequest (from lib/types.ts)
- Validates all required fields exist
- Saves user message to messages table FIRST (before streaming)
- Calls Claude API with STREAMING enabled:
  model: 'claude-sonnet-4-20250514'
  max_tokens: 600
  system: buildSocraticSystemPrompt(domain, turnNumber, conceptsCovered)
  messages: conversationHistory (array of {role, content})
- Streams response back to client using ReadableStream + SSE format
- After stream completes, saves assistant message to messages table
- Updates sessions.turns_count + sessions.updated_at
- Calculate turn clarity score using calculateTurnScore()
- Update the most recent concept's clarity_score

STREAMING IMPLEMENTATION (exact pattern to follow):
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages: conversationHistory,
  })

  const encoder = new TextEncoder()
  let fullContent = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text
            fullContent += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        // After streaming completes, save to DB and send final event
        // [save assistant message, update session, calculate score]
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, clarityScore: turnScore })}\n\n`))
        controller.close()
      } catch (error) {
        console.error('Streaming error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })

─────────────────────────────────
ROUTE 4: app/api/insights/route.ts
─────────────────────────────────
POST /api/insights
- Body: InsightRequest (from lib/types.ts)
- Validates sessionId, domain, conversationHistory (min 4 messages), mainConcept
- Builds conversation summary: join all messages into a readable string,
  last 8 messages max to keep within token budget
- Identifies strong responses: user messages with reasoning keywords (from scoring.ts)
- Identifies gaps: user messages with hesitation patterns ("I think", "maybe", "not sure")
- Calls Claude API (NOT streaming):
  model: 'claude-sonnet-4-20250514'
  max_tokens: 400
  messages: [{ role: 'user', content: buildInsightCardPrompt(...) }]
- Parses response as JSON (InsightCard shape)
- Strip markdown fences before parsing
- Saves to insight_cards table
- Marks session as complete: UPDATE sessions SET is_complete = TRUE
- Returns: { insightCard: InsightCard }

─────────────────────────────────
VERIFICATION CHECKLIST before finishing Phase 2:
─────────────────────────────────
□ All 4 routes are complete and compile without errors
□ Streaming route sends 'data: ...\n\n' format (valid SSE)
□ All Supabase operations use createServerSupabaseClient() (not browser client)
□ All Claude calls use the correct model string: 'claude-sonnet-4-20250514'
□ JSON parsing is wrapped in try/catch with fallback
□ User message is saved BEFORE streaming starts
□ Session turns_count is incremented after each chat turn
□ All imports from lib/* are correct paths

When done, say: "PHASE 2 COMPLETE — 4 API routes created. Ready for Phase 3."
```

---

# ═══════════════════════════════════════════════════════
# PHASE 3 PROMPT
# Design System + Layout + Landing Page
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 TASK: LAYOUT + LANDING PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases 1 and 2 are complete. Now build the visual foundation.

DESIGN MANDATE:
- Dark Academia Terminal aesthetic
- Fonts: Playfair Display (display), JetBrains Mono (labels/scores), Instrument Sans (body)
- Colors: amber (#f5a623) accent, near-black background, warm off-white text
- Animations: use Framer Motion for page transitions, not CSS where possible
- Every interactive element must have a hover state
- The UI must feel like a serious academic tool, not a chatbot

─────────────────────────────────
FILE 1: app/layout.tsx
─────────────────────────────────
Root layout:
- Import globals.css
- Set metadata: title "Episteme", description "The Socratic Study Engine"
- Add lang="en" to html
- Body with grain texture pseudo-element
- Include a subtle fixed amber line at very top of page (2px, 30% opacity)
- Wrap children in a div with min-h-screen

─────────────────────────────────
FILE 2: components/ui/button.tsx
─────────────────────────────────
Build a custom Button component (do NOT use shadcn auto-generate — write manually):

interface ButtonProps {
  variant: 'primary' | 'ghost' | 'outline' | 'danger'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

Styles:
- primary: amber bg, dark text, hover brightens
- ghost: transparent, text-muted, hover shows border
- outline: transparent bg, amber border, amber text
- danger: transparent, red-400 text, hover red bg at 10% opacity
- All variants: JetBrains Mono font, tracking-wider, uppercase text, 4px radius
- Disabled: opacity-40, cursor-not-allowed
- Add subtle scale(0.97) on active/press

─────────────────────────────────
FILE 3: components/DomainSelector.tsx
─────────────────────────────────
The landing page's main interactive element.

Props: { onSelect: (domain: Domain) => void, isLoading: boolean }

DOMAINS data (hardcode in component):
const DOMAINS = [
  { id: 'ml', label: 'Machine Learning', icon: '⟡', description: 'Algorithms, models, training, inference' },
  { id: 'statistics', label: 'Statistics', icon: '∑', description: 'Probability, inference, distributions' },
  { id: 'economics', label: 'Economics', icon: '◈', description: 'Micro, macro, game theory, markets' },
  { id: 'cs', label: 'Computer Science', icon: '⌥', description: 'Data structures, algorithms, systems' },
  { id: 'general', label: 'General', icon: '◎', description: 'Any topic — philosophy, science, history' },
]

Layout: 2-column grid on desktop, 1-column on mobile
Each domain card:
- Border: 1px solid rgba(255,255,255,0.08)
- Background: #111111
- Hover: border becomes amber at 40% opacity, bg shifts to #161616
- Selected (during loading): amber border at full opacity + amber glow shadow
- Icon: 28px, Playfair Display, amber color
- Label: 16px, Instrument Sans, semibold
- Description: 13px, JetBrains Mono, text-muted
- Cursor: pointer
- Framer Motion: whileHover scale(1.02), whileTap scale(0.98)
- Transition: 200ms ease

─────────────────────────────────
FILE 4: app/page.tsx  ← LANDING PAGE
─────────────────────────────────
This is the entry point. No authentication needed.

Layout (full-height, centered content):
- Fixed ambient glow: large amber radial gradient, centered, very low opacity (0.03)
- Header section:
  - Small mono label: "EPISTEME · SOCRATIC STUDY ENGINE"
  - Main heading (Playfair Display, 64px desktop / 40px mobile, italic): 
    "Think deeper."
  - Subheading (Instrument Sans, 18px, text-muted, max-width 480px):
    "AI that refuses to answer your questions — and instead helps you answer them yourself."
  - Thin amber divider (1px, 120px wide, centered, margin 32px vertical)
- Domain selector section:
  - Label: "// select your domain" (JetBrains Mono, 11px, amber, tracking-widest)
  - <DomainSelector /> component
- Footer strip:
  - "24-hour Hackathon · CBC Spring 2026 · Track 3: Economic Empowerment"
  - JetBrains Mono, 11px, text-dim, centered

BEHAVIOR:
- When domain is selected, POST to /api/session with { domain }
- Show loading state on DomainSelector during request
- On success, router.push(`/session/${session.id}`)
- On error, show error toast (use simple state-based toast, no library)

Framer Motion page entry animation:
  - Heading: fade up, delay 0
  - Subheading: fade up, delay 0.1
  - Divider: fade in + scale-x from 0 to 1, delay 0.2
  - Domain selector: fade up, delay 0.3

─────────────────────────────────
VERIFICATION CHECKLIST before finishing Phase 3:
─────────────────────────────────
□ Landing page imports DomainSelector correctly
□ DomainSelector calls onSelect with correct Domain type
□ POST to /api/session uses correct request shape
□ Router push uses correct URL pattern /session/${id}
□ All Framer Motion animations have both initial and animate props
□ No TypeScript errors in component props
□ Mobile responsive (check: grid switches to 1-col, font sizes reduce)
□ Button component exported as named export

When done, say: "PHASE 3 COMPLETE — Layout + landing page created. Ready for Phase 4."
```

---

# ═══════════════════════════════════════════════════════
# PHASE 4 PROMPT
# Session Page + Chat Panel + Streaming Logic
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 TASK: SESSION PAGE + CHAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases 1-3 are complete. The API routes exist and the landing page works.
Now build the main experience: the session page with chat.

─────────────────────────────────
FILE 1: hooks/useSession.ts
─────────────────────────────────
Custom hook that manages session state.

export function useSession(sessionId: string) — returns:
  session: Session | null
  messages: Message[]
  concepts: Concept[]
  isLoading: boolean
  error: string | null
  refetch: () => void

Implementation:
- On mount, fetch GET /api/session?id={sessionId}
- Parse response into typed objects
- Handle 404 → error = "Session not found"
- Handle 500 → error = "Failed to load session"
- isLoading starts true, becomes false after first fetch

─────────────────────────────────
FILE 2: hooks/useChat.ts
─────────────────────────────────
The most important hook. Manages all chat state + streaming.

export function useChat(sessionId: string, domain: Domain) — returns:
  messages: ChatMessage[]  (local, includes streaming state)
  isStreaming: boolean
  clarityScore: number
  depthLevel: DepthLevel | null
  conceptsCovered: string[]
  insightCard: InsightCard | null
  sendMessage: (content: string) => Promise<void>
  generateInsight: () => Promise<void>
  canGenerateInsight: boolean  (true when turns >= 4)

Internal ChatMessage type (local only, not in DB):
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming: boolean
  turnNumber: number

STREAMING IMPLEMENTATION for sendMessage:
1. Add user message to local state immediately
2. Add empty assistant message with isStreaming: true
3. POST to /api/chat with full conversation history
4. Read response as SSE stream:

  const response = await fetch('/api/chat', { method: 'POST', body: ... })
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        if (data.text) {
          // append text to streaming assistant message
          updateStreamingMessage(data.text)
        }
        if (data.done) {
          // mark streaming complete, update clarityScore
          finalizeMessage(data.clarityScore)
        }
        if (data.error) {
          // handle error
          setError('Response failed. Try again.')
        }
      }
    }
  }

5. After message completes: classify the FIRST user message of session if concepts is empty

canGenerateInsight: local messages where role='user' has length >= 4

─────────────────────────────────
FILE 3: hooks/useClarity.ts
─────────────────────────────────
Tracks clarity score history for the animated chart.

export function useClarity(initialScore: number = 0) — returns:
  score: number
  history: number[]  (max 10 entries)
  updateScore: (newScore: number) => void
  trend: 'up' | 'down' | 'stable'

trend: compare last 2 history entries. Diff > 5 = 'up', < -5 = 'down', else 'stable'

─────────────────────────────────
FILE 4: components/StreamingMessage.tsx
─────────────────────────────────
Renders a single message bubble with streaming support.

Props:
  role: 'user' | 'assistant'
  content: string
  isStreaming: boolean
  turnNumber: number

User bubble:
- Right-aligned
- Background: rgba(245,166,35,0.08) — amber tint
- Border: 1px solid rgba(245,166,35,0.2)
- Font: Instrument Sans, 15px
- Border radius: 4px, bottom-right: 2px

Assistant bubble:
- Left-aligned, slight indent (16px left margin)
- Background: transparent
- Left border: 2px solid amber (full opacity)
- Padding-left: 16px
- Font: Instrument Sans, 15px, line-height 1.8
- If isStreaming: show blinking cursor at end (CSS animation)

Turn number indicator:
- Top-right of assistant bubble
- JetBrains Mono, 10px, text-dim
- Format: "T{turnNumber}"

Streaming cursor (CSS):
  @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
  .cursor { display: inline-block; width: 2px; height: 16px; background: amber; animation: blink 1s infinite; margin-left: 2px; }

Framer Motion: each message animates in with:
  initial: { opacity: 0, y: 8 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.25 }

─────────────────────────────────
FILE 5: components/ChatPanel.tsx
─────────────────────────────────
The right panel containing chat history + input.

Props:
  sessionId: string
  domain: Domain
  onClarityUpdate: (score: number) => void
  onDepthUpdate: (depth: DepthLevel) => void
  onInsightGenerated: (card: InsightCard) => void
  onConceptsUpdate: (concepts: string[]) => void

Uses useChat hook internally.

Layout (flex column, full height):
  ┌─────────────────────────────────┐
  │ HEADER: domain label + turn count│ ← 52px, border-bottom
  ├─────────────────────────────────┤
  │                                 │
  │ MESSAGE AREA (scrollable)       │ ← flex-1, overflow-y-auto
  │                                 │
  │ [welcome message on first load] │
  │                                 │
  ├─────────────────────────────────┤
  │ INSIGHT BUTTON (when >= 4 turns)│ ← 44px, only shown when canGenerateInsight
  ├─────────────────────────────────┤
  │ INPUT AREA                      │ ← 80px, border-top
  │ [textarea] [send button]        │
  └─────────────────────────────────┘

Welcome message (shown only when messages is empty):
  Playfair Display italic, centered, text-muted
  "Ask anything. I won't answer it — not directly."
  Below it: JetBrains Mono 12px, text-dim:
  "I'll ask you what you already think. We'll build from there."

Textarea:
  - Autoresizes (max 4 rows)
  - Placeholder: "What do you want to understand today?"
  - Background: transparent
  - No border (border is on parent container)
  - Enter = send, Shift+Enter = newline
  - Disabled when isStreaming: true

Send button:
  - Right side of input area
  - Use Button component, variant='primary', size='sm'
  - Label: "→" (just the arrow)
  - Disabled when isStreaming or content empty

Insight button (amber, full-width, subtle):
  - Shows: "Generate Insight Card →"
  - Appears with Framer Motion (fade in from bottom)
  - Calls generateInsight() on click
  - Shows "Analyzing..." while loading

Auto-scroll: useEffect that scrolls to bottom of message area on every new message.
messageEndRef pattern.

─────────────────────────────────
FILE 6: app/session/[sessionId]/page.tsx
─────────────────────────────────
The main session page. Two-panel layout.

Params: { sessionId: string }

Uses useSession hook for initial load.

If loading: show centered loading state (amber pulsing dot + "Loading session...")
If error: show error state + "Return to home" link

TWO PANEL LAYOUT (when loaded):
  ┌───────────────┬──────────────────────────┐
  │  SIDE PANEL   │      CHAT PANEL          │
  │   320px       │      flex-1              │
  │   border-right│                          │
  └───────────────┴──────────────────────────┘

State lifted to page:
  clarityScore: number (starts 0)
  depthLevel: DepthLevel | null
  insightCard: InsightCard | null
  conceptsCovered: string[]

Pass callback props to ChatPanel:
  onClarityUpdate, onDepthUpdate, onInsightGenerated, onConceptsUpdate

Pass display props to SidePanel:
  clarityScore, depthLevel, insightCard, conceptsCovered, domain

Mobile: SidePanel hidden on mobile (md:block). Show toggle button to reveal.

─────────────────────────────────
VERIFICATION CHECKLIST before finishing Phase 4:
─────────────────────────────────
□ useChat correctly implements SSE parsing with buffer handling
□ Streaming messages update char-by-char (not in large chunks)
□ isStreaming prevents sending new messages while streaming
□ canGenerateInsight is true only after >= 4 user turns
□ Auto-scroll works on new messages
□ Textarea Enter key sends, Shift+Enter adds newline
□ useSession fetches from correct API endpoint
□ Session page handles loading/error states
□ ChatPanel callbacks correctly update parent state
□ No TypeScript any types

When done, say: "PHASE 4 COMPLETE — Session page + chat built. Ready for Phase 5."
```

---

# ═══════════════════════════════════════════════════════
# PHASE 5 PROMPT
# Side Panel Components: Depth, Clarity, Knowledge Map, Insight Cards
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 TASK: SIDE PANEL COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phases 1-4 complete. Now build the visual intelligence components
that make Episteme feel alive and informative.

─────────────────────────────────
FILE 1: components/DepthMeter.tsx
─────────────────────────────────
Props: { depth: DepthLevel | null, previousDepth: DepthLevel | null }

DEPTH ORDER: SURFACE(1) → CONCEPTUAL(2) → ANALYTICAL(3) → SYNTHESIS(4)

Visual design — 4 steps stacked vertically:
  ┌────────────────────────────────┐
  │  ◈ SYNTHESIS         [dim]     │ ← if not reached, dimmed
  │  ◈ ANALYTICAL        [dim]     │
  │  ◈ CONCEPTUAL        [active]  │ ← amber, glowing, current depth
  │  ◈ SURFACE           [passed]  │ ← lighter amber, checked
  └────────────────────────────────┘

Each step:
  - Row: flex, gap-3, items-center, padding 10px 0
  - Dot: 8px circle, filled amber if passed/active, dim border if not reached
  - Label: JetBrains Mono, 11px, uppercase, tracking-wider
  - Active step: amber text + right-side label "← current"
  - Passed step: lighter amber text
  - Future step: text-dim

UPGRADE ANIMATION:
  When depth changes to higher level, trigger:
  - A 600ms amber pulse ring around the active dot (Framer Motion)
  - The new active label slides in from left (x: -8 → 0, opacity: 0 → 1)
  - If depth increases: emit a visual "upgrade pulse" — amber ring that expands
    and fades using Framer Motion animate

Section header: "// DEPTH LEVEL" (JetBrains Mono, 10px, amber, tracking-widest)

─────────────────────────────────
FILE 2: components/ClarityScore.tsx
─────────────────────────────────
Props: { score: number, history: number[], trend: 'up' | 'down' | 'stable' }

Layout:
  Section header: "// CLARITY SCORE" (JetBrains Mono, 10px, amber, tracking-widest)

  Large score display:
  - Animated counter: use Framer Motion's useMotionValue + useTransform
    OR simple useState + useEffect with requestAnimationFrame to count up
  - Font: JetBrains Mono, 56px, amber color
  - Adjacent trend indicator: ↑ (green), ↓ (red), → (dim)
  - JetBrains Mono, 20px

  Progress bar below:
  - Full-width bar, height 4px, background rgba(255,255,255,0.06)
  - Fill: amber, width transitions with score change (transition: width 0.8s ease)
  - At 70+: glowing amber bar (box-shadow amber glow)

  Sparkline chart (last 10 scores):
  - SVG-based, 100% width × 40px height
  - Plot score history as a path
  - Points: small amber circles, 3px radius
  - Line: amber, 1.5px stroke, opacity 0.6
  - Build SVG path manually (no chart library needed):
    - Scale scores 0-100 to 0-40px height
    - Distribute x-positions evenly across width
    - Use polyline element

Animate score change: when score prop changes, animate from old to new value
over 800ms using requestAnimationFrame.

─────────────────────────────────
FILE 3: components/KnowledgeMap.tsx
─────────────────────────────────
Props: { concepts: string[], gaps: string[], domain: Domain }

A simple visual graph showing explored concepts and their gaps.

NO D3 — build with pure CSS/SVG for hackathon speed.

Layout:
  Section header: "// KNOWLEDGE MAP" (JetBrains Mono, 10px, amber, tracking-widest)

  Canvas area (relative positioned div, 100% wide, ~200px tall):
  - Background: rgba(255,255,255,0.02), border 1px solid rgba(255,255,255,0.06)

  Explored concepts (solid amber pills):
  - Position: dynamically placed using a seeded layout
  - Each concept: amber border + amber-soft background, JetBrains Mono 10px
  - Framer Motion: stagger in when concepts array grows
  - Each pill: whileHover → show full concept name if truncated

  Gap concepts (dashed pills):
  - Dimmed, dashed border, text-dim color
  - Label: "?" prefix — "? regularization"
  - Only show max 3 gaps (truncate with "+ N more")

  Connection lines: SVG overlay with lines from center concept to others
  - Amber, opacity 0.15, stroke-dasharray for gaps
  - Use absolute-positioned SVG at full width/height of container

  If no concepts yet: show centered placeholder
  - Text: "Start a conversation to map your understanding"
  - JetBrains Mono, 11px, text-dim

─────────────────────────────────
FILE 4: components/InsightCard.tsx
─────────────────────────────────
Props: { card: InsightCard | null, onDismiss?: () => void }

When card is null: render nothing (null return).

When card exists: full-screen overlay with card reveal animation.

OVERLAY:
  - Fixed inset, background rgba(0,0,0,0.85), backdrop-blur-sm
  - Framer Motion: opacity 0→1 on mount
  - z-index: 50
  - Click outside to dismiss

CARD (centered, max-width 560px):
  Framer Motion entry: y: 40→0, opacity: 0→1, duration: 0.5, ease: [0.16, 1, 0.3, 1]
  Background: #141414, border: 1px solid rgba(245,166,35,0.3)
  Padding: 40px
  
  TOP STRIP: "INSIGHT CARD" label + close button
  - JetBrains Mono, 10px, amber, tracking-widest
  - Close: × button, top-right, ghost variant

  CONCEPT NAME: 
  - Playfair Display italic, 28px, text-primary
  - Thin amber line below (60px wide, 1px)

  CLARITY SCORE BADGE:
  - Inline: "CLARITY: 74/100"
  - JetBrains Mono, 12px
  - Color: green if >70, amber if 40-70, red if <40

  INSIGHT TEXT:
  - Playfair Display, 16px, line-height 1.75, text-muted
  - This is the most important text — give it breathing room

  GAPS SECTION (if gaps.length > 0):
  - Label: "// UNEXPLORED THREADS" (JetBrains Mono, 10px, amber)
  - Gap pills: dashed border, text-dim, each is a concept name
  - Framer Motion: stagger in at 50ms intervals

  NEXT QUESTION:
  - Label: "// CONTINUE WITH"  
  - Playfair Display italic, 15px, amber
  - The next_question from the card

  SHARE BUTTON:
  - "Copy insight" button (copies card text to clipboard)
  - Shows "Copied!" for 2s then reverts

─────────────────────────────────
FILE 5: components/SidePanel.tsx
─────────────────────────────────
The left panel container that composes all side components.

Props:
  clarityScore: number
  clarityHistory: number[]
  clarityTrend: 'up' | 'down' | 'stable'
  depthLevel: DepthLevel | null
  previousDepthLevel: DepthLevel | null
  conceptsCovered: string[]
  gaps: string[]
  domain: Domain
  insightCard: InsightCard | null

Layout (vertical flex, full height, 320px width, overflow-y-auto):
  ┌────────────────────────────┐
  │ EPISTEME wordmark          │ ← 52px header, border-bottom (matches ChatPanel)
  │ domain label               │
  ├────────────────────────────┤
  │ DepthMeter                 │ ← padded section, border-bottom
  ├────────────────────────────┤
  │ ClarityScore               │ ← padded section, border-bottom
  ├────────────────────────────┤
  │ KnowledgeMap               │ ← padded section, flex-1
  └────────────────────────────┘

Each section: padding 20px, border-bottom 1px solid rgba(255,255,255,0.06)

EPISTEME wordmark (top):
  - "EPISTEME" — JetBrains Mono, 13px, amber, tracking-[0.3em]
  - Below: domain in small text — JetBrains Mono, 10px, text-dim, "// {domain}"
  - Height: 52px, flex items-center, border-bottom

InsightCard is rendered as overlay (portal) — it doesn't live inside SidePanel,
but SidePanel passes card to it via its parent (session page).

─────────────────────────────────
VERIFICATION CHECKLIST before finishing Phase 5:
─────────────────────────────────
□ DepthMeter upgrade animation fires correctly on depth change
□ ClarityScore counter animates smoothly (no jumping)
□ Sparkline SVG renders without errors (no NaN in coordinates)
□ KnowledgeMap handles empty state gracefully
□ InsightCard overlay closes on outside click AND on × click
□ InsightCard "Copy insight" writes to clipboard correctly
□ SidePanel is 320px fixed width and scrolls internally if needed
□ All components handle null/undefined props gracefully
□ No layout overflow issues in 2-panel layout

When done, say: "PHASE 5 COMPLETE — Side panel components built. Ready for Phase 6."
```

---

# ═══════════════════════════════════════════════════════
# PHASE 6 PROMPT
# Polish, Error States, Final Wiring, Accessibility
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 TASK: POLISH + FINAL WIRING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All components and routes exist. Phase 6 is about making it
production-ready, demo-beautiful, and error-proof.

─────────────────────────────────
TASK 1: Toast Notification System
─────────────────────────────────
Create components/Toast.tsx — a simple, stateful toast system.
NO external library.

Export:
  export function Toast({ message, type, onClose }: ToastProps)
  type: 'success' | 'error' | 'info'

Styles:
  - Fixed bottom-right, z-50
  - JetBrains Mono, 13px
  - success: green border + bg-green/10
  - error: red border + bg-red/10
  - info: amber border + amber-soft bg
  - Framer Motion: slide in from right, auto-dismiss after 3s

Export a useToast hook:
  export function useToast() { 
    return { toast: (msg: string, type?: ToastProps['type']) => void }
  }

Implement with a simple Context + useState at app level (add to layout.tsx).

─────────────────────────────────
TASK 2: Loading States
─────────────────────────────────
Create components/LoadingDot.tsx:
  A pulsing amber dot for loading states.
  Props: { label?: string, size?: 'sm' | 'md' }
  Animation: scale oscillates 0.8 → 1.2 → 0.8, infinite, 1.2s

Create components/SkeletonLine.tsx:
  A shimmer skeleton for text loading states.
  Props: { width?: string, height?: number }
  Shimmer animation: left-to-right gradient sweep.

Use LoadingDot in:
  - Session page initial load
  - ChatPanel when isStreaming
  - Insight generation waiting state

─────────────────────────────────
TASK 3: Error Boundary
─────────────────────────────────
Create components/ErrorBoundary.tsx (class component, required for React error boundaries):

interface State { hasError: boolean; error: Error | null }

render fallback:
  - Centered, "Something broke." in Playfair Display italic
  - JetBrains Mono 12px error message (in dev) or generic (in prod)
  - "Try refreshing" button
  - Thin amber accent line at top

Wrap the session page content in ErrorBoundary.

─────────────────────────────────
TASK 4: next.config.ts
─────────────────────────────────
Create next.config.ts:

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
}

export default nextConfig

─────────────────────────────────
TASK 5: postcss.config.js
─────────────────────────────────
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

─────────────────────────────────
TASK 6: Depth Upgrade Event — Full Integration
─────────────────────────────────
In the session page (app/session/[sessionId]/page.tsx):

When depthLevel changes to a HIGHER level (e.g., SURFACE → CONCEPTUAL):
1. Trigger a full-screen "depth upgrade" animation:
   - A thin amber horizontal line sweeps across the screen (left to right, 0.6s)
   - Small tooltip appears bottom-center: "↑ Depth upgraded to {level}"
   - Auto-dismisses after 2s

Implement this as a DepthUpgradeFlash component:
  Props: { depth: DepthLevel | null, trigger: number }
  - 'trigger' is a counter that increments each time depth upgrades
  - useEffect watches 'trigger' to fire animation
  - AnimatePresence wraps the animation

─────────────────────────────────
TASK 7: Session Complete State
─────────────────────────────────
When insightCard is generated (onInsightGenerated fires):
- ChatPanel input area shows: "Session complete. Start a new session →"
- Button: routes back to home page
- The insight card overlay appears automatically
- Session is_complete = TRUE (already set by /api/insights route)

─────────────────────────────────
TASK 8: README.md
─────────────────────────────────
Write a clean README:

# Episteme — Socratic Study Engine

> AI that refuses to answer your questions.

## What it does
[2-paragraph description]

## Setup
1. Clone repo
2. cp .env.local.example .env.local
3. Fill in Anthropic API key and Supabase credentials
4. Run SQL from supabase/migrations/001_initial.sql in Supabase SQL editor
5. npm install
6. npm run dev

## Stack
[list]

## Hackathon
CBC Spring 2026 · Track 3 — Economic Empowerment & Education

─────────────────────────────────
TASK 9: Final Integration Audit
─────────────────────────────────
Go through every file and verify:

API ROUTES:
□ /api/session POST returns { session: Session } with correct shape
□ /api/session GET returns { session, messages, concepts }
□ /api/classify POST returns ClassifyResponse & { conceptId }
□ /api/chat POST streams SSE with 'data: {"text": "..."}\n\n' format
□ /api/chat sends final 'data: {"done": true, "clarityScore": N}\n\n'
□ /api/insights POST returns { insightCard: InsightCard }

HOOKS:
□ useSession correctly initializes from API response
□ useChat SSE parser handles partial chunks via buffer
□ useClarity trend calculation works correctly

COMPONENTS:
□ ChatPanel callbacks (onClarityUpdate, onDepthUpdate, etc.) are called at correct times
□ SidePanel receives all props from session page
□ InsightCard overlay appears when insightCard prop is non-null

DATA FLOW:
□ Session created on landing → stored in Supabase → ID in URL
□ Every user message → saved to messages table
□ Every assistant message → saved after streaming completes
□ Depth classification → saved to concepts table
□ Insight card → saved to insight_cards table + session marked complete

STYLING:
□ Fonts load correctly (check network tab in dev)
□ Amber accent (#f5a623) is used consistently
□ Dark background (#0a0a0a) everywhere
□ No white or light backgrounds anywhere

─────────────────────────────────
TASK 10: Vercel Deployment Config
─────────────────────────────────
Create vercel.json:
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"]
}

Note: "bom1" is Mumbai — lowest latency for Indian demo.
Add environment variables in Vercel dashboard (same 4 as .env.local).

─────────────────────────────────
FINAL VERIFICATION before finishing Phase 6:
─────────────────────────────────
□ npm run build completes with 0 TypeScript errors
□ Landing page → domain select → session create → redirect works end to end
□ Sending a message → streams → appears in chat → updates clarity score
□ After 4 user turns → insight button appears
□ Generating insight → card appears → session marked complete
□ All Supabase data persists (verify in Supabase dashboard)
□ No console.error calls in browser when using happy path
□ Page is usable on mobile screen (375px wide)

When done, say: "PHASE 6 COMPLETE — Episteme is production-ready. Deploy to Vercel."
```

---

# ═══════════════════════════════════════════════════════
# DEBUGGING PROMPT
# Use this when something breaks
# ═══════════════════════════════════════════════════════

```
[PASTE MASTER CONTEXT ABOVE THIS LINE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBUGGING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I am getting the following error:
[PASTE EXACT ERROR MESSAGE + STACK TRACE]

The error occurs when:
[DESCRIBE EXACT USER ACTION THAT CAUSES IT]

The relevant files are:
[PASTE THE FULL CONTENT OF THE FILES INVOLVED]

RULES FOR YOUR FIX:
1. Diagnose the root cause first — explain it in 2-3 sentences
2. Show the COMPLETE fixed file(s) — not just the changed lines
3. Explain why this fix works
4. List any other files that may need updating as a result
5. Do not change any functionality not related to the bug

Do not suggest "maybe try X" — give the definitive fix.
```

---

# ═══════════════════════════════════════════════════════
# DEMO SEED QUESTIONS
# Paste these into Episteme during your hackathon demo
# to guarantee beautiful Socratic exchanges
# ═══════════════════════════════════════════════════════

**Demo Q1 (ML domain — starts simple, goes deep):**
"What is gradient descent?"
*Expected depth upgrade arc: SURFACE → CONCEPTUAL → ANALYTICAL*

**Demo Q2 (Economics domain — judges from non-tech backgrounds will relate):**
"Why does printing money cause inflation?"
*Expected depth upgrade arc: SURFACE → CONCEPTUAL*

**Demo Q3 (CS domain — for technical judges):**
"What makes a hash table fast?"
*Expected depth upgrade arc: CONCEPTUAL → ANALYTICAL → SYNTHESIS*

**Demo Q4 (General — philosophy, tests the Socratic mode at its best):**
"What is the difference between knowing something and understanding it?"
*This is also a meta-question about what Episteme itself is doing — powerful for demos.*

---

# ═══════════════════════════════════════════════════════
# QUICK REFERENCE CARD
# Keep this open during the hackathon
# ═══════════════════════════════════════════════════════

```
MODEL:      claude-sonnet-4-20250514
DB:         Supabase (postgres)
DEPLOY:     Vercel (vercel --prod)

PORTS (dev):
  Next.js: http://localhost:3000
  Supabase: use remote (not local)

KEY COMMANDS:
  npm run dev          ← start dev server
  npm run build        ← verify no TS errors
  vercel --prod        ← deploy

SUPABASE SQL EDITOR:
  Run: supabase/migrations/001_initial.sql
  Then verify tables exist in Table Editor

API ROUTES:
  POST /api/session    ← { domain }
  GET  /api/session    ← ?id={sessionId}
  POST /api/classify   ← { question }
  POST /api/chat       ← ChatRequest (streaming)
  POST /api/insights   ← InsightRequest

COLOR CHEAT:
  Amber:  #f5a623
  BG:     #0a0a0a
  Surface:#111111
  Text:   #f0ede6
  Muted:  #8a8a8a

DEPTH ORDER:
  SURFACE < CONCEPTUAL < ANALYTICAL < SYNTHESIS
```
