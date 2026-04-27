'use client'

// components/LoadingDot.tsx

interface LoadingDotProps {
  label?: string
  size?: 'sm' | 'md'
}

export function LoadingDot({ label, size = 'md' }: LoadingDotProps) {
  const px = size === 'sm' ? '6px' : '8px'

  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          width: px,
          height: px,
          background: '#f5a623',
          borderRadius: '50%',
          animation: 'pulse-dot 1.2s ease-in-out infinite',
        }}
      />
      {label && (
        <span className="font-jetbrains" style={{ fontSize: '12px', color: '#8a8a8a' }}>
          {label}
        </span>
      )}
      <style>{`@keyframes pulse-dot{0%,100%{transform:scale(0.8);opacity:0.6}50%{transform:scale(1.2);opacity:1}}`}</style>
    </div>
  )
}
