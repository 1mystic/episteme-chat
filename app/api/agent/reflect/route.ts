// app/api/agent/reflect/route.ts
// Metacognitive agent — can also be called directly from /api/insights

import { runMetacognitiveReflection } from '@/lib/metacognitive'

export async function POST(request: Request): Promise<Response> {
  try {
    const { sessionId } = await request.json() as { sessionId: string }
    if (!sessionId) return Response.json({ error: 'Missing sessionId' }, { status: 400 })

    const result = await runMetacognitiveReflection(sessionId)
    if (!result) return Response.json({ error: 'Insufficient session data' }, { status: 422 })

    return Response.json(result)
  } catch (err) {
    console.error('Reflect route error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
