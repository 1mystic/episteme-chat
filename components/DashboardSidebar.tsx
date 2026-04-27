'use client'

import Link from 'next/link'
import { LayoutDashboard, Sparkles, Plus, LogOut } from 'lucide-react'

interface DashboardSidebarProps {
  user: { email?: string | null }
  signOut: () => void
  onNewSession: () => void
  newSessionLoading: boolean
  activeItem: 'dashboard' | 'insights'
}

function userInitial(email: string) {
  return email.charAt(0).toUpperCase()
}

export function DashboardSidebar({
  user,
  signOut,
  onNewSession,
  newSessionLoading,
  activeItem,
}: DashboardSidebarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'DASHBOARD', href: '/dashboard', Icon: LayoutDashboard },
    { id: 'insights' as const, label: 'INSIGHTS', href: '/insights', Icon: Sparkles },
  ]

  return (
    <aside className="bg-[#08090A] text-amber-500 font-['Space_Grotesk'] text-xs tracking-wider border-r border-white/10 w-64 flex flex-shrink-0 flex-col h-screen fixed left-0 top-0 py-8 z-50">
      <div className="px-8 mb-12 flex-shrink-0">
        <Link href="/" className="transition-opacity hover:opacity-70 group inline-block">
          <h1 className="text-amber-500 font-black text-xl tracking-tighter group-hover:drop-shadow-[0_0_15px_rgba(255,176,0,0.6)] transition-all">EPISTEME</h1>
          <p className="text-white/40 text-[10px] tracking-widest mt-1 uppercase">LEARNING_OS</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ id, label, href, Icon }) =>
          activeItem === id ? (
            <div
              key={id}
              className="cursor-crosshair flex items-center py-3 text-amber-500 border-l-2 border-amber-500 bg-white/5 pl-4"
            >
              <Icon size={16} className="mr-3 flex-shrink-0" />
              <span className="font-medium text-xs tracking-[0.14em] uppercase">{label}</span>
            </div>
          ) : (
            <Link
              key={id}
              href={href}
              className="group cursor-crosshair flex items-center py-3 text-white/40 pl-4 hover:bg-white/5 hover:text-amber-400 transition-all duration-300"
              style={{ borderLeft: '2px solid transparent' }}
            >
              <Icon size={16} className="mr-3 flex-shrink-0 text-white/40 group-hover:text-amber-400 transition-colors" />
              <span className="font-medium text-xs tracking-[0.14em] uppercase">{label}</span>
            </Link>
          )
        )}

        <button
          onClick={onNewSession}
          disabled={newSessionLoading}
          className="group cursor-crosshair w-full flex items-center py-3 text-white/40 pl-4 hover:bg-white/5 hover:text-amber-400 transition-all duration-300 disabled:opacity-40"
          style={{ borderLeft: '2px solid transparent' }}
        >
          <Plus size={16} className="mr-3 flex-shrink-0 text-white/40 group-hover:text-amber-400 transition-colors" />
          <span className="font-medium text-xs tracking-[0.14em] uppercase">
            {newSessionLoading ? 'STARTING...' : 'NEW SESSION'}
          </span>
        </button>
      </nav>

      <div className="px-6 flex-shrink-0">
        <div className="flex items-center mb-8 overflow-hidden pl-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-[14px] bg-amber-500 text-black flex-shrink-0">
              {userInitial(user.email ?? 'U')}
            </div>
            <div className="text-[12px] text-left min-w-0">
              <p className="text-white font-bold leading-none truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <button
            onClick={signOut}
            className="group w-full cursor-crosshair flex items-center text-white/40 pl-2 hover:text-[#f87171] transition-all"
          >
            <LogOut size={18} className="mr-3 flex-shrink-0" />
            <span className="font-bold tracking-[0.2em] text-[11px] uppercase">LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
