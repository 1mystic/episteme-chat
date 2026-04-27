// app/api/export/route.ts
// Fast export: formats existing DB data directly — no LLM call needed

import { createServerSupabaseClient } from '@/lib/supabase-server'

function decodeJWT(token: string): { sub?: string } {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { sub?: string }
  } catch { return {} }
}

const DOMAIN_LABELS: Record<string, string> = {
  ml: 'Machine Learning', statistics: 'Statistics',
  economics: 'Economics', cs: 'Computer Science', general: 'General',
}

function bar(pct: number, width = 10): string {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${pct}%`
}

function clarityLevel(score: number): string {
  if (score >= 80) return 'SYNTHESIS — you can design, evaluate, and create with this concept'
  if (score >= 60) return 'ANALYTICAL — you can compare, contrast, and break down this concept'
  if (score >= 40) return 'CONCEPTUAL — you understand the core idea but some edges need work'
  return 'SURFACE — foundational grasp established; deeper reasoning is the next step'
}

function learningTrajectory(score: number): string {
  if (score >= 80) return 'ACCELERATING — your understanding is compounding; push for synthesis-level challenges'
  if (score >= 60) return 'STEADY PROGRESS — good grasp established; target the analytical gaps next'
  if (score >= 40) return 'PLATEAUING — foundational concepts are in place; the next breakthrough requires deeper questioning'
  return 'BUILDING — early foundation formed; focused practice on core concepts will yield rapid gains'
}

function smInterval(index: number): string {
  return index === 0 ? '24 hours' : index === 1 ? '3 days' : '7 days'
}

function masteryLabel(pL: number): string {
  if (pL >= 0.8) return 'Mastered'
  if (pL >= 0.6) return 'Proficient'
  if (pL >= 0.4) return 'Developing'
  return 'Emerging'
}

function depthOrder(depth: string): number {
  return { SURFACE: 0, CONCEPTUAL: 1, ANALYTICAL: 2, SYNTHESIS: 3 }[depth.toUpperCase()] ?? 0
}

// ── Markdown builder ──────────────────────────────────────────────────────────

function buildMarkdown(params: {
  concept: string
  insight: string
  gaps: string[]
  clarityScore: number
  nextStarter: string | null
  domain: string
  createdAt: string
  turnsCount: number
  concepts: Array<{ name: string; clarity_score: number; depth_reached: string; bkt_pL?: number | null }>
}): string {
  const { concept, insight, gaps, clarityScore, nextStarter, domain, createdAt, turnsCount, concepts } = params
  const dateStr = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const domainLabel = DOMAIN_LABELS[domain] ?? domain
  const durationMin = Math.max(5, turnsCount * 3)

  // Sort concepts by depth for prerequisite ordering
  const sortedByDepth = [...concepts].sort((a, b) => depthOrder(a.depth_reached) - depthOrder(b.depth_reached))

  // Bloom distribution from concepts
  const depthCounts: Record<string, number> = { SURFACE: 0, CONCEPTUAL: 0, ANALYTICAL: 0, SYNTHESIS: 0 }
  concepts.forEach((c) => {
    const k = (c.depth_reached ?? '').toUpperCase()
    if (k in depthCounts) depthCounts[k]++
  })
  const total = Math.max(1, Object.values(depthCounts).reduce((a, b) => a + b, 0))
  const bloom = Object.entries(depthCounts).map(([level, count]) => ({
    level,
    pct: Math.round((count / total) * 100),
  }))

  const lines: string[] = []

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# Learning Session — ${concept}`)
  lines.push(`*${dateStr} · ${domainLabel} · ~${durationMin} min · ${turnsCount} exchanges*`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 1. What You Understand Now ────────────────────────────────────────────
  lines.push('## What You Understand Now')
  lines.push(insight)
  lines.push('')

  // ── 2. Clarity Score ─────────────────────────────────────────────────────
  lines.push(`## Clarity Score: ${clarityScore}/100`)
  lines.push('')
  lines.push(`\`${bar(clarityScore)}\``)
  lines.push('')
  lines.push(`**Level:** ${clarityLevel(clarityScore)}`)
  lines.push('')
  lines.push(`**Trajectory:** ${learningTrajectory(clarityScore)}`)
  lines.push('')

  // ── 3. Bloom's Depth Distribution ────────────────────────────────────────
  lines.push("## Bloom's Depth Distribution")
  lines.push('')
  bloom.forEach(({ level, pct }) => {
    lines.push(`\`${level.padEnd(12)} ${bar(pct)}\``)
  })
  lines.push('')

  // ── 4. BKT Mastery Estimates ─────────────────────────────────────────────
  const conceptsWithBkt = concepts.filter((c) => c.bkt_pL != null)
  if (conceptsWithBkt.length > 0) {
    lines.push('## BKT Mastery Estimates')
    lines.push('*Bayesian Knowledge Tracing — probability this concept is learned*')
    lines.push('')
    conceptsWithBkt.forEach((c) => {
      const pct = Math.round((c.bkt_pL ?? 0) * 100)
      lines.push(`**${c.name}**`)
      lines.push(`\`P(learned) = ${bar(pct)}\` — ${masteryLabel(c.bkt_pL ?? 0)}`)
      lines.push('')
    })
  }

  // ── 5. Knowledge Map ─────────────────────────────────────────────────────
  if (concepts.length > 0) {
    lines.push('## Knowledge Map — Concepts Explored')
    lines.push('')
    concepts.forEach((c) => {
      const bktStr = c.bkt_pL != null ? `, mastery: ${Math.round(c.bkt_pL * 100)}%` : ''
      lines.push(`- **${c.name}**`)
      lines.push(`  - Clarity: ${c.clarity_score}/100 · Depth: ${c.depth_reached}${bktStr}`)
    })
    lines.push('')
  }

  // ── 6. Prerequisites to Study First ──────────────────────────────────────
  if (sortedByDepth.length > 1) {
    lines.push('## Prerequisites — Recommended Study Order')
    lines.push('*Ordered from foundation to advanced based on depth reached in this session*')
    lines.push('')
    sortedByDepth.forEach((c, i) => {
      const arrow = i < sortedByDepth.length - 1 ? ' →' : ''
      lines.push(`${i + 1}. **${c.name}** *(${c.depth_reached})*${arrow}`)
    })
    lines.push('')
    if (gaps.length > 0) {
      lines.push(`**Unlock next:** Once the above are solid, these gaps will unlock rapidly:`)
      gaps.slice(0, 3).forEach((g) => lines.push(`- ${g}`))
    }
    lines.push('')
  }

  // ── 7. Priority Gaps (Ebbinghaus-Ranked) ─────────────────────────────────
  if (gaps.length > 0) {
    lines.push('## Priority Gaps — Ebbinghaus-Ranked')
    lines.push('*Ranked by estimated forgetting curve urgency*')
    lines.push('')
    gaps.forEach((gap, i) => {
      const interval = smInterval(i)
      const urgency = i === 0 ? '⚠ HIGH' : i === 1 ? '● MEDIUM' : '○ NORMAL'
      lines.push(`### ${i + 1}. ${gap}`)
      lines.push(`- **Review by:** ${interval} from now`)
      lines.push(`- **Urgency:** ${urgency}`)
      lines.push(`- **Why:** ${
        i === 0
          ? 'First forgetting curve hits hardest — review within 24h to retain 80%+ recall'
          : i === 1
          ? 'Spaced repetition interval 2 — review before day 3 for consolidation'
          : 'Weekly review sufficient at this stage of the spaced repetition schedule'
      }`)
      lines.push('')
    })
  }

  // ── 8. 30-Day Study Plan ──────────────────────────────────────────────────
  lines.push('## 30-Day Study Plan')
  lines.push('')

  lines.push('### Week 1 — Consolidate & First Reviews')
  if (nextStarter) {
    const short = nextStarter.length > 90 ? nextStarter.slice(0, 90) + '...' : nextStarter
    lines.push(`- **Day 1:** Start next session — *"${short}"*`)
  }
  if (gaps[0]) lines.push(`- **Day 1–2:** Review \`${gaps[0]}\` (SM-2 interval: 24h) ← most urgent`)
  if (gaps[1]) lines.push(`- **Day 3:** Review \`${gaps[1]}\` (SM-2 interval: 3 days)`)
  if (gaps[2]) lines.push(`- **Day 5–7:** Begin \`${gaps[2]}\` — schedule 7-day review`)
  lines.push(`- **Goal:** Bring clarity from ${clarityScore} → ${Math.min(100, clarityScore + 10)}`)
  lines.push('')

  lines.push('### Week 2 — Deepen the Gaps')
  if (gaps[1]) lines.push(`- Complete second review of \`${gaps[1]}\` (3-day interval done)`)
  if (gaps[2]) lines.push(`- Second exposure to \`${gaps[2]}\``)
  const extra = gaps.slice(3, 5)
  if (extra.length > 0) lines.push(`- Explore new threads: ${extra.map((g) => `\`${g}\``).join(', ')}`)
  lines.push('- Goal: Reach ANALYTICAL depth on the primary concept')
  lines.push('- Try explaining the concept aloud without notes (free recall)')
  lines.push('')

  lines.push('### Week 3 — Push to Synthesis')
  lines.push(`- Apply \`${concept}\` to a novel problem or real-world scenario`)
  lines.push('- Run a cross-domain session connecting this concept to a different domain')
  if (gaps[2]) lines.push(`- Complete 7-day review of \`${gaps[2]}\``)
  lines.push('- Goal: At least one concept node reaches SYNTHESIS depth')
  lines.push('- Challenge: find one thing this concept cannot explain — that is your next gap')
  lines.push('')

  lines.push('### Week 4 — Ebbinghaus Consolidation Cycle')
  lines.push('- Full review of all gaps encountered in this session')
  lines.push('- Free-recall test: explain the entire concept without any notes or aid')
  lines.push('- Generate a new insight card to measure progress objectively')
  lines.push('- Compare clarity scores: new session vs. this one')
  lines.push('- Goal: Verify improvement; identify second-order gaps for next 30-day cycle')
  lines.push('')

  // ── 9. Your Next Session ──────────────────────────────────────────────────
  if (nextStarter) {
    lines.push('## Your Next Session')
    lines.push('')
    lines.push(`> "${nextStarter}"`)
    lines.push('')
    lines.push('*This question was generated from the edge of your current understanding — it is calibrated to your exact knowledge state.*')
    lines.push('')
  }

  // ── 10. Session Stats ─────────────────────────────────────────────────────
  lines.push('## Session Stats')
  lines.push('')
  lines.push(`| Field | Value |`)
  lines.push(`|---|---|`)
  lines.push(`| Date | ${dateStr} |`)
  lines.push(`| Domain | ${domainLabel} |`)
  lines.push(`| Total exchanges | ${turnsCount} |`)
  lines.push(`| Duration estimate | ~${durationMin} min |`)
  lines.push(`| Concepts explored | ${concepts.length} |`)
  lines.push(`| Gaps identified | ${gaps.length} |`)
  lines.push(`| Clarity achieved | ${clarityScore}/100 |`)
  lines.push(`| Trajectory | ${learningTrajectory(clarityScore).split(' — ')[0]} |`)
  lines.push('')
  lines.push('---')
  lines.push('*Generated by Episteme · Socratic Study Engine · CBC Spring 2026*')

  return lines.join('\n')
}

// ── Styled HTML for print-to-PDF ─────────────────────────────────────────────

function buildHtml(markdown: string, domain: string): string {
  const html = markdown
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.+)$/gm, '</p><h1>$1</h1><p>')
    .replace(/^## (.+)$/gm, '</p><h2>$1</h2><p>')
    .replace(/^### (.+)$/gm, '</p><h3>$1</h3><p>')
    .replace(/^> (.+)$/gm, '</p><blockquote>$1</blockquote><p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.slice(1, -1).split(' | ')
      return `<tr>${cells.map((c) => c.trim() === '---' ? '' : `<td>${c.trim()}</td>`).join('')}</tr>`
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '</p><hr><p>')
    .replace(/\n\n/g, '</p><p>')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Episteme — Learning Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  body{font-family:'Space Grotesk',sans-serif;max-width:780px;margin:48px auto;padding:0 40px;color:#1a1007;line-height:1.75;font-size:15px;background:#fff}
  h1{font-size:28px;font-weight:700;color:#0a0702;border-bottom:2px solid #FFB000;padding-bottom:10px;letter-spacing:-0.03em;margin-top:0}
  h2{font-size:17px;font-weight:700;color:#0a0702;margin-top:36px;margin-bottom:8px;border-left:3px solid #FFB000;padding-left:11px;letter-spacing:-0.01em}
  h3{font-size:14px;font-weight:600;color:#3a2c1a;margin-top:18px;margin-bottom:4px}
  p{margin:10px 0;color:#3a2c1a}
  li{margin:5px 0 5px 22px}
  blockquote{border-left:3px solid #FFB000;padding:10px 16px;background:#fffbf0;color:#5a3e10;margin:16px 0;font-style:italic;font-size:16px}
  strong{color:#0a0702}
  em{color:#6b4d1a}
  hr{border:none;border-top:1px solid #e8d8b0;margin:32px 0}
  code{font-family:'JetBrains Mono',monospace;font-size:11.5px;background:#fdf5e0;padding:2px 6px;color:#7a4f00;white-space:pre;display:inline-block}
  table{border-collapse:collapse;width:100%;margin:12px 0}
  td{border:1px solid #e8d8b0;padding:7px 12px;font-size:13px;color:#3a2c1a}
  tr:first-child td{font-weight:600;background:#fdf5e0}
  .meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:#a08060;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:28px}
  footer{margin-top:48px;padding-top:16px;border-top:1px solid #e8d8b0;font-family:'JetBrains Mono',monospace;font-size:9px;color:#b09070;letter-spacing:0.1em}
  @media print{body{margin:20px}h2{break-after:avoid}h3{break-after:avoid}}
</style>
<script>window.onload = function() { window.print() }</script>
</head>
<body>
<p class="meta">EPISTEME · SOCRATIC STUDY ENGINE · ${domain.toUpperCase()}</p>
<p>${html}</p>
<footer>Generated by Episteme · CBC Spring 2026 · Print this page (Ctrl+P / Cmd+P) → Save as PDF</footer>
</body>
</html>`
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { sessionId?: string; format?: string }
    const { sessionId, format } = body

    if (!sessionId || !['md', 'pdf'].includes(format ?? '')) {
      return Response.json({ error: 'Invalid request — format must be "md" or "pdf"' }, { status: 400 })
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const userId = token ? decodeJWT(token).sub : null

    const supabase = createServerSupabaseClient()

    const [sessionRes, conceptsRes, insightRes, messagesRes] = await Promise.all([
      supabase.from('sessions').select('id,domain,created_at,user_id,turns_count').eq('id', sessionId).single(),
      supabase.from('concepts').select('name,depth_reached,clarity_score,bkt_pL,bkt_pT,bkt_pS,bkt_pG').eq('session_id', sessionId),
      supabase.from('insight_cards').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('messages').select('role').eq('session_id', sessionId),
    ])

    if (sessionRes.error || !sessionRes.data) {
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = sessionRes.data as { id: string; domain: string; created_at: string; user_id?: string; turns_count?: number }
    if (userId && session.user_id && session.user_id !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const concepts = (conceptsRes.data ?? []) as Array<{
      name: string; clarity_score: number; depth_reached: string
      bkt_pL?: number | null; bkt_pT?: number | null; bkt_pS?: number | null; bkt_pG?: number | null
    }>
    const insight = insightRes.data as { concept?: string; insight?: string; gaps?: string[]; clarity_score?: number; next_starter?: string | null } | null
    const messages = (messagesRes.data ?? []) as Array<{ role: string }>
    const turnsCount = session.turns_count ?? messages.filter((m) => m.role === 'user').length

    const markdown = buildMarkdown({
      concept: insight?.concept ?? concepts[0]?.name ?? 'Your Session',
      insight: insight?.insight ?? 'You explored this concept through Socratic dialogue.',
      gaps: insight?.gaps ?? [],
      clarityScore: insight?.clarity_score ?? Math.round((concepts[0] as { clarity_score: number } | undefined)?.clarity_score ?? 40),
      nextStarter: insight?.next_starter ?? null,
      domain: session.domain,
      createdAt: session.created_at,
      turnsCount,
      concepts,
    })

    if (format === 'md') {
      const filename = `episteme-${session.domain}-${sessionId.slice(0, 8)}.md`
      return new Response(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // pdf → styled HTML (user prints to PDF via browser)
    const html = buildHtml(markdown, session.domain)
    const filename = `episteme-report-${sessionId.slice(0, 8)}.html`
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
