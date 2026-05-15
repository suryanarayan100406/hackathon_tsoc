import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/student/streak
 * Get user's streak information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      streak: user.streak || 0,
      lastLoginDate: user.lastLoginDate,
      totalDaysActive: user.totalDaysActive || 0
    })
  } catch (err) {
    console.error('[Streak] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/streak/update
 * Update user's streak (called on login)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]
    const lastLogin = user.lastLoginDate
      ? user.lastLoginDate.toISOString().split('T')[0]
      : null
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0]

    let streak = user.streak || 0
    let totalDaysActive = user.totalDaysActive || 0

    // Determine streak status
    if (lastLogin === today) {
      // Already logged in today
      return NextResponse.json({
        streak,
        totalDaysActive,
        message: 'Already logged in today',
        lastLoginDate: user.lastLoginDate
      })
    } else if (lastLogin === yesterday) {
      // Consecutive day - increment streak
      streak += 1
      totalDaysActive += 1
    } else if (!lastLogin) {
      // First login ever
      streak = 1
      totalDaysActive = 1
    } else {
      // Streak broken - reset to 1
      streak = 1
      totalDaysActive += 1
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        streak,
        lastLoginDate: new Date(),
        totalDaysActive
      }
    })

    // Check for streak badges (award them)
    const badges = updated.badges || []
    const newBadges = [...badges]

    if (streak >= 30 && !badges.includes('streak_30')) {
      newBadges.push('streak_30')
    }
    if (streak >= 7 && !badges.includes('streak_7')) {
      newBadges.push('streak_7')
    }
    if (streak >= 3 && !badges.includes('streak_3')) {
      newBadges.push('streak_3')
    }

    if (newBadges.length > badges.length) {
      await prisma.user.update({
        where: { id: user.id },
        data: { badges: newBadges }
      })
    }

    return NextResponse.json({
      streak,
      totalDaysActive,
      lastLoginDate: new Date(),
      newBadges: newBadges.filter(b => !badges.includes(b))
    })
  } catch (err) {
    console.error('[Streak] Error:', err)
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    )
  }
}
