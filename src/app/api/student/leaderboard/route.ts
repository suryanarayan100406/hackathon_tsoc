import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const grade = searchParams.get('grade')

    const where = grade ? { grade: parseInt(grade), role: 'STUDENT' as const } : { role: 'STUDENT' as const }

    const students = await prisma.user.findMany({
      where,
      orderBy: { xp: 'desc' },
      take: 20,
      select: {
        id: true, name: true, xp: true, level: true,
        streakDays: true, grade: true,
        _count: { select: { progress: true } },
      },
    })

    const currentUserId = (session.user as any).id

    return NextResponse.json({
      leaderboard: students.map((s, idx) => ({
        rank: idx + 1,
        id: s.id,
        name: s.name,
        xp: s.xp,
        level: s.level,
        streakDays: s.streakDays,
        grade: s.grade,
        questsDone: s._count.progress,
        isMe: s.id === currentUserId,
      }))
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
