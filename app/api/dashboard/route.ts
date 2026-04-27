// app/api/dashboard/route.ts

import { createServerSupabaseClient } from '@/lib/supabase-server'

/** Decode Supabase JWT without a network call. */
function decodeJWT(token: string): { sub?: string; email?: string } {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { sub?: string; email?: string }
  } catch {
    return {}
  }
}

interface SessionRow {
  id: string
  domain: string
  turns_count: number
  is_complete: boolean
  created_at: string
  insight_cards: { clarity_score: number; concept: string; insight: string; next_starter?: string | null }[]
}

const BADGE_DEFS = [
  { id: 'first_session',   title: 'First Steps',      description: 'Completed your first session',       icon: '◈' },
  { id: 'five_sessions',   title: 'Scholar',           description: '5+ sessions completed',              icon: '⟡' },
  { id: 'ten_sessions',    title: 'Devoted Learner',   description: '10+ sessions completed',             icon: '∑' },
  { id: 'deep_turns',      title: 'Deep Diver',        description: 'A session with 10+ turns',           icon: '⌥' },
  { id: 'high_clarity',    title: 'High Achiever',     description: 'Clarity score above 80 in a session',icon: '↑' },
  { id: 'insight_seeker',  title: 'Insight Seeker',   description: '3+ insight cards generated',         icon: '◎' },
]

export async function GET(request: Request): Promise<Response> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = decodeJWT(token)
    const userId = payload.sub
    const userEmail = payload.email
    if (!userId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Claim any sessions this user created without being logged in (matching by email)
    // This runs fast and is idempotent — only updates where user_id IS NULL
    if (userEmail) {
      await supabase
        .from('sessions')
        .update({ user_id: userId })
        .eq('user_email', userEmail)
        .is('user_id', null)
        .then(() => {}) // non-blocking, ignore errors
    }

    // Fetch all sessions for this user with their insight cards
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, domain, turns_count, is_complete, created_at, insight_cards(clarity_score, concept, insight)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError)
      return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    const rows = (sessions ?? []) as SessionRow[]

    // ── Aggregate stats ──────────────────────────────────────────────
    const totalSessions = rows.length
    const totalTurns = rows.reduce((s, r) => s + (r.turns_count ?? 0), 0)
    const completedSessions = rows.filter((r) => r.is_complete).length

    const allClarity = rows.flatMap((r) => r.insight_cards.map((ic) => ic.clarity_score))
    const avgClarity = allClarity.length
      ? Math.round(allClarity.reduce((s, c) => s + c, 0) / allClarity.length)
      : 0
    const bestClarity = allClarity.length ? Math.max(...allClarity) : 0

    // ── Domain breakdown ─────────────────────────────────────────────
    const domainCounts: Record<string, number> = {}
    for (const r of rows) {
      domainCounts[r.domain] = (domainCounts[r.domain] ?? 0) + 1
    }
    const DOMAIN_ORDER = ['ml', 'statistics', 'economics', 'cs', 'general']
    const domainStats = DOMAIN_ORDER.map((d) => ({
      domain: d,
      count: domainCounts[d] ?? 0,
    }))

    // ── Clarity trend (completed sessions in chronological order) ────
    const clarityHistory = rows
      .filter((r) => r.insight_cards.length > 0)
      .slice(0, 20)
      .reverse()
      .map((r) => ({
        sessionId: r.id,
        domain: r.domain,
        clarity: r.insight_cards[0].clarity_score,
        createdAt: r.created_at,
      }))

    // ── Recent sessions ──────────────────────────────────────────────
    const recentSessions = rows.slice(0, 10).map((r) => ({
      id: r.id,
      domain: r.domain,
      turns: r.turns_count ?? 0,
      clarity: r.insight_cards[0]?.clarity_score ?? null,
      isComplete: r.is_complete,
      createdAt: r.created_at,
    }))

    // ── Recent insight cards ─────────────────────────────────────────
    const recentInsights = rows
      .filter((r) => r.insight_cards.length > 0)
      .slice(0, 4)
      .map((r) => ({
        sessionId: r.id,
        concept: r.insight_cards[0].concept,
        insight: r.insight_cards[0].insight,
        clarity: r.insight_cards[0].clarity_score,
        domain: r.domain,
        createdAt: r.created_at,
      }))

    // ── Badges ───────────────────────────────────────────────────────
    const maxTurns = rows.length ? Math.max(...rows.map((r) => r.turns_count ?? 0)) : 0
    const badges = BADGE_DEFS.map((b) => {
      let earned = false
      if (b.id === 'first_session')  earned = totalSessions >= 1
      if (b.id === 'five_sessions')  earned = totalSessions >= 5
      if (b.id === 'ten_sessions')   earned = totalSessions >= 10
      if (b.id === 'deep_turns')     earned = maxTurns >= 10
      if (b.id === 'high_clarity')   earned = bestClarity >= 80
      if (b.id === 'insight_seeker') earned = completedSessions >= 3
      return { ...b, earned }
    })

    return Response.json({
      stats: { totalSessions, completedSessions, totalTurns, avgClarity, bestClarity },
      domainStats,
      clarityHistory,
      recentSessions,
      recentInsights,
      badges,
    })
  } catch (err) {
    console.error('Dashboard GET error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
