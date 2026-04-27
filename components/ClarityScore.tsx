'use client'

// components/ClarityScore.tsx

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ClarityScoreProps {
  score: number
  history: number[]
  trend: 'up' | 'down' | 'stable'
}

const TREND_ICON: Record<'up' | 'down' | 'stable', React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const TREND_COLOR: Record<'up' | 'down' | 'stable', string> = {
  up: '#4ade80',
  down: '#f87171',
  stable: '#9f8e78',
}

function useAnimatedCounter(target: number, duration = 800) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startRef.current = null

    function step(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return display
}

export function ClarityScore({ score, history, trend }: ClarityScoreProps) {
  const displayScore = useAnimatedCounter(score)
  const isHigh = score >= 70

  const width = 220
  const height = 36
  const points = history.length > 1
    ? history.map((s, i) => {
        const x = (i / (history.length - 1)) * width
        const y = height - (s / 100) * height
        return `${x},${y}`
      }).join(' ')
    : null

  return (
    <div>
      <p
        className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-3"
        style={{ fontSize: '10px', color: '#FFB000' }}
      >
        // CLARITY SCORE
      </p>

      {/* Score + trend */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="font-grotesk font-semibold tabular-nums"
          style={{
            fontSize: '52px',
            lineHeight: 1,
            color: '#FFB000',
            letterSpacing: '-0.04em',
          }}
        >
          {displayScore}
        </span>
        {(() => { const Icon = TREND_ICON[trend]; return <Icon size={20} style={{ color: TREND_COLOR[trend] }} /> })()}
      </div>

      {/* Progress bar */}
      <div
        className="w-full mb-4"
        style={{
          height: '3px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: '#FFB000',
            transition: 'width 0.8s ease',
            boxShadow: isHigh ? '0 0 10px rgba(255,176,0,0.5)' : 'none',
          }}
        />
      </div>

      {/* Sparkline */}
      {points && (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB000" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFB000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke="#FFB000"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
          {history.map((s, i) => {
            const x = (i / (history.length - 1)) * width
            const y = height - (s / 100) * height
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#FFB000" />
          })}
        </svg>
      )}

      {history.length === 0 && (
        <p className="font-grotesk" style={{ fontSize: '11px', color: '#524533' }}>
          Score updates as you respond
        </p>
      )}
    </div>
  )
}
