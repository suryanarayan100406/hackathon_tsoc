import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/teacher/quests — list subjects + units for the teacher's grade selections
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const grade = parseInt(searchParams.get('grade') || '8')

  const subjects = await prisma.subject.findMany({
    orderBy: { order: 'asc' },
    include: {
      units: {
        where: { grade },
        orderBy: { order: 'asc' },
        include: { quests: { orderBy: { order: 'asc' } } },
      },
    },
  })

  return NextResponse.json({ subjects })
}

// POST /api/teacher/quests — create a new quest (optionally with new unit)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacherId = (session.user as any).id
    const body = await req.json()
    const { subjectSlug, unitName, unitId, grade, title, type, difficulty, xpReward, timeLimit, questions } = body

    if (!title || !subjectSlug || !grade) {
      return NextResponse.json({ error: 'title, subjectSlug and grade are required' }, { status: 400 })
    }

    // Resolve or create unit
    let resolvedUnitId = unitId
    if (!resolvedUnitId && unitName) {
      const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } })
      if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })

      const existingUnit = await prisma.unit.findFirst({
        where: { name: unitName, grade: parseInt(grade), subjectId: subject.id },
      })
      if (existingUnit) {
        resolvedUnitId = existingUnit.id
      } else {
        const lastUnit = await prisma.unit.findFirst({
          where: { subjectId: subject.id, grade: parseInt(grade) },
          orderBy: { order: 'desc' },
        })
        const newUnit = await prisma.unit.create({
          data: { name: unitName, grade: parseInt(grade), order: (lastUnit?.order ?? 0) + 1, subjectId: subject.id },
        })
        resolvedUnitId = newUnit.id
      }
    }

    if (!resolvedUnitId) {
      return NextResponse.json({ error: 'Provide either unitId or unitName' }, { status: 400 })
    }

    const lastQuest = await prisma.quest.findFirst({ where: { unitId: resolvedUnitId }, orderBy: { order: 'desc' } })

    const quest = await prisma.quest.create({
      data: {
        title,
        type: type || 'QUIZ',
        difficulty: difficulty || 'EASY',
        xpReward: parseInt(xpReward) || 50,
        timeLimit: parseInt(timeLimit) || 300,
        order: (lastQuest?.order ?? 0) + 1,
        unitId: resolvedUnitId,
        createdBy: teacherId,
        content: JSON.stringify({ questions: questions || [] }),
      },
    })

    return NextResponse.json({ success: true, quest })
  } catch (error) {
    console.error('Teacher quest creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
