import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/student/content — get content for student's grade and subjects
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    })

    if (!student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const subjectSlug = searchParams.get('subjectSlug')

    let whereClause: any = {
      unit: {
        grade: student.grade,
      },
    }

    if (subjectSlug) {
      whereClause.unit = {
        ...whereClause.unit,
        subject: {
          slug: subjectSlug,
        },
      }
    }

    const content = await prisma.content.findMany({
      where: whereClause,
      include: { unit: { include: { subject: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ content })
  } catch (err) {
    console.error('Error fetching content:', err)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
