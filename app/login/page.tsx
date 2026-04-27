'use client'

// app/login/page.tsx

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        setSuccess('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (data.session) {
          const secure = window.location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `ep-auth=1; path=/; max-age=604800; SameSite=Lax${secure}`
          // Hard navigation ensures the cookie is present in the request headers
          // that the proxy middleware reads — router.push (client-side) has a timing
          // gap on production where the cookie isn't committed yet.
          window.location.href = next
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#08090A' }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        style={{ zIndex: 0 }}
      />

      {/* Amber bloom */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,176,0,0.07) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: '#FFB000',
          opacity: 0.3,
          zIndex: 100,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Wordmark */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-grotesk font-semibold tracking-[0.28em] uppercase transition-opacity hover:opacity-70"
            style={{ fontSize: '14px', color: '#FFB000' }}
          >
            EPISTEME
          </Link>
          <p
            className="font-grotesk mt-2"
            style={{ fontSize: '12px', color: '#524533', letterSpacing: '0.08em' }}
          >
            // The Socratic Study Engine
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,176,0,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Mode tabs */}
          <div
            className="flex"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className="flex-1 py-4 font-grotesk font-semibold uppercase tracking-[0.18em] transition-all duration-200"
                style={{
                  fontSize: '10px',
                  color: mode === m ? '#FFB000' : '#524533',
                  background: mode === m ? 'rgba(255,176,0,0.05)' : 'transparent',
                  borderBottom: mode === m ? '2px solid #FFB000' : '2px solid transparent',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="font-grotesk uppercase tracking-[0.18em]"
                style={{ fontSize: '10px', color: '#9f8e78' }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent font-grotesk outline-none transition-colors"
                style={{
                  fontSize: '14px',
                  color: '#eee0d0',
                  border: '1px solid rgba(255,255,255,0.10)',
                  padding: '10px 14px',
                  caretColor: '#FFB000',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,176,0,0.4)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="font-grotesk uppercase tracking-[0.18em]"
                style={{ fontSize: '10px', color: '#9f8e78' }}
              >
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="──────────"
                className="w-full bg-transparent font-grotesk outline-none transition-colors"
                style={{
                  fontSize: '14px',
                  color: '#eee0d0',
                  border: '1px solid rgba(255,255,255,0.10)',
                  padding: '10px 14px',
                  caretColor: '#FFB000',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,176,0,0.4)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
              />
            </div>

            {/* Error / success messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-grotesk"
                  style={{ fontSize: '12px', color: '#f87171', letterSpacing: '0.02em' }}
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-grotesk"
                  style={{ fontSize: '12px', color: '#4ade80', letterSpacing: '0.02em' }}
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-grotesk font-semibold uppercase tracking-[0.18em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              style={{
                fontSize: '11px',
                color: '#08090A',
                background: '#FFB000',
                boxShadow: loading ? 'none' : '0 0 24px rgba(255,176,0,0.25)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#08090A', display: 'inline-block' }}
                  />
                  Processing...
                </span>
              ) : mode === 'signin' ? 'Enter →' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p
          className="text-center font-grotesk mt-6"
          style={{ fontSize: '11px', color: '#524533' }}
        >
          By continuing, you agree to the Socratic method.
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
