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

    // Get user with badges and streak info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subjects with units and quests, including user's progress for each quest
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        units: {
          orderBy: { order: 'asc' },
          where: { grade: user.grade },
          include: {
            quests: {
              orderBy: { order: 'asc' },
              include: {
                progress: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    })

    // Format badges
    const formattedBadges = user.badges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt,
    }))

    // Format subjects
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      icon: subject.icon,
      color: subject.color,
      units: subject.units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        grade: unit.grade,
        order: unit.order,
        quests: unit.quests.map((quest) => ({
          id: quest.id,
          title: quest.title,
          type: quest.type,
          difficulty: quest.difficulty,
          xpReward: quest.xpReward,
          progress: quest.progress.length > 0 ? {
            score: quest.progress[0].score,
            stars: quest.progress[0].stars,
            xpEarned: quest.progress[0].xpEarned,
          } : null,
        })),
      })),
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streakDays: user.streakDays,
      },
      subjects: formattedSubjects,
      badges: formattedBadges,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
