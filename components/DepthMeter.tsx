'use client'

// components/DepthMeter.tsx

import { motion, AnimatePresence } from 'framer-motion'
import type { DepthLevel } from '@/lib/types'

interface DepthMeterProps {
  depth: DepthLevel | null
  previousDepth: DepthLevel | null
}

const DEPTH_INDEX: Record<DepthLevel, number> = {
  SURFACE: 0,
  CONCEPTUAL: 1,
  ANALYTICAL: 2,
  SYNTHESIS: 3,
}

const STEPS = [
  { level: 'SYNTHESIS' as DepthLevel,  label: 'Synthesis' },
  { level: 'ANALYTICAL' as DepthLevel, label: 'Analytical' },
  { level: 'CONCEPTUAL' as DepthLevel, label: 'Conceptual' },
  { level: 'SURFACE' as DepthLevel,    label: 'Surface' },
]

export function DepthMeter({ depth, previousDepth }: DepthMeterProps) {
  const currentIndex = depth ? DEPTH_INDEX[depth] : -1
  const prevIndex = previousDepth ? DEPTH_INDEX[previousDepth] : -1
  const upgraded = currentIndex > prevIndex && prevIndex >= 0

  return (
    <div>
      <p
        className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-4"
        style={{ fontSize: '10px', color: '#FFB000' }}
      >
        // DEPTH LEVEL
      </p>

      <div className="flex flex-col gap-1">
        {STEPS.map((step) => {
          const stepIndex = DEPTH_INDEX[step.level]
          const isActive = depth === step.level
          const isPassed = currentIndex > stepIndex
          const isFuture = currentIndex < stepIndex || currentIndex === -1

          return (
            <div key={step.level} className="flex items-center gap-3 py-1.5">
              {/* Dot */}
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{
                    background: isActive || isPassed ? '#FFB000' : 'transparent',
                    borderColor: isFuture ? '#524533' : '#FFB000',
                    opacity: isPassed ? 0.45 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    border: '1px solid',
                  }}
                />
                {isActive && upgraded && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    style={{
                      position: 'absolute',
                      inset: '-1px',
                      borderRadius: '50%',
                      border: '1px solid #FFB000',
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${step.level}-${isActive}`}
                  initial={isActive ? { x: -6, opacity: 0 } : { opacity: 1 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-grotesk font-medium uppercase tracking-[0.14em]"
                  style={{
                    fontSize: '11px',
                    color: isActive ? '#FFB000' : isPassed ? 'rgba(255,176,0,0.45)' : '#524533',
                  }}
                >
                  {step.label}
                  {isActive && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', color: '#9f8e78', fontWeight: 400 }}>
                      ← current
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
