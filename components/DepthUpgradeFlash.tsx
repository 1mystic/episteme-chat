'use client'

// components/DepthUpgradeFlash.tsx

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DepthLevel } from '@/lib/types'

interface DepthUpgradeFlashProps {
  depth: DepthLevel | null
  trigger: number
}

export function DepthUpgradeFlash({ depth, trigger }: DepthUpgradeFlashProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trigger === 0) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <AnimatePresence>
      {visible && depth && (
        <>
          {/* Horizontal amber sweep */}
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: '#f5a623',
              transformOrigin: 'left center',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 font-jetbrains uppercase tracking-wider z-[201] pointer-events-none"
            style={{
              fontSize: '11px',
              color: '#f5a623',
              background: 'rgba(10,10,10,0.9)',
              border: '1px solid rgba(245,166,35,0.4)',
              borderRadius: '4px',
              padding: '6px 14px',
            }}
          >
            ↑ Depth upgraded to {depth}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
