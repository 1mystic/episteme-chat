// app/api/classify/route.ts

import anthropic from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildDepthClassifierPrompt } from '@/lib/prompts'
import { keywordClassify, DOMAIN_BKT_PRIORS } from '@/lib/algorithms'
import type { ClassifyResponse, DepthLevel } from '@/lib/types'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { question?: string; sessionId?: string; domain?: string }
    const { question, sessionId, domain = 'general' } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return Response.json({ error: 'question is required' }, { status: 400 })
    }
    if (question.length > 500) {
      return Response.json({ error: 'question exceeds 500 characters' }, { status: 400 })
    }

    // Fast keyword classification as fallback
    const kwResult = keywordClassify(question)

    let classifyResult: ClassifyResponse = {
      depth: kwResult.depth,
      confidence: kwResult.confidence,
      keywords: [],
    }

    // LLM classification
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{ role: 'user', content: buildDepthClassifierPrompt(question) }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean) as { depth: DepthLevel; confidence: number; keywords: string[] }

      // Fuse: LLM gets 0.7 weight, keyword gets 0.3 weight
      const llmScore = parsed.confidence * 0.7
      const kwScore = kwResult.confidence * 0.3

      classifyResult = {
        depth: llmScore >= kwScore ? parsed.depth : kwResult.depth,
        confidence: Math.max(parsed.confidence, kwResult.confidence),
        keywords: parsed.keywords ?? [],
      }
    } catch {
      // keep keyword fallback
    }

    // Persist concept if sessionId provided
    let conceptId: string | null = null
    if (sessionId) {
      try {
        const supabase = createServerSupabaseClient()
        const conceptName = question.slice(0, 80).replace(/[?!.]+$/, '').trim()
        const priors = DOMAIN_BKT_PRIORS[domain] ?? DOMAIN_BKT_PRIORS.general
        const { data } = await supabase
          .from('concepts')
          .insert({
            session_id: sessionId,
            name: conceptName,
            depth_reached: classifyResult.depth,
            clarity_score: 0,
            bkt_pL: priors.pL,
            bkt_pT: priors.pT,
            bkt_pS: priors.pS,
            bkt_pG: priors.pG,
          })
          .select('id')
          .single()
        conceptId = data?.id ?? null
      } catch (err) {
        console.error('Concept insert error:', err)
      }
    }

    return Response.json({ ...classifyResult, conceptId })
  } catch (err) {
    console.error('Classify POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
