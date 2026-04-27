# EPISTEME — CLAUDE CODE STARTER PROMPT
# Give this file + HACKATHON_STRATEGY.md + EPISTEME_BUILD_PROMPTS.md + EPISTEME_ALGORITHMS.md to the agent
# Then paste the instruction block below as your first message

---

## INSTRUCTION TO AGENT (paste this as your opening message)

You have been given 4 reference documents:
- `HACKATHON_STRATEGY.md` — product vision, judging strategy, UI/UX design system
- `EPISTEME_BUILD_PROMPTS.md` — complete file structure, DB schema, all AI prompts, phase-by-phase build plan
- `EPISTEME_ALGORITHMS.md` — 7 research-grade backend algorithms with full TypeScript implementations
- This file — your operating instructions

You are building **Episteme**: a Socratic AI tutoring web app for a 24-hour hackathon. Read all 4 documents before writing a single file. Then build the project phase by phase exactly as specified.

---

## AGENT OPERATING RULES (non-negotiable)

**1. Read before build.**
Before writing any code, confirm you have read and understood all 4 documents. State the tech stack, file structure, and the 7 algorithm names from memory. If you cannot, re-read.

**2. Build in strict phase order.**
Phase 1 → 2 → 3 → 4 → 5 → 6. Do not start Phase N+1 until Phase N is complete and verified. At the end of each phase, run `npm run build` (or `tsc --noEmit`) and fix ALL TypeScript errors before proceeding.

**3. Write complete files only.**
No `// ... rest of code`, no stubs, no `TODO` comments in logic paths. Every file you create must be complete and runnable. If a file is long, write it in one code block anyway.

**4. Never invent architecture.**
The file structure is defined in `EPISTEME_BUILD_PROMPTS.md`. The algorithms are implemented in `EPISTEME_ALGORITHMS.md` as `lib/algorithms.ts`. Do not create alternative structures or rename files.

**5. Environment variables.**
Never hardcode secrets. Always use `process.env.ANTHROPIC_API_KEY`, `process.env.NEXT_PUBLIC_SUPABASE_URL`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`, `process.env.SUPABASE_SERVICE_ROLE_KEY`. The user will provide a `.env.local` file.

**6. The streaming route is the most critical piece.**
`app/api/chat/route.ts` must implement Server-Sent Events correctly. Use the exact SSE pattern from `EPISTEME_BUILD_PROMPTS.md` Phase 2. Test it by sending a message before building any UI.

**7. Supabase uses the server client in API routes.**
Import `createServerSupabaseClient` from `lib/supabase-server.ts` in all `app/api/` routes. Never import the browser client (`lib/supabase.ts`) in server code.

**8. The algorithm file is the brain.**
`lib/algorithms.ts` contains all 7 algorithms (RDSE, SDSM, CBKT-CS, SUV, BGDC, CPGAB, EGP). Create this file exactly as specified in `EPISTEME_ALGORITHMS.md` Section 10. Every API route imports from it. Do not duplicate algorithm logic elsewhere.

**9. Fix errors immediately, never skip.**
If `npm run build` shows a TypeScript error, fix it before writing the next file. Do not accumulate errors.

**10. The UI must match the design system.**
Colors, fonts, and component styles are specified in `HACKATHON_STRATEGY.md` and `EPISTEME_BUILD_PROMPTS.md`. Dark background (#0a0a0a), amber accent (#f5a623), Playfair Display + JetBrains Mono + Instrument Sans. Do not substitute these.

---

## BUILD SEQUENCE

Execute these phases in order. Each phase ends with a verification step.

### PHASE 1 — Foundation (no UI, no API)
Create in this order:
1. `package.json` — exact dependencies from BUILD_PROMPTS Phase 1
2. `tsconfig.json`
3. `tailwind.config.ts` — with custom colors and fonts
4. `app/globals.css` — CSS variables, Google Fonts import, grain texture
5. `lib/types.ts` — ALL TypeScript interfaces
6. `lib/algorithms.ts` — ALL 7 algorithms from ALGORITHMS.md Section 10 (complete implementation)
7. `lib/anthropic.ts`
8. `lib/supabase.ts` (browser)
9. `lib/supabase-server.ts` (server)
10. `lib/prompts.ts` — all prompt builder functions
11. `supabase/migrations/001_initial.sql` — exact schema from BUILD_PROMPTS
12. `.env.local.example`
13. `next.config.ts`
14. `postcss.config.js`

**Phase 1 verification:** Run `npx tsc --noEmit`. Zero errors. Confirm `lib/algorithms.ts` exports: `extractDepthSignals`, `determineNextState`, `updateBKT`, `bktToScore`, `keywordClassify`, `calculateGapUrgency`, `calculateSM2Interval`, `STATE_INSTRUCTIONS`.

---

### PHASE 2 — API Routes
Create in this order:
1. `app/api/session/route.ts` — POST creates session, GET fetches session+messages+concepts
2. `app/api/classify/route.ts` — POST runs BGDC (keyword + LLM fusion), saves to concepts table
3. `app/api/chat/route.ts` — POST streaming SSE; runs RDSE → SDSM → SUV → CBKT-CS → builds enriched system prompt → streams Claude → saves to DB → sends `{done: true, clarityScore, nextState}`
4. `app/api/insights/route.ts` — POST runs EGP on gaps, generates insight card via Claude, saves to DB, marks session complete

**Critical for chat route — the per-turn pipeline must run in this exact order:**
```
1. Save user message to DB (BEFORE streaming)
2. extractDepthSignals(message, domain, turnNumber) → qualityScore, confusionCount
3. determineNextState(turnNumber, qualityScore, semanticAccuracy, confusionCount, consecutiveScaffolds) → nextState
4. [async, non-blocking] semanticUnderstandingVerify() via Claude → semanticAccuracy, misconception
5. updateBKT(currentBKTState, qualityScore) → newBKTState
6. buildAlgorithmEnrichedSystemPrompt(domain, turnNumber, nextState, clarityScore, bktState, misconception, concepts, gaps)
7. Stream Claude response
8. [after stream completes] Save assistant message, update BKT in DB, update turns_count
9. Send final SSE event: {done: true, clarityScore: bktToScore(newBKTState), nextState, canGenerateInsight}
```

**Phase 2 verification:** Use curl or a REST client to test each route:
```bash
# Test session creation
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"domain":"ml"}'
# Must return: {"session": {"id": "...", "domain": "ml", ...}}

# Test classification
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"question":"What is overfitting?","sessionId":"<id from above>"}'
# Must return: {"depth":"SURFACE","confidence":0.85,...}

# Test chat (streaming) — must see SSE events in terminal
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<id>","message":"What is overfitting?","turnNumber":1,"domain":"ml","conversationHistory":[],"conceptsCovered":[]}'
# Must see: data: {"text":"..."} lines followed by data: {"done":true,...}
```
All 3 must pass before Phase 3.

---

### PHASE 3 — Landing Page
1. `app/layout.tsx`
2. `components/ui/button.tsx` — custom Button (4 variants)
3. `components/DomainSelector.tsx` — 5 domain cards with Framer Motion
4. `app/page.tsx` — landing page; on domain select → POST /api/session → router.push(`/session/${id}`)

**Phase 3 verification:** `npm run dev`. Open `http://localhost:3000`. Click a domain card. Should redirect to `/session/[some-uuid]` (404 is fine at this point — the route doesn't exist yet). No console errors on the landing page itself.

---

### PHASE 4 — Session Page + Chat
1. `hooks/useSession.ts`
2. `hooks/useChat.ts` — SSE streaming consumer; implements the buffer-based parser
3. `hooks/useClarity.ts`
4. `components/StreamingMessage.tsx` — user/assistant bubbles with streaming cursor
5. `components/ChatPanel.tsx` — full chat UI with auto-scroll, textarea, send button, insight trigger button
6. `app/session/[sessionId]/page.tsx` — two-panel layout, loading/error states, lifted state

**The SSE consumer in useChat.ts must use the buffer pattern:**
```typescript
let buffer = ''
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() || ''
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6))
        // handle data.text, data.done, data.error
      } catch { /* skip malformed */ }
    }
  }
}
```

**Phase 4 verification:** Full end-to-end test:
- Open `/session/[valid-session-id]`
- Type "What is gradient descent?" and press Enter
- Must see: streaming text appearing character by character in the chat
- Must NOT see a direct answer — the response must ask the user something back
- After send: clarity score changes, no TypeScript errors in console

---

### PHASE 5 — Side Panel Components
1. `components/DepthMeter.tsx` — 4-step visual with upgrade pulse animation
2. `components/ClarityScore.tsx` — animated counter + sparkline SVG + trend indicator
3. `components/KnowledgeMap.tsx` — concept pills + gap pills + SVG connection lines
4. `components/InsightCard.tsx` — full-screen overlay, Framer Motion reveal, copy button
5. `components/SidePanel.tsx` — composes all above, 320px fixed width

**Phase 5 verification:**
- Send 4+ messages in a session
- Depth meter must show current level highlighted
- Clarity score must animate upward as quality responses are given
- Knowledge map must show at least the first concept as an explored pill
- After 4 user turns, the "Generate Insight Card" button must appear in ChatPanel
- Click it → InsightCard overlay must appear with concept, insight text, gaps, and next question

---

### PHASE 6 — Polish + Deploy
1. `components/Toast.tsx` + `useToast` hook + add ToastProvider to `app/layout.tsx`
2. `components/LoadingDot.tsx`
3. `components/ErrorBoundary.tsx`
4. `components/DepthUpgradeFlash.tsx` — amber line sweep animation on depth upgrade
5. Session complete state in ChatPanel — show "Session complete. Start new session →"
6. `vercel.json`
7. `README.md`
8. Final audit: run `npm run build` — must complete with 0 errors, 0 warnings about missing env vars in build (those are runtime)

**Deploy:** `vercel --prod`. Set all 4 environment variables in Vercel dashboard. Confirm the deployed URL works end-to-end.

---

## COMMON MISTAKES TO AVOID

**Do not:**
- Use `import { supabase } from '@/lib/supabase'` inside `app/api/` routes — always use `createServerSupabaseClient()`
- Use `any` TypeScript type anywhere
- Write `response.body.getReader()` without checking `response.body` is non-null first
- Call `anthropic.messages.create()` without `await`
- Put the Anthropic API call inside the ReadableStream constructor — put it outside, then iterate the stream inside
- Skip the buffer pattern in the SSE consumer — partial chunks will break JSON parsing
- Use `localStorage` or `sessionStorage` anywhere — not needed, Supabase handles persistence
- Import from a file that doesn't exist yet — build in dependency order

**Always:**
- Use `try/catch` around every Supabase call in API routes
- Return proper HTTP status codes: 400 for validation errors, 404 for not found, 500 for server errors
- Strip markdown fences before JSON.parse(): `text.replace(/```json|```/g, '').trim()`
- Use `export function` (named exports) for all components except page files
- Add `'use client'` at the top of any file using React hooks or browser APIs

---

## ENVIRONMENT SETUP (do this before Phase 1)

```bash
# 1. Create the project
npx create-next-app@latest episteme --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*"
cd episteme

# 2. Install all dependencies at once
npm install @anthropic-ai/sdk @supabase/supabase-js framer-motion clsx tailwind-merge uuid lucide-react
npm install -D @types/uuid

# 3. Create .env.local (user fills in values)
cp .env.local.example .env.local

# 4. Run Supabase SQL
# Go to your Supabase project → SQL Editor
# Paste and run: supabase/migrations/001_initial.sql

# 5. Start dev server
npm run dev
```

---

## WHAT SUCCESS LOOKS LIKE

When the build is complete, a user should be able to:
1. Land on the homepage, see the domain cards, select "Machine Learning"
2. Be redirected to a session page with a two-panel layout
3. Type "What is overfitting?" and receive a Socratic probe question (NOT a definition)
4. Have a 4-6 turn conversation where the depth meter and clarity score update in real time
5. Click "Generate Insight Card" and see a full-screen card with their insight, gaps, and next question
6. The card should reference their actual reasoning from the conversation — not a generic definition

If step 3 gives a direct answer to the question, something is wrong with the system prompt or the SDSM state injection. Fix it before moving on.

---

## IF SOMETHING BREAKS

Use the Debugging Prompt from `EPISTEME_BUILD_PROMPTS.md` (bottom of file). Always provide:
- The exact error message + stack trace
- The full content of the file that contains the error
- What action triggered the error

Do not guess. Read the error. Fix the root cause.
