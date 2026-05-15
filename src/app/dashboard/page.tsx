'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { XPBar } from '@/components/ui/XPBar'
import { BadgeShelf } from '@/components/ui/BadgeShelf'
import { StreakFlame } from '@/components/ui/StreakFlame'
import {
  LogOut, BookOpen, Trophy, Star, Zap,
  Map, User, ChevronRight, Lock
} from 'lucide-react'

interface Quest {
  id: string
  title: string
  type: string
  difficulty: string
  xpReward: number
  progress: { score: number; stars: number; xpEarned: number } | null
}

interface Unit {
  id: string
  name: string
  grade: number
  order: number
  quests: Quest[]
}

interface Subject {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  units: Unit[]
}

interface DashboardData {
  user: {
    id: string
    name: string
    xp: number
    level: number
    streakDays: number
    grade: number
  }
  subjects: Subject[]
  badges: { id: string; name: string; icon: string; description: string; earnedAt: string }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSubject, setActiveSubject] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/student/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={() => router.push('/login')} className="mt-4 px-6 py-2 rounded-xl text-white font-semibold"
            style={{ background: 'var(--primary)' }}>Go Back</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { user, subjects, badges } = data
  const activeSubjectData = subjects?.[activeSubject]

  // Compute stats from subjects
  let totalQuests = 0, totalStars = 0, totalScore = 0, completedCount = 0
  subjects?.forEach(sub => sub.units.forEach(unit => unit.quests.forEach(q => {
    totalQuests++
    if (q.progress) { completedCount++; totalStars += q.progress.stars; totalScore += q.progress.score }
  })))
  const stats = { totalQuests: completedCount, totalStars, avgScore: completedCount > 0 ? Math.round(totalScore / completedCount) : 0 }

  const difficultyColor: Record<string, string> = {
    EASY: '#06d6a0',
    MEDIUM: '#ffd166',
    HARD: '#ef476f',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(var(--bg-secondary-rgb, 26,26,26), 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
            🎓
          </div>
          <span className="font-bold text-lg gradient-text">VidyaQuest</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)' }}>
            <Zap size={14} />
            {user.xp} XP
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome + XP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 rounded-2xl"
          style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back,</p>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.name || session?.user?.name || 'Hero'} 👋
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Grade {user.grade}</p>
            </div>
            <StreakFlame streak={user.streakDays} />
          </div>
          <XPBar xp={user.xp} size="md" />
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Quests', value: stats.totalQuests, icon: '⚔️', color: 'var(--primary)' },
            { label: 'Stars', value: stats.totalStars, icon: '⭐', color: 'var(--accent)' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: '📊', color: 'var(--secondary)' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-2xl text-center"
              style={{ border: '1px solid var(--border-color)' }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-5 rounded-2xl"
            style={{ border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Badges Earned ({badges.length})
              </h2>
            </div>
            <BadgeShelf badges={badges} />
          </motion.div>
        )}

        {/* Quest Map */}
        {subjects && subjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* Subject Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
              {subjects.map((subject, idx) => (
                <button
                  key={subject.id}
                  onClick={() => setActiveSubject(idx)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: activeSubject === idx ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: activeSubject === idx ? 'white' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span>{subject.icon}</span>
                  {subject.name}
                </button>
              ))}
            </div>

            {/* Quests List */}
            {activeSubjectData && (
              <div className="space-y-3">
                {activeSubjectData.units.map((unit) => (
                  <div key={unit.id}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Map size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {unit.name}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {unit.quests.map((quest, qIdx) => {
                        const completed = !!quest.progress
                        const stars = quest.progress?.stars ?? 0
                        const isLocked = qIdx > 0 && !unit.quests[qIdx - 1].progress
                        return (
                          <motion.div
                            key={quest.id}
                            whileHover={!isLocked ? { scale: 1.01 } : {}}
                            whileTap={!isLocked ? { scale: 0.99 } : {}}
                            onClick={() => !isLocked && router.push(`/quests/${quest.id}`)}
                            className={`glass-card p-4 rounded-xl flex items-center gap-3 ${!isLocked ? 'cursor-pointer' : 'opacity-50'}`}
                            style={{ border: `1px solid ${completed ? 'var(--accent)' : 'var(--border-color)'}` }}
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{
                                background: completed
                                  ? 'linear-gradient(135deg, var(--accent), var(--primary))'
                                  : isLocked ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                              }}>
                              {isLocked ? <Lock size={16} style={{ color: 'var(--text-muted)' }} /> :
                                completed ? '✅' :
                                  quest.type === 'QUIZ' ? '📝' :
                                    quest.type === 'LAB' ? '🔬' : '🎯'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {quest.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    background: `${difficultyColor[quest.difficulty]}20`,
                                    color: difficultyColor[quest.difficulty]
                                  }}>
                                  {quest.difficulty}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  +{quest.xpReward} XP
                                </span>
                                {completed && (
                                  <span className="text-xs">
                                    {'⭐'.repeat(stars)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isLocked && (
                              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {(!subjects || subjects.length === 0) && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No quests available yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
