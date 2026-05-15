import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { calculateStars, getLevelInfo, BADGE_DEFINITIONS } from '@/lib/gamification'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    // score = number of correct answers, totalQuestions = total
    const { score: rawScore, totalQuestions, timeSpent } = body

    const total = totalQuestions ?? 1
    const correct = rawScore ?? 0

    // 1. Fetch Quest
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: { unit: { include: { subject: true } } }
    })
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    // 2. Fetch User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
        progress: { include: { quest: { include: { unit: { include: { subject: true } } } } } }
      }
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // 3. Calculate stars and XP
    const stars = calculateStars(correct, total)
    const streakMultiplier = user.streakDays >= 7 ? 1.5 : user.streakDays >= 3 ? 1.25 : 1
    const baseXP = Math.round(quest.xpReward * (correct / total))
    const xpEarned = Math.max(10, Math.round(baseXP * (1 + stars * 0.25) * streakMultiplier))

    // 4. Upsert progress — only improve score, never decrease
    const existing = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId, questId: id } }
    })

    await prisma.questProgress.upsert({
      where: { userId_questId: { userId, questId: id } },
      update: {
        score: Math.max(correct, existing?.score ?? 0),
        stars: Math.max(stars, existing?.stars ?? 0),
        xpEarned: xpEarned,
        completedAt: new Date(),
      },
      create: { userId, questId: id, score: correct, stars, xpEarned }
    })

    // 5. Update User XP, level, streak
    const newXP = user.xp + (existing ? 0 : xpEarned) // Only grant XP on first completion
    const { current: currentLevel } = getLevelInfo(user.xp)
    const { current: newLevelInfo } = getLevelInfo(newXP)
    const leveledUp = newLevelInfo.level > currentLevel.level

    const lastActive = user.lastActive ? new Date(user.lastActive) : null
    const now = new Date()
    const diffDays = lastActive
      ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24))
      : 999
    const newStreak = diffDays === 1 ? user.streakDays + 1 : diffDays === 0 ? user.streakDays : 1

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXP, level: newLevelInfo.level, streakDays: newStreak, lastActive: now }
    })

    // 6. Badge unlocking
    const newBadges: any[] = []
    const allBadgesInDB = await prisma.badge.findMany()
    const userBadgeTriggers = user.badges.map(ub => ub.badge.trigger)

    const allProgress = [
      ...user.progress,
      ...(existing ? [] : [{ quest }]) // include this quest if first time
    ]
    const subjectSlugsCompleted = new Set(
      allProgress.map((p: any) => p.quest?.unit?.subject?.slug).filter(Boolean)
    )
    const mathPerfect = allProgress.filter((p: any) =>
      p.quest?.unit?.subject?.slug === 'mathematics' && (p.score ?? 0) >= (p.quest?.content ? JSON.parse(p.quest.content as string)?.questions?.length : 1)
    ).length

    for (const badgeDef of BADGE_DEFINITIONS) {
      if (userBadgeTriggers.includes(badgeDef.trigger)) continue

      let unlocked = false
      switch (badgeDef.trigger) {
        case 'FIRST_QUEST':
          unlocked = user.progress.length === 0 && !existing
          break
        case 'LEVEL_2': unlocked = newLevelInfo.level >= 2; break
        case 'LEVEL_4': unlocked = newLevelInfo.level >= 4; break
        case 'STREAK_5': unlocked = newStreak >= 5; break
        case 'STREAK_7': unlocked = newStreak >= 7; break
        case 'STREAK_30': unlocked = newStreak >= 30; break
        case 'MATH_PERFECT_3': unlocked = mathPerfect >= 3; break
        case 'ALL_SUBJECTS': unlocked = subjectSlugsCompleted.size >= 5; break
        case 'STARS_10':
          unlocked = allProgress.reduce((sum: number, p: any) => sum + (p.stars ?? 0), 0) + stars >= 10
          break
        case 'DAILY_5':
          unlocked = allProgress.filter((p: any) => {
            const d = p.completedAt ? new Date(p.completedAt) : null
            return d && d.toDateString() === now.toDateString()
          }).length >= 4 // current quest is the 5th
          break
        case 'XP_10000': unlocked = newXP >= 10000; break
        case 'SPEED_60': unlocked = !!timeSpent && timeSpent <= 60; break
        case 'JOIN_SCHOOL': unlocked = !!user.schoolId; break
      }

      if (unlocked) {
        const badgeInDB = allBadgesInDB.find(b => b.trigger === badgeDef.trigger)
        if (badgeInDB) {
          await prisma.userBadge.create({ data: { userId, badgeId: badgeInDB.id } })
          newBadges.push({ badge: badgeInDB })
        }
      }
    }

    return NextResponse.json({
      success: true,
      score: correct,
      stars,
      xpEarned: existing ? 0 : xpEarned, // show 0 XP on retry
      leveledUp,
      streakMultiplier,
      badges: newBadges,
    })

  } catch (error) {
    console.error('Quest submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
