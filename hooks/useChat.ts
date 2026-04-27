'use client'

// hooks/useChat.ts

import { useState, useCallback, useRef, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Domain, DepthLevel, InsightCard, Message, Concept } from '@/lib/types'
import { inferKnowledgeGaps } from '@/lib/algorithms'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming: boolean
  turnNumber: number
}

export interface InitialChatState {
  messages?: Message[]
  concepts?: Concept[]
  nextState?: string | null
}

interface UseChatResult {
  messages: ChatMessage[]
  isStreaming: boolean
  clarityScore: number
  depthLevel: DepthLevel | null
  nextState: string | null
  conceptsCovered: string[]
  gaps: string[]
  misconception: string | null
  insightCard: InsightCard | null
  insightId: string | null
  sendMessage: (content: string) => Promise<void>
  generateInsight: () => Promise<void>
  canGenerateInsight: boolean
  error: string | null
}

export function useChat(sessionId: string, domain: Domain, initial?: InitialChatState): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    (initial?.messages ?? []).map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      isStreaming: false,
      turnNumber: m.turn_number,
    }))
  )
  const [isStreaming, setIsStreaming] = useState(false)
  const [clarityScore, setClarityScore] = useState(() => {
    const concepts = initial?.concepts ?? []
    return concepts.length > 0 ? concepts[concepts.length - 1].clarity_score : 0
  })
  const [depthLevel, setDepthLevel] = useState<DepthLevel | null>(() => {
    const concepts = initial?.concepts ?? []
    return concepts.length > 0 ? (concepts[concepts.length - 1].depth_reached as DepthLevel) : null
  })
  const [nextState, setNextState] = useState<string | null>(initial?.nextState ?? null)
  const [conceptsCovered, setConceptsCovered] = useState<string[]>(() =>
    (initial?.concepts ?? []).map((c) => c.name)
  )
  const [misconception, setMisconception] = useState<string | null>(null)
  const [insightCard, setInsightCard] = useState<InsightCard | null>(null)
  const [insightId, setInsightId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const initTurnRef = (initial?.messages ?? [])
    .filter((m) => m.role === 'user')
    .map((m) => m.turn_number)
  const turnNumberRef = useRef(initTurnRef.length > 0 ? Math.max(...initTurnRef) : 0)

  const userMessages = messages.filter((m) => m.role === 'user')
  const canGenerateInsight = userMessages.length >= 4 && !insightCard
  const gaps = useMemo(() => inferKnowledgeGaps(conceptsCovered, domain), [conceptsCovered, domain])

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return
      setError(null)
      setIsStreaming(true)

      turnNumberRef.current += 1
      const turnNumber = turnNumberRef.current

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        isStreaming: false,
        turnNumber,
      }

      const assistantId = uuidv4()
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        turnNumber,
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])

      // Classify on first message to get depth level
      if (turnNumber === 1) {
        fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: content, sessionId, domain }),
        })
          .then((r) => r.json())
          .then((data: { depth?: DepthLevel }) => {
            if (data.depth) setDepthLevel(data.depth)
            const conceptName = content.slice(0, 60).replace(/[?!.]+$/, '').trim()
            setConceptsCovered((prev) => (prev.includes(conceptName) ? prev : [...prev, conceptName]))
          })
          .catch(() => {})
      }

      // Build conversation history for API (uses snapshot before setState resolves)
      const history = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      history.push({ role: 'user', content })

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: content,
            turnNumber,
            domain,
            conversationHistory: history,
            conceptsCovered,
          }),
        })

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const data = JSON.parse(line.slice(6)) as {
                text?: string
                done?: boolean
                clarityScore?: number
                nextState?: string
                depthLevel?: DepthLevel
                canGenerateInsight?: boolean
                misconception?: string | null
                error?: string
              }

              if (data.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.text! }
                      : m
                  )
                )
              }

              if (data.done) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                )
                if (data.clarityScore !== undefined) setClarityScore(data.clarityScore)
                if (data.nextState) setNextState(data.nextState)
                if (data.depthLevel) setDepthLevel(data.depthLevel)
                setMisconception(data.misconception ?? null)
                setIsStreaming(false)
              }

              if (data.error) {
                setError('Response failed. Try again.')
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, isStreaming: false, content: '[Response failed]' }
                      : m
                  )
                )
                setIsStreaming(false)
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err)
        setError('Failed to send message. Try again.')
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, content: '[Failed to load response]' }
              : m
          )
        )
        setIsStreaming(false)
      }
    },
    [isStreaming, messages, sessionId, domain, conceptsCovered]
  )

  const generateInsight = useCallback(async () => {
    if (!canGenerateInsight || isStreaming) return
    setError(null)

    const history = messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const mainConcept = conceptsCovered[0] ?? 'this topic'

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, domain, conversationHistory: history, mainConcept }),
      })
      if (!res.ok) throw new Error('Insight generation failed')
      const data = await res.json() as { insightCard: InsightCard }
      setInsightCard(data.insightCard)
      if (data.insightCard?.id) setInsightId(data.insightCard.id)
    } catch (err) {
      console.error('Insight error:', err)
      setError('Failed to generate insight card. Try again.')
    }
  }, [canGenerateInsight, isStreaming, messages, sessionId, domain, conceptsCovered])

  return {
    messages,
    isStreaming,
    clarityScore,
    depthLevel,
    nextState,
    conceptsCovered,
    gaps,
    misconception,
    insightCard,
    insightId,
    sendMessage,
    generateInsight,
    canGenerateInsight,
    error,
  }
}
