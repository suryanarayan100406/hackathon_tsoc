import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/student/progress?subject=math
 * Fetch all chapter progress for a subject
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subject = request.nextUrl.searchParams.get('subject')
    if (!subject) {
      return NextResponse.json({ error: 'Subject required' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chapters for this subject
    const chapters = await prisma.chapter.findMany({
      where: { subject },
      orderBy: { order: 'asc' }
    })

    // Get progress for these chapters
    const progress = await prisma.chapterProgress.findMany({
      where: {
        userId: user.id,
        chapter: {
          subject: subject
        }
      },
      include: {
        chapter: true
      }
    })

    // Format response
    const progressMap: Record<string, any> = {}
    progress.forEach(p => {
      progressMap[p.chapter.chapterId] = {
        status: p.status,
        score: p.score,
        attempts: p.attempts,
        completedAt: p.completedAt
      }
    })

    return NextResponse.json({
      subject,
      chapters: chapters.length,
      progress: progressMap
    })
  } catch (err) {
    console.error('[Progress] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/student/progress
 * Mark a chapter as done and award XP
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, chapterId, score, timeSpent, xpEarned } = await request.json()

    if (!subject || !chapterId) {
      return NextResponse.json(
        { error: 'Subject and chapterId required' },
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

    // Find chapter
    const chapter = await prisma.chapter.findFirst({
      where: {
        subject,
        chapterId
      }
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Get existing progress
    const existing = await prisma.chapterProgress.findFirst({
      where: {
        userId: user.id,
        chapterId: chapter.id
      }
    })

    // Update or create progress
    const updatedProgress = await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: chapter.id
        }
      },
      update: {
        status: 'done',
        score: Math.max(existing?.score || 0, score || 0),
        attempts: (existing?.attempts || 0) + 1,
        completedAt: new Date(),
        timeSpent: (existing?.timeSpent || 0) + (timeSpent || 0)
      },
      create: {
        userId: user.id,
        chapterId: chapter.id,
        status: 'done',
        score: score || 0,
        attempts: 1,
        completedAt: new Date(),
        timeSpent: timeSpent || 0
      }
    })

    // Update user XP (only if first completion)
    const isFirstCompletion = !existing || existing.status !== 'done'
    let newXP = user.xp || 0
    let newLevel = user.level || 1

    if (isFirstCompletion) {
      newXP = newXP + (xpEarned || 0)
      newLevel = Math.floor(newXP / 500) + 1
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: newXP,
        level: newLevel,
        levelsCompleted: (user.levelsCompleted || 0) + (isFirstCompletion ? 1 : 0)
      }
    })

    // Check and award badges
    const badges = await checkBadges(user.id, {
      xp: newXP,
      subject,
      chapterId,
      score: score || 0,
      wasAlreadyDone: !isFirstCompletion
    })

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      xpEarned: isFirstCompletion ? xpEarned : 0,
      newXP,
      newLevel,
      badgesAwarded: badges
    })
  } catch (err) {
    console.error('[Progress] Error:', err)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

/**
 * Check and award badges based on achievements
 */
async function checkBadges(
  userId: string,
  context: {
    xp: number
    subject: string
    chapterId: string
    score: number
    wasAlreadyDone: boolean
  }
): Promise<string[]> {
  const awarded: string[] = []

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return awarded

    const badges = user.badges || []

    // XP milestones
    if (context.xp >= 1000 && !badges.includes('xp_1000')) {
      awarded.push('xp_1000')
    }
    if (context.xp >= 500 && !badges.includes('xp_500')) {
      awarded.push('xp_500')
    }

    // First lesson
    if (!context.wasAlreadyDone && !badges.includes('first_lesson')) {
      awarded.push('first_lesson')
    }

    // Perfect score
    if (context.score === 100 && !badges.includes('quiz_perfect')) {
      awarded.push('quiz_perfect')
    }

    // Update badges if any were awarded
    if (awarded.length > 0) {
      const newBadges = [...badges, ...awarded]
      await prisma.user.update({
        where: { id: userId },
        data: { badges: newBadges }
      })
    }

    return awarded
  } catch (err) {
    console.error('[Badge] Error:', err)
    return awarded
  }
}
