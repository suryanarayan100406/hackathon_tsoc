import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface OfflineCompletion {
  questId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: number
  xpEarned: number
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id
    const body = await request.json()
    const completions: OfflineCompletion[] = body.completions || []

    if (!Array.isArray(completions)) {
      return NextResponse.json({ error: 'Completions must be an array' }, { status: 400 })
    }

    if (completions.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No progress to sync' })
    }

    // Start transaction
    let totalXpEarned = 0
    let syncedCount = 0

    // Process each completion
    for (const completion of completions) {
      try {
        // Verify quest exists
        const quest = await prisma.quest.findUnique({
          where: { id: completion.questId }
        })

        if (!quest) {
          console.warn(`[Sync] Quest ${completion.questId} not found, skipping`)
          continue
        }

        // Check for duplicate (based on quest and timestamp window)
        const existingProgress = await prisma.questProgress.findFirst({
          where: {
            userId,
            questId: completion.questId,
            createdAt: {
              gte: new Date(completion.completedAt - 60000), // Within 1 minute
              lte: new Date(completion.completedAt + 60000)
            }
          }
        })

        if (existingProgress) {
          console.warn(`[Sync] Duplicate progress for quest ${completion.questId}, skipping`)
          continue
        }

        // Create progress record
        await prisma.questProgress.create({
          data: {
            userId,
            questId: completion.questId,
            score: completion.score,
            totalQuestions: completion.totalQuestions,
            timeSpent: completion.timeSpent,
            xpEarned: completion.xpEarned,
            createdAt: new Date(completion.completedAt)
          }
        })

        totalXpEarned += completion.xpEarned
        syncedCount++
      } catch (err) {
        console.error(`[Sync] Error processing completion for ${completion.questId}:`, err)
        continue
      }
    }

    // Update user stats if XP was earned
    if (totalXpEarned > 0) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (currentUser) {
        const newXp = (currentUser.xp || 0) + totalXpEarned
        const newLevel = Math.floor(newXp / 1000) + 1

        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: newXp,
            level: newLevel,
            lastActive: new Date()
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      xpEarned: totalXpEarned,
      message: `Synced ${syncedCount} quest result${syncedCount !== 1 ? 's' : ''}`
    })
  } catch (error) {
    console.error('[Sync] API Error:', error)
    return NextResponse.json(
      { error: 'Sync failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({ ok: true })
}
