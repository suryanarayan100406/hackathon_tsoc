'use client'
import { useState } from 'react'

interface ContentItem {
  id: string
  title: string
  description: string
  type: string
  fileUrl: string
  fileName: string
  fileSize: number
  createdAt: string
  unit: {
    name: string
    subject: {
      name: string
    }
  }
}

interface TeacherContentManagerProps {
  content: ContentItem[]
  onDelete: (id: string) => void
  loading: boolean
}

const typeEmojis: { [key: string]: string } = {
  PDF: '📄',
  DOCUMENT: '📝',
  VIDEO: '🎥',
  AUDIO: '🔊',
  LINK: '🔗',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function TeacherContentManager({ content, onDelete, loading }: TeacherContentManagerProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/teacher/content/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onDelete(id)
      } else {
        alert('Failed to delete content')
      }
    } catch (err) {
      alert('Error deleting content')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-2">Loading content...</p>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-5xl mb-3">📚</div>
        <p className="text-gray-600">No content uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">Click "Upload Content" to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold">Type</th>
            <th className="px-4 py-3 text-left font-semibold">Unit / Subject</th>
            <th className="px-4 py-3 text-left font-semibold">Size</th>
            <th className="px-4 py-3 text-left font-semibold">Uploaded</th>
            <th className="px-4 py-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {content.map(item => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-1">{typeEmojis[item.type] || '📌'}</span>
                  <div className="flex-1">
                    <p className="font-semibold line-clamp-1">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  {item.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <p className="text-xs">{item.unit.subject.name}</p>
                <p className="text-xs text-gray-600">{item.unit.name}</p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                {formatFileSize(item.fileSize)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <a
                    href={item.fileUrl}
                    target={item.type === 'LINK' ? '_blank' : undefined}
                    title="Preview/Open"
                    className="inline-block px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-semibold transition"
                  >
                    👁️
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    title="Delete"
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition disabled:opacity-50"
                  >
                    {deleting === item.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
