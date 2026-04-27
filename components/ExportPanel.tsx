'use client'

// components/ExportPanel.tsx

import { useState } from 'react'
import { Download, FileText, Clipboard, ClipboardCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ExportPanelProps {
  sessionId: string
}

type ExportFormat = 'md' | 'pdf'

export function ExportPanel({ sessionId }: ExportPanelProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [done, setDone] = useState<Set<ExportFormat>>(new Set())
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchMarkdown(): Promise<string | null> {
    const { data: { session: authSession } } = await supabase.auth.getSession()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authSession?.access_token) headers['Authorization'] = `Bearer ${authSession.access_token}`

    const res = await fetch('/api/export', {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId, format: 'md' }),
    })
    if (!res.ok) {
      const err = await res.json() as { error?: string }
      throw new Error(err.error ?? 'Export failed')
    }
    return res.text()
  }

  async function handleExport(format: ExportFormat) {
    setLoading(format)
    setError(null)

    // For PDF: open blank tab immediately (synchronous, avoids popup blockers),
    // then write the HTML into it once fetched — auto-print fires via window.onload in the HTML.
    const pdfWin = format === 'pdf' ? window.open('', '_blank') : null
    if (format === 'pdf' && !pdfWin) {
      setError('Popup blocked — please allow popups for this site and try again.')
      setLoading(null)
      return
    }

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authSession?.access_token) headers['Authorization'] = `Bearer ${authSession.access_token}`

      const res = await fetch('/api/export', {
        method: 'POST',
        headers,
        body: JSON.stringify({ sessionId, format }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        pdfWin?.close()
        throw new Error(err.error ?? 'Export failed')
      }

      if (format === 'pdf' && pdfWin) {
        const html = await res.text()
        pdfWin.document.write(html)
        pdfWin.document.close()
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `episteme-session.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      setDone((prev) => new Set(prev).add(format))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading(null)
    }
  }

  async function handleCopy() {
    setError(null)
    try {
      const md = await fetchMarkdown()
      if (!md) return
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Copy failed')
    }
  }

  const busy = loading !== null

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,176,0,0.02)' }}>
      <div className="p-8 pt-6">
        <p
          className="font-grotesk font-semibold uppercase tracking-[0.2em] mb-2"
          style={{ fontSize: '10px', color: '#FFB000' }}
        >
          // EXPORT LEARNING ROADMAP
        </p>
        <p className="font-grotesk mb-5" style={{ fontSize: '13px', color: '#6b5a44', lineHeight: 1.6 }}>
          Your insight, knowledge map, gap schedule, and 30-day plan as a portable document.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Markdown download */}
          <button
            onClick={() => handleExport('md')}
            disabled={busy}
            className="font-grotesk font-medium uppercase tracking-[0.14em] transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              fontSize: '10px',
              color: done.has('md') ? '#4ade80' : '#9f8e78',
              border: `1px solid ${done.has('md') ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`,
              padding: '8px 14px',
            }}
          >
            {loading === 'md'
              ? <><Loader2 size={11} className="animate-spin" /> Exporting...</>
              : <><Download size={11} /> {done.has('md') ? 'Downloaded' : 'Download .md'}</>}
          </button>

          {/* PDF/HTML download */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={busy}
            className="font-grotesk font-medium uppercase tracking-[0.14em] transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              fontSize: '10px',
              color: done.has('pdf') ? '#4ade80' : '#9f8e78',
              border: `1px solid ${done.has('pdf') ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`,
              padding: '8px 14px',
            }}
          >
            {loading === 'pdf'
              ? <><Loader2 size={11} className="animate-spin" /> Exporting...</>
              : <><FileText size={11} /> {done.has('pdf') ? 'Opened' : 'Save as PDF'}</>}
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopy}
            disabled={busy}
            className="font-grotesk font-medium uppercase tracking-[0.14em] transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              fontSize: '10px',
              color: copied ? '#4ade80' : '#FFB000',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,176,0,0.3)'}`,
              padding: '8px 14px',
            }}
          >
            {copied
              ? <><ClipboardCheck size={11} /> Copied!</>
              : <><Clipboard size={11} /> Copy Markdown</>}
          </button>
        </div>

        <p className="font-grotesk mt-4" style={{ fontSize: '10px', color: '#524533', lineHeight: 1.6 }}>
          {done.has('pdf')
            ? 'Print dialog opened — choose "Save as PDF" as the destination.'
            : 'Notion tip: paste the copied Markdown directly into any Notion page — it imports natively.'}
        </p>

        {error && (
          <p className="font-grotesk mt-3" style={{ fontSize: '11px', color: '#f87171' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
