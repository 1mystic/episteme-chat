'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/about',  label: 'How it works' },
  { href: '/vision', label: 'Vision' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-8"
      style={{
        height: '80px',
        background: 'rgba(8,9,10,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {/* Wordmark */}
      <Link
        href="/"
        className="font-grotesk font-semibold tracking-[0.28em] uppercase transition-opacity hover:opacity-70"
        style={{ fontSize: '14px', color: '#FFB000' }}
      >
        EPISTEME
      </Link>

      {/* Nav links */}
      <div className="ml-auto flex items-center gap-10">
        {LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'font-grotesk font-medium uppercase tracking-[0.18em] transition-all duration-150',
                isActive
                  ? 'text-[#FFB000]'
                  : 'text-[#9f8e78] hover:text-[#eee0d0]'
              )}
              style={{ fontSize: '12px' }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
