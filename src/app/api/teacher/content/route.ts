import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await mkdir(uploadsDir, { recursive: true })
  } catch (err) {
    console.error('Error creating uploads directory:', err)
  }
}

// GET /api/teacher/content — list all content created by this teacher
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const grade = parseInt(searchParams.get('grade') || '8')
    const subjectSlug = searchParams.get('subjectSlug')

    const teacherId = (session.user as any).id

    let whereClause: any = {
      unit: {
        grade,
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

// POST /api/teacher/content — upload new content
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureUploadsDir()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const titleJson = formData.get('titleJson') as string
    const descJson = formData.get('descJson') as string
    const type = formData.get('type') as string
    const unitId = formData.get('unitId') as string
    const language = (formData.get('language') as string) || 'en'

    if (!title || !type || !unitId) {
      return NextResponse.json(
        { error: 'title, type, and unitId are required' },
        { status: 400 }
      )
    }

    const teacherId = (session.user as any).id

    // If file is provided, save it
    let fileName = ''
    let fileSize = 0
    let fileUrl = ''

    if (file && file.size > 0) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds 100MB' }, { status: 400 })
      }

      fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      fileSize = file.size

      const buffer = await file.arrayBuffer()
      const filePath = path.join(uploadsDir, fileName)

      await writeFile(filePath, Buffer.from(buffer))
      fileUrl = `/uploads/${fileName}`
    } else if (type === 'LINK') {
      // For links, the fileUrl is provided
      fileUrl = formData.get('fileUrl') as string
      if (!fileUrl) {
        return NextResponse.json({ error: 'fileUrl is required for LINK type' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'File upload required' }, { status: 400 })
    }

    // Create content record
    const content = await prisma.content.create({
      data: {
        title,
        description,
        titleJson: titleJson || JSON.stringify({ en: title }),
        descJson: descJson || JSON.stringify({ en: description }),
        type,
        fileUrl,
        fileName,
        fileSize,
        unitId,
        language,
        createdBy: teacherId,
      },
      include: { unit: { include: { subject: true } } },
    })

    return NextResponse.json({ success: true, content }, { status: 201 })
  } catch (err) {
    console.error('Error uploading content:', err)
    return NextResponse.json({ error: 'Failed to upload content' }, { status: 500 })
  }
}
