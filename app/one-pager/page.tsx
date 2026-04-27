// app/one-pager/page.tsx

import Link from 'next/link'

const ALGORITHMS = [
  {
    step: '01',
    id: 'RDSE',
    name: 'Response Depth Signal Extractor',
    desc: 'Scores reasoning density across six weighted signals: connectives (0.30), length (0.20), uncertainty (0.15), technical terms (0.20), structure (0.10), clarity (0.05)',
    output: 'qualityScore ∈ [0, 1]',
  },
  {
    step: '02',
    id: 'BGDC',
    name: 'Bloom-Grounded Depth Classifier',
    desc: "Classifies the student's question into Bloom's taxonomy (SURFACE → SYNTHESIS) via keyword match (30% weight) fused with LLM classification (70% weight)",
    output: 'depthLevel ∈ {SURFACE, CONCEPTUAL, ANALYTICAL, SYNTHESIS}',
  },
  {
    step: '03',
    id: 'SDSM',
    name: 'Socratic Dialogue State Machine',
    desc: "Determines the next instructional state from qualityScore, semanticAccuracy, confusionCount, and consecutiveScaffolds. The active state instruction is injected directly into Claude's system prompt.",
    output: 'state ∈ {PROBE, DEEPEN, REDIRECT, SCAFFOLD, RECTIFY, CONSOLIDATE, COMPLETE}',
  },
  {
    step: '04',
    id: 'SUV',
    name: 'Semantic Understanding Verifier',
    desc: "Async Claude call that scores semantic accuracy (0–1.0) and identifies specific misconceptions in the student's response. Stored in session_state for the next turn's SDSM.",
    output: 'semanticAccuracy ∈ [0, 1], misconception | null',
  },
  {
    step: '05',
    id: 'CBKT-CS',
    name: 'Bayesian Knowledge Tracing Clarity Scorer',
    desc: 'Updates per-session BKT state (pL, pT, pS, pG) using qualityScore as the correctness signal. Mastery probability pL is persisted per concept across turns.',
    output: 'clarityScore = round(pL × 100)',
  },
  {
    step: '06',
    id: 'CPGAB',
    name: 'Concept-Performance Gap Analyser (Bloom)',
    desc: 'Maps concepts covered in the session against a domain core-concept graph. Surfaces unexplored prerequisite concepts to Claude as context.',
    output: 'gaps[] — ordered list of uncovered core concepts',
  },
  {
    step: '07',
    id: 'EGP',
    name: 'Ebbinghaus Gap Prioritizer',
    desc: 'Calculates retention decay R = e^(−t/S) where S scales with clarity and review count. The metacognitive agent uses this to rank which gaps are most urgent for the next session.',
    output: 'urgency = (1 − R) × (1 − clarityScore/100)',
  },
]

const STACK = [
  { label: 'Frontend', value: 'Next.js 15, TypeScript, Framer Motion, Space Grotesk' },
  { label: 'AI', value: 'Claude Sonnet — streaming SSE, SDSM-directed system prompt' },
  { label: 'Database', value: 'Supabase (PostgreSQL) — 5 tables with BKT columns' },
  { label: 'Auth', value: 'Supabase email/password, JWT decoded locally' },
]

const SCHEMA = [
  { table: 'sessions', cols: 'id, domain, session_state JSONB, user_id, user_email' },
  { table: 'messages', cols: 'session_id, role, content, turn_number' },
  { table: 'concepts', cols: 'session_id, name, depth_reached, clarity_score, bkt_pL/pT/pS/pG' },
  { table: 'insight_cards', cols: 'session_id, concept, insight, gaps[], clarity_score, next_starter' },
  { table: 'learner_profiles', cols: 'session_id, strength_areas, urgent_gaps, next_session_starter, learning_trajectory' },
]

const DIFFERENTIATORS = [
  {
    title: 'The AI never answers directly',
    body: "The active SDSM state instruction is embedded in every system prompt — e.g. STATE: SCAFFOLD. Give ONE minimal foothold. Claude obeys it. The student's own reasoning becomes the curriculum.",
  },
  {
    title: 'Cognitive signals update live',
    body: 'As you type, three bars — REASONING / DEPTH / CLARITY — reflect how your draft scores against the RDSE algorithm in real time, with 120ms debounce.',
  },
  {
    title: 'Sessions persist and personalise',
    body: 'After 4+ turns, the metacognitive agent reads the full conversation and generates a nextSessionStarter — a probe question that picks up exactly where understanding broke down.',
  },
]

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, rgba(255,176,0,0.18), rgba(255,176,0,0.04) 60%, transparent)',
      }}
    />
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#FFB000',
        marginBottom: '35px',
      }}
    >
      {children}
    </p>
  )
}

export default function OnePagerPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#08090A',
        color: '#eee0d0',
        fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: '2px', background: '#FFB000', opacity: 0.35 }} />

      {/* Nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 50px',
          height: '65px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,9,10,0.96)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: '#FFB000',
            textDecoration: 'none',
          }}
        >
          EPISTEME
        </Link>
        <span
          style={{
            fontSize: '13px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#524533',
            fontWeight: 500,
          }}
        >
          Technical Overview
        </span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 50px 150px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '100px' }}>
          <h1
            style={{
              fontSize: 'clamp(52px, 10vw, 90px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: '#eee0d0',
              marginBottom: '8px',
            }}
          >
            EPISTEME
          </h1>
          <p
            style={{
              fontSize: '22px',
              fontWeight: 400,
              color: '#9f8e78',
              letterSpacing: '-0.01em',
              marginBottom: '40px',
            }}
          >
            Socratic AI Tutor — Built on Claude
          </p>
          <div
            style={{
              width: '70px',
              height: '2px',
              background: '#FFB000',
              opacity: 0.7,
              marginBottom: '40px',
            }}
          />
          <p
            style={{
              fontSize: '20px',
              color: '#9f8e78',
              lineHeight: 1.75,
              maxWidth: '775px',
              letterSpacing: '0.01em',
            }}
          >
            When you ask Episteme a question, it doesn&apos;t answer — it asks what{' '}
            <em style={{ color: '#eee0d0', fontStyle: 'normal', fontWeight: 600 }}>you</em>{' '}
            already think. Every response is engineered to push your reasoning one cognitive level
            higher. Covers{' '}
            <span style={{ color: '#FFB000', fontWeight: 600 }}>
              ML, Statistics, Economics, CS, and General Reasoning
            </span>
            .
          </p>
        </div>

        <Divider />

        {/* ── 7-Algorithm Pipeline ── */}
        <div style={{ marginTop: '80px', marginBottom: '100px' }}>
          <SectionLabel>// The 7-Algorithm Pipeline</SectionLabel>
          <p
            style={{
              fontSize: '16px',
              color: '#524533',
              letterSpacing: '0.04em',
              marginBottom: '50px',
              lineHeight: 1.6,
            }}
          >
            Every student message runs through this deterministic pipeline before Claude sees it.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ALGORITHMS.map((algo, i) => (
              <div
                key={algo.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '45px 110px 1fr',
                  gap: '0 30px',
                  padding: '25px 30px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'start',
                }}
              >
                {/* Step number */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'rgba(255,176,0,0.35)',
                    letterSpacing: '0.08em',
                    paddingTop: '2px',
                  }}
                >
                  {algo.step}
                </span>

                {/* Algorithm ID */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: '#FFB000',
                      background: 'rgba(255,176,0,0.08)',
                      padding: '4px 10px',
                      border: '1px solid rgba(255,176,0,0.2)',
                    }}
                  >
                    {algo.id}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#d7c4ac',
                      marginBottom: '8px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {algo.name}
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b5a44',
                      lineHeight: 1.6,
                      marginBottom: '10px',
                    }}
                  >
                    {algo.desc}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,176,0,0.5)',
                      fontFamily: 'monospace',
                      letterSpacing: '0.02em',
                    }}
                  >
                    → {algo.output}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── What Makes It Different ── */}
        <div style={{ marginTop: '80px', marginBottom: '100px' }}>
          <SectionLabel>// What Makes It Different</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2px',
            }}
          >
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.title}
                style={{
                  padding: '35px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,176,0,0.02)',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#eee0d0',
                    marginBottom: '15px',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                  }}
                >
                  {d.title}
                </p>
                <p style={{ fontSize: '15px', color: '#6b5a44', lineHeight: 1.7 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── Tech Stack + Schema (two columns) ── */}
        <div
          style={{
            marginTop: '80px',
            marginBottom: '100px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '75px',
          }}
        >
          {/* Stack */}
          <div>
            <SectionLabel>// Tech Stack</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {STACK.map((s) => (
                <div key={s.label}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#524533',
                      marginBottom: '5px',
                    }}
                  >
                    {s.label}
                  </p>
                  <p style={{ fontSize: '15px', color: '#9f8e78', lineHeight: 1.5 }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Schema */}
          <div>
            <SectionLabel>// Database Schema</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {SCHEMA.map((s) => (
                <div
                  key={s.table}
                  style={{
                    padding: '13px 18px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFB000',
                      marginBottom: '5px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {s.table}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#524533',
                      fontFamily: 'monospace',
                      lineHeight: 1.5,
                    }}
                  >
                    {s.cols}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Insight Card ── */}
        <div style={{ marginTop: '80px', marginBottom: '100px' }}>
          <SectionLabel>// The Insight Card</SectionLabel>
          <div
            style={{
              padding: '45px',
              border: '1px solid rgba(255,176,0,0.2)',
              background: 'rgba(255,176,0,0.025)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '2px', background: '#FFB000', position: 'absolute', top: 0, left: 0, right: 0 }} />
            <p
              style={{
                fontSize: '16px',
                color: '#9f8e78',
                lineHeight: 1.75,
                maxWidth: '750px',
              }}
            >
              After <span style={{ color: '#FFB000', fontWeight: 600 }}>4+ turns</span>, the
              user can generate an Insight Card — a Claude-written summary containing:
            </p>
            <ul
              style={{
                marginTop: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '13px',
                paddingLeft: '0',
                listStyle: 'none',
              }}
            >
              {[
                'What they now genuinely understand — specific to their reasoning, not generic',
                "Top 3 adjacent concepts they haven't explored yet (Claude-prioritised)",
                'A BKT-derived clarity score (0–100)',
                'A next-session starter question from the metacognitive reflection agent',
              ].map((item) => (
                <li key={item} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#FFB000', flexShrink: 0, fontSize: '15px', paddingTop: '2px' }}>→</span>
                  <span style={{ fontSize: '15px', color: '#9f8e78', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Divider />

        {/* ── Setup ── */}
        <div style={{ marginTop: '80px', marginBottom: '100px' }}>
          <SectionLabel>// Running It</SectionLabel>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '35px 40px',
              fontFamily: 'monospace',
            }}
          >
            <p style={{ fontSize: '15px', color: '#4ade80', marginBottom: '10px' }}>npm install</p>
            <p style={{ fontSize: '15px', color: '#524533', marginBottom: '5px' }}># Set in .env.local:</p>
            {[
              'ANTHROPIC_API_KEY',
              'NEXT_PUBLIC_SUPABASE_URL',
              'NEXT_PUBLIC_SUPABASE_ANON_KEY',
              'SUPABASE_SERVICE_ROLE_KEY',
            ].map((k) => (
              <p key={k} style={{ fontSize: '15px', color: '#9f8e78', marginBottom: '3px' }}>
                {k}=...
              </p>
            ))}
            <p style={{ fontSize: '15px', color: '#524533', margin: '15px 0 5px' }}># Run all 4 migrations in supabase/migrations/</p>
            <p style={{ fontSize: '15px', color: '#4ade80' }}>npm run dev</p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '50px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '14px', color: '#524533', letterSpacing: '0.06em' }}>
            Built for the Claude AI Hackathon · April 2026
          </span>
          <Link
            href="/"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#FFB000',
              textDecoration: 'none',
              opacity: 0.8,
            }}
          >
            Try it →
          </Link>
        </div>

      </div>
    </div>
  )
}
