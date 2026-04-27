'use client'

// app/insights/[insightId]/page.tsx

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ExportPanel } from '@/components/ExportPanel'

interface InsightRecord {
  id: string
  session_id: string
  concept: string
  insight: string
  gaps: string[]
  clarity_score: number
  next_starter?: string | null
  created_at: string
}

interface SessionInfo {
  domain: string
  created_at: string
}

const DOMAIN_LABELS: Record<string, string> = {
  ml: 'Machine Learning', statistics: 'Statistics',
  economics: 'Economics', cs: 'Computer Science', general: 'General',
}

function scoreColor(score: number) {
  if (score >= 71) return '#4ade80'
  if (score >= 41) return '#FFB000'
  return '#f87171'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InsightDetailPage() {
  const params = useParams()
  const insightId = params.insightId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [insight, setInsight] = useState<InsightRecord | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/insights')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || !insightId) return
    async function load() {
      try {
        const { data: card, error: cardErr } = await supabase
          .from('insight_cards')
          .select('*')
          .eq('id', insightId)
          .single()

        if (cardErr || !card) { setError('Insight not found.'); setLoading(false); return }
        setInsight(card as InsightRecord)

        const { data: sess } = await supabase
          .from('sessions')
          .select('domain, created_at')
          .eq('id', (card as InsightRecord).session_id)
          .single()

        if (sess) setSession(sess as SessionInfo)
      } catch {
        setError('Failed to load insight.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, insightId])

  if (authLoading || !user) return null

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#08090A' }}>
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '8px', height: '8px', background: '#FFB000', borderRadius: '50%' }}
        />
        <p className="font-grotesk tracking-[0.18em] uppercase" style={{ fontSize: '11px', color: '#9f8e78' }}>
          Loading insight...
        </p>
      </div>
    )
  }

  if (error || !insight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: '#08090A' }}>
        <p className="font-grotesk font-medium" style={{ fontSize: '18px', color: '#eee0d0' }}>
          {error ?? 'Insight not found.'}
        </p>
        <Link href="/insights" className="font-grotesk font-semibold uppercase tracking-[0.16em] flex items-center gap-1.5 transition-opacity hover:opacity-70" style={{ fontSize: '11px', color: '#FFB000' }}>
          <ArrowLeft size={13} /> All Insights
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#08090A', color: '#eee0d0' }}>
      {/* Amber top bar */}
      <div style={{ height: '2px', background: '#FFB000', opacity: 0.35 }} />

      {/* Nav */}
      <div
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,9,10,0.96)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-grotesk font-semibold tracking-[0.24em] uppercase transition-opacity hover:opacity-70" style={{ fontSize: '12px', color: '#FFB000' }}>
            EPISTEME
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>/</span>
          <Link href="/insights" className="font-grotesk uppercase tracking-[0.12em] transition-opacity hover:opacity-70" style={{ fontSize: '11px', color: '#9f8e78' }}>
            Insights
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>/</span>
          <span className="font-grotesk uppercase tracking-[0.10em]" style={{ fontSize: '11px', color: '#6b5a44', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {insight.concept}
          </span>
        </div>
        <Link
          href="/insights"
          className="font-grotesk uppercase tracking-[0.14em] transition-opacity hover:opacity-70 flex items-center gap-1.5"
          style={{ fontSize: '10px', color: '#524533' }}
        >
          <ArrowLeft size={11} /> All Insights
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#191209',
            border: '1px solid rgba(255,176,0,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Amber top bar */}
          <div style={{ height: '2px', background: '#FFB000' }} />

          <div className="p-8 sm:p-10">
            {/* Meta row */}
            <div className="flex items-center justify-between mb-7">
              <span className="font-grotesk font-semibold uppercase tracking-[0.22em]" style={{ fontSize: '11px', color: '#FFB000' }}>
                INSIGHT CARD
              </span>
              <div className="flex items-center gap-3">
                {session && (
                  <span className="font-grotesk uppercase tracking-[0.12em]" style={{ fontSize: '9px', color: '#524533', background: 'rgba(255,255,255,0.04)', padding: '2px 8px' }}>
                    {DOMAIN_LABELS[session.domain] ?? session.domain}
                  </span>
                )}
                <span className="font-grotesk" style={{ fontSize: '11px', color: '#524533' }}>
                  {formatDate(insight.created_at)}
                </span>
              </div>
            </div>

            {/* Concept */}
            <h1
              className="font-grotesk font-semibold mb-2 leading-tight"
              style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#eee0d0', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {insight.concept}
            </h1>

            <div style={{ width: '48px', height: '1.5px', background: '#FFB000', marginBottom: '20px', opacity: 0.7 }} />

            {/* Clarity score */}
            <div className="flex items-center gap-3 mb-7">
              <span className="font-grotesk uppercase tracking-[0.14em]" style={{ fontSize: '11px', color: '#9f8e78' }}>Clarity</span>
              <span className="font-grotesk font-semibold" style={{ fontSize: '20px', color: scoreColor(insight.clarity_score) }}>
                {insight.clarity_score}
                <span style={{ fontSize: '13px', color: '#9f8e78', fontWeight: 400 }}>/100</span>
              </span>
              {/* Progress bar */}
              <div className="flex-1" style={{ height: '3px', background: 'rgba(255,255,255,0.06)', maxWidth: '120px' }}>
                <div style={{ height: '100%', width: `${insight.clarity_score}%`, background: scoreColor(insight.clarity_score), transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {/* Insight text */}
            <p className="font-grotesk mb-8 leading-relaxed" style={{ fontSize: '16px', color: '#d7c4ac', lineHeight: 1.8 }}>
              {insight.insight}
            </p>

            {/* Unexplored threads */}
            {insight.gaps.length > 0 && (
              <div className="mb-8">
                <p className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-4" style={{ fontSize: '10px', color: '#FFB000' }}>
                  // UNEXPLORED THREADS
                </p>
                <div className="flex flex-wrap gap-2">
                  {insight.gaps.map((gap, i) => (
                    <motion.span
                      key={gap}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="font-grotesk"
                      style={{ fontSize: '12px', color: '#9f8e78', border: '1px dashed rgba(255,255,255,0.14)', padding: '4px 10px' }}
                    >
                      {gap}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Next session starter */}
            {insight.next_starter && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,176,0,0.03)' }}>
                <div className="pt-6">
                  <p className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-4" style={{ fontSize: '10px', color: '#FFB000' }}>
                    // YOUR NEXT SESSION
                  </p>
                  <blockquote
                    className="font-grotesk font-medium mb-6"
                    style={{ fontSize: '17px', color: '#eee0d0', lineHeight: 1.65, borderLeft: '2px solid #FFB000', paddingLeft: '16px', letterSpacing: '-0.01em' }}
                  >
                    &ldquo;{insight.next_starter}&rdquo;
                  </blockquote>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-grotesk font-semibold uppercase tracking-[0.16em] transition-all hover:opacity-90 active:scale-95"
                    style={{ fontSize: '11px', padding: '11px 26px', background: '#FFB000', color: '#08090A', boxShadow: '0 0 18px rgba(255,176,0,0.28)' }}
                  >
                    Start this session <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {!insight.next_starter && (
              <div className="flex items-center justify-between pt-2">
                <span className="font-grotesk" style={{ fontSize: '12px', color: '#524533' }}>Session complete.</span>
                <Link
                  href="/"
                  className="font-grotesk font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70 flex items-center gap-1.5"
                  style={{ fontSize: '11px', color: '#FFB000' }}
                >
                  New session <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Export panel */}
          <ExportPanel sessionId={insight.session_id} />

          {/* Back to session footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px' }}>
            <Link
              href={`/session/${insight.session_id}`}
              className="font-grotesk uppercase tracking-[0.14em] transition-opacity hover:opacity-70 flex items-center gap-1.5 w-fit"
              style={{ fontSize: '10px', color: '#524533' }}
            >
              <ArrowLeft size={10} /> Back to session
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
