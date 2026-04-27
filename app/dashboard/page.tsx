'use client'

// app/dashboard/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  Brain, BarChart2, TrendingUp, Cpu, Globe,
  Check, Loader2, ArrowRight, Trash2, Sparkles,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/DashboardSidebar'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Stats {
  totalSessions: number
  completedSessions: number
  totalTurns: number
  avgClarity: number
  bestClarity: number
}

interface DomainStat {
  domain: string
  count: number
}

interface ClarityPoint {
  sessionId: string
  domain: string
  clarity: number
  createdAt: string
}

interface RecentSession {
  id: string
  domain: string
  turns: number
  clarity: number | null
  isComplete: boolean
  createdAt: string
}

interface RecentInsight {
  sessionId: string
  concept: string
  insight: string
  clarity: number
  domain: string
  createdAt: string
}

interface Badge {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
}

interface DashboardData {
  stats: Stats
  domainStats: DomainStat[]
  clarityHistory: ClarityPoint[]
  recentSessions: RecentSession[]
  recentInsights: RecentInsight[]
  badges: Badge[]
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  ml: 'Machine Learning',
  statistics: 'Statistics',
  economics: 'Economics',
  cs: 'Computer Science',
  general: 'General',
}

const DOMAIN_ICON_MAP: Record<string, React.ElementType> = {
  ml: Brain,
  statistics: BarChart2,
  economics: TrendingUp,
  cs: Cpu,
  general: Globe,
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function userInitial(email: string) {
  return email.charAt(0).toUpperCase()
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div
      className="p-8 flex flex-col justify-center border border-white/10 hover:border-amber-500/30 transition-all group relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -z-10 group-hover:bg-amber-500/10 transition-all blur-2xl"></div>
      <span className="text-white/40 text-[11px] tracking-widest font-bold uppercase">{label}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-bold font-grotesk text-amber-500 tracking-tighter group-hover:drop-shadow-[0_0_15px_rgba(255,176,0,0.5)] transition-all">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-white/40 uppercase font-bold tracking-widest">{unit}</span>
        )}
      </div>
    </div>
  )
}

function ClarityChart({ history, height = 100 }: { history: ClarityPoint[]; height?: number }) {
  if (history.length < 2) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ height: `${height}px`, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}
      >
        <p className="font-grotesk uppercase tracking-widest" style={{ fontSize: '10px', color: '#524533' }}>
          Insufficient Data Stream
        </p>
      </div>
    )
  }

  const W = 600
  const H = height
  const pad = { l: 40, r: 20, t: 20, b: 30 }
  const inner = { w: W - pad.l - pad.r, h: H - pad.t - pad.b }

  const points = history.map((p, i) => {
    const x = pad.l + (i / (history.length - 1)) * inner.w
    const y = pad.t + inner.h - (p.clarity / 100) * inner.h
    return { x, y, ...p }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')
  const area = [
    `M ${points[0].x},${pad.t + inner.h}`,
    ...points.map((p) => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1].x},${pad.t + inner.h}`,
    'Z',
  ].join(' ')

  const yLabels = [0, 50, 100]

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFB000" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map((v) => {
        const y = pad.t + inner.h - (v / 100) * inner.h
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={pad.l - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="'Space Grotesk', sans-serif">{v}</text>
          </g>
        )
      })}
      {/* Area fill */}
      <motion.path 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        d={area} 
        fill="url(#chartGrad)" 
      />
      {/* Line */}
      <motion.polyline 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        points={polyline} 
        fill="none" 
        stroke="#FFB000" 
        strokeWidth="2" 
        strokeOpacity="0.8" 
      />
      {/* Dots */}
      {points.map((p, i) => (
        <circle 
          key={i} 
          cx={p.x} 
          cy={p.y} 
          r="4" 
          fill="#08090A" 
          stroke="#FFB000" 
          strokeWidth="2"
          className="drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]"
        />
      ))}
    </svg>
  )
}

function ConsistencyChart({ history }: { history: RecentSession[] }) {
  const H = 100
  const W = 400
  const maxTurns = Math.max(...history.map(s => s.turns), 10)
  
  return (
    <div className="flex items-end justify-between gap-1 h-full w-full px-2">
      {history.slice(0, 12).reverse().map((s, i) => {
        const h = (s.turns / maxTurns) * 100
        return (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-2 group/bar">
            <div className="w-full relative bg-white/5 rounded-t-sm overflow-hidden" style={{ height: `${Math.max(h, 5)}%` }}>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ delay: i * 0.05 }}
                className="absolute bottom-0 left-0 right-0 bg-amber-500/20 group-hover/bar:bg-amber-500/40 transition-colors"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}


// ── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [newSessionLoading, setNewSessionLoading] = useState(false)
  const [newSessionDomain, setNewSessionDomain] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error('Failed to load dashboard')
      const json = await res.json() as DashboardData
      setData(json)
    } catch {
      setError('Could not load dashboard data.')
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
      return
    }
    if (!authLoading && user) {
      fetchDashboard()
    }
  }, [authLoading, user, router, fetchDashboard])

  const handleNewSession = useCallback(async (domain = 'general') => {
    setNewSessionLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch('/api/session', { method: 'POST', headers, body: JSON.stringify({ domain }) })
      const json = await res.json() as { session?: { id: string } }
      if (json.session?.id) router.push(`/session/${json.session.id}`)
    } catch {
      setNewSessionLoading(false)
    }
  }, [router])

  const handleDomainSession = (domain: string) => {
    setNewSessionDomain(null)
    handleNewSession(domain)
  }

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    setDeletingId(sessionId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      await fetch(`/api/session?id=${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      setData((prev) => prev ? {
        ...prev,
        recentSessions: prev.recentSessions.filter((s) => s.id !== sessionId),
        stats: { ...prev.stats, totalSessions: Math.max(0, prev.stats.totalSessions - 1) },
      } : prev)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }, [])

  if (authLoading || (dataLoading && !error)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#08090A' }}
      >
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '8px', height: '8px', background: '#FFB000', borderRadius: '50%' }}
        />
        <p className="font-grotesk tracking-[0.18em] uppercase" style={{ fontSize: '11px', color: '#9f8e78' }}>
          Loading...
        </p>
      </div>
    )
  }

  if (!user) return null

  const stats = data?.stats ?? { totalSessions: 0, completedSessions: 0, totalTurns: 0, avgClarity: 0, bestClarity: 0 }

  return (
    <div className="flex h-screen overflow-hidden bg-[#08090A] text-[#eee0d0] font-['Space_Grotesk'] selection:bg-amber-500 selection:text-black">
      <style dangerouslySetInnerHTML={{__html:`
        .glow-amber { box-shadow: 0 0 20px rgba(255, 176, 0, 0.03); }
        .glow-amber-hover:hover { box-shadow: 0 0 30px rgba(255, 176, 0, 0.12); }
        .grid-bg {
            background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        .bloom-effect {
            background: radial-gradient(circle at center, rgba(255, 176, 0, 0.12) 0%, transparent 70%);
            filter: blur(60px);
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 176, 0, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 176, 0, 0.3);
        }
      `}}/>
      
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        signOut={signOut}
        onNewSession={() => setNewSessionDomain('open')}
        newSessionLoading={newSessionLoading}
        activeItem="dashboard"
      />

      {/* Main content */}
      <main className="ml-64 flex-1 overflow-y-auto relative grid-bg">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bloom-effect -z-10 pointer-events-none"></div>

        {/* Header */}
        <header className="bg-[#08090A] font-['Space_Grotesk'] uppercase tracking-widest text-sm border-b border-white/10 flex justify-between items-center w-full px-8 h-16 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-amber-500 tracking-tighter">DATA // V1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-amber-500/80">
              <Loader2 size={13} className="animate-spin" />
              <span className="text-[10px] font-medium">SYSTEM_STATUS: OPTIMAL</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          {error && (
            <p className="font-grotesk" style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>
          )}

          {/* ── Stats row ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard label="Total Sessions" value={stats.totalSessions} />
            <StatCard label="Total Turns" value={stats.totalTurns} />
            <StatCard label="Avg Clarity" value={stats.avgClarity} unit="/100" />
            <StatCard label="Best Clarity" value={stats.bestClarity} unit="/100" />
          </motion.div>

          {/* ── Clarity trend + Badges ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* Chart */}
            <div className="col-span-12 lg:col-span-8 p-10 border border-white/10 glow-amber bg-white/[0.01]">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-base">Learning Velocity</h3>
                  <p className="text-white/40 text-[11px] mt-1 tracking-wider uppercase">Metric: Clarity Trend (Δ / Time)</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#FFB000]"></span>
                    <span className="text-[11px] text-white/60 font-bold uppercase tracking-widest">Current</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <ClarityChart history={data?.clarityHistory ?? []} height={280} />
              </div>
              <div className="flex justify-between mt-8 text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">
                {data?.clarityHistory.slice(-10).map((_, i) => (
                  <span key={i} className="font-grotesk">T_{i + 1}</span>
                ))}
              </div>
            </div>

            {/* Achievements - Spanned to match chart height */}
            <div className="col-span-12 lg:col-span-4 p-10 border border-white/10 bg-white/[0.01] flex flex-col glow-amber transition-all hover:border-amber-500/20">
              <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-center">
                <h3 className="text-white/80 font-bold tracking-[0.2em] uppercase text-sm">ACHIEVEMENTS</h3>
                <span className="text-amber-500/40 text-[10px] uppercase font-bold tracking-[0.1em]">Verified_Records</span>
              </div>
              <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/20" style={{ maxHeight: '420px' }}>
                {(data?.badges ?? []).map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-5 p-5 transition-all duration-300 border ${
                      badge.earned
                        ? 'border-amber-500/20 bg-amber-500/5 glow-amber'
                        : 'border-white/5 bg-transparent opacity-40'
                    }`}
                  >
                    <span className={`text-2xl leading-none ${badge.earned ? 'text-amber-500 drop-shadow-[0_0_8px_#FFB000]' : 'text-white/20'}`}>
                      {badge.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`font-bold tracking-widest text-[12px] uppercase mb-1.5 ${badge.earned ? 'text-amber-500' : 'text-white/40'}`}>
                        {badge.title}
                      </p>
                      <p className="text-[11px] text-white/30 uppercase tracking-wider leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                    {badge.earned && (
                      <Check size={16} className="text-amber-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Recent sessions ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="border border-white/10 p-10 glow-amber bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
              <h3 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-base">Active & Recent Sessions</h3>
              <a href="#" className="text-[11px] text-white/40 hover:text-amber-500 transition-colors uppercase font-bold border-b border-transparent hover:border-amber-500 tracking-widest">{stats.totalSessions} TOTAL RECORDS logged</a>
            </div>

            {(!data?.recentSessions || data.recentSessions.length === 0) ? (
              <div className="py-12 text-center">
                <p className="text-[11px] text-white/60 tracking-[0.2em] font-bold uppercase animate-pulse flex items-center justify-center gap-3">
                  [ NO_RECORDS_FOUND ] INITIATE_SESSION <ArrowRight size={13} />
                </p>
              </div>
            ) : (
              <div>
                {/* Header row */}
                <div className="grid grid-cols-12 gap-6 pb-6 mb-6 border-b border-white/5">
                  {['Domain_ID', 'Timestamp', 'Cycles', 'Clarity_IDX', 'State', ''].map((h) => (
                    <span
                      key={h}
                      className={`text-[11px] text-white/40 font-bold tracking-[0.2em] uppercase ${
                        h === 'Domain_ID' ? 'col-span-3' : h === 'Timestamp' ? 'col-span-3' : h === '' ? 'col-span-2 text-right' : 'col-span-2'
                      }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {data.recentSessions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div
                      className="group grid grid-cols-12 gap-6 py-6 items-center border-b border-white/5 hover:bg-amber-500/5 transition-all relative overflow-hidden"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('[data-no-nav]')) return
                        router.push(`/session/${s.id}`)
                      }}
                      style={{ cursor: 'crosshair' }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top pointer-events-none"></div>

                      <div className="col-span-3 flex items-center gap-4 pl-4">
                        {(() => { const Icon = DOMAIN_ICON_MAP[s.domain] ?? Globe; return <Icon size={16} className="text-amber-500/60 group-hover:text-amber-500 transition-colors flex-shrink-0" /> })()}
                        <span className="font-bold text-[13px] text-white/90 uppercase group-hover:text-amber-500 transition-colors tracking-widest drop-shadow-sm">
                          {DOMAIN_LABELS[s.domain] ?? s.domain}
                        </span>
                      </div>
                      <span className="col-span-3 text-[11px] text-white/40 uppercase tracking-widest font-bold">
                        {formatDate(s.createdAt)}
                      </span>
                      <span className="col-span-2 text-[13px] font-bold text-white/60 tracking-widest group-hover:text-amber-400">
                        {s.turns}
                      </span>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className={`text-[13px] font-bold tracking-widest ${s.clarity !== null ? 'text-amber-500' : 'text-white/20'}`}>
                          {s.clarity !== null ? `${s.clarity}` : '—'}
                          {s.clarity !== null && <span className="text-[10px] text-white/30 ml-1">/100</span>}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pr-4" data-no-nav="true">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${s.isComplete ? 'text-[#4ade80]' : 'text-amber-500 animate-pulse'}`}>
                          {s.isComplete ? 'ARCHIVED' : 'PROCESSING'}
                        </span>
                        <div className="flex items-center gap-2" data-no-nav="true">
                          {confirmDeleteId === s.id ? (
                            <>
                              <button
                                data-no-nav="true"
                                onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id) }}
                                disabled={deletingId === s.id}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#f87171] hover:text-red-400 transition-colors disabled:opacity-40"
                              >
                                {deletingId === s.id ? '...' : 'DEL?'}
                              </button>
                              <button
                                data-no-nav="true"
                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                                className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors ml-1"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <button
                              data-no-nav="true"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id) }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-[#f87171] transition-colors p-1"
                              title="Delete session"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Domain coverage + Recent insights ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* Domain coverage */}
            <div className="col-span-12 lg:col-span-5 p-10 border border-white/10 flex flex-col glow-amber hover:border-amber-500/30 transition-all bg-white/[0.01]">
              <h3 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-base mb-8 border-b border-white/10 pb-6">Knowledge Matrix</h3>
              <div className="flex flex-col gap-8">
                {(data?.domainStats ?? []).map((d) => {
                  const pct = stats.totalSessions > 0 ? (d.count / stats.totalSessions) * 100 : 0
                  return (
                    <div key={d.domain} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-4">
                          {(() => { const Icon = DOMAIN_ICON_MAP[d.domain] ?? Globe; return <Icon size={16} className="text-amber-500/40 group-hover:text-amber-500 transition-colors flex-shrink-0" /> })()}
                          <span className="text-[12px] text-white/90 uppercase font-bold tracking-widest group-hover:text-amber-400 drop-shadow-sm">
                            {DOMAIN_LABELS[d.domain]}
                          </span>
                        </span>
                        <span className="text-[12px] text-amber-500 font-bold tracking-widest">
                          {d.count} <span className="text-white/20 text-[10px]">RECORDS</span>
                        </span>
                      </div>
                      <div className="h-[3px] bg-white/5 w-full relative overflow-hidden group-hover:bg-white/10 transition-colors">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                          className="absolute left-0 top-0 bottom-0 bg-amber-500 shadow-[0_0_12px_#FFB000]"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent insight cards */}
            <div className="col-span-12 lg:col-span-7 p-10 border border-white/10 flex flex-col group hover:border-amber-500/30 transition-all bg-white/[0.01]">
              <h3 className="text-white/80 font-bold tracking-[0.2em] uppercase text-base mb-8 border-b border-white/10 pb-6 flex justify-between items-center">
                <span>Synchronized Insights</span>
                <Sparkles size={18} className="text-white/20 group-hover:text-amber-500 transition-colors" />
              </h3>
              
              {(!data?.recentInsights || data.recentInsights.length === 0) ? (
                <div className="py-12 flex items-center justify-center">
                  <p className="text-[11px] text-white/40 tracking-[0.3em] font-bold uppercase animate-pulse">
                    AWAITING_NEURAL_SYNC
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.recentInsights.map((ins) => (
                    <Link
                      key={ins.sessionId}
                      href={`/session/${ins.sessionId}`}
                      className="block p-6 border border-white/5 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/40 glow-amber-hover transition-all cursor-crosshair relative group/card overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -z-10 group-hover/card:bg-amber-500/20 transition-all blur-2xl"></div>
                      
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className="font-bold text-[13px] text-white tracking-[0.1em] uppercase group-hover/card:text-amber-400 transition-colors drop-shadow-sm line-clamp-1">
                          {ins.concept}
                        </span>
                        <span className="font-black text-[14px] text-amber-500 tabular-nums flex-shrink-0 glow-amber">
                          {ins.clarity}
                          <span className="text-[10px] text-white/30 ml-[2px]">/100</span>
                        </span>
                      </div>
                      <p className="text-[12px] text-white/60 tracking-wider leading-relaxed line-clamp-3 mb-5 group-hover/card:text-white/90 transition-colors">
                        {ins.insight}
                      </p>
                      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        {(() => { const Icon = DOMAIN_ICON_MAP[ins.domain] ?? Globe; return <Icon size={14} className="text-amber-500/80 flex-shrink-0" /> })()}
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                          {formatDate(ins.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bottom padding */}
          <footer className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-[9px] font-bold tracking-[0.3em] text-white/20 uppercase">
            <div>© 2026 ACADEMIC_OS_KERNEL // BUILD_7701</div>
            <div className="flex gap-8">
              <span className="hover:text-amber-500 cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-amber-500 cursor-pointer transition-colors">Node_Status</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Domain picker modal */}
      <AnimatePresence>
        {newSessionDomain === 'open' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#08090A]/95 backdrop-blur-md"
              onClick={() => setNewSessionDomain(null)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-[110] w-full max-w-lg p-12 border border-amber-500/30 bg-[#08090A] shadow-[0_0_100px_rgba(255,176,0,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 grid-bg opacity-30 -z-10"></div>
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bloom-effect -z-10 pointer-events-none opacity-40"></div>
              
              <div className="flex justify-between items-center mb-12">
                <div>
                  <p className="font-extrabold uppercase tracking-[0.4em] text-[16px] text-amber-500 drop-shadow-[0_0_12px_#FFB000]">
                    SELECT_NEURAL_NODE
                  </p>
                  <div className="h-[2px] w-12 bg-amber-500 mt-2"></div>
                </div>
                <button 
                  onClick={() => setNewSessionDomain(null)} 
                  className="text-white/30 hover:text-white text-[12px] uppercase font-bold tracking-[0.2em] transition-colors border border-white/10 px-4 py-2 hover:bg-white/5 active:scale-95"
                >
                  ABORT [×]
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {Object.entries(DOMAIN_LABELS).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => handleDomainSession(id)}
                    disabled={newSessionLoading}
                    className="group flex flex-col justify-center gap-1 p-6 text-left transition-all duration-300 disabled:opacity-40 border border-white/5 bg-white/[0.03] hover:border-amber-500/60 hover:bg-amber-500/10 cursor-crosshair relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-amber-500 transition-all group-hover:translate-x-1">
                      <ArrowRight size={20} />
                    </div>
                    <div className="flex items-center gap-4">
                      {(() => { const Icon = DOMAIN_ICON_MAP[id] ?? Globe; return <Icon size={28} className="text-amber-500/70 group-hover:text-amber-500 transition-colors" /> })()}
                      <span className="font-bold text-[16px] text-white/60 uppercase tracking-[0.15em] group-hover:text-white transition-colors">
                        {label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
