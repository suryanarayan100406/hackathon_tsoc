'use client'

import { motion } from 'framer-motion'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: string
}

interface BadgeShelfProps {
  badges: Badge[]
  maxDisplay?: number
}

export function BadgeShelf({ badges, maxDisplay = 8 }: BadgeShelfProps) {
  const displayed = badges.slice(0, maxDisplay)
  const remaining = badges.length - maxDisplay

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {displayed.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
          className="relative group flex-shrink-0"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer
                        transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--primary))',
              boxShadow: '0 2px 10px rgba(255, 107, 53, 0.3)',
            }}
          >
            {badge.icon}
          </div>
          {/* Tooltip */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg
                        text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100
                        transition-opacity pointer-events-none z-50"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="font-bold">{badge.name}</div>
            <div style={{ color: 'var(--text-muted)' }}>{badge.description}</div>
          </div>
        </motion.div>
      ))}
      {remaining > 0 && (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
