import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'

// DELETE /api/teacher/content/[id] — delete content
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacherId = (session.user as any).id
    const { id } = params

    // Find the content
    const content = await prisma.content.findUnique({ where: { id } })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Verify ownership
    if (content.createdBy !== teacherId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete file if it exists
    if (content.fileName) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', content.fileName)
        await unlink(filePath)
      } catch (err) {
        console.error('Error deleting file:', err)
      }
    }

    // Delete content record
    await prisma.content.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting content:', err)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}
