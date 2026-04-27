# Episteme — Socratic Study Engine

> AI that refuses to answer your questions.

>Episteme — Socratic Study Engine AI that refuses to think for you.

## What it does

Episteme is a Socratic AI tutoring system built for the CBC Spring 2026 Hackathon (Track 3: Economic Empowerment & Education). Instead of answering questions directly, it engages users in structured Socratic dialogue — probing their existing understanding, guiding them to reason through concepts, and generating an insight card that maps what they now understand and what gaps remain.

Under the hood, Episteme runs 7 research-backed algorithms alongside the Claude API: a Bloom-grounded depth classifier, a formal Socratic state machine (7 states), Bayesian Knowledge Tracing for clarity scoring, a semantic understanding verifier, a concept prerequisite graph builder, an Ebbinghaus gap prioritizer, and a response depth signal extractor. Every turn, these algorithms enrich the system prompt sent to Claude — making the Socratic dialogue adaptive, not just a personality prompt.

## Setup

1. Clone the repo
2. `cp .env.local.example .env.local`
3. Fill in your Anthropic API key and Supabase credentials in `.env.local`
4. Run the SQL from `supabase/migrations/001_initial.sql` in your Supabase SQL editor
5. `npm install`
6. `npm run dev`

Open `http://localhost:3000`, select a domain, and start asking questions.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`) via streaming SSE
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS v3 + Framer Motion
- **Deployment**: Vercel (Mumbai region `bom1`)

## Environment variables

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Hackathon

**CBC Spring 2026 · Track 3 — Economic Empowerment & Education**

Core thesis: every AI tool in 2026 optimises for user satisfaction (fast answers). Episteme optimises for user growth (better thinking). These are fundamentally opposed — and that opposition is the entire product.
