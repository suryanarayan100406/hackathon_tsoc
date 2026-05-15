import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/student/badges
 * Get user's earned and available badges
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

    const earnedBadges = user.badges || []

    // All available badges (from game.js BADGES array)
    const allBadges = [
      { id: 'first_lesson', icon: '🌟', name: 'First Step', desc: 'Complete your first lesson' },
      { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: 'Maintain a 3-day streak' },
      { id: 'streak_7', icon: '🏆', name: '7-Day Learner', desc: 'Maintain a 7-day streak' },
      { id: 'streak_30', icon: '👑', name: 'Month Master', desc: '30-day learning streak' },
      { id: 'quiz_first', icon: '📝', name: 'Quiz Taker', desc: 'Pass your first quiz' },
      { id: 'quiz_perfect', icon: '💯', name: 'Quiz Champion', desc: 'Score 100% on any quiz' },
      { id: 'math_5', icon: '🧮', name: 'Math Warrior', desc: 'Complete 5 Math levels' },
      { id: 'science_5', icon: '⚗️', name: 'Science Master', desc: 'Complete 5 Science levels' },
      { id: 'coding_5', icon: '💻', name: 'Code Ninja', desc: 'Complete 5 Coding levels' },
      { id: 'xp_500', icon: '⚡', name: 'Power Learner', desc: 'Earn 500 XP' },
      { id: 'xp_1000', icon: '🚀', name: 'XP Rocket', desc: 'Earn 1000 XP' },
      { id: 'daily_3', icon: '📅', name: 'Challenger', desc: 'Complete 3 daily challenges' },
      { id: 'all_subjects', icon: '🌈', name: 'Explorer', desc: 'Start all 5 subjects' },
      { id: 'boss_1', icon: '🏅', name: 'Boss Slayer', desc: 'Pass your first boss quiz' }
    ]

    const badgesWithStatus = allBadges.map(badge => ({
      ...badge,
      earned: earnedBadges.includes(badge.id)
    }))

    return NextResponse.json({
      earnedCount: earnedBadges.length,
      totalBadges: allBadges.length,
      earned: earnedBadges,
      badges: badgesWithStatus
    })
  } catch (err) {
    console.error('[Badges] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/badges/check
 * Check and award badges based on user progress (internal use)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { checkType } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chapterProgress: {
          include: {
            chapter: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const badges = user.badges || []
    const awarded: string[] = []

    // Check streak badges
    if (checkType === 'streak') {
      const streak = user.streak || 0
      if (streak >= 30 && !badges.includes('streak_30')) {
        awarded.push('streak_30')
      }
      if (streak >= 7 && !badges.includes('streak_7')) {
        awarded.push('streak_7')
      }
      if (streak >= 3 && !badges.includes('streak_3')) {
        awarded.push('streak_3')
      }
    }

    // Check subject completion badges
    if (checkType === 'subjects') {
      const subjectCounts: Record<string, number> = {}

      user.chapterProgress.forEach(cp => {
        if (cp.status === 'done') {
          const subject = cp.chapter.subject
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1
        }
      })

      if (subjectCounts['math'] >= 5 && !badges.includes('math_5')) {
        awarded.push('math_5')
      }
      if (subjectCounts['coding'] >= 5 && !badges.includes('coding_5')) {
        awarded.push('coding_5')
      }
      if (
        (subjectCounts['physics'] >= 5 ||
          subjectCounts['chemistry'] >= 5 ||
          subjectCounts['biology'] >= 5) &&
        !badges.includes('science_5')
      ) {
        awarded.push('science_5')
      }

      // All subjects started
      const subjectsStarted = Object.keys(subjectCounts).length
      if (subjectsStarted >= 5 && !badges.includes('all_subjects')) {
        awarded.push('all_subjects')
      }
    }

    // Award badges
    if (awarded.length > 0) {
      const newBadges = [...badges, ...awarded]
      await prisma.user.update({
        where: { id: user.id },
        data: { badges: newBadges }
      })
    }

    return NextResponse.json({
      awarded,
      total: badges.length + awarded.length
    })
  } catch (err) {
    console.error('[Badges] Error:', err)
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    )
  }
}
