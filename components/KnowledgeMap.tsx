'use client'

// components/KnowledgeMap.tsx

import { motion } from 'framer-motion'
import type { Domain } from '@/lib/types'

interface KnowledgeMapProps {
  concepts: string[]
  gaps: string[]
  domain: Domain
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

export function KnowledgeMap({ concepts, gaps }: KnowledgeMapProps) {
  const visibleGaps = gaps.slice(0, 5)

  return (
    <div>
      <p
        className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-4"
        style={{ fontSize: '10px', color: '#FFB000' }}
      >
        // KNOWLEDGE MAP
      </p>

      {concepts.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={{
            height: '80px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="font-grotesk text-center px-4" style={{ fontSize: '11px', color: '#524533' }}>
            Concepts appear as you explore
          </p>
        </div>
      ) : (
        <>
          {/* Explored concepts */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {concepts.map((concept, i) => (
              <motion.div
                key={concept}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="font-grotesk font-medium"
                style={{
                  fontSize: '10px',
                  color: '#FFB000',
                  background: 'rgba(255,176,0,0.08)',
                  border: '1px solid rgba(255,176,0,0.3)',
                  padding: '3px 9px',
                }}
                title={concept}
              >
                {truncate(concept, 22)}
              </motion.div>
            ))}
          </div>

          {/* Gaps */}
          {visibleGaps.length > 0 && (
            <>
              <p
                className="font-grotesk uppercase tracking-[0.16em] mb-2"
                style={{ fontSize: '9px', color: '#524533' }}
              >
                // Not yet explored
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleGaps.map((gap) => (
                  <div
                    key={gap}
                    className="font-grotesk"
                    style={{
                      fontSize: '10px',
                      color: '#6b5a44',
                      border: '1px dashed rgba(107,90,68,0.4)',
                      padding: '3px 9px',
                    }}
                    title={gap}
                  >
                    {gap}
                  </div>
                ))}
                {gaps.length > 5 && (
                  <span className="font-grotesk" style={{ fontSize: '10px', color: '#524533', padding: '3px 4px' }}>
                    +{gaps.length - 5}
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
