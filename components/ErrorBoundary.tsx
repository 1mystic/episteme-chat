'use client'

// components/ErrorBoundary.tsx

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5">
          {/* Amber accent line at top */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: '#f87171' }} />

          <p className="font-playfair italic" style={{ fontSize: '24px', color: '#f0ede6' }}>
            Something broke.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <p className="font-jetbrains px-4 text-center" style={{ fontSize: '12px', color: '#f87171', maxWidth: '480px' }}>
              {this.state.error.message}
            </p>
          )}

          {process.env.NODE_ENV !== 'development' && (
            <p className="font-jetbrains" style={{ fontSize: '12px', color: '#8a8a8a' }}>
              An unexpected error occurred.
            </p>
          )}

          <button
            onClick={() => window.location.reload()}
            className="font-jetbrains uppercase tracking-wider transition-opacity hover:opacity-70"
            style={{
              fontSize: '11px',
              color: '#f5a623',
              border: '1px solid rgba(245,166,35,0.3)',
              borderRadius: '4px',
              padding: '8px 16px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Try refreshing
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
