'use client'

// components/SkeletonLine.tsx

interface SkeletonLineProps {
  width?: string
  height?: number
}

export function SkeletonLine({ width = '100%', height = 14 }: SkeletonLineProps) {
  return (
    <div
      style={{
        width,
        height: `${height}px`,
        borderRadius: '3px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}
