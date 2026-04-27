'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Pipeline steps ───────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  {
    num: '①',
    label: 'User sends a message',
    desc: 'Raw text arrives at the Next.js API route. The turn counter increments and the session context is loaded from Supabase.',
  },
  {
    num: '②',
    label: 'RDSE extracts quality signals',
    desc: 'No LLM call — under 1ms. Six deterministic signals are measured and collapsed into a single quality score between 0 and 1.',
  },
  {
    num: '③',
    label: 'SDSM determines next Socratic state',
    desc: 'The 7-state machine reads RDSE score, SUV accuracy from the prior turn, confusion signal count, and turn number — then emits a precise instruction block.',
  },
  {
    num: '④',
    label: 'SUV verifies semantic accuracy',
    desc: 'An async Claude call checks factual accuracy (0–1) and detects specific misconceptions. This runs in parallel and does not block the streaming response.',
  },
  {
    num: '⑤',
    label: 'CBKT-CS updates Bayesian knowledge state',
    desc: 'Four BKT parameters — P(knows), P(learn), P(slip), P(guess) — are updated using the RDSE score as a soft correctness signal. Mastery probability becomes the clarity score.',
  },
  {
    num: '⑥',
    label: 'Enriched system prompt sent to Claude',
    desc: 'SDSM state, CBKT clarity, BGDC depth level, detected misconceptions, and prerequisite gaps are injected into the system prompt — structured signals, not vibes.',
  },
  {
    num: '⑦',
    label: 'Response streamed to user',
    desc: 'Claude (Sonnet 4.6) generates a Socratic response guided by the enriched prompt. Tokens stream via SSE directly to the browser.',
  },
  {
    num: '⑧',
    label: 'DB updated, clarity score surfaced',
    desc: 'The turn, clarity score, CPGAB graph update, and EGP forgetting-curve state are persisted to Supabase. The UI reflects the new mastery state instantly.',
  },
]

// ─── Algorithm data ───────────────────────────────────────────────────────────
const ALGORITHMS = [
  {
    abbr: 'RDSE',
    name: 'Response Depth Signal Extractor',
    research: 'SocraticAI (arXiv 2512.03501)',
    desc: 'Converts raw user text into a multi-feature quality score (0–1) using 6 deterministic signals: reasoning connectives, response length, uncertainty level, technical term density, question-back ratio, and structure score. Runs in under 1ms with no LLM call — purely algorithmic. This score drives both the state machine and BKT updater every turn.',
  },
  {
    abbr: 'BGDC',
    name: 'Bloom-Grounded Depth Classifier',
    research: "Bloom's Taxonomy NLP Classification (arXiv 2511.10903, Nov 2025)",
    desc: "Classifies each user question into Bloom's cognitive levels (Remember → Create), mapped to Episteme's four depth levels: SURFACE, CONCEPTUAL, ANALYTICAL, SYNTHESIS. Uses 3-signal fusion: fast keyword pattern matching, LLM zero-shot classification, and confidence weighting. The fused result determines how Episteme structures its opening probe.",
  },
  {
    abbr: 'SDSM',
    name: 'Socratic Dialogue State Machine',
    research: 'SocraticLLM (CIKM 2024) — REVIEW→HEURISTIC→RECTIFY→SUMMARIZE structure',
    desc: 'A formal 7-state machine (PROBE, DEEPEN, REDIRECT, SCAFFOLD, RECTIFY, CONSOLIDATE, COMPLETE) that determines the exact Socratic strategy for each turn. State transitions are deterministic, based on RDSE quality score, SUV semantic accuracy, confusion signal count, and turn number. Each state injects a precise instruction block into the system prompt.',
  },
  {
    abbr: 'CBKT-CS',
    name: 'Conversational BKT Clarity Scorer',
    research: 'Bayesian Knowledge Tracing (Corbett & Anderson, 1994) + DKT (Piech et al., Stanford)',
    desc: 'Adapts classic Bayesian Knowledge Tracing — designed for binary quiz outcomes — to work with continuous conversational quality signals. Maintains four parameters per concept: P(knows), P(learn), P(slip), P(guess). Updated after each turn using the RDSE quality score as a soft correctness signal. The resulting mastery probability (0–1) is scaled to the 0–100 clarity score shown in the UI.',
  },
  {
    abbr: 'SUV',
    name: 'Semantic Understanding Verifier',
    research: 'Reference-aided evaluation (JEDM 2025)',
    desc: "After each user response, a lightweight Claude call evaluates semantic accuracy (0–1) and detects specific misconceptions. This runs asynchronously — it does not block the streaming response. The detected misconception, if any, is stored and fed into the next turn's system prompt, triggering the RECTIFY state.",
  },
  {
    abbr: 'CPGAB',
    name: 'Concept Prerequisite Graph Auto-Builder',
    research: 'ACE Methodology (JEDM 2025) + Graphusion (ACL 2024)',
    desc: "On each new concept encountered, Claude extracts its direct prerequisites and adjacent concepts, building a directed acyclic graph (DAG) per session. This graph powers the knowledge map UI and gap detection. \"You explored overfitting without touching bias-variance tradeoff\" is a CPGAB output.",
  },
  {
    abbr: 'EGP',
    name: 'Ebbinghaus Gap Prioritizer',
    research: 'Ebbinghaus Forgetting Curve (1885) + SM-2 spaced repetition algorithm',
    desc: 'Uses the forgetting curve (R = e^(−t/S)) to rank unvisited gap concepts by urgency. Memory stability S is calibrated to clarity score and times explored. Concepts with low clarity and high elapsed time since last visit are surfaced first in the knowledge map and next-session recommendations.',
  },
]

// ─── Research papers ──────────────────────────────────────────────────────────
const PAPERS = [
  'SocraticAI: Scaffolding Human Reasoning via Socratic Dialogue (arXiv 2512.03501)',
  "Bloom's Taxonomy NLP Classification via Multi-Signal Fusion (arXiv 2511.10903, Nov 2025)",
  'SocraticLLM: Structured Dialogue for Tutoring Systems (CIKM 2024)',
  'Bayesian Knowledge Tracing — Corbett & Anderson (1994)',
  'Deep Knowledge Tracing — Piech et al., Stanford (NeurIPS 2015)',
  'Reference-aided Conversational Evaluation for Tutoring (JEDM 2025)',
  'ACE: Automatic Concept Extraction for Knowledge Graph Construction (JEDM 2025)',
  'Graphusion: LLM-based Knowledge Graph Construction from Text (ACL 2024)',
  'Ebbinghaus Forgetting Curve and Memory Decay (1885)',
  'SM-2 Spaced Repetition Algorithm — Wozniak (SuperMemo, 1987)',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-grotesk tracking-[0.22em] uppercase mb-5"
      style={{ fontSize: '11px', color: '#FFB000' }}
    >
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-grotesk font-semibold mb-5 leading-tight"
      style={{ fontSize: 'clamp(26px, 4vw, 46px)', color: '#eee0d0', letterSpacing: '-0.03em' }}
    >
      {children}
    </h2>
  )
}

function BackLink() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-16"
    >
      <Link
        href="/"
        className="font-grotesk tracking-[0.18em] uppercase transition-opacity hover:opacity-70 flex items-center gap-1.5"
        style={{ fontSize: '12px', color: '#FFB000' }}
      >
        <ArrowLeft size={13} /> EPISTEME
      </Link>
    </motion.div>
  )
}

function PipelineStep({
  num,
  label,
  desc,
  index,
}: {
  num: string
  label: string
  desc: string
  index: number
}) {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-5 sm:gap-7">
      {index < PIPELINE_STEPS.length - 1 && (
        <div
          className="absolute left-[22px] sm:left-[25px] top-[52px] bottom-[-28px] w-px"
          style={{ borderLeft: '1px dashed rgba(255,176,0,0.25)' }}
        />
      )}

      <div
        className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center font-grotesk font-semibold z-10"
        style={{
          background: 'rgba(255,176,0,0.08)',
          border: '1px solid rgba(255,176,0,0.28)',
          color: '#FFB000',
          fontSize: '16px',
        }}
      >
        {num}
      </div>

      <div
        className="flex-1 mb-8 p-5 sm:p-6"
        style={{
          background: '#191209',
          border: '1px solid rgba(255,255,255,0.10)',
          borderLeft: '2px solid #FFB000',
        }}
      >
        <p
          className="font-grotesk font-semibold mb-2"
          style={{ color: '#eee0d0', fontSize: '16px' }}
        >
          {label}
        </p>
        <p
          className="font-grotesk leading-relaxed"
          style={{ color: '#d7c4ac', fontSize: '15px', lineHeight: 1.7 }}
        >
          {desc}
        </p>
      </div>
    </motion.div>
  )
}

function AlgorithmCard({
  abbr,
  name,
  research,
  desc,
}: {
  abbr: string
  name: string
  research: string
  desc: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="p-6 sm:p-7 h-full transition-colors duration-200"
      style={{
        background: '#191209',
        border: '1px solid rgba(255,255,255,0.10)',
        borderTop: '2px solid rgba(255,176,0,0.45)',
      }}
    >
      <p
        className="font-grotesk tracking-[0.18em] uppercase mb-3"
        style={{ fontSize: '12px', color: '#FFB000' }}
      >
        {abbr}
      </p>

      <h3
        className="font-grotesk font-semibold mb-3 leading-snug"
        style={{ fontSize: 'clamp(17px, 2vw, 21px)', color: '#eee0d0', letterSpacing: '-0.01em' }}
      >
        {name}
      </h3>

      <p
        className="font-grotesk mb-4 leading-snug"
        style={{ fontSize: '13px', color: '#9f8e78', fontStyle: 'italic' }}
      >
        {research}
      </p>

      <div className="mb-4" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

      <p
        className="font-grotesk leading-relaxed"
        style={{ fontSize: '15px', color: '#d7c4ac', lineHeight: 1.7 }}
      >
        {desc}
      </p>
    </motion.div>
  )
}

function ArchitectureDiagram() {
  return (
    <motion.div
      variants={fadeUp}
      className="p-7 sm:p-10 overflow-x-auto"
      style={{
        background: '#191209',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <svg
        viewBox="0 0 700 320"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-3xl mx-auto"
        style={{ minWidth: '380px' }}
        aria-label="Episteme system architecture diagram"
      >
        <rect x="20" y="120" width="110" height="44" rx="0" fill="#251e15" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <text x="75" y="140" textAnchor="middle" fill="#eee0d0" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="600">Browser</text>
        <text x="75" y="155" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="9">React + SSE</text>

        <rect x="280" y="120" width="140" height="44" rx="0" fill="#251e15" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <text x="350" y="140" textAnchor="middle" fill="#eee0d0" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="600">Next.js / Vercel</text>
        <text x="350" y="155" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="9">App Router · API Routes</text>

        <rect x="190" y="240" width="120" height="44" rx="0" fill="#251e15" stroke="rgba(255,176,0,0.3)" strokeWidth="1" />
        <text x="250" y="260" textAnchor="middle" fill="#FFB000" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="600">Claude API</text>
        <text x="250" y="275" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="9">Sonnet 4.6</text>

        <rect x="390" y="240" width="120" height="44" rx="0" fill="#251e15" stroke="rgba(74,222,128,0.2)" strokeWidth="1" />
        <text x="450" y="260" textAnchor="middle" fill="#4ade80" fontFamily="Space Grotesk, sans-serif" fontSize="11" fontWeight="600">Supabase</text>
        <text x="450" y="275" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="9">PostgreSQL</text>

        <rect x="90" y="32" width="520" height="52" rx="0" fill="#08090A" stroke="rgba(255,176,0,0.18)" strokeWidth="1" />
        <text x="350" y="52" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="9" letterSpacing="1">PIPELINE (per turn)</text>
        <text x="350" y="70" textAnchor="middle" fill="#FFB000" fontFamily="Space Grotesk, sans-serif" fontSize="10.5" letterSpacing="0.5">RDSE → BGDC → SDSM → SUV → CBKT-CS → EGP → CPGAB</text>

        <line x1="130" y1="142" x2="280" y2="142" stroke="#FFB000" strokeWidth="1.5" strokeOpacity="0.6" markerEnd="url(#arrow)" />
        <line x1="280" y1="148" x2="130" y2="148" stroke="#FFB000" strokeWidth="1.5" strokeOpacity="0.6" markerEnd="url(#arrowLeft)" />
        <text x="205" y="133" textAnchor="middle" fill="#9f8e78" fontFamily="Space Grotesk, sans-serif" fontSize="8">SSE streaming</text>
        <line x1="310" y1="164" x2="270" y2="240" stroke="#FFB000" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arrow)" />
        <line x1="390" y1="164" x2="430" y2="240" stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.4" markerEnd="url(#arrowGreen)" />
        <line x1="350" y1="84" x2="350" y2="120" stroke="#FFB000" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,3" markerEnd="url(#arrowDim)" />

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,176,0,0.7)" />
          </marker>
          <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
            <path d="M8,0 L8,6 L0,3 z" fill="rgba(255,176,0,0.7)" />
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(74,222,128,0.6)" />
          </marker>
          <marker id="arrowDim" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,176,0,0.35)" />
          </marker>
        </defs>
      </svg>

      <div className="flex flex-wrap gap-8 mt-8 justify-center">
        {[
          { color: '#FFB000', label: 'Amber — primary data flow / algorithm pipeline' },
          { color: '#4ade80', label: 'Green — persistence layer (Supabase)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ background: color, opacity: 0.7 }} />
            <span className="font-grotesk" style={{ fontSize: '13px', color: '#9f8e78' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main className="min-h-screen relative" style={{ background: '#08090A' }}>
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        style={{ zIndex: 0 }}
      />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,176,0,0.04) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-20">
        <BackLink />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-28"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// HOW IT WORKS</SectionLabel>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-grotesk font-semibold mb-6 leading-tight"
            style={{
              fontSize: 'clamp(34px, 5.5vw, 68px)',
              color: '#eee0d0',
              letterSpacing: '-0.035em',
              maxWidth: '900px',
            }}
          >
            Seven algorithms. One question. Genuine understanding.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-grotesk leading-relaxed"
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: '#d7c4ac',
              maxWidth: '640px',
              lineHeight: 1.7,
            }}
          >
            Episteme doesn&apos;t rely on prompt engineering to be Socratic. It runs a
            research-backed algorithmic pipeline on every turn — then feeds the structured
            output into Claude.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10"
            style={{ width: '56px', height: '1.5px', background: '#FFB000', opacity: 0.65 }}
          />
        </motion.section>

        {/* ── Core loop ─────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-28"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// THE CORE LOOP</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionHeading>What happens on every message.</SectionHeading>
          </motion.div>

          <div className="relative mt-10">
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep key={step.num} {...step} index={i} />
            ))}
          </div>
        </motion.section>

        {/* ── Algorithms ────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-28"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// THE 7 ALGORITHMS</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionHeading>Research-backed. Deterministic. Fast.</SectionHeading>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="font-grotesk mb-12 leading-relaxed"
            style={{ fontSize: '17px', color: '#d7c4ac', maxWidth: '560px', lineHeight: 1.7 }}
          >
            Each algorithm is grounded in published educational-technology research.
            Most run without any LLM call — the intelligence is structural.
          </motion.p>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALGORITHMS.map((algo) => (
              <AlgorithmCard key={algo.abbr} {...algo} />
            ))}
          </motion.div>
        </motion.section>

        {/* ── Architecture ──────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-28"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// ARCHITECTURE</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionHeading>The full system at a glance.</SectionHeading>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="font-grotesk mb-10 leading-relaxed"
            style={{ fontSize: '17px', color: '#d7c4ac', maxWidth: '560px', lineHeight: 1.7 }}
          >
            A single Next.js edge function orchestrates the entire pipeline on each
            turn — deterministic algorithms first, then a single Claude call with
            the enriched prompt.
          </motion.p>
          <ArchitectureDiagram />
        </motion.section>

        {/* ── Research ──────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-20"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>// RESEARCH FOUNDATION</SectionLabel>
          </motion.div>
          <motion.div variants={fadeUp}>
            <SectionHeading>Grounded in 10 published works.</SectionHeading>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="font-grotesk mb-10 leading-relaxed"
            style={{ fontSize: '17px', color: '#d7c4ac', maxWidth: '580px', lineHeight: 1.7 }}
          >
            Every algorithm in Episteme traces directly to peer-reviewed or
            preprint research in educational technology, cognitive science, and NLP.
          </motion.p>

          <motion.ol variants={staggerContainer} className="space-y-4">
            {PAPERS.map((paper, i) => (
              <motion.li key={i} variants={fadeUp} className="flex gap-5 items-start">
                <span
                  className="font-grotesk flex-shrink-0 w-7 text-right"
                  style={{ fontSize: '13px', color: '#9f8e78', marginTop: '2px' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="font-grotesk leading-relaxed"
                  style={{ fontSize: '15px', color: '#d7c4ac', lineHeight: 1.65 }}
                >
                  {paper}
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer
          className="pt-10 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="font-grotesk" style={{ fontSize: '13px', color: '#9f8e78' }}>
            24-hour Hackathon · CBC Spring 2026 · Track 3: Economic Empowerment
          </p>
          <Link
            href="/"
            className="font-grotesk tracking-[0.14em] uppercase transition-opacity hover:opacity-70 flex items-center gap-1.5"
            style={{ fontSize: '12px', color: '#FFB000' }}
          >
            <ArrowLeft size={12} /> Back to Episteme
          </Link>
        </footer>
      </div>
    </main>
  )
}
