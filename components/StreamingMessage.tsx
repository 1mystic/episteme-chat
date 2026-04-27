'use client'

// components/StreamingMessage.tsx

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square } from 'lucide-react'

interface StreamingMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming: boolean
  turnNumber: number
}

// Module-level singleton — only one message plays at a time across all instances
const ttsState = {
  activeId: null as string | null,
  listeners: new Set<(id: string | null) => void>(),
  set(id: string | null) {
    this.activeId = id
    this.listeners.forEach((fn) => fn(id))
  },
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[-_]{3,}/g, '')
    .replace(/\n{2,}/g, '. ')
    .trim()
}

const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window

export function StreamingMessage({ role, content, isStreaming, turnNumber }: StreamingMessageProps) {
  const msgId = useRef(`t${turnNumber}-${role}`).current
  const [playState, setPlayState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const wasStreamingRef = useRef(false)
  // keep a stable ref to latest content so auto-play closure is never stale
  const contentRef = useRef(content)
  useEffect(() => { contentRef.current = content }, [content])

  // Subscribe to global TTS state changes so siblings reset when another plays
  useEffect(() => {
    if (role !== 'assistant') return
    const handler = (id: string | null) => {
      if (id !== msgId) setPlayState('idle')
    }
    ttsState.listeners.add(handler)
    return () => { ttsState.listeners.delete(handler) }
  }, [role, msgId])

  // Cancel and clean up if this component unmounts while speaking
  useEffect(() => {
    return () => {
      if (hasSpeech && ttsState.activeId === msgId) {
        window.speechSynthesis.cancel()
        ttsState.set(null)
      }
    }
  }, [msgId])

  const speak = useCallback((text: string) => {
    if (!hasSpeech) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text))
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setPlayState('playing')
      ttsState.set(msgId)
    }
    utterance.onend = () => {
      setPlayState('idle')
      ttsState.set(null)
    }
    utterance.onerror = () => {
      setPlayState('idle')
      ttsState.set(null)
    }

    window.speechSynthesis.speak(utterance)
  }, [msgId])

  // Auto-play when streaming finishes
  useEffect(() => {
    if (role !== 'assistant') return
    if (wasStreamingRef.current && !isStreaming && contentRef.current) {
      speak(contentRef.current)
    }
    wasStreamingRef.current = isStreaming
    // intentionally only isStreaming as dep — speak is stable, content via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming])

  const handlePlayPause = useCallback(() => {
    if (!hasSpeech) return
    if (playState === 'idle') {
      speak(contentRef.current)
    } else if (playState === 'playing') {
      window.speechSynthesis.pause()
      setPlayState('paused')
    } else {
      window.speechSynthesis.resume()
      setPlayState('playing')
    }
  }, [playState, speak])

  const handleStop = useCallback(() => {
    if (!hasSpeech) return
    window.speechSynthesis.cancel()
    setPlayState('idle')
    ttsState.set(null)
  }, [])

  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        <div
          className="max-w-[80%] px-4 py-3 font-grotesk"
          style={{
            fontSize: '15px',
            background: 'rgba(255,176,0,0.07)',
            border: '1px solid rgba(255,176,0,0.18)',
            color: '#eee0d0',
            lineHeight: 1.65,
          }}
        >
          {content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
      style={{ paddingLeft: '16px', borderLeft: '2px solid #FFB000' }}
    >
      <div className="relative">
        <span
          className="font-grotesk absolute -top-5 right-0"
          style={{ fontSize: '10px', color: '#9f8e78', letterSpacing: '0.08em' }}
        >
          T{turnNumber}
        </span>
        <p
          className="font-grotesk"
          style={{ fontSize: '15px', color: '#eee0d0', lineHeight: 1.8 }}
        >
          {content}
          {isStreaming && <span className="streaming-cursor" />}
        </p>
      </div>

      {/* TTS controls — only shown once streaming is done and speech API is available */}
      {!isStreaming && hasSpeech && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handlePlayPause}
            title={playState === 'playing' ? 'Pause narration' : playState === 'paused' ? 'Resume narration' : 'Play narration'}
            className="flex items-center justify-center transition-all duration-150"
            style={{
              width: '22px',
              height: '22px',
              color: playState !== 'idle' ? '#FFB000' : '#524533',
              border: `1px solid ${playState !== 'idle' ? 'rgba(255,176,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
              background: playState !== 'idle' ? 'rgba(255,176,0,0.06)' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFB000'; e.currentTarget.style.borderColor = 'rgba(255,176,0,0.35)' }}
            onMouseLeave={(e) => {
              if (playState === 'idle') {
                e.currentTarget.style.color = '#524533'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }
            }}
          >
            {playState === 'playing' ? <Pause size={10} strokeWidth={2} /> : <Play size={10} strokeWidth={2} />}
          </button>

          {playState !== 'idle' && (
            <button
              onClick={handleStop}
              title="Stop narration"
              className="flex items-center justify-center transition-all duration-150"
              style={{
                width: '22px',
                height: '22px',
                color: '#524533',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#524533'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <Square size={9} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
