'use client'

// components/SidePanel.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { DepthMeter } from '@/components/DepthMeter'
import { ClarityScore } from '@/components/ClarityScore'
import { KnowledgeMap } from '@/components/KnowledgeMap'
import type { DepthLevel, InsightCard, Domain } from '@/lib/types'

const STATE_LABELS: Record<string, string> = {
  PROBE:       'Probing',
  DEEPEN:      'Deepening',
  REDIRECT:    'Redirecting',
  SCAFFOLD:    'Scaffolding',
  RECTIFY:     'Rectifying',
  CONSOLIDATE: 'Consolidating',
  COMPLETE:    'Complete',
}

const STATE_DESCRIPTIONS: Record<string, string> = {
  PROBE:       'Mapping your prior knowledge',
  DEEPEN:      'Pushing to the next cognitive level',
  REDIRECT:    'Steering back to the core concept',
  SCAFFOLD:    'Building a minimal foothold',
  RECTIFY:     'Addressing a specific misconception',
  CONSOLIDATE: 'Crystallising what you have built',
  COMPLETE:    'Session has reached natural completion',
}

interface SidePanelProps {
  clarityScore: number
  clarityHistory: number[]
  clarityTrend: 'up' | 'down' | 'stable'
  depthLevel: DepthLevel | null
  previousDepthLevel: DepthLevel | null
  nextState: string | null
  conceptsCovered: string[]
  gaps: string[]
  misconception?: string | null
  domain: Domain
  insightCard: InsightCard | null
}

function SectionDivider() {
  return (
    <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,176,0,0.12), rgba(255,176,0,0.03) 70%, transparent)', margin: '0' }} />
  )
}

export function SidePanel({
  clarityScore,
  clarityHistory,
  clarityTrend,
  depthLevel,
  previousDepthLevel,
  nextState,
  conceptsCovered,
  gaps,
  misconception,
  domain,
  insightCard,
}: SidePanelProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: '#08090A' }}>

      {/* ── SDSM State block ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {nextState ? (
          <motion.div
            key={nextState}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 px-5 pt-5 pb-4"
            style={{ background: 'rgba(255,176,0,0.04)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block animate-pulse flex-shrink-0"
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB000' }}
              />
              <span
                className="font-grotesk font-semibold uppercase tracking-[0.2em]"
                style={{ fontSize: '10px', color: '#FFB000' }}
              >
                {STATE_LABELS[nextState] ?? nextState}
              </span>
            </div>
            <p
              className="font-grotesk"
              style={{ fontSize: '11px', color: '#9f8e78', lineHeight: 1.5, paddingLeft: '14px' }}
            >
              {STATE_DESCRIPTIONS[nextState] ?? ''}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-shrink-0 px-5 pt-5 pb-4"
          >
            <div className="flex items-center gap-2">
              <span
                style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1px solid rgba(255,176,0,0.3)', display: 'inline-block' }}
              />
              <span
                className="font-grotesk uppercase tracking-[0.2em]"
                style={{ fontSize: '10px', color: '#524533' }}
              >
                Waiting to begin
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionDivider />

      {/* ── Clarity score ─────────────────────────────────── */}
      <div
        className="px-5 py-5 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <ClarityScore score={clarityScore} history={clarityHistory} trend={clarityTrend} />
      </div>

      <SectionDivider />

      {/* ── Depth meter ───────────────────────────────────── */}
      <div className="px-5 py-5 flex-shrink-0">
        <DepthMeter depth={depthLevel} previousDepth={previousDepthLevel} />
      </div>

      <SectionDivider />

      {/* ── Session stats strip ───────────────────────────── */}
      <div
        className="flex-shrink-0 px-5 py-4 grid grid-cols-2 gap-3"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <div>
          <p
            className="font-grotesk uppercase tracking-[0.18em] mb-1"
            style={{ fontSize: '9px', color: '#524533' }}
          >
            Domain
          </p>
          <p
            className="font-grotesk font-semibold uppercase tracking-[0.1em]"
            style={{ fontSize: '10px', color: '#9f8e78' }}
          >
            {domain}
          </p>
        </div>
        <div>
          <p
            className="font-grotesk uppercase tracking-[0.18em] mb-1"
            style={{ fontSize: '9px', color: '#524533' }}
          >
            Concepts
          </p>
          <p
            className="font-grotesk font-semibold tabular-nums"
            style={{ fontSize: '10px', color: conceptsCovered.length > 0 ? '#FFB000' : '#524533' }}
          >
            {conceptsCovered.length}
          </p>
        </div>
        {insightCard && (
          <div className="col-span-2">
            <p
              className="font-grotesk uppercase tracking-[0.18em] mb-1"
              style={{ fontSize: '9px', color: '#524533' }}
            >
              Clarity at close
            </p>
            <p
              className="font-grotesk font-semibold tabular-nums"
              style={{ fontSize: '10px', color: '#FFB000' }}
            >
              {insightCard.clarity_score}/100
            </p>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* ── Knowledge map ─────────────────────────────────── */}
      <div className="px-5 py-5 flex-1">
        <KnowledgeMap concepts={conceptsCovered} gaps={gaps} domain={domain} />
      </div>
    </div>
  )
}
