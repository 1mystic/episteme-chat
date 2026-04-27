'use client'

// app/session/[sessionId]/page.tsx

import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from '@/hooks/useSession'
import { useClarity } from '@/hooks/useClarity'
import { useAuth } from '@/hooks/useAuth'
import { ChatPanel } from '@/components/ChatPanel'
import { SidePanel } from '@/components/SidePanel'
import { ArrowLeft } from 'lucide-react'
import type { DepthLevel, InsightCard as InsightCardType, Domain } from '@/lib/types'

const DOMAIN_LABELS: Record<string, string> = {
  ml: 'Machine Learning',
  statistics: 'Statistics',
  economics: 'Economics',
  cs: 'Computer Science',
  general: 'General',
}

const STATE_LABELS: Record<string, string> = {
  PROBE:       'Probing',
  DEEPEN:      'Deepening',
  REDIRECT:    'Redirecting',
  SCAFFOLD:    'Scaffolding',
  RECTIFY:     'Rectifying',
  CONSOLIDATE: 'Consolidating',
  COMPLETE:    'Complete',
}

const DEFAULT_SIDEBAR_WIDTH = 272
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 420

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const { session, messages: savedMessages, concepts: savedConcepts, isLoading, error } = useSession(sessionId)
  const { score: clarityScore, history: clarityHistory, updateScore, trend } = useClarity(0)
  const { user } = useAuth()

  // Seed sidebar state from saved session data (populated after useSession loads)
  const [depthLevel, setDepthLevel] = useState<DepthLevel | null>(null)
  const [prevDepthLevel, setPrevDepthLevel] = useState<DepthLevel | null>(null)
  const [nextState, setNextState] = useState<string | null>(null)
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null)
  const [conceptsCovered, setConceptsCovered] = useState<string[]>([])
  const [gaps, setGaps] = useState<string[]>([])
  const [misconception, setMisconception] = useState<string | null>(null)

  // Once session data loads, seed sidebar state from saved records
  useEffect(() => {
    if (savedConcepts.length > 0) {
      const last = savedConcepts[savedConcepts.length - 1]
      setDepthLevel(last.depth_reached as DepthLevel)
      setConceptsCovered(savedConcepts.map((c) => c.name))
      updateScore(last.clarity_score)
    }
    if (session?.session_state?.lastState) {
      setNextState(session.session_state.lastState)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedConcepts, session])
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)

  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(DEFAULT_SIDEBAR_WIDTH)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sidebarWidth])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = e.clientX - dragStartX.current
      const next = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, dragStartWidth.current + delta))
      setSidebarWidth(next)
    }
    const onUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleClarityUpdate = useCallback((score: number) => updateScore(score), [updateScore])

  const handleDepthUpdate = useCallback((depth: DepthLevel) => {
    setDepthLevel((prev) => {
      setPrevDepthLevel(prev)
      return depth
    })
  }, [])

  const handleInsightGenerated = useCallback((card: InsightCardType) => {
    setInsightCard(card)
  }, [])

  const handleConceptsUpdate = useCallback((concepts: string[]) => {
    setConceptsCovered(concepts)
  }, [])

  const handleNextStateUpdate = useCallback((state: string) => {
    setNextState(state)
  }, [])

  const handleGapsUpdate = useCallback((g: string[]) => {
    setGaps(g)
  }, [])

  const handleMisconceptionUpdate = useCallback((m: string | null) => {
    setMisconception(m)
  }, [])

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#08090A' }}
      >
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '8px', height: '8px', background: '#FFB000', borderRadius: '50%' }}
        />
        <p className="font-grotesk tracking-[0.18em] uppercase" style={{ fontSize: '11px', color: '#9f8e78' }}>
          Loading session...
        </p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: '#08090A' }}
      >
        <p className="font-grotesk font-medium" style={{ fontSize: '18px', color: '#eee0d0', letterSpacing: '-0.01em' }}>
          {error ?? 'Session not found.'}
        </p>
        <Link
          href="/"
          className="font-grotesk font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ fontSize: '11px', color: '#FFB000' }}
        >
          <span className="flex items-center gap-1.5"><ArrowLeft size={13} /> Return to home</span>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#08090A' }}
    >
      {/* ── Top status bar ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 flex-shrink-0"
        style={{
          height: '44px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(8,9,10,0.96)',
        }}
      >
        {/* Left: brand + domain */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-grotesk font-semibold tracking-[0.24em] uppercase transition-opacity hover:opacity-70"
            style={{ fontSize: '12px', color: '#FFB000' }}
          >
            EPISTEME
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>/</span>
          <span
            className="font-grotesk uppercase tracking-[0.12em]"
            style={{ fontSize: '11px', color: '#9f8e78' }}
          >
            {DOMAIN_LABELS[session.domain] ?? session.domain}
          </span>
        </div>

        {/* Right: SDSM state chip + clarity score + mobile toggle */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {nextState && (
              <motion.div
                key={nextState}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.25 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1"
                style={{
                  border: '1px solid rgba(255,176,0,0.22)',
                  background: 'rgba(255,176,0,0.06)',
                }}
              >
                <span
                  className="inline-block animate-pulse"
                  style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB000' }}
                />
                <span
                  className="font-grotesk font-semibold uppercase tracking-[0.16em]"
                  style={{ fontSize: '10px', color: '#FFB000' }}
                >
                  {STATE_LABELS[nextState] ?? nextState}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {clarityScore > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                className="font-grotesk font-semibold tabular-nums"
                style={{ fontSize: '14px', color: '#FFB000', letterSpacing: '-0.02em' }}
              >
                {clarityScore}
              </span>
              <span className="font-grotesk" style={{ fontSize: '11px', color: '#9f8e78' }}>
                /100
              </span>
            </div>
          )}

          <button
            className="md:hidden font-grotesk font-semibold uppercase tracking-[0.14em] px-3 py-1 transition-colors"
            style={{
              fontSize: '10px',
              color: '#9f8e78',
              border: '1px solid rgba(255,255,255,0.10)',
              background: showSidePanel ? 'rgba(255,176,0,0.08)' : 'transparent',
            }}
            onClick={() => setShowSidePanel((p) => !p)}
          >
            {showSidePanel ? 'hide' : 'stats'}
          </button>

          {/* User avatar */}
          {user && (
            <Link
              href="/dashboard"
              title={user.email ?? 'Dashboard'}
              className="font-grotesk font-semibold flex items-center justify-center transition-all duration-150 flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                background: 'rgba(255,176,0,0.12)',
                border: '1px solid rgba(255,176,0,0.3)',
                fontSize: '12px',
                color: '#FFB000',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,176,0,0.22)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,176,0,0.12)' }}
            >
              {(user.email ?? 'U').charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar — resizable */}
        <div
          className="hidden md:flex flex-shrink-0 flex-col"
          style={{ width: `${sidebarWidth}px`, borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SidePanel
            clarityScore={clarityScore}
            clarityHistory={clarityHistory}
            clarityTrend={trend}
            depthLevel={depthLevel}
            previousDepthLevel={prevDepthLevel}
            nextState={nextState}
            conceptsCovered={conceptsCovered}
            gaps={gaps}
            misconception={misconception}
            domain={session.domain as Domain}
            insightCard={insightCard}
          />
        </div>

        {/* Drag handle */}
        <div
          className="hidden md:flex flex-shrink-0 items-center justify-center cursor-col-resize group"
          style={{ width: '6px', background: 'transparent', position: 'relative' }}
          onMouseDown={handleDragStart}
        >
          <div
            className="transition-all duration-150"
            style={{
              width: '2px',
              height: '40px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '1px',
            }}
          />
          {/* hover highlight */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,176,0,0.08)' }}
          />
        </div>

        {/* Mobile side panel overlay */}
        <AnimatePresence>
          {showSidePanel && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed inset-y-0 left-0 z-30 flex flex-col"
              style={{
                width: '280px',
                background: '#08090A',
                borderRight: '1px solid rgba(255,255,255,0.10)',
                top: '44px',
              }}
            >
              <SidePanel
                clarityScore={clarityScore}
                clarityHistory={clarityHistory}
                clarityTrend={trend}
                depthLevel={depthLevel}
                previousDepthLevel={prevDepthLevel}
                nextState={nextState}
                conceptsCovered={conceptsCovered}
                gaps={gaps}
                domain={session.domain as Domain}
                insightCard={insightCard}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat panel — seeded with saved messages so returning users see history */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ChatPanel
            sessionId={sessionId}
            domain={session.domain as Domain}
            initial={{
              messages: savedMessages,
              concepts: savedConcepts,
              nextState: session.session_state?.lastState ?? null,
            }}
            onClarityUpdate={handleClarityUpdate}
            onDepthUpdate={handleDepthUpdate}
            onInsightGenerated={handleInsightGenerated}
            onConceptsUpdate={handleConceptsUpdate}
            onNextStateUpdate={handleNextStateUpdate}
            onGapsUpdate={handleGapsUpdate}
            onMisconceptionUpdate={handleMisconceptionUpdate}
          />
        </div>
      </div>

      {/* Insight card is now a full page — ChatPanel navigates to /insights/[id] after generation */}
    </div>
  )
}
