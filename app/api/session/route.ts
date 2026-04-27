// app/api/session/route.ts

import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Domain } from '@/lib/types'

const VALID_DOMAINS: Domain[] = ['ml', 'statistics', 'economics', 'cs', 'general']

/** Decode a Supabase JWT without a network call. The `sub` claim is the user UUID. */
function decodeJWT(token: string): { sub?: string; email?: string } {
  try {
    const part = token.split('.')[1]
    if (!part) return {}
    const json = Buffer.from(part, 'base64url').toString('utf8')
    return JSON.parse(json) as { sub?: string; email?: string }
  } catch {
    return {}
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { domain?: Domain }
    const { domain } = body

    if (!domain || !VALID_DOMAINS.includes(domain)) {
      return Response.json(
        { error: `Invalid domain. Must be one of: ${VALID_DOMAINS.join(', ')}` },
        { status: 400 }
      )
    }

    // Decode JWT if provided — no network call needed; Supabase signs all tokens
    let userId: string | null = null
    let userEmail: string | null = null
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (token) {
      const payload = decodeJWT(token)
      userId = payload.sub ?? null
      userEmail = payload.email ?? null
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('sessions')
      .insert({ domain, user_id: userId, user_email: userEmail })
      .select()
      .single()

    if (error) {
      console.error('Session create error:', error)
      return Response.json(
        { error: 'Failed to create session', detail: error.message },
        { status: 500 }
      )
    }

    return Response.json({ session: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Session POST error:', message)
    return Response.json({ error: 'Internal server error', detail: message }, { status: 500 })
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (sessionError || !session) {
      return Response.json({ error: 'Session not found' }, { status: 404 })
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('turn_number', { ascending: true })

    if (messagesError) {
      console.error('Messages fetch error:', messagesError)
      return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    const { data: concepts, error: conceptsError } = await supabase
      .from('concepts')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })

    if (conceptsError) {
      console.error('Concepts fetch error:', conceptsError)
      return Response.json({ error: 'Failed to fetch concepts' }, { status: 500 })
    }

    return Response.json({ session, messages: messages ?? [], concepts: concepts ?? [] })
  } catch (err) {
    console.error('Session GET error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { sub: userId } = decodeJWT(token)
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerSupabaseClient()

    const { data: session } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!session || session.user_id !== userId) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    await supabase.from('sessions').delete().eq('id', id)

    return Response.json({ success: true })
  } catch (err) {
    console.error('Session DELETE error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
