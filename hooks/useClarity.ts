'use client'

// hooks/useClarity.ts

import { useState, useCallback } from 'react'

interface UseClarityResult {
  score: number
  history: number[]
  updateScore: (newScore: number) => void
  trend: 'up' | 'down' | 'stable'
}

export function useClarity(initialScore = 0): UseClarityResult {
  const [score, setScore] = useState(initialScore)
  const [history, setHistory] = useState<number[]>(initialScore > 0 ? [initialScore] : [])

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore)
    setHistory((prev) => {
      const next = [...prev, newScore].slice(-10)
      return next
    })
  }, [])

  const trend: 'up' | 'down' | 'stable' = (() => {
    if (history.length < 2) return 'stable'
    const diff = history[history.length - 1] - history[history.length - 2]
    if (diff > 5) return 'up'
    if (diff < -5) return 'down'
    return 'stable'
  })()

  return { score, history, updateScore, trend }
}
