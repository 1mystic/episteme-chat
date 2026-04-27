'use client'

// components/InsightCard.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, Copy, ArrowRight } from 'lucide-react'
import type { InsightCard as InsightCardType } from '@/lib/types'
import { ExportPanel } from '@/components/ExportPanel'

interface InsightCardProps {
  card: InsightCardType | null
  onDismiss?: () => void
  sessionId?: string
}

function scoreColor(score: number): string {
  if (score >= 71) return '#4ade80'
  if (score >= 41) return '#FFB000'
  return '#f87171'
}

export function InsightCard({ card, onDismiss, sessionId }: InsightCardProps) {
  const [copied, setCopied] = useState(false)

  if (!card) return null

  function handleCopy() {
    const text = `Concept: ${card!.concept}\n\n${card!.insight}\n\nGaps: ${card!.gaps.join(', ')}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onDismiss?.()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
        className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
        style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative my-8"
          style={{
            maxWidth: '640px',
            background: '#191209',
            border: '1px solid rgba(255,176,0,0.25)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Amber top bar */}
          <div style={{ height: '2px', background: '#FFB000' }} />

          <div className="p-10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-7">
              <span
                className="font-grotesk font-semibold uppercase tracking-[0.22em]"
                style={{ fontSize: '11px', color: '#FFB000' }}
              >
                INSIGHT CARD
              </span>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="font-grotesk transition-opacity hover:opacity-60 w-8 h-8 flex items-center justify-center"
                  style={{ fontSize: '22px', color: '#9f8e78' }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Concept name */}
            <h2
              className="font-grotesk font-semibold mb-2 leading-tight"
              style={{ fontSize: 'clamp(26px, 5vw, 36px)', color: '#eee0d0', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {card.concept}
            </h2>

            {/* Amber divider */}
            <div style={{ width: '48px', height: '1.5px', background: '#FFB000', marginBottom: '20px', opacity: 0.7 }} />

            {/* Clarity score */}
            <div className="flex items-center gap-3 mb-7">
              <span
                className="font-grotesk uppercase tracking-[0.14em]"
                style={{ fontSize: '11px', color: '#9f8e78' }}
              >
                Clarity
              </span>
              <span
                className="font-grotesk font-semibold"
                style={{ fontSize: '18px', color: scoreColor(card.clarity_score) }}
              >
                {card.clarity_score}
                <span style={{ fontSize: '13px', color: '#9f8e78', fontWeight: 400 }}>/100</span>
              </span>
            </div>

            {/* Insight text */}
            <p
              className="font-grotesk mb-8 leading-relaxed"
              style={{ fontSize: '16px', color: '#d7c4ac', lineHeight: 1.8 }}
            >
              {card.insight}
            </p>

            {/* Unexplored threads */}
            {card.gaps.length > 0 && (
              <div className="mb-8">
                <p
                  className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ fontSize: '11px', color: '#FFB000' }}
                >
                  // UNEXPLORED THREADS
                </p>
                <div className="flex flex-wrap gap-2">
                  {card.gaps.map((gap, i) => (
                    <motion.span
                      key={gap}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="font-grotesk"
                      style={{
                        fontSize: '12px',
                        color: '#9f8e78',
                        border: '1px dashed rgba(255,255,255,0.14)',
                        padding: '4px 10px',
                      }}
                    >
                      {gap}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="font-grotesk font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-70 mb-8"
              style={{
                fontSize: '11px',
                color: copied ? '#4ade80' : '#9f8e78',
                border: '1px solid rgba(255,255,255,0.10)',
                padding: '7px 14px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span className="flex items-center gap-1.5">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy insight'}
              </span>
            </button>
          </div>

          {/* Next Session section */}
          {card.next_starter && (
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,176,0,0.03)',
              }}
            >
              <div className="p-10 pt-8">
                <p
                  className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-5"
                  style={{ fontSize: '11px', color: '#FFB000' }}
                >
                  // YOUR NEXT SESSION
                </p>

                <p
                  className="font-grotesk mb-2"
                  style={{ fontSize: '13px', color: '#9f8e78', lineHeight: 1.6 }}
                >
                  Episteme has been thinking about your last session. Start here:
                </p>

                <blockquote
                  className="font-grotesk font-medium mb-7"
                  style={{
                    fontSize: '17px',
                    color: '#eee0d0',
                    lineHeight: 1.65,
                    borderLeft: '2px solid #FFB000',
                    paddingLeft: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  &ldquo;{card.next_starter}&rdquo;
                </blockquote>

                <Link
                  href="/"
                  className="inline-block font-grotesk font-semibold uppercase tracking-[0.16em] transition-all hover:opacity-90 active:scale-95"
                  style={{
                    fontSize: '11px',
                    padding: '12px 28px',
                    background: '#FFB000',
                    color: '#08090A',
                    boxShadow: '0 0 20px rgba(255,176,0,0.3)',
                  }}
                >
                  <span className="flex items-center gap-2">Start this session <ArrowRight size={13} /></span>
                </Link>
              </div>
            </div>
          )}

          {/* Footer if no next_starter */}
          {!card.next_starter && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-10 py-6 flex items-center justify-between">
                <span className="font-grotesk" style={{ fontSize: '12px', color: '#524533' }}>
                  Session complete.
                </span>
                <Link
                  href="/"
                  className="font-grotesk font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                  style={{ fontSize: '11px', color: '#FFB000' }}
                >
                  <span className="flex items-center gap-1.5">New session <ArrowRight size={12} /></span>
                </Link>
              </div>
            </div>
          )}

          {/* Export roadmap */}
          {sessionId && <ExportPanel sessionId={sessionId} />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
