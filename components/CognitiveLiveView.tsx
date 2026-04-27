'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractDepthSignals, REASONING_CONNECTIVES, CONFUSION_MARKERS } from '@/lib/algorithms'
import type { Domain } from '@/lib/types'

interface Signals {
  reasoning: number
  depth: number
  clarity: number
}

function Bar({
  label,
  value,
  color,
  description,
}: {
  label: string
  value: number
  color: string
  description: string
}) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-20 text-right">
        <span
          className="font-grotesk font-medium uppercase"
          style={{ fontSize: '10px', color: '#9f8e78', letterSpacing: '0.12em' }}
          title={description}
        >
          {label}
        </span>
      </div>

      <div
        className="flex-1 relative overflow-hidden"
        style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          style={{ height: '100%', background: color, originX: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      </div>

      <span
        className="font-grotesk flex-shrink-0 w-9 text-right tabular-nums"
        style={{ fontSize: '10px', color, opacity: pct > 0 ? 0.85 : 0.3 }}
      >
        {pct}%
      </span>
    </div>
  )
}

export function CognitiveLiveView({
  draftResponse,
  domain,
  turnNumber,
}: {
  draftResponse: string
  domain: Domain
  turnNumber: number
}) {
  const [signals, setSignals] = useState<Signals>({ reasoning: 0, depth: 0, clarity: 0 })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (draftResponse.length < 8) {
      setSignals({ reasoning: 0, depth: 0, clarity: 0 })
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const { qualityScore, confusionCount } = extractDepthSignals(
        draftResponse,
        domain,
        turnNumber
      )

      const words = draftResponse.toLowerCase().split(/\s+/).filter(Boolean)
      const connectiveHits = REASONING_CONNECTIVES.filter((c) =>
        draftResponse.toLowerCase().includes(c)
      ).length
      const reasoning = Math.min(connectiveHits / Math.max(words.length / 8, 1), 1)

      const depth = qualityScore

      const confusionHits = CONFUSION_MARKERS.filter((m) =>
        draftResponse.toLowerCase().includes(m)
      ).length
      const clarity = Math.max(0, 1 - confusionCount / 3 - confusionHits * 0.25)

      setSignals({ reasoning, depth, clarity })
    }, 120)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [draftResponse, domain, turnNumber])

  const visible = draftResponse.length >= 8

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-5 py-3 flex flex-col gap-2">
            <p
              className="font-grotesk font-medium mb-1"
              style={{ fontSize: '10px', color: '#524533', letterSpacing: '0.22em', textTransform: 'uppercase' }}
            >
              // cognitive signals
            </p>
            <Bar
              label="REASONING"
              value={signals.reasoning}
              color="#FFB000"
              description="Density of reasoning connectives (because, therefore, which causes…)"
            />
            <Bar
              label="DEPTH"
              value={signals.depth}
              color="#4ade80"
              description="Overall RDSE quality score — length, structure, technical vocabulary"
            />
            <Bar
              label="CLARITY"
              value={signals.clarity}
              color="#60a5fa"
              description="Inverse of confusion signals — high means no hesitation markers detected"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
