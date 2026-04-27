'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, BarChart2, TrendingUp, Cpu, BookOpen } from 'lucide-react'
import type { Domain } from '@/lib/types'

interface DomainSelectorProps {
  onSelect: (domain: Domain) => void
  isLoading: boolean
}

const DOMAINS: { id: Domain; label: string; Icon: React.ElementType; description: string }[] = [
  { id: 'ml',         label: 'Machine Learning', Icon: Brain,      description: 'Algorithms, models, training, inference' },
  { id: 'statistics', label: 'Statistics',        Icon: BarChart2,  description: 'Probability, inference, distributions' },
  { id: 'economics',  label: 'Economics',         Icon: TrendingUp, description: 'Micro, macro, game theory, markets' },
  { id: 'cs',         label: 'Computer Science',  Icon: Cpu,        description: 'Data structures, algorithms, systems' },
  { id: 'general',    label: 'General',           Icon: BookOpen,   description: 'Any topic — philosophy, science, history' },
]

export function DomainSelector({ onSelect, isLoading }: DomainSelectorProps) {
  const [selected, setSelected] = useState<Domain | null>(null)

  function handleSelect(domain: Domain) {
    if (isLoading) return
    setSelected(domain)
    onSelect(domain)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
      {DOMAINS.map((d, i) => {
        const isActive = selected === d.id
        return (
          <motion.button
            key={d.id}
            onClick={() => handleSelect(d.id)}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="text-left p-5 cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: isActive ? '#191209' : '#08090A',
              border: isActive
                ? '1px solid #FFB000'
                : '1px solid rgba(255,255,255,0.10)',
              boxShadow: isActive ? '0 0 24px rgba(255,176,0,0.18)' : 'none',
            }}
          >
            <div className="flex items-start gap-3">
              <d.Icon
                size={20}
                className="flex-shrink-0 mt-0.5"
                style={{ color: '#FFB000' }}
              />
              <div>
                <div
                  className="font-grotesk font-semibold mb-1"
                  style={{ fontSize: '15px', color: '#eee0d0' }}
                >
                  {d.label}
                </div>
                <div
                  className="font-grotesk"
                  style={{ fontSize: '12px', color: '#9f8e78', letterSpacing: '0.02em' }}
                >
                  {d.description}
                </div>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
