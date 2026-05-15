import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET — list all subjects
export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const subjects = await prisma.subject.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ subjects })
}

// POST — create a new subject
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, icon, color } = await req.json()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const existing = await prisma.subject.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Subject with this name already exists' }, { status: 409 })

    const last = await prisma.subject.findFirst({ orderBy: { order: 'desc' } })
    const subject = await prisma.subject.create({
      data: {
        name,
        slug,
        icon: icon || '📖',
        color: color || '#6366f1',
        order: (last?.order ?? 0) + 1,
      },
    })

    return NextResponse.json({ success: true, subject })
  } catch (error) {
    console.error('Subject creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
