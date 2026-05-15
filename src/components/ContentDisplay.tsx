'use client'

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
      icon: string
    }
  }
}

interface ContentDisplayProps {
  content: ContentItem[]
  filter?: string
}

const typeEmojis: { [key: string]: string } = {
  PDF: '📄',
  DOCUMENT: '📝',
  VIDEO: '🎥',
  AUDIO: '🔊',
  LINK: '🔗',
}

const typeColors: { [key: string]: string } = {
  PDF: 'bg-red-100 text-red-700',
  DOCUMENT: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-purple-100 text-purple-700',
  AUDIO: 'bg-orange-100 text-orange-700',
  LINK: 'bg-green-100 text-green-700',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

export default function ContentDisplay({ content, filter }: ContentDisplayProps) {
  const filteredContent = filter ? content.filter(c => c.type === filter) : content

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📚</div>
        <p className="text-gray-600">No content available yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredContent.map(item => (
        <div key={item.id} className="border rounded-lg hover:shadow-lg transition overflow-hidden">
          <div className={`p-3 ${typeColors[item.type] || 'bg-gray-100 text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeEmojis[item.type] || '📌'}</span>
              <span className="font-semibold text-sm">{item.type}</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            )}

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">{item.unit.subject.name}</span> - {item.unit.name}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatDate(item.createdAt)}</span>
                {item.fileSize > 0 && <span>{formatFileSize(item.fileSize)}</span>}
              </div>
            </div>

            <a
              href={item.fileUrl}
              target={item.type === 'LINK' ? '_blank' : undefined}
              download={item.type !== 'LINK' && item.fileName ? true : undefined}
              className="block w-full px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition text-sm font-semibold"
            >
              {item.type === 'VIDEO' && 'Watch Video'}
              {item.type === 'AUDIO' && 'Play Audio'}
              {item.type === 'PDF' && 'View PDF'}
              {item.type === 'DOCUMENT' && 'Download Document'}
              {item.type === 'LINK' && 'Open Link'}
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
