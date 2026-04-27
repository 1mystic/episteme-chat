// app/api/chat/route.ts

export const maxDuration = 60 // seconds — required for Vercel streaming

import anthropic from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  extractDepthSignals,
  determineNextState,
  sdsmToDepthLevel,
  updateBKT,
  bktToScore,
  semanticUnderstandingVerify,
  buildAlgorithmEnrichedSystemPrompt,
  DOMAIN_BKT_PRIORS,
  type BKTState,
} from '@/lib/algorithms'
import type { ChatRequest } from '@/lib/types'

interface SessionState {
  semanticAccuracy: number
  misconception: string | null
  consecutiveScaffolds: number
  lastState: string | null
}

const DEFAULT_SESSION_STATE: SessionState = {
  semanticAccuracy: 0.5,
  misconception: null,
  consecutiveScaffolds: 0,
  lastState: null,
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as ChatRequest
    const { sessionId, message, turnNumber, domain, conversationHistory, conceptsCovered } = body

    if (!sessionId || !message || !domain || turnNumber === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // STEP 1: Save user message to DB
    try {
      await supabase.from('messages').insert({
        session_id: sessionId,
        role: 'user',
        content: message,
        turn_number: turnNumber,
      })
    } catch (err) {
      console.error('User message save error:', err)
    }

    // STEP 2: Load session state from previous turn (SUV result, consecutive scaffolds)
    let sessionState: SessionState = { ...DEFAULT_SESSION_STATE }
    try {
      const { data: sessionRow } = await supabase
        .from('sessions')
        .select('session_state')
        .eq('id', sessionId)
        .single()

      if (sessionRow?.session_state && typeof sessionRow.session_state === 'object') {
        sessionState = { ...DEFAULT_SESSION_STATE, ...(sessionRow.session_state as Partial<SessionState>) }
      }
    } catch {
      // column may not exist yet — use defaults
    }

    // STEP 3: RDSE — extract depth signals from user response
    const { qualityScore, confusionCount } = extractDepthSignals(message, domain, turnNumber)

    // STEP 4: SDSM — determine Socratic state using real signals from previous turn
    const nextState = determineNextState(
      turnNumber,
      qualityScore,
      sessionState.semanticAccuracy,   // ← from previous turn's SUV
      confusionCount,
      sessionState.consecutiveScaffolds // ← tracked across turns
    )

    // Track consecutive scaffolds for RECTIFY triggering
    const newConsecutiveScaffolds =
      nextState === 'SCAFFOLD' ? sessionState.consecutiveScaffolds + 1 : 0

    // Derive Bloom depth level from SDSM state
    const depthLevel = sdsmToDepthLevel(nextState, qualityScore)

    // STEP 5: SUV — semantic understanding verify (async, resolves after streaming)
    const concept = conceptsCovered[0] ?? 'the topic'
    const suvPromise = semanticUnderstandingVerify(concept, message, 'CONCEPTUAL')

    // STEP 6: Fetch current BKT state from DB
    let currentBKT: BKTState = DOMAIN_BKT_PRIORS[domain] ?? DOMAIN_BKT_PRIORS.general
    try {
      const { data: conceptRow } = await supabase
        .from('concepts')
        .select('bkt_pL, bkt_pT, bkt_pS, bkt_pG')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (conceptRow) {
        currentBKT = {
          pL: conceptRow.bkt_pL ?? currentBKT.pL,
          pT: conceptRow.bkt_pT ?? currentBKT.pT,
          pS: conceptRow.bkt_pS ?? currentBKT.pS,
          pG: conceptRow.bkt_pG ?? currentBKT.pG,
        }
      }
    } catch {
      // use priors
    }

    const newBKTState = updateBKT(currentBKT, qualityScore)
    const clarityScore = bktToScore(newBKTState)

    // STEP 7: Build enriched system prompt — include misconception from previous turn's SUV
    const systemPrompt = buildAlgorithmEnrichedSystemPrompt(
      domain,
      turnNumber,
      nextState,
      clarityScore,
      newBKTState,
      sessionState.misconception,  // ← actual misconception from last turn
      conceptsCovered,
      []
    )

    // STEP 8: Stream Claude response
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: systemPrompt,
      messages: conversationHistory,
    })

    const encoder = new TextEncoder()
    let fullContent = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullContent += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // STEP 9: Post-stream DB updates
          let detectedMisconception: string | null = null
          try {
            await supabase.from('messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              turn_number: turnNumber,
            })

            await supabase
              .from('sessions')
              .update({ turns_count: turnNumber, updated_at: new Date().toISOString() })
              .eq('id', sessionId)

            // Update BKT on most recent concept
            const { data: latestConcept } = await supabase
              .from('concepts')
              .select('id')
              .eq('session_id', sessionId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            if (latestConcept) {
              await supabase
                .from('concepts')
                .update({
                  bkt_pL: newBKTState.pL,
                  bkt_pT: newBKTState.pT,
                  clarity_score: clarityScore,
                  depth_reached: depthLevel,
                })
                .eq('id', latestConcept.id)
            }

            // Resolve SUV and store for next turn's SDSM
            const suvResult = await suvPromise
            detectedMisconception = suvResult.misconception
            const newSessionState: SessionState = {
              semanticAccuracy: suvResult.semanticAccuracy,
              misconception: suvResult.misconception,
              consecutiveScaffolds: newConsecutiveScaffolds,
              lastState: nextState,
            }

            // Persist session state — graceful if column doesn't exist
            await supabase
              .from('sessions')
              .update({ session_state: newSessionState } as Record<string, unknown>)
              .eq('id', sessionId)
              .then(({ error }) => {
                if (error) console.warn('session_state update skipped (run migration 003):', error.message)
              })

          } catch (err) {
            console.error('Post-stream DB error:', err)
          }

          const canGenerateInsight = turnNumber >= 4

          // STEP 10: Final SSE event with all signal data
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                clarityScore,
                nextState,
                depthLevel,
                canGenerateInsight,
                misconception: detectedMisconception,
              })}\n\n`
            )
          )
          controller.close()
        } catch (err) {
          console.error('Streaming error:', err)
          let clientError = 'Response failed. Try again.'
          if (err instanceof Error) {
            if (err.message.includes('401') || err.message.includes('authentication_error')) {
              clientError = 'Invalid Anthropic API key. Check ANTHROPIC_API_KEY in .env.local and restart the server.'
            } else if (err.message.includes('429')) {
              clientError = 'Rate limited by Anthropic. Wait a moment and try again.'
            } else if (err.message.includes('529') || err.message.includes('overloaded')) {
              clientError = 'Claude API is overloaded. Try again in a few seconds.'
            }
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: clientError })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
