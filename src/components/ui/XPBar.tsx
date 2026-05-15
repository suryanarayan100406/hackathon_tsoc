'use client'

import { motion } from 'framer-motion'
import { getLevelInfo } from '@/lib/gamification'

interface XPBarProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function XPBar({ xp, size = 'md', showLabel = true }: XPBarProps) {
  const { current, next, progress, xpInLevel, xpForNextLevel } = getLevelInfo(xp)

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between mb-1.5 ${textSizes[size]}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{current.icon}</span>
            <span className="font-bold" style={{ color: 'var(--primary)' }}>
              Lv.{current.level} {current.title}
            </span>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>
            {xpInLevel} / {xpForNextLevel} XP
          </span>
        </div>
      )}
      <div
        className={`${heights[size]} rounded-full overflow-hidden`}
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <motion.div
          className={`${heights[size]} rounded-full`}
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {showLabel && current.level !== next.level && (
        <div className={`flex justify-end mt-1 ${textSizes[size]}`}>
          <span style={{ color: 'var(--text-muted)' }}>
            Next: {next.icon} {next.title}
          </span>
        </div>
      )}
    </div>
  )
}
