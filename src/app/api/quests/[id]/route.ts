import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questId = params.id

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Parse content JSON string into an object
    let content = {}
    try {
      if (quest.content && typeof quest.content === 'string') {
        content = JSON.parse(quest.content)
      }
    } catch (e) {
      console.warn('Failed to parse quest content', e)
    }

    return NextResponse.json({
      quest: {
        id: quest.id,
        title: quest.title,
        type: quest.type,
        difficulty: quest.difficulty,
        xpReward: quest.xpReward,
        timeLimit: quest.timeLimit,
        content,
        unit: quest.unit,
      }
    })
  } catch (error) {
    console.error('Quest fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
