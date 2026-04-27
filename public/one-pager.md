# EPISTEME
### Socratic AI Tutor — Built on Claude

---

## What It Does

Episteme is a Socratic tutoring system. When you ask it a question, it doesn't answer — it asks what *you* already think. Every response is engineered to push your reasoning one cognitive level higher.

It covers **Machine Learning, Statistics, Economics, Computer Science, and General Reasoning**.

---

## The 7-Algorithm Pipeline

Every student message runs through a deterministic pipeline before Claude sees it:

| Step | Algorithm | What It Does |
|------|-----------|--------------|
| 1 | **RDSE** — Response Depth Signal Extractor | Scores reasoning density: connectives (0.30), length (0.20), uncertainty (0.15), technical terms (0.20), structure (0.10), clarity (0.05) → `qualityScore ∈ [0,1]` |
| 2 | **BGDC** — Bloom-Grounded Depth Classifier | Classifies the student's question into Bloom's taxonomy (SURFACE→SYNTHESIS) via keyword fusion (30%) + LLM (70%) |
| 3 | **SDSM** — Socratic Dialogue State Machine | Determines next Socratic state (PROBE→DEEPEN→REDIRECT→SCAFFOLD→RECTIFY→CONSOLIDATE→COMPLETE) based on qualityScore, semanticAccuracy, confusionCount, consecutiveScaffolds |
| 4 | **SUV** — Semantic Understanding Verifier | Async Claude call: scores semantic accuracy (0–1.0) and identifies specific misconceptions; stored in session_state for next turn's SDSM |
| 5 | **CBKT-CS** — Bayesian Knowledge Tracing Clarity Scorer | Updates per-session BKT state (pL, pT, pS, pG) using qualityScore; produces 0–100 clarity score |
| 6 | **CPGAB** — Concept-Performance Gap Analyser (Bloom) | Maps covered concepts against domain core concept graph; surfaces knowledge gaps to Claude |
| 7 | **EGP** — Ebbinghaus Gap Prioritizer | Calculates retention decay `R = e^(-t/S)` to surface the most urgent gaps for the next session |

---

## What Makes It Different

**The AI never answers directly.** The system prompt always contains the active SDSM state instruction — e.g. `STATE: SCAFFOLD. Give ONE minimal foothold.` — which Claude obeys. The student's own reasoning becomes the curriculum.

**Cognitive signals update in real time.** As you type your response, three live bars (REASONING / DEPTH / CLARITY) reflect how your draft scores against the RDSE algorithm.

**Sessions persist and personalise.** After 4+ turns, the metacognitive agent reads the full conversation and writes a `nextSessionStarter` — a specific probe question that picks up exactly where your understanding broke down.

---

## Tech Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Framer Motion, Space Grotesk
- **AI**: Claude Sonnet (streaming SSE, SDSM-directed system prompt)
- **Database**: Supabase (PostgreSQL) — sessions, messages, concepts (with BKT columns), insight_cards, learner_profiles
- **Auth**: Supabase email/password, JWT decoded locally (no network round-trip)

---

## Database Schema (Key Tables)

```sql
sessions      — id, domain, session_state (JSONB: SDSM signals), user_id, user_email
messages      — session_id, role, content, turn_number
concepts      — session_id, name, depth_reached, clarity_score, bkt_pL/pT/pS/pG
insight_cards — session_id, concept, insight, gaps[], clarity_score, next_starter
learner_profiles — session_id, strength_areas, urgent_gaps, next_session_starter, learning_trajectory
```

---

## The Insight Card

After 4+ turns, the user can generate an **Insight Card** — a Claude-written summary of:
- What they now genuinely understand (specific to their reasoning, not generic)
- The top 3 adjacent concepts they haven't explored yet
- A clarity score (0–100, BKT-derived)
- A "next session" starter question from the metacognitive agent

---

## Running It

```bash
npm install
# Set ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY in .env.local
# Run all 4 migrations in supabase/migrations/ against your Supabase project
npm run dev
```

---

*Built for the Claude AI Hackathon · April 2026*
