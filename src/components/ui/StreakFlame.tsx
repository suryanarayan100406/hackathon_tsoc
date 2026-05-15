'use client'

import { motion } from 'framer-motion'

interface StreakFlameProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakFlame({ days, size = 'md' }: StreakFlameProps) {
  const sizes = {
    sm: { flame: 'text-xl', text: 'text-xs', gap: 'gap-1' },
    md: { flame: 'text-3xl', text: 'text-sm', gap: 'gap-1.5' },
    lg: { flame: 'text-5xl', text: 'text-lg', gap: 'gap-2' },
  }

  const s = sizes[size]
  const intensity = Math.min(days / 30, 1)

  return (
    <div className={`flex items-center ${s.gap}`}>
      <motion.span
        className={s.flame}
        animate={{
          scale: [1, 1.1 + intensity * 0.2, 1],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          filter: `brightness(${1 + intensity * 0.5})`,
          display: 'inline-block',
        }}
      >
        🔥
      </motion.span>
      <div>
        <div className={`font-bold ${s.text}`} style={{ color: 'var(--primary)' }}>
          {days} Day{days !== 1 ? 's' : ''}
        </div>
        {size !== 'sm' && (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            streak
          </div>
        )}
      </div>
    </div>
  )
}
