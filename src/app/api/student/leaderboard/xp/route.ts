import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/student/leaderboard/xp
 * Get XP leaderboard (top students)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = request.nextUrl.searchParams.get('limit') || '10'
    const type = request.nextUrl.searchParams.get('type') || 'global' // global | class | weekly

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let where: any = {}

    // Weekly leaderboard (last 7 days)
    if (type === 'weekly') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      where = {
        lastLoginDate: {
          gte: sevenDaysAgo
        }
      }
    }

    // Class leaderboard
    if (type === 'class' && user.class) {
      where = {
        class: user.class
      }
    }

    const topStudents = await prisma.user.findMany({
      where: {
        role: 'student',
        ...where
      },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        class: true
      },
      orderBy: [{ xp: 'desc' }, { level: 'desc' }],
      take: parseInt(limit)
    })

    // Get user's rank
    const userAboveCount = await prisma.user.count({
      where: {
        role: 'student',
        xp: {
          gt: user.xp || 0
        },
        ...where
      }
    })

    const leaderboard = topStudents.map((student, index) => ({
      rank: index + 1,
      name: student.name,
      xp: student.xp || 0,
      level: student.level || 1,
      streak: student.streak || 0,
      isCurrentUser: student.id === user.id
    }))

    return NextResponse.json({
      type,
      leaderboard,
      userRank: userAboveCount + 1,
      userXP: user.xp || 0,
      userLevel: user.level || 1
    })
  } catch (err) {
    console.error('[Leaderboard] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
