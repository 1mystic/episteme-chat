'use client'

// app/insights/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { DashboardSidebar } from '@/components/DashboardSidebar'

interface InsightRecord {
  id: string
  session_id: string
  concept: string
  insight: string
  gaps: string[]
  clarity_score: number
  next_starter?: string | null
  created_at: string
  domain: string
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

export default function InsightsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [insights, setInsights] = useState<InsightRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/insights')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const res = await fetch('/api/insights', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json() as { insights?: InsightRecord[] }
      setInsights(data.insights ?? [])
      setLoading(false)
    })
  }, [user])

  if (authLoading || !user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#08090A] text-[#eee0d0] font-['Space_Grotesk']">
      <style dangerouslySetInnerHTML={{__html:`
        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .bloom-effect {
          background: radial-gradient(circle at center, rgba(255,176,0,0.15) 0%, transparent 70%);
          filter: blur(40px);
        }
      `}}/>

      <DashboardSidebar
        user={user}
        signOut={signOut}
        onNewSession={() => router.push('/dashboard')}
        newSessionLoading={false}
        activeItem="insights"
      />

      <main className="ml-64 flex-1 overflow-y-auto relative grid-bg">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bloom-effect -z-10 pointer-events-none" />

        <header className="bg-[#08090A] uppercase tracking-widest text-sm border-b border-white/10 flex justify-between items-center w-full px-8 h-16 sticky top-0 z-40">
          <span className="text-xl font-bold text-amber-500 tracking-tighter">INSIGHTS // LOG</span>
          <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">
            {loading ? '...' : `${insights.length} CARD${insights.length !== 1 ? 'S' : ''}`}
          </span>
        </header>

        <div className="p-8 max-w-[960px] mx-auto space-y-8">
          <div>
            <p className="font-bold uppercase tracking-[0.22em] mb-1" style={{ fontSize: '10px', color: '#FFB000' }}>
              // Your insight cards
            </p>
            <p className="font-grotesk" style={{ fontSize: '13px', color: '#524533' }}>
              Generated at the end of each Socratic session. Click any card to open it.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-16">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB000', display: 'inline-block' }}
              />
              <span className="font-grotesk" style={{ fontSize: '12px', color: '#9f8e78', letterSpacing: '0.12em' }}>
                Loading insights...
              </span>
            </div>
          ) : insights.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-4"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="font-grotesk font-medium" style={{ fontSize: '16px', color: '#6b5a44' }}>No insights yet</p>
              <p className="font-grotesk" style={{ fontSize: '12px', color: '#524533' }}>
                Complete a session (4+ turns) and generate an insight card
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="font-grotesk font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70 mt-2 flex items-center gap-1.5"
                style={{ fontSize: '11px', color: '#FFB000' }}
              >
                Start a session <ArrowRight size={11} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {insights.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    href={`/insights/${card.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition-all"
                    style={{
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.01)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,176,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,176,0,0.2)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    {/* Clarity score */}
                    <span
                      className="font-grotesk font-semibold tabular-nums flex-shrink-0"
                      style={{ fontSize: '18px', color: scoreColor(card.clarity_score), letterSpacing: '-0.02em' }}
                    >
                      {card.clarity_score}
                      <span style={{ fontSize: '11px', color: '#524533', fontWeight: 400 }}>/100</span>
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-grotesk font-semibold" style={{ fontSize: '14px', color: '#eee0d0', letterSpacing: '-0.01em' }}>
                          {card.concept}
                        </span>
                        <span
                          className="font-grotesk uppercase tracking-[0.12em]"
                          style={{ fontSize: '9px', color: '#524533', background: 'rgba(255,255,255,0.04)', padding: '2px 6px' }}
                        >
                          {DOMAIN_LABELS[card.domain] ?? card.domain}
                        </span>
                      </div>
                      <p className="font-grotesk truncate" style={{ fontSize: '12px', color: '#6b5a44', maxWidth: '520px' }}>
                        {card.insight}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-grotesk" style={{ fontSize: '11px', color: '#524533' }}>
                        {formatDate(card.created_at)}
                      </span>
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                        style={{ color: '#524533' }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <footer className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-[9px] font-bold tracking-[0.3em] text-white/20 uppercase">
            <div>© 2026 ACADEMIC_OS_KERNEL // BUILD_7701</div>
          </footer>
        </div>
      </main>
    </div>
  )
}
