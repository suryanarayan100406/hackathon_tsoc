'use client'
import { useState, useRef } from 'react'

interface ContentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  subjects: any[]
  grade: number
  onSuccess: () => void
}

export default function ContentUploadModal({ isOpen, onClose, subjects, grade, onSuccess }: ContentUploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('PDF')
  const [subjectSlug, setSubjectSlug] = useState('')
  const [unitId, setUnitId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUnitsForSubject = (slug: string) => {
    const subject = subjects.find(s => s.slug === slug)
    return subject?.units || []
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title || !type || !unitId) {
      setMessage({ type: 'error', text: 'Title, type, and unit are required' })
      return
    }

    if (type !== 'LINK' && !file) {
      setMessage({ type: 'error', text: 'File upload required' })
      return
    }

    if (type === 'LINK' && !fileUrl) {
      setMessage({ type: 'error', text: 'URL required for link content' })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('type', type)
      formData.append('unitId', unitId)

      if (file) {
        formData.append('file', file)
      } else if (type === 'LINK') {
        formData.append('fileUrl', fileUrl)
      }

      const res = await fetch('/api/teacher/content', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload')
      }

      setMessage({ type: 'success', text: 'Content uploaded successfully!' })
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setType('PDF')
        setSubjectSlug('')
        setUnitId('')
        setFile(null)
        setFileUrl('')
        onClose()
        onSuccess()
      }, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error uploading content' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Upload Learning Content</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mathematics Chapter 5 Video"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the content..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Subject *</label>
              <select
                value={subjectSlug}
                onChange={(e) => {
                  setSubjectSlug(e.target.value)
                  setUnitId('')
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Unit *</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={!subjectSlug}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Unit</option>
                {getUnitsForSubject(subjectSlug).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Content Type *</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setFile(null)
                setFileUrl('')
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PDF">📄 PDF Document</option>
              <option value="DOCUMENT">📝 Word Document</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="AUDIO">🔊 Audio</option>
              <option value="LINK">🔗 External Link</option>
            </select>
          </div>

          {type === 'LINK' ? (
            <div>
              <label className="block text-sm font-semibold mb-1">URL/Link *</label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-1">Upload File (Max 100MB) *</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">📤</div>
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">{file?.name || 'No file selected'}</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
