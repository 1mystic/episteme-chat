// lib/metacognitive.ts
// Metacognitive Reflection Agent — runs post-session to build next session starter

import anthropic from './anthropic'
import { createServerSupabaseClient } from './supabase-server'
import type { DepthLevel } from './types'

export interface MetacognitiveResult {
  strengthAreas: string[]
  urgentGaps: string[]
  nextSessionStarter: string
  learningTrajectory: 'accelerating' | 'plateauing' | 'regressing'
  recommendedDepth: DepthLevel
  metacognitiveNote: string
}

export async function runMetacognitiveReflection(
  sessionId: string
): Promise<MetacognitiveResult | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data: messages } = await supabase
      .from('messages')
      .select('role, content, turn_number')
      .eq('session_id', sessionId)
      .order('turn_number', { ascending: true })

    if (!messages || messages.length < 4) return null

    const { data: concepts } = await supabase
      .from('concepts')
      .select('name, depth_reached, clarity_score')
      .eq('session_id', sessionId)

    const userResponses = messages
      .filter((m) => m.role === 'user')
      .map((m) => `[Turn ${m.turn_number}] ${m.content}`)
      .join('\n')

    const conceptSummary = concepts?.length
      ? concepts.map((c) => `${c.name} — depth: ${c.depth_reached}, clarity: ${c.clarity_score}`).join('\n')
      : 'No concepts explicitly tracked'

    const prompt = `You are Episteme's metacognitive reflection agent. You have just completed a Socratic tutoring session with a student. Your job is to reason deeply about what they understood, what they avoided, and exactly where to pick up next time.

STUDENT RESPONSES (chronological):
${userResponses}

CONCEPTS COVERED:
${conceptSummary}

Return ONLY valid JSON — no markdown, no preamble:
{
  "strengthAreas": ["strength 1 — be specific, cite what they said", "strength 2"],
  "urgentGaps": ["gap concept 1", "gap concept 2"],
  "nextSessionStarter": "A single Socratic probe question that references something specific they said and picks up exactly where understanding broke down. Max 120 chars.",
  "learningTrajectory": "accelerating",
  "recommendedDepth": "CONCEPTUAL",
  "metacognitiveNote": "One sentence on their reasoning style and what to challenge next time."
}

Rules:
- strengthAreas: genuine reasoning strengths only, not just topic mentions
- urgentGaps: concepts they skipped, misunderstood, or couldn't deepen
- nextSessionStarter: must quote or reference something specific from their responses
- learningTrajectory: "accelerating" if clarity improved across turns, "regressing" if it declined, "plateauing" otherwise
- recommendedDepth: where to START next session based on where this one ended`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as MetacognitiveResult

    await supabase.from('learner_profiles').insert({
      session_id: sessionId,
      strength_areas: parsed.strengthAreas,
      urgent_gaps: parsed.urgentGaps,
      next_session_starter: parsed.nextSessionStarter,
      learning_trajectory: parsed.learningTrajectory,
      recommended_depth: parsed.recommendedDepth,
    })

    return parsed
  } catch (err) {
    console.error('Metacognitive reflection error:', err)
    return null
  }
}
