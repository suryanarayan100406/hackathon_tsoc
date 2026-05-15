import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user with badges and progress
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
        progress: {
          include: {
            quest: {
              include: { unit: { include: { subject: true } } }
            }
          }
        }
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate stats
    let totalStars = 0
    let totalScore = 0
    const subjectBreakdown: Record<string, number> = {}

    user.progress.forEach(p => {
      totalStars += p.stars
      totalScore += p.score
      const subjectSlug = p.quest.unit.subject.slug
      subjectBreakdown[subjectSlug] = (subjectBreakdown[subjectSlug] || 0) + 1
    })

    const avgScore = user.progress.length > 0 
      ? Math.round(totalScore / user.progress.length) 
      : 0

    // Fake streak history since we don't have a separate table for daily logins
    const streakHistory = [
      { date: new Date().toISOString().split('T')[0], count: user.streakDays }
    ]

    const formattedBadges = user.badges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streakDays: user.streakDays,
        grade: user.grade,
      },
      stats: {
        totalQuests: user.progress.length,
        totalStars,
        avgScore,
        timeSpent: 0, // Not tracked in DB currently
        subjectBreakdown,
      },
      streakHistory,
      badges: formattedBadges,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
