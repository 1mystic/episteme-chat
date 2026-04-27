// app/api/insights/route.ts

export const maxDuration = 60 // seconds — required for Vercel

import anthropic from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildInsightCardPrompt } from '@/lib/prompts'
import { REASONING_KEYWORDS } from '@/lib/scoring'
import { runMetacognitiveReflection } from '@/lib/metacognitive'
import type { InsightRequest } from '@/lib/types'

function decodeJWT(token: string): { sub?: string; email?: string } {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { sub?: string; email?: string }
  } catch {
    return {}
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const { sub: userId } = decodeJWT(token)
    if (!userId) return Response.json({ error: 'Invalid token' }, { status: 401 })

    const supabase = createServerSupabaseClient()

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, domain, created_at')
      .eq('user_id', userId)

    const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id)
    if (sessionIds.length === 0) return Response.json({ insights: [] })

    const sessionMap = Object.fromEntries(
      (sessions ?? []).map((s: { id: string; domain: string; created_at: string }) => [s.id, s])
    )

    const { data: cards } = await supabase
      .from('insight_cards')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    const insights = (cards ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      domain: (sessionMap[c.session_id as string] as { domain: string } | undefined)?.domain ?? 'general',
    }))

    return Response.json({ insights })
  } catch (err) {
    console.error('Insights GET error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as InsightRequest
    const { sessionId, domain, conversationHistory, mainConcept } = body

    if (!sessionId || !domain || !mainConcept) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!conversationHistory || conversationHistory.length < 4) {
      return Response.json({ error: 'Need at least 4 messages for insight generation' }, { status: 400 })
    }

    // Build conversation summary (last 8 messages)
    const recentHistory = conversationHistory.slice(-8)
    const conversationSummary = recentHistory
      .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n')

    // Identify strong responses (user messages with reasoning keywords)
    const userMessages = conversationHistory.filter((m) => m.role === 'user')
    const strongResponses = userMessages
      .filter((m) => REASONING_KEYWORDS.some((kw) => m.content.toLowerCase().includes(kw)))
      .map((m) => m.content)
      .slice(0, 3)
      .join(' | ')

    // Identify gaps (user messages with hesitation patterns)
    const hesitationPatterns = ["i think", "maybe", "not sure", "i'm not", "i don't"]
    const gapResponses = userMessages
      .filter((m) => hesitationPatterns.some((p) => m.content.toLowerCase().includes(p)))
      .map((m) => m.content)
      .slice(0, 3)
      .join(' | ')

    // Call Claude for insight card
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: buildInsightCardPrompt(
            domain,
            conversationSummary,
            mainConcept,
            strongResponses || 'No strong responses detected',
            gapResponses || 'No gaps detected'
          ),
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()

    let parsed: {
      concept: string
      insight: string
      gaps: string[]
      clarity_score: number
      next_question: string
    }

    try {
      parsed = JSON.parse(clean)
    } catch {
      parsed = {
        concept: mainConcept,
        insight: 'You have explored this concept through Socratic dialogue and built a foundation of understanding.',
        gaps: [],
        clarity_score: 50,
        next_question: `What would you like to explore next about ${mainConcept}?`,
      }
    }

    // Gaps come from Claude in priority order — preserve that order, take top 3
    const rankedGaps = parsed.gaps.slice(0, 3)

    const supabase = createServerSupabaseClient()

    // Save insight card
    const { data: cardData, error: cardError } = await supabase
      .from('insight_cards')
      .insert({
        session_id: sessionId,
        concept: parsed.concept,
        insight: parsed.insight,
        gaps: rankedGaps,
        clarity_score: parsed.clarity_score,
      })
      .select()
      .single()

    if (cardError) {
      console.error('Insight card save error:', cardError)
      return Response.json({ error: 'Failed to save insight card' }, { status: 500 })
    }

    // Mark session complete
    await supabase
      .from('sessions')
      .update({ is_complete: true, updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    // Run metacognitive agent (non-blocking — failure doesn't break the response)
    const reflect = await runMetacognitiveReflection(sessionId).catch(() => null)

    return Response.json({
      insightCard: {
        ...cardData,
        next_starter: reflect?.nextSessionStarter ?? null,
      },
      nextQuestion: parsed.next_question,
    })
  } catch (err) {
    console.error('Insights POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
