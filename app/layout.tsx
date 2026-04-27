// app/layout.tsx

import type { Metadata } from 'next'
import { Goldman, JetBrains_Mono, Playfair_Display, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/Toast'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
})

const goldman = Goldman({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-goldman',
})

export const metadata: Metadata = {
  title: 'Episteme',
  description: 'The Socratic Study Engine — AI that refuses to answer your questions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${goldman.variable}`}>
        {/* Top amber accent line */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--amber)',
            opacity: 0.3,
            zIndex: 100,
          }}
        />
        <ToastProvider>
          <div style={{ minHeight: '100vh' }}>{children}</div>
        </ToastProvider>
      </body>
    </html>
  )
}
