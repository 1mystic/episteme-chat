// lib/scoring.ts

import type { DepthLevel } from './types'

export const REASONING_KEYWORDS = [
  'because', 'therefore', 'since', 'which means', 'this causes',
  'as a result', 'leads to', 'implies', 'suggests', 'however',
  'but', 'although', 'on the other hand', 'compared to', 'unlike',
  'for example', 'specifically', 'in other words', 'that is',
]

export const DEPTH_SCORE_MAP: Record<DepthLevel, number> = {
  SURFACE: 15,
  CONCEPTUAL: 35,
  ANALYTICAL: 65,
  SYNTHESIS: 85,
}

export function calculateTurnScore(
  userResponse: string,
  currentDepth: DepthLevel,
  turnNumber: number
): number {
  const r = userResponse.toLowerCase()

  // Base score from depth level
  const base = DEPTH_SCORE_MAP[currentDepth]

  // Bonus: +2 per reasoning keyword found (max 20)
  const keywordBonus = Math.min(
    REASONING_KEYWORDS.filter((kw) => r.includes(kw)).length * 2,
    20
  )

  // Bonus: +1 per 20 chars of response (max 15)
  const lengthBonus = Math.min(Math.floor(userResponse.length / 20), 15)

  // Bonus: +3 per turn number (capped at turn 5)
  const turnBonus = Math.min(turnNumber, 5) * 3

  return Math.max(0, Math.min(100, base + keywordBonus + lengthBonus + turnBonus))
}

export function calculateSessionClarity(turnScores: number[]): number {
  if (turnScores.length === 0) return 0

  // Weighted average: later turns weighted higher (exponential)
  const weights = turnScores.map((_, i) => Math.pow(1.5, i))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const weightedSum = turnScores.reduce((sum, score, i) => sum + score * weights[i], 0)

  return Math.round(weightedSum / totalWeight)
}
