import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { calculateLevel, calculateStars, BADGE_DEFINITIONS } from '@/lib/gamification'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const questId = params.id
    const body = await req.json()
    const { score } = body

    if (score === undefined || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Invalid score. Must be between 0 and 100' }, { status: 400 })
    }

    // 1. Fetch Quest to get base XP and unit details
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { unit: true }
    })

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // 2. Fetch User to get current XP and Level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { badges: true, progress: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Calculate Gamification Rewards
    // Stars based on score (e.g. 90+ = 3 stars, 70+ = 2 stars, 50+ = 1 star)
    const starsEarned = calculateStars(score)
    
    // XP calculation: Base XP * Score multiplier
    // Score 100 = 100% XP. Minimum XP is 10 for trying.
    const xpEarned = Math.max(10, Math.round(quest.xpReward * (score / 100)))

    // 4. Update or Create Quest Progress
    const progress = await prisma.questProgress.upsert({
      where: {
        userId_questId: {
          userId,
          questId,
        }
      },
      update: {
        score: Math.max(score, 0), // Assuming we keep the latest or highest? Let's just update for now. 
        // In a real app, you might want to only update if score is higher: 
        // score: { set: Math.max(score, previousScore) }
        stars: Math.max(starsEarned, 0),
        xpEarned: { increment: xpEarned },
        completedAt: new Date(),
      },
      create: {
        userId,
        questId,
        score,
        stars: starsEarned,
        xpEarned,
      }
    })

    // 5. Update User XP and Level
    const newTotalXp = user.xp + xpEarned
    const newLevel = calculateLevel(newTotalXp)
    const levelUp = newLevel > user.level

    // Update Streak Logic (Basic implementation)
    const lastActive = new Date(user.lastActive)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 3600 * 24))
    
    let newStreak = user.streakDays
    if (diffDays === 1) {
      newStreak += 1
    } else if (diffDays > 1) {
      newStreak = 1 // Reset streak if missed a day
    }

    // 6. Check for New Badges
    const newlyUnlockedBadges: any[] = []
    
    // Evaluate triggers
    for (const badgeDef of BADGE_DEFINITIONS) {
      const alreadyHasBadge = user.badges.some(ub => ub.badgeId === badgeDef.id)
      if (alreadyHasBadge) continue

      let unlocked = false
      if (badgeDef.trigger === 'FIRST_QUEST') {
        unlocked = user.progress.length === 0 // This is the first quest they just completed
      } else if (badgeDef.trigger === 'PERFECT_SCORE' && score === 100) {
        unlocked = true
      } else if (badgeDef.trigger === 'STREAK_3' && newStreak >= 3) {
        unlocked = true
      } else if (badgeDef.trigger === 'LEVEL_5' && newLevel >= 5) {
        unlocked = true
      } else if (badgeDef.trigger === 'ALL_SUBJECTS') {
         // simplified check
         unlocked = user.progress.length > 5
      }

      if (unlocked) {
        newlyUnlockedBadges.push(badgeDef)
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badgeDef.id
          }
        })
      }
    }

    // 7. Save User Updates
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
        streakDays: newStreak,
        lastActive: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      xpEarned,
      starsEarned,
      levelUp,
      newLevel,
      badgesUnlocked: newlyUnlockedBadges.map(b => ({
        id: b.id,
        name: b.name,
        icon: b.icon
      }))
    })

  } catch (error) {
    console.error('Quest submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
