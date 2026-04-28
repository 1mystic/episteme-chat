# HACKATHON STRATEGY — CBC Spring 2026 · April 27
## Atharv Khare · Personal Build Plan

---

## PART 0 — EXECUTIVE DECISION SUMMARY

**Track:** Track 3 — Economic Empowerment & Education  
**Project Name:** **Episteme** *(repurposed/evolved)*  
**Core Tagline:** *"The AI that teaches you to ask better questions — not just answer yours."*  
**Submission Target:** T+20:00 (2h buffer)  
**Stack:** Next.js (App Router) + Claude API + Supabase + Vercel  
**Team Size Recommendation:** Solo or 2 (you + one frontend collaborator)

---

## PART 1 — PROBLEM IDENTIFICATION (First Principles)

### What's actually broken in 2026?

The world is drowning in AI-generated answers. ChatGPT, Gemini, Perplexity — every tool is a better Google. You ask → it answers. The feedback loop is: *question → instant answer → dopamine → next question.*

What's being destroyed in this loop:

1. **The ability to think in depth.** Students don't sit with confusion anymore. Discomfort = open AI tab.
2. **First-principles reasoning.** People learn the answer, never the path.
3. **Economic self-sufficiency.** Access to AI is uniform in 2026. The gap is no longer *access to information* — it's **access to the capacity to use information well.**

The population being failed most by this: **students and early-career professionals in Tier-2/3 cities of India, Southeast Asia, Latin America** — people who have access to the internet but not to mentors, not to Socratic dialogue, not to a teacher who will ask them "but *why* do you think that?"

They are consuming knowledge with no framework to evaluate it.

### The specific, painful gap

At IIT Madras you know this from both sides:
- Students in the DS program copy notebook outputs without understanding what the model is doing.
- People preparing for GATE, placements, or career switches are memorizing patterns, not internalizing principles.
- Job interviewers in ML/AI consistently say: "They know the algorithms. They cannot reason about *when* to use them or *why* they fail."

This is not an access problem. This is a **cognitive scaffolding** problem.

**No tool in 2026 is training people to ask better questions.** Every tool answers the question you give it. None of them push back.

---

## PART 2 — THE PRODUCT IDEA

### **Episteme: The Socratic Study Engine**

A Claude-powered AI learning companion that **refuses to just answer your question** — and instead helps you *develop the question* into something deeper.

### How it works (user-facing flow)

```
User types: "What is overfitting?"

Instead of: a definition

Episteme asks:
  "Before I explain — what do you think happens to a model 
   that memorizes its training data? What would break?"

User responds imperfectly.

Episteme says:
  "You're close. You said 'the model gets too confident' — 
   that's actually exactly right for one failure mode. 
   Can you think of a *different* type of data the model 
   would fail on? What do we call data the model hasn't seen?"

... Socratic back-and-forth for 4-6 turns ...

At the end:
  - A clarity score (0-100) for that concept
  - A "depth map" showing what they understood vs. glossed over
  - A saved insight card: "You understand overfitting intuitively. 
    You haven't yet connected it to bias-variance tradeoff."
```

### What makes it genuinely different

| Feature | ChatGPT / Claude.ai | Episteme |
|---|---|---|
| Answer mode | Always answers immediately | Defaults to Socratic questioning |
| Goal | Satisfy the query | Build understanding |
| Memory | Per-session | Tracks concept mastery over time |
| Feedback | None | Clarity score per concept |
| Depth | User controls | AI guides depth via probing |
| Output | Text | Insight cards + knowledge graph |

### The depth classifier hook (your existing work)

This is where your **Episteme project from your portfolio** becomes the secret weapon. You've already thought about LLM-powered question depth classification. Here it adapts:

- Every user question is classified by depth: surface / conceptual / analytical / synthesis
- The AI's Socratic strategy changes based on depth level
- Users can *see* their question being upgraded in real-time

---

## PART 3 — JUDGING CRITERIA ALIGNMENT

### Impact Potential (25 pts) → Target: 22-25

**Who exactly:** Students preparing for GATE DA, placement interviews, or career transitions in STEM — specifically those without access to mentors or coaching institutes. Secondary: self-learners in any domain.

**What changes for them:** For the first time, they have a system that *notices when they're pattern-matching instead of understanding* and forces productive discomfort. This is what expensive coaching provides. This is what a 1:1 IIT professor interaction looks like. Episteme democratizes Socratic teaching.

**Legibility of benefit:** Immediate. Show any student the before/after of their question quality in a single session.

**Ethical question answered:** "Who gets excluded?" → We are *especially* designed for people locked out by language, wealth, or geography. The interface works in English with planned support for Hindi/Tamil. No tech requirements beyond a browser and internet.

### Technical Execution (30 pts) → Target: 26-29

The demo must *work*. A live 5-minute Socratic session with Claude playing the role of Socratic tutor — showing: question intake → depth classification → probing response → clarity score → insight card generation. This is achievable in 24h with the stack below.

### Ethical Alignment (25 pts) → Target: 22-24

**Core ethical design principle:** Episteme is *anti-answer*. It is philosophically built to keep humans as thinkers.

Risks acknowledged and safeguarded:
- **Frustration trap:** Users who are confused don't need more questions. System detects "lost" state and shifts to guided explanation mode.
- **Bias in depth scoring:** Clarity scores are explanatory, not punitive. Shown as growth trajectories, not grades.
- **Cultural epistemic bias:** Socratic method is Western-rooted. We acknowledge this and allow users to choose "Direct explanation" mode at any time. The Socratic mode is an *offer*, not a requirement.
- **Dependency paradox:** Ironically, the tool's goal is to make itself unnecessary. We track "independent reasoning streaks" — when you answer your own question before Episteme asks.

### Presentation (20 pts) → Target: 17-20

The pitch *is* a live Episteme session. Walk judges through asking a question about AI themselves. Let them see their question get Socratically probed. End with the insight card generated for them. Judges don't just hear about the product — they experience it.

---

## PART 4 — TECH STACK & ARCHITECTURE

### Stack Decision

```
Frontend:    Next.js 15 (App Router) + TypeScript
Styling:     Tailwind CSS + shadcn/ui
Animation:   Framer Motion
AI:          Claude claude-sonnet-4-20250514 via Anthropic API (streaming)
DB:          Supabase (postgres + auth + realtime)
Deploy:      Vercel (zero config)
```

**Why not pure frontend?** Supabase gives you persistent session storage for the insight cards and mastery tracking — the feature that separates Episteme from a stateless chatbot. Without it, the product loses its memory-of-learning value prop.

**Why Next.js over plain React?** Server Actions → API keys stay server-side. Route handlers → clean streaming SSE architecture. Vercel deploy is 1 command.

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                    │
│                                                      │
│  Chat Interface  ←──── Streaming SSE ────────────   │
│  Insight Cards                                       │
│  Depth Meter     ←──── Real-time scoring             │
│  Knowledge Map                                       │
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────┐
│                   NEXT.JS (VERCEL)                   │
│                                                      │
│  /api/chat         → Orchestrator (server action)   │
│  /api/classify     → Depth classifier               │
│  /api/insights     → Card generator                 │
│                                                      │
│  Session Manager   → Tracks conversation state      │
│  Prompt Composer   → Builds Socratic system prompt  │
└────────┬────────────────────────────────────────────┘
         │
    ┌────▼─────────┐    ┌──────────────────────┐
    │ CLAUDE API   │    │   SUPABASE           │
    │              │    │                      │
    │ Socratic     │    │  sessions table      │
    │ Tutor Agent  │    │  concepts table      │
    │              │    │  insight_cards table │
    │ Depth        │    │  user_profiles table │
    │ Classifier   │    │                      │
    └──────────────┘    └──────────────────────┘
```

### Core Prompt Architecture

**System Prompt (Socratic Tutor):**
```
You are Episteme — a Socratic tutor. Your entire purpose is to help 
the user develop understanding, not to provide answers.

RULES:
1. NEVER answer a question directly on the first turn.
2. Always begin with a probing question that surfaces what the user 
   already knows.
3. Calibrate depth to the user's responses — if they're clearly 
   expert, probe deeper. If lost, guide gently.
4. After 4-6 exchanges, offer to consolidate understanding.
5. Always end a learning session with one "insight card" — a crisp 
   statement of what the user now knows.

DEPTH LEVELS:
- Surface: "What is X?" → Ask what they already think
- Conceptual: "How does X work?" → Ask them to reason from parts
- Analytical: "Why does X fail?" → Ask for edge cases
- Synthesis: "When would you choose X over Y?" → Ask for tradeoffs

TONE: Warm, curious, patient. Never condescending. Never dismissive 
of wrong answers — wrong answers are data.

Current session context: {session_context}
Concepts discussed so far: {concepts_covered}
```

**Depth Classifier Prompt:**
```
Classify the following question into one of four depth levels:
SURFACE | CONCEPTUAL | ANALYTICAL | SYNTHESIS

Question: "{user_question}"

Return JSON: {"depth": "CONCEPTUAL", "confidence": 0.87, "reasoning": "..."}
```

### Database Schema (Supabase)

```sql
-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  domain TEXT, -- "machine-learning", "statistics", "economics"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  turns_count INT DEFAULT 0
);

-- Concepts touched in a session
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT,          -- "overfitting"
  depth_reached TEXT, -- "ANALYTICAL"
  clarity_score INT,  -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated insight cards
CREATE TABLE insight_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  concept TEXT,
  insight TEXT,       -- "You understand overfitting. You haven't connected it to bias-variance."
  gaps TEXT[],        -- ["bias-variance tradeoff", "regularization"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Algorithms

**1. Clarity Score Calculation**

After each Socratic exchange, Claude scores the user's understanding:
```
Clarity Score = (Conceptual Accuracy × 0.4) 
              + (Reasoning Chain Quality × 0.35) 
              + (Edge Case Awareness × 0.25)
```
Scores accumulate across turns. Shown as a live meter in the UI.

**2. Depth Upgrade Detection**

When a user's *response* to a probe demonstrates deeper understanding than their original question implied, the system flags a "depth upgrade event" — a delightful UI moment where the depth meter visibly jumps.

**3. Gap Detection**

At session end, Claude identifies concepts adjacent to what was discussed that the user *didn't* reach. These become "open threads" — seeded as starting questions for next session.

---

## PART 5 — UI/UX DESIGN VISION

### Aesthetic Direction: **"Dark Academia meets Terminal"**

Inspired by your own portfolio's dark theme with mono fonts and accent lime, but pushed further into the "serious learning space" aesthetic.

- **Background:** Near-black (#0a0a0a) with very subtle paper texture
- **Accent:** Electric amber (#f5a623) — warmth of candlelight, urgency of a deadline
- **Mono font:** JetBrains Mono (for depth labels, scores)
- **Serif font:** Playfair Display (for insight cards — feels archival, weighted)
- **Sans font:** Instrument Sans (for chat, clean and readable)

### Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  EPISTEME    [domain: ml]    [session: 12min]    [←exit] │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   KNOWLEDGE MAP      │         CHAT AREA                │
│   (mini graph of     │                                  │
│    concepts explored)│  ┌──────────────────────────┐   │
│                      │  │ "What is overfitting?"   │   │
│   CLARITY METER      │  └──────────────────────────┘   │
│   ████████░░ 74%     │                                  │
│                      │  Episteme: "Before I explain,    │
│   DEPTH LEVEL        │  what do you think happens       │
│   [CONCEPTUAL]       │  to a model that memorizes..."   │
│                      │                                  │
│   INSIGHT CARDS      │  ┌──────────────────────────┐   │
│   ─ overfitting (3)  │  │ Your answer...           │   │
│   ─ bias-variance    │  └──────────────────────────┘   │
│                      │                                  │
│                      │  [depth upgraded ↑ ANALYTICAL]  │
└──────────────────────┴──────────────────────────────────┘
```

### Key UI Moments (demo-worthy)

1. **Question intake animation** — as user types, the depth label quietly updates (SURFACE → CONCEPTUAL) before they even submit.
2. **Depth upgrade pulse** — when AI detects the user "leveled up" their thinking mid-session, a golden ring pulses around the depth label.
3. **Insight card reveal** — end of session, a card flips in with a satisfying animation: "Here is what you now know."
4. **Gap thread** — faint dotted lines in the knowledge map pointing to unexplored adjacent concepts, with the label: "You haven't asked about this yet."

---

## PART 6 — 24-HOUR BUILD PLAN (PHASE-BY-PHASE)

### T+0:00–1:00 | Setup & Team Lock

- [ ] Register team immediately at T+0:00
- [ ] Select Track 3 in the T+0:30 window
- [ ] Clone Next.js starter, init Supabase project, set env vars
- [ ] Rough wireframe in Excalidraw (30 min max)

### T+1:00–5:00 | Core AI Loop (Most Critical)

The entire product lives or dies on the Socratic AI working correctly.

- [ ] Build `/api/chat` route with streaming Claude response
- [ ] Write and iterate the Socratic system prompt (expect 5-6 iterations)
- [ ] Build depth classifier endpoint
- [ ] Manual testing: ask 20 questions, verify Socratic behavior holds
- [ ] Hardcode session state in memory (skip DB for now)

**Success criterion at T+5:00:** You can type a question and get a Socratic response that doesn't immediately answer it.

### T+5:00–10:00 | UI Shell + Supabase

- [ ] Build the two-panel layout (knowledge map left, chat right)
- [ ] Depth meter component (live-updating)
- [ ] Clarity score accumulation logic
- [ ] Wire Supabase: session create, concept tracking, insight card storage
- [ ] Streaming chat UI with proper bubble rendering

### T+10:00–15:00 | Insight Cards + Knowledge Map

- [ ] Insight card generator prompt + UI reveal animation
- [ ] Knowledge map (use D3 force-directed or simple CSS flex graph)
- [ ] Gap detection logic
- [ ] Domain selector (ML / Statistics / Economics / General)

### T+15:00–19:00 | Polish + Edge Cases

- [ ] Handle "I'm confused" state → shift to explanation mode
- [ ] Handle very short / low-quality answers gracefully
- [ ] Add the depth upgrade pulse animation
- [ ] Mobile responsive (judges may view on phone)
- [ ] Error states, loading states, empty states

### T+19:00–20:00 | Submission Prep

- [ ] Deploy to Vercel (final URL)
- [ ] Record 2-min demo video as backup
- [ ] Write submission description (impact, tech, ethics, future)
- [ ] Submit at T+20:00 sharp — 2h before penalty window

### T+20:00–24:00 | Pitch Prep

- [ ] Rehearse the 5-min pitch as a live Episteme session
- [ ] Prepare 3 "seed questions" that demo beautifully:
  - "What is gradient descent?" (ML domain)
  - "Why do governments print money?" (Economics domain)
  - "What is a linked list?" (CS domain)
- [ ] Anticipate Q&A: ethical concerns, scale, differentiation from Claude.ai

---

## PART 7 — FUTURE VISION (For Pitch / Judges)

### 3-Month Roadmap Post-Hackathon

**V1.1 — Personalized Learning Paths**
The knowledge map becomes a curriculum. Based on your insight cards and gaps, Episteme generates a 30-day Socratic study plan for any topic.

**V1.2 — Teacher Dashboard**
Educators upload a syllabus. Episteme auto-generates Socratic question trees for each topic. Teachers see class-wide clarity heatmaps.

**V1.3 — Vernacular Support**
Hindi, Tamil, Bengali — Socratic dialogue in regional languages. This is the actual unlock for Tier-2/3 India.

### Business Model (for judges who ask)

- **Freemium:** 10 sessions/month free. Premium ₹199/month for unlimited + export.
- **B2B:** Coaching institutes (GATE prep, upskilling) license Episteme as a tutor layer. Target: Unacademy, Physics Wallah, Coursera India.
- **Impact metric:** 1 million first-principles conversations in Year 1.

### Scale Architecture

For scale beyond hackathon:
- Move to LangGraph multi-agent: separate Socratic Agent, Classifier Agent, Insight Agent
- Add pgvector embeddings for concept similarity and knowledge graph persistence
- RLHF loop: users rate whether Episteme's probing was helpful → fine-tune system prompts
- CDN-edge streaming for sub-100ms response latency in India

---

## PART 8 — COMPETITIVE DIFFERENTIATION

| Competitor | What they do | Episteme's edge |
|---|---|---|
| Claude.ai | Answers everything | Refuses to answer — teaches instead |
| Khan Academy AI | Explains concepts | Socratic dialogue, not explanation |
| Duolingo | Gamified repetition | Depth-first understanding, not recall |
| Coursera AI | Course supplement | Works on any question, any domain |
| Perplexity | Research assistant | Anti-answer by design |

The key insight: **Every AI tool in 2026 is optimizing for user satisfaction (fast answers). Episteme is optimizing for user growth (better thinking).** These are fundamentally opposed, and that opposition is the entire product.

---

## PART 9 — RISK REGISTER

| Risk | Probability | Mitigation |
|---|---|---|
| Claude API latency ruins demo | Medium | Pre-cache 3 scripted sessions as fallback |
| Socratic prompt breaks for complex questions | High | Build "explain anyway" escape hatch |
| Supabase setup takes too long | Low | Build session state in localStorage first |
| Judges don't resonate with Socratic framing | Low | Lead with the problem, not the philosophy |
| UI looks unpolished at demo time | Medium | Use shadcn/ui components from hour 1, polish last |

---

## PART 10 — THE PITCH SCRIPT (5 Minutes)

**[0:00–0:45] The Problem**
"In 2026, every student has access to AI. Every student can get any answer in seconds. But here's what I noticed at IIT Madras: students who use AI the most are *less* able to reason independently. We've built the most powerful answer machines in history — and accidentally made people worse at thinking."

**[0:45–1:30] The Insight**
"The problem isn't the answers. It's that no tool ever asks 'but why do you think that?' The entire Socratic tradition — the foundation of every great university — has been replaced by a search bar."

**[1:30–3:30] Live Demo**
"Let me show you Episteme. I'll type a real question — [type: 'What is gradient descent?'] — and you'll see what Episteme does instead of answering."
[Walk through 3-4 Socratic turns live. Show depth meter rising. Show insight card.]

**[3:30–4:30] Architecture & Ethics**
"Under the hood: Claude API with a Socratic system prompt, a depth classifier that reads question quality in real-time, and a knowledge graph that tracks what you understand vs. what you've glossed over. Ethically — Episteme never forces Socratic mode. If you're confused, it shifts to explanation. The goal is to make itself unnecessary."

**[4:30–5:00] Vision**
"We're building for the 50 million students in India who have internet but no mentor. In vernacular languages. For GATE prep, career transitions, interview prep. Episteme is what happens when you optimize AI for thinking instead of answering."

---

*This document is your single source of truth for April 27. Trust the plan. Ship the thing.*
