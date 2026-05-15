import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const unitId = formData.get('unitId') as string

    if (!file || !title || !unitId) {
      return NextResponse.json({ error: 'File, title, and unitId are required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filepath = path.join(process.cwd(), 'public/uploads', filename)
    await writeFile(filepath, buffer)

    let type = 'DOCUMENT'
    if (file.type.startsWith('video/')) type = 'VIDEO'
    else if (file.type.startsWith('audio/')) type = 'AUDIO'
    else if (file.type === 'application/pdf') type = 'PDF'

    const content = await prisma.content.create({
      data: {
        title,
        description: description || '',
        type,
        fileUrl: `/uploads/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        unitId,
        createdBy: (session.user as any).id,
      }
    })

    return NextResponse.json({ success: true, content })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
