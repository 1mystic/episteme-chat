'use client'

// components/ChatPanel.tsx

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat, type InitialChatState } from '@/hooks/useChat'
import { StreamingMessage } from '@/components/StreamingMessage'
import { CognitiveLiveView } from '@/components/CognitiveLiveView'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Domain, DepthLevel, InsightCard } from '@/lib/types'

interface ChatPanelProps {
  sessionId: string
  domain: Domain
  initial?: InitialChatState
  onClarityUpdate: (score: number) => void
  onDepthUpdate: (depth: DepthLevel) => void
  onInsightGenerated: (card: InsightCard) => void
  onConceptsUpdate: (concepts: string[]) => void
  onNextStateUpdate: (state: string) => void
  onGapsUpdate?: (gaps: string[]) => void
  onMisconceptionUpdate?: (m: string | null) => void
}


export function ChatPanel({
  sessionId,
  domain,
  initial,
  onClarityUpdate,
  onDepthUpdate,
  onInsightGenerated,
  onConceptsUpdate,
  onNextStateUpdate,
  onGapsUpdate,
  onMisconceptionUpdate,
}: ChatPanelProps) {
  const router = useRouter()
  const {
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
  } = useChat(sessionId, domain, initial)

  const [input, setInput] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => { onClarityUpdate(clarityScore) }, [clarityScore, onClarityUpdate])
  useEffect(() => { if (depthLevel) onDepthUpdate(depthLevel) }, [depthLevel, onDepthUpdate])
  useEffect(() => { if (nextState) onNextStateUpdate(nextState) }, [nextState, onNextStateUpdate])
  useEffect(() => { onConceptsUpdate(conceptsCovered) }, [conceptsCovered, onConceptsUpdate])
  useEffect(() => { onGapsUpdate?.(gaps) }, [gaps, onGapsUpdate])
  useEffect(() => { onMisconceptionUpdate?.(misconception) }, [misconception, onMisconceptionUpdate])
  useEffect(() => { if (insightCard) onInsightGenerated(insightCard) }, [insightCard, onInsightGenerated])

  useEffect(() => {
    // Jump instantly to bottom on initial load (historical messages); smooth for new messages
    const behavior = isFirstRender.current ? 'instant' : 'smooth'
    isFirstRender.current = false
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [messages])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(trimmed)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  const handleGenerateInsight = async () => {
    setInsightLoading(true)
    await generateInsight()
    setInsightLoading(false)
    // insightId is set in useChat after generation — navigate to the full insight page
  }

  // Navigate to insight page once insightId is known
  useEffect(() => {
    if (insightId) router.push(`/insights/${insightId}`)
  }, [insightId, router])

  const userTurns = messages.filter((m) => m.role === 'user').length

  return (
    <div className="flex flex-col h-full" style={{ background: '#08090A' }}>
      {/* Chat header — turn counter + streaming state only (domain shown in top bar) */}
      <div
        className="flex items-center justify-end px-5 flex-shrink-0"
        style={{ height: '40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {isStreaming && (
              <motion.div
                key="streaming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFB000', display: 'inline-block' }}
                />
                <span className="font-grotesk" style={{ fontSize: '10px', color: '#9f8e78', letterSpacing: '0.12em' }}>
                  thinking...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {userTurns > 0 && (
            <span className="font-grotesk tabular-nums" style={{ fontSize: '11px', color: '#524533', letterSpacing: '0.06em' }}>
              T{userTurns}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col gap-8">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full text-center gap-5"
          >
            <div
              style={{
                width: '40px',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #FFB000, transparent)',
                opacity: 0.5,
              }}
            />
            <p
              className="font-grotesk font-medium"
              style={{ fontSize: '20px', color: '#d7c4ac', letterSpacing: '-0.02em', maxWidth: '400px', lineHeight: 1.4 }}
            >
              Ask anything. I won&apos;t answer it — not directly.
            </p>
            <p className="font-grotesk" style={{ fontSize: '13px', color: '#524533', letterSpacing: '0.04em' }}>
              I&apos;ll ask you what you already think. We&apos;ll build from there.
            </p>
            <div
              style={{
                width: '40px',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #FFB000, transparent)',
                opacity: 0.5,
              }}
            />
          </motion.div>
        )}

        {messages.map((msg) => (
          <StreamingMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
            turnNumber={msg.turnNumber}
          />
        ))}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-grotesk text-center"
            style={{ fontSize: '12px', color: '#f87171', letterSpacing: '0.04em' }}
          >
            {error}
          </motion.p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Insight generation CTA */}
      <AnimatePresence>
        {canGenerateInsight && !insightCard && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-5 py-2 flex-shrink-0"
          >
            <button
              onClick={handleGenerateInsight}
              disabled={insightLoading || isStreaming}
              className="w-full py-3 font-grotesk font-semibold uppercase tracking-[0.18em] text-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontSize: '11px',
                color: '#FFB000',
                background: 'rgba(255,176,0,0.05)',
                border: '1px solid rgba(255,176,0,0.2)',
                letterSpacing: '0.18em',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(255,176,0,0.10)' }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = 'rgba(255,176,0,0.05)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={12} />
                {insightLoading ? '// analyzing session...' : '// generate insight card'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session complete banner */}
      {insightCard && (
        <div
          className="px-5 py-4 flex-shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,176,0,0.04)' }}
        >
          <p className="font-grotesk" style={{ fontSize: '12px', color: '#9f8e78' }}>
            Session complete.
          </p>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/')} className="flex items-center gap-1.5">
            Start new session <ArrowRight size={12} />
          </Button>
        </div>
      )}

      {/* Input area */}
      {!insightCard && (
        <div
          className="flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Live cognitive signals */}
          <CognitiveLiveView
            draftResponse={input}
            domain={domain}
            turnNumber={userTurns + 1}
          />

          <div className="flex items-end gap-3 px-5 py-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="What do you want to understand today?"
              rows={1}
              className="flex-1 resize-none bg-transparent font-grotesk outline-none disabled:opacity-50"
              style={{
                fontSize: '16px',
                color: '#eee0d0',
                lineHeight: 1.6,
                maxHeight: '140px',
                overflowY: 'auto',
                caretColor: '#FFB000',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="flex-shrink-0 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                color: '#08090A',
                background: '#FFB000',
                width: '36px',
                height: '36px',
                boxShadow: input.trim() ? '0 0 16px rgba(255,176,0,0.3)' : 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
