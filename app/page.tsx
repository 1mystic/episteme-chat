'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { DomainSelector } from '@/components/DomainSelector'
import { Nav } from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { Domain } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALGORITHMS = [
  { abbr: 'RDSE',    full: 'Response Depth Signal Extractor' },
  { abbr: 'BGDC',    full: 'Bloom-Grounded Depth Classifier' },
  { abbr: 'SDSM',    full: 'Socratic Dialogue State Machine' },
  { abbr: 'SUV',     full: 'Semantic Understanding Verifier' },
  { abbr: 'CBKT-CS', full: 'Conversational BKT Clarity Scorer' },
  { abbr: 'CPGAB',   full: 'Concept Prerequisite Graph Auto-Builder' },
  { abbr: 'EGP',     full: 'Ebbinghaus Gap Prioritizer' },
]

const METHOD_CARDS = [
  {
    num: '01',
    title: 'Refuses to answer',
    body: 'Every question is met with a question. The Socratic method is a 2,400-year-old proof that explaining forces understanding that reading never does.',
  },
  {
    num: '02',
    title: 'Tracks your thinking',
    body: 'Six quality signals, a 7-state dialogue machine, and Bayesian knowledge tracing build a live model of your understanding — not just what you got right.',
  },
  {
    num: '03',
    title: 'Maps your gaps',
    body: "A prerequisite graph auto-builds from your responses. Misconceptions are detected and addressed specifically. The system knows what you haven't thought to ask yet.",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleDomainSelect(domain: Domain) {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authSession?.access_token) headers['Authorization'] = `Bearer ${authSession.access_token}`
      const res = await fetch('/api/session', {
        method: 'POST',
        headers,
        body: JSON.stringify({ domain }),
      })
      const json = await res.json() as { session?: { id: string }; error?: string; detail?: string }
      if (!res.ok) throw new Error(json.detail ?? json.error ?? 'Failed to create session')
      const { session } = json as { session: { id: string } }
      router.push(`/session/${session.id}`)
    } catch (err) {
      console.error(err)
      setError('Could not start session. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: '#08090A', color: '#eee0d0' }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        style={{ zIndex: 0 }}
      />

      {/* Amber ambient bloom */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 45% at 50% -8%, rgba(255,176,0,0.07) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />

      {/* Nav */}
      <Nav />

      {/* ================================================================= */}
      {/* HERO                                                                */}
      {/* ================================================================= */}
      <section
        className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6"
        style={{ paddingTop: '96px', paddingBottom: '112px' }}
      >
        {/* Status badge */}
        <motion.div
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          custom={0}
          variants={fadeUp}
          className="flex items-center gap-3 mb-10"
          style={{
            border: '1px solid rgba(255,176,0,0.25)',
            padding: '8px 20px',
            background: 'rgba(255,176,0,0.06)',
          }}
        >
          <span
            className="inline-block animate-pulse"
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB000', flexShrink: 0 }}
          />
          <span
            className="font-grotesk font-medium tracking-[0.22em] uppercase"
            style={{ fontSize: '11px', color: '#FFB000' }}
          >
            Socratic Study Engine &nbsp;·&nbsp; CBC Spring 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          custom={0.08}
          variants={fadeUp}
          className="font-grotesk font-semibold"
          style={{
            fontSize: 'clamp(52px, 9vw, 108px)',
            letterSpacing: '-0.04em',
            lineHeight: 1.04,
            maxWidth: '960px',
            color: '#eee0d0',
          }}
        >
          Think{' '}
          <span style={{ color: '#FFB000' }}>Deeper.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          custom={0.18}
          variants={fadeUp}
          className="font-grotesk font-normal mt-6"
          style={{
            fontSize: 'clamp(17px, 2.2vw, 21px)',
            color: '#d7c4ac',
            maxWidth: '540px',
            lineHeight: 1.65,
          }}
        >
          AI that refuses to answer your questions — and instead helps you{' '}
          <span style={{ color: '#eee0d0', fontWeight: 500 }}>answer them yourself</span>.
        </motion.p>

        {/* Amber divider line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={mounted ? { opacity: 0.65, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
          style={{
            width: '56px',
            height: '1.5px',
            background: '#FFB000',
            margin: '32px 0',
          }}
        />

        {/* CTA buttons */}
        <motion.div
          initial="hidden"
          animate={mounted ? 'visible' : 'hidden'}
          custom={0.42}
          variants={fadeUp}
          className="flex items-center gap-4 flex-wrap justify-center mt-1"
        >
          <Link
            href="/#start"
            className="hero-cta hero-cta-primary font-goldman font-bold tracking-[0.16em] uppercase transition-all duration-300 hover:-translate-y-[1px] hover:opacity-100 hover:shadow-[0_0_38px_rgba(255,176,0,0.46)] active:translate-y-0 active:scale-[0.98]"
            style={{
              fontSize: '12px',
              padding: '14px 34px',
              background: '#FFB000',
              color: '#08090A',
              boxShadow: '0 0 32px rgba(255,176,0,0.38)',
            }}
          >
            Initialize Session
          </Link>
          <Link
            href="/about"
            className="hero-cta hero-cta-secondary font-goldman font-bold tracking-[0.14em] uppercase transition-all duration-300 hover:-translate-y-[1px] hover:text-[#eee0d0] hover:border-[rgba(255,176,0,0.52)]"
            style={{
              fontSize: '12px',
              padding: '13px 34px',
              background: 'transparent',
              color: '#d7c4ac',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            How it works
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.9 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1"
          >
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRight: '2px solid rgba(255,176,0,0.95)',
                borderBottom: '2px solid rgba(255,176,0,0.95)',
                transform: 'rotate(45deg)',
              }}
            />
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRight: '2px solid rgba(255,176,0,0.7)',
                borderBottom: '2px solid rgba(255,176,0,0.7)',
                transform: 'rotate(45deg)',
                marginTop: '-4px',
              }}
            />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.45, 0.95, 0.45] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              height: '24px',
              background: 'linear-gradient(to bottom, rgba(255,176,0,0.75), transparent)',
            }}
          />
          <span className="font-grotesk" style={{ fontSize: '11px', color: '#9f8e78', letterSpacing: '0.22em' }}>
            SCROLL
          </span>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* ALGORITHM PIPELINE STRIP                                           */}
      {/* ================================================================= */}
      <section
        className="relative z-10 py-20 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-grotesk tracking-[0.22em] uppercase text-center mb-14"
            style={{ fontSize: '13px', color: '#FFB000' }}
          >
            // 7-algorithm pipeline · runs deterministically on every turn
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="flex items-stretch overflow-x-auto pb-2"
            style={{ justifyContent: 'center' }}
          >
            {ALGORITHMS.map((algo, i) => (
              <motion.div key={algo.abbr} variants={fadeUpChild} className="flex items-center flex-shrink-0">
                <div
                  className="flex flex-col items-center justify-center text-center px-7 py-6"
                  style={{
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#191209',
                    minWidth: '156px',
                    minHeight: '108px',
                  }}
                >
                  <span
                    className="font-grotesk font-semibold block mb-1"
                    style={{ fontSize: '14px', color: '#FFB000', letterSpacing: '0.1em' }}
                  >
                    {algo.abbr}
                  </span>
                  <span
                    className="font-grotesk block"
                    style={{ fontSize: '12px', color: '#9f8e78', lineHeight: 1.45, maxWidth: '132px' }}
                  >
                    {algo.full}
                  </span>
                </div>
                {i < ALGORITHMS.length - 1 && (
                  <div style={{ width: '30px', height: '2px', background: 'rgba(255,176,0,0.5)', flexShrink: 0 }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* THE METHOD                                                          */}
      {/* ================================================================= */}
      <section
        className="relative z-10 py-24 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUpChild}
              className="font-grotesk tracking-[0.22em] uppercase mb-5 text-center"
              style={{ fontSize: '11px', color: '#FFB000' }}
            >
              // THE METHOD
            </motion.p>

            <motion.h2
              variants={fadeUpChild}
              className="font-grotesk font-semibold text-center mb-16"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                color: '#eee0d0',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
              }}
            >
              Not a tutor. An interrogator.
            </motion.h2>

            {/* Cards — separated by 1px lines, no radius */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3"
              style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {METHOD_CARDS.map((card, i) => (
                <motion.div
                  key={card.num}
                  variants={fadeUpChild}
                  whileHover={{ backgroundColor: '#191209', transition: { duration: 0.2 } }}
                  className="flex flex-col p-8 transition-colors duration-200"
                  style={{
                    background: '#08090A',
                    borderRight: i < METHOD_CARDS.length - 1 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                    borderTop: '2px solid transparent',
                  }}
                  onHoverStart={(e) => {
                    const el = e.target as HTMLElement
                    if (el.closest) {
                      const card = el.closest('[data-card]') as HTMLElement
                      if (card) card.style.borderTop = '2px solid #FFB000'
                    }
                  }}
                  onHoverEnd={(e) => {
                    const el = e.target as HTMLElement
                    if (el.closest) {
                      const card = el.closest('[data-card]') as HTMLElement
                      if (card) card.style.borderTop = '2px solid transparent'
                    }
                  }}
                  data-card="true"
                >
                  <span
                    className="font-grotesk font-semibold mb-5 block"
                    style={{ fontSize: '12px', color: '#FFB000', letterSpacing: '0.18em' }}
                  >
                    {card.num}
                  </span>
                  <h3
                    className="font-grotesk font-semibold mb-3"
                    style={{ fontSize: '22px', color: '#eee0d0', lineHeight: 1.2, letterSpacing: '-0.02em' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="font-grotesk leading-relaxed"
                    style={{ fontSize: '15px', color: '#d7c4ac', lineHeight: 1.75 }}
                  >
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* PULL QUOTE                                                          */}
      {/* ================================================================= */}
      <section
        className="relative z-10 py-20 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.blockquote
            variants={fadeUpChild}
            className="font-grotesk font-medium"
            style={{
              fontSize: 'clamp(20px, 3.5vw, 36px)',
              color: '#eee0d0',
              lineHeight: 1.5,
              letterSpacing: '-0.025em',
            }}
          >
            &ldquo;Every AI in 2026 answers your questions.{' '}
            <span style={{ color: '#FFB000' }}>
              We are the one that won&rsquo;t.
            </span>&rdquo;
          </motion.blockquote>

          <motion.div
            variants={fadeUpChild}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div style={{ width: '32px', height: '1px', background: '#FFB000', opacity: 0.4 }} />
            <span
              className="font-grotesk"
              style={{ fontSize: '11px', color: '#9f8e78', letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              Episteme · CBC Spring 2026
            </span>
            <div style={{ width: '32px', height: '1px', background: '#FFB000', opacity: 0.4 }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* DOMAIN SELECTOR — CTA                                              */}
      {/* ================================================================= */}
      <section
        className="relative z-10 py-24 px-6"
        id="start"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-2xl mx-auto"
        >
          <motion.p
            variants={fadeUpChild}
            className="font-grotesk tracking-[0.22em] uppercase mb-5"
            style={{ fontSize: '11px', color: '#FFB000' }}
          >
            // BEGIN THE DIALOGUE
          </motion.p>

          <motion.h2
            variants={fadeUpChild}
            className="font-grotesk font-semibold"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 52px)',
              color: '#eee0d0',
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              marginBottom: '14px',
            }}
          >
            Select a domain.
          </motion.h2>

          <motion.p
            variants={fadeUpChild}
            className="font-grotesk mb-10"
            style={{ fontSize: '17px', color: '#d7c4ac', lineHeight: 1.65 }}
          >
            Your session is private, instant, and has no memory of past conversations.
            Every session starts from zero — just you and a question.
          </motion.p>

          <motion.div variants={fadeUpChild}>
            <DomainSelector onSelect={handleDomainSelect} isLoading={isLoading} />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-grotesk mt-4"
                style={{ fontSize: '12px', color: '#f87171' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* FOOTER                                                              */}
      {/* ================================================================= */}
      <footer
        className="relative z-10 py-12 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <span
            className="font-grotesk font-semibold tracking-[0.28em] uppercase"
            style={{ fontSize: '13px', color: '#FFB000' }}
          >
            EPISTEME
          </span>

          <div className="flex items-center gap-7">
            <Link
              href="/about"
              className="font-grotesk uppercase tracking-[0.14em] transition-colors hover:text-[#FFB000] flex items-center gap-1"
              style={{ fontSize: '11px', color: '#9f8e78' }}
            >
              How it works <ArrowRight size={11} />
            </Link>
            <span style={{ color: '#524533', fontSize: '12px' }}>·</span>
            <Link
              href="/vision"
              className="font-grotesk uppercase tracking-[0.14em] transition-colors hover:text-[#FFB000] flex items-center gap-1"
              style={{ fontSize: '11px', color: '#9f8e78' }}
            >
              Vision <ArrowRight size={11} />
            </Link>
          </div>

          <span className="font-grotesk" style={{ fontSize: '11px', color: '#524533', letterSpacing: '0.08em' }}>
            CBC Spring 2026 · Track 3
          </span>
        </motion.div>
      </footer>
    </main>
  )
}
