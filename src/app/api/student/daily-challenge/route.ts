import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/student/daily-challenge/claim
 * Claim today's daily challenge and award XP
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { challengeId, xpReward } = await request.json()

    if (!challengeId || !xpReward) {
      return NextResponse.json(
        { error: 'challengeId and xpReward required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if already claimed today
    const existing = await prisma.dailyChallengeCompletion.findFirst({
      where: {
        userId: user.id,
        challengeId,
        completedDate: {
          gte: new Date(`${today}T00:00:00`),
          lt: new Date(`${today}T23:59:59`)
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already claimed today' },
        { status: 400 }
      )
    }

    // Record challenge completion
    await prisma.dailyChallengeCompletion.create({
      data: {
        userId: user.id,
        challengeId,
        completedDate: new Date(),
        xpAwarded: xpReward
      }
    })

    // Update user XP
    const newXP = (user.xp || 0) + xpReward
    const newLevel = Math.floor(newXP / 500) + 1

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: newXP,
        level: newLevel
      }
    })

    // Check for daily challenge badges
    const completionCount = await prisma.dailyChallengeCompletion.count({
      where: { userId: user.id }
    })

    const badges = updated.badges || []
    let newBadges = [...badges]

    // Award badge for 3 daily challenges
    if (completionCount >= 3 && !badges.includes('daily_3')) {
      newBadges.push('daily_3')
      await prisma.user.update({
        where: { id: user.id },
        data: { badges: newBadges }
      })
    }

    return NextResponse.json({
      success: true,
      xpAwarded: xpReward,
      newXP,
      newLevel,
      badgesAwarded: newBadges.filter(b => !badges.includes(b))
    })
  } catch (err) {
    console.error('[DailyChallenge] Error:', err)
    return NextResponse.json(
      { error: 'Failed to claim challenge' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/student/daily-challenge
 * Get today's daily challenge status
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

    const today = new Date().toISOString().split('T')[0]

    // Get all completed challenges today
    const completed = await prisma.dailyChallengeCompletion.findMany({
      where: {
        userId: user.id,
        completedDate: {
          gte: new Date(`${today}T00:00:00`),
          lt: new Date(`${today}T23:59:59`)
        }
      }
    })

    return NextResponse.json({
      today,
      completedToday: completed.map(c => c.challengeId),
      totalCompleted: completed.length
    })
  } catch (err) {
    console.error('[DailyChallenge] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch challenge status' },
      { status: 500 }
    )
  }
}
