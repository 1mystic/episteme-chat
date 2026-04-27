'use client'

// components/ui/button.tsx

import { clsx } from 'clsx'

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

const base =
  'inline-flex items-center justify-center font-jetbrains tracking-wider uppercase transition-all duration-150 rounded select-none'

const variants = {
  primary:
    'bg-[#f5a623] text-[#0a0a0a] hover:bg-[#f7b84a] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-[#8a8a8a] hover:border hover:border-[rgba(255,255,255,0.15)] hover:text-[#f0ede6] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
  outline:
    'bg-transparent border border-[#f5a623] text-[#f5a623] hover:bg-[rgba(245,166,35,0.08)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
  danger:
    'bg-transparent text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
}

const sizes = {
  sm: 'text-[10px] px-3 py-1.5',
  md: 'text-[11px] px-4 py-2',
  lg: 'text-[12px] px-6 py-3',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}
