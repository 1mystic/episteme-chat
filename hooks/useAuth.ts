'use client'

// hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      syncCookie(!!session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      syncCookie(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    syncCookie(false)
  }, [])

  return { user, loading, signOut }
}

function syncCookie(authenticated: boolean) {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  if (authenticated) {
    document.cookie = `ep-auth=1; path=/; max-age=604800; SameSite=Lax${secure}`
  } else {
    document.cookie = `ep-auth=; path=/; max-age=0; SameSite=Lax${secure}`
  }
}
