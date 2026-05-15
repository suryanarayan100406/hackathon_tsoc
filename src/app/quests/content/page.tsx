'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ContentDisplay from '@/components/ContentDisplay'

export default function StudentContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    
    setLoading(true)
    const query = new URLSearchParams()
    if (subjectFilter) query.append('subjectSlug', subjectFilter)
    
    fetch(`/api/student/content?${query}`).then(r => r.json()).then(d => setContent(d.content || [])).finally(() => setLoading(false))
  }, [status, subjectFilter])

  const subjects = Array.from(new Map(content.map(c => [c.unit.subject.slug, c.unit.subject])).values())
  const contentTypes = ['PDF', 'DOCUMENT', 'VIDEO', 'AUDIO', 'LINK']
  const filteredContent = typeFilter ? content.filter(c => c.type === typeFilter) : content

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fa',padding:'2rem 1rem'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div style={{marginBottom:'2rem'}}>
          <h1 style={{fontSize:'2rem',fontWeight:900,marginBottom:'.5rem'}}>📚 Learning Content</h1>
          <p style={{color:'#6b7280',fontSize:'.95rem'}}>Explore resources shared by your teacher</p>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap'}}>
          <div>
            <label style={{display:'block',fontSize:'.85rem',fontWeight:600,marginBottom:'.5rem',color:'#6b7280'}}>Subject</label>
            <select 
              value={subjectFilter} 
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{padding:'8px 12px',border:'2px solid #e0e7ff',borderRadius:'8px',outline:'none',fontWeight:500}}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{display:'block',fontSize:'.85rem',fontWeight:600,marginBottom:'.5rem',color:'#6b7280'}}>Type</label>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{padding:'8px 12px',border:'2px solid #e0e7ff',borderRadius:'8px',outline:'none',fontWeight:500}}
            >
              <option value="">All Types</option>
              <option value="PDF">📄 PDF</option>
              <option value="DOCUMENT">📝 Documents</option>
              <option value="VIDEO">🎥 Videos</option>
              <option value="AUDIO">🔊 Audio</option>
              <option value="LINK">🔗 Links</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div style={{textAlign:'center',padding:'3rem'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⏳</div>
            <p style={{color:'#6b7280'}}>Loading content...</p>
          </div>
        ) : (
          <ContentDisplay content={filteredContent} filter={typeFilter ? typeFilter : undefined} />
        )}
      </div>
    </div>
  )
}
