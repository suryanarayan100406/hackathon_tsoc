'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import TeacherContentManager from '@/components/TeacherContentManager'
import ContentUploadModal from '@/components/ContentUploadModal'

export default function TeacherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grade, setGrade] = useState(8)
  const [section, setSection] = useState('overview')
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [showQuestModal, setShowQuestModal] = useState(false)
  const [showSubjModal, setShowSubjModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [questions, setQuestions] = useState([emptyQ()])
  const [form, setForm] = useState({ subjectSlug: '', unitName: '', title: '', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300 })
  const [subjForm, setSubjForm] = useState({ name: '', icon: '📚', color: '#4f46e5' })
  const [showContentModal, setShowContentModal] = useState(false)
  const [contentForm, setContentForm] = useState({ title: '', description: '', unitId: '' })
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [content, setContent] = useState<any[]>([])
  const [contentLoading, setContentLoading] = useState(true)

  function emptyQ() { return { id: Math.random().toString(36).slice(2), question: '', options: ['', '', '', ''], correct: 0, explanation: '' } }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch(`/api/teacher/quests?grade=${grade}`).then(r => r.json()).then(d => setSubjects(d.subjects || [])).finally(() => setLoading(false))
  }, [grade, status])

  useEffect(() => {
    if (status !== 'authenticated') return
    setContentLoading(true)
    fetch(`/api/teacher/content?grade=${grade}`)
      .then(r => r.json())
      .then(d => setContent(d.content || []))
      .finally(() => setContentLoading(false))
  }, [grade, status])

  const totalQuests = subjects.reduce((n, s) => n + s.units.reduce((m: number, u: any) => m + u.quests.length, 0), 0)
  const name = (session?.user as any)?.name || 'Teacher'

  async function saveQuest() {
    if (!form.title || !form.subjectSlug) return setMsg({ type: 'err', text: 'Title and subject required.' })
    setSaving(true)
    const res = await fetch('/api/teacher/quests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, grade, questions }) })
    const d = await res.json(); setSaving(false)
    if (!res.ok) return setMsg({ type: 'err', text: d.error || 'Failed.' })
    setMsg({ type: 'ok', text: `Quest "${d.quest?.title}" published!` })
    setShowQuestModal(false); setForm({ subjectSlug: '', unitName: '', title: '', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300 }); setQuestions([emptyQ()])
    fetch(`/api/teacher/quests?grade=${grade}`).then(r => r.json()).then(d => setSubjects(d.subjects || []))
  }

  async function saveSubject() {
    if (!subjForm.name) return setMsg({ type: 'err', text: 'Name required.' })
    setSaving(true)
    const res = await fetch('/api/teacher/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...subjForm, grade }) })
    const d = await res.json(); setSaving(false)
    if (!res.ok) return setMsg({ type: 'err', text: d.error || 'Failed.' })
    setMsg({ type: 'ok', text: `Subject "${d.subject?.name}" created!` })
    setShowSubjModal(false); setSubjForm({ name: '', icon: '📚', color: '#4f46e5' })
    fetch(`/api/teacher/quests?grade=${grade}`).then(r => r.json()).then(d => setSubjects(d.subjects || []))
  }

  return (
    <>
      <link rel="stylesheet" href="/style.css" />
      <style>{`
        body{display:flex;min-height:100vh}
        .sidebar{background:#1e1b4b}
        .sidebar-logo{border-bottom:1px solid rgba(255,255,255,.08)}
        .logo-text{color:#fff;font-size:1.1rem}
        .logo-sub{color:#c7d2fe;font-size:.72rem}
        .nav-item{color:#c7d2fe;border-left:3px solid transparent}
        .nav-item:hover{background:rgba(255,255,255,.07);color:#fff}
        .nav-item.active{background:rgba(79,70,229,.35);color:#fff;border-left-color:#818cf8}
        .user-name{color:#fff}.user-role{color:#c7d2fe;font-size:.72rem}
        .grade-pills{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem}
        .gpill{padding:7px 16px;border-radius:20px;font-weight:700;font-size:.85rem;cursor:pointer;border:2px solid #e0e7ff;background:#fff;color:#6b7280;transition:all .2s}
        .gpill.active{background:#4f46e5;color:#fff;border-color:#4f46e5}
        .action-row{display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap}
        .subj-block{background:#fff;border-radius:16px;border:1px solid #e0e7ff;margin-bottom:1rem;overflow:hidden;box-shadow:0 4px 20px rgba(79,70,229,.08)}
        .subj-hdr{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;cursor:pointer}
        .subj-hdr:hover{background:#f8f9ff}
        .unit-lbl{padding:.3rem 1.25rem;font-size:.72rem;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:1px;background:#f0f4ff}
        .quest-row{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;border-top:1px solid #e0e7ff}
        .badge{display:inline-block;padding:.2rem .65rem;border-radius:999px;font-size:.75rem;font-weight:700}
        .badge-success{background:#d1fae5;color:#065f46}.badge-warning{background:#fef3c7;color:#92400e}.badge-primary{background:#e0e7ff;color:#3730a3}.badge-danger{background:#fee2e2;color:#991b1b}
        .stat-card{position:relative;overflow:hidden}
        .stat-card.blue::before{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:#4f46e5;opacity:.1}
        .stat-card.green::before{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:#10b981;opacity:.1}
        .stat-card.yellow::before{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:#f59e0b;opacity:.1}
        .stat-card.red::before{content:'';position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:#ef4444;opacity:.1}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem}
        .modal{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,.2)}
        .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .qblock{background:#f8f9ff;border-radius:12px;padding:1rem;margin-bottom:.75rem;border:1px solid #e0e7ff}
        label{display:block;font-weight:700;margin-bottom:.3rem;font-size:.85rem}
        input,select,textarea{width:100%;padding:9px 12px;border:2px solid #e0e7ff;border-radius:10px;font-family:inherit;font-size:.9rem;outline:none;margin-bottom:.6rem}
        input:focus,select:focus{border-color:#4f46e5}
        .alert-ok{background:#d1fae5;color:#065f46;border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.88rem;font-weight:600}
        .alert-err{background:#fee2e2;color:#991b1b;border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.88rem;font-weight:600}
        @media(max-width:768px){.sidebar{display:none}.main-content{margin-left:0 !important;padding:1rem}.fgrid{grid-template-columns:1fr}}
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar" style={{width:240,minHeight:'100vh',display:'flex',flexDirection:'column',position:'fixed',left:0,top:0,bottom:0,zIndex:100}}>
        <div className="sidebar-logo" style={{padding:'1.5rem 1.25rem',display:'flex',alignItems:'center',gap:'.75rem'}}>
          <div className="logo-mark" style={{width:40,height:40,background:'#4f46e5',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#fff'}}>VQ</div>
          <div><div className="logo-text">VidyaQuest</div><div className="logo-sub">Teacher Portal</div></div>
        </div>
        <nav style={{flex:1,padding:'1rem 0'}}>
          {[['overview','📊','Overview'],['courses','📚','My Quests'],['content','📂','Learning Content'],['students','👩‍🎓','Students']].map(([id,icon,label]) => (
            <div key={id} className={`nav-item${section===id?' active':''}`} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1.25rem',cursor:'pointer',fontWeight:600,fontSize:'.9rem',textDecoration:'none'}} onClick={() => setSection(id)}>
              <span>{icon}</span>{label}
            </div>
          ))}
          <div className="nav-item" style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1.25rem',cursor:'pointer',fontWeight:600,fontSize:'.9rem',color:'#c7d2fe',borderLeft:'3px solid transparent'}} onClick={() => { setMsg({type:'',text:''}); setShowQuestModal(true) }}>
            <span>➕</span>Add Quest
          </div>
          <div className="nav-item" style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1.25rem',cursor:'pointer',fontWeight:600,fontSize:'.9rem',color:'#c7d2fe',borderLeft:'3px solid transparent'}} onClick={() => { setMsg({type:'',text:''}); setShowContentModal(true) }}>
            <span>⬆️</span>Upload Content
          </div>
          <div className="nav-item" style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1.25rem',cursor:'pointer',fontWeight:600,fontSize:'.9rem',color:'#ef4444',borderLeft:'3px solid transparent'}} onClick={() => signOut({ callbackUrl:'/login' })}>
            <span>🚪</span>Logout
          </div>
        </nav>
        <div style={{padding:'1rem 1.25rem',borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'.75rem'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#4f46e5',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>{name.charAt(0)}</div>
          <div><div className="user-name">{name}</div><div className="user-role">Teacher</div></div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content" style={{marginLeft:240,flex:1,padding:'2rem',minHeight:'100vh'}}>
        {msg.text && <div className={msg.type==='ok'?'alert-ok':'alert-err'}>{msg.type==='ok'?'✅':'⚠️'} {msg.text}</div>}

        {/* Grade Selector */}
        <div className="grade-pills">
          {[6,7,8,9,10,11,12].map(g => <button key={g} className={`gpill${grade===g?' active':''}`} onClick={()=>setGrade(g)}>Grade {g}</button>)}
        </div>

        {/* OVERVIEW */}
        {section === 'overview' && (
          <>
            <div className="page-header">
              <div>
                <h1 style={{fontSize:'1.7rem',fontWeight:900}}>{new Date().getHours()<12?'Good Morning':'Good Afternoon'}, {name.split(' ')[0]}! 👋</h1>
                <p style={{color:'#6b7280',fontSize:'.9rem',marginTop:'.2rem'}}>Grade {grade} Dashboard</p>
              </div>
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => { setMsg({type:'',text:''}); setShowQuestModal(true) }}>+ Add Quest</button>
                <button className="btn btn-outline" onClick={() => { setMsg({type:'',text:''}); setShowSubjModal(true) }}>📚 New Subject</button>
              </div>
            </div>
            <div className="grid-4" style={{marginBottom:'1.5rem'}}>
              <div className="card stat-card blue"><div style={{fontSize:'2rem',marginBottom:'.5rem'}}>📚</div><div style={{fontSize:'2rem',fontWeight:900}}>{totalQuests}</div><div style={{color:'#6b7280',fontSize:'.85rem',fontWeight:600}}>Quests Published</div></div>
              <div className="card stat-card green"><div style={{fontSize:'2rem',marginBottom:'.5rem'}}>📂</div><div style={{fontSize:'2rem',fontWeight:900}}>{subjects.length}</div><div style={{color:'#6b7280',fontSize:'.85rem',fontWeight:600}}>Subjects</div></div>
              <div className="card stat-card yellow"><div style={{fontSize:'2rem',marginBottom:'.5rem'}}>🎯</div><div style={{fontSize:'2rem',fontWeight:900}}>Grade {grade}</div><div style={{color:'#6b7280',fontSize:'.85rem',fontWeight:600}}>Current Grade</div></div>
              <div className="card stat-card red"><div style={{fontSize:'2rem',marginBottom:'.5rem'}}>🏆</div><div style={{fontSize:'2rem',fontWeight:900}}>{subjects.reduce((n,s)=>n+s.units.length,0)}</div><div style={{color:'#6b7280',fontSize:'.85rem',fontWeight:600}}>Units</div></div>
            </div>
            <QuestList subjects={subjects} loading={loading} grade={grade} expandedSubject={expandedSubject} setExpandedSubject={setExpandedSubject} onAdd={() => { setMsg({type:'',text:''}); setShowQuestModal(true) }} />
          </>
        )}

        {section === 'courses' && (
          <>
            <div className="page-header"><div><h1 style={{fontSize:'1.7rem',fontWeight:900}}>My Quests</h1><p style={{color:'#6b7280',fontSize:'.9rem'}}>Published quests for Grade {grade}</p></div><button className="btn btn-primary" onClick={() => setShowQuestModal(true)}>+ New Quest</button></div>
            <QuestList subjects={subjects} loading={loading} grade={grade} expandedSubject={expandedSubject} setExpandedSubject={setExpandedSubject} onAdd={() => setShowQuestModal(true)} />
          </>
        )}

        {section === 'content' && (
          <>
            <div className="page-header"><div><h1 style={{fontSize:'1.7rem',fontWeight:900}}>Learning Content</h1><p style={{color:'#6b7280',fontSize:'.9rem'}}>Manage PDFs, videos, documents, audio & links for Grade {grade}</p></div><button className="btn btn-primary" onClick={() => { setMsg({type:'',text:''}); setShowContentModal(true) }}>⬆️ Upload Content</button></div>
            <TeacherContentManager content={content} onDelete={(id) => setContent(c => c.filter(ci => ci.id !== id))} loading={contentLoading} />
          </>
        )}

        {section === 'students' && (
          <>
            <div className="page-header"><div><h1 style={{fontSize:'1.7rem',fontWeight:900}}>My Students</h1><p style={{color:'#6b7280',fontSize:'.9rem'}}>Track progress and performance</p></div></div>
            <div className="card"><p style={{color:'#6b7280',textAlign:'center',padding:'2rem'}}>Student analytics coming soon. Quests and progress are tracked per student.</p></div>
          </>
        )}
      </main>

      {/* ADD QUEST MODAL */}
      {showQuestModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowQuestModal(false)}>
          <div className="modal">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontWeight:900}}>➕ Add New Quest</h2>
              <button style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#6b7280'}} onClick={()=>setShowQuestModal(false)}>✕</button>
            </div>
            {msg.text && <div className={msg.type==='ok'?'alert-ok':'alert-err'}>{msg.text}</div>}
            <div className="fgrid">
              <div><label>Subject</label>
                <select value={form.subjectSlug} onChange={e=>setForm(f=>({...f,subjectSlug:e.target.value}))}>
                  <option value="">— Select —</option>
                  {subjects.map(s=><option key={s.slug} value={s.slug}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div><label>Unit Name</label><input placeholder="e.g. Algebra Basics" value={form.unitName} onChange={e=>setForm(f=>({...f,unitName:e.target.value}))} /></div>
              <div style={{gridColumn:'1/-1'}}><label>Quest Title</label><input placeholder="e.g. Intro to Fractions" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
              <div><label>Type</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="QUIZ">📝 Quiz (MCQ)</option>
                  <option value="MATCH_PAIRS">🃏 Match Pairs</option>
                </select>
              </div>
              <div><label>Difficulty</label>
                <select value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}>
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <div><label>XP Reward</label><input type="number" value={form.xpReward} onChange={e=>setForm(f=>({...f,xpReward:+e.target.value||50}))} /></div>
              <div><label>Time Limit (sec)</label><input type="number" value={form.timeLimit} onChange={e=>setForm(f=>({...f,timeLimit:+e.target.value||300}))} /></div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'1rem 0 .75rem'}}>
              <label style={{margin:0}}>Questions ({questions.length})</label>
              <button className="btn btn-outline btn-sm" style={{width:'auto'}} onClick={()=>setQuestions(q=>[...q,emptyQ()])}>+ Add</button>
            </div>
            {questions.map((q,qi)=>(
              <div key={q.id} className="qblock">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.5rem'}}>
                  <label style={{margin:0}}>Q{qi+1}</label>
                  {questions.length>1&&<button style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontWeight:700,fontSize:'.82rem'}} onClick={()=>setQuestions(qs=>qs.filter((_,i)=>i!==qi))}>Remove</button>}
                </div>
                <input placeholder="Question text" value={q.question} onChange={e=>{const qs=[...questions];qs[qi].question=e.target.value;setQuestions(qs)}} />
                {q.options.map((opt,oi)=>(
                  <div key={oi} style={{display:'flex',gap:'.5rem',alignItems:'center',marginBottom:'.35rem'}}>
                    <input type="radio" name={`c${qi}`} checked={q.correct===oi} onChange={()=>{const qs=[...questions];qs[qi].correct=oi;setQuestions(qs)}} style={{width:'auto',margin:0}} />
                    <input placeholder={`Option ${String.fromCharCode(65+oi)}`} value={opt} onChange={e=>{const qs=[...questions];qs[qi].options[oi]=e.target.value;setQuestions(qs)}} style={{margin:0}} />
                  </div>
                ))}
                <input placeholder="Explanation (optional)" value={q.explanation} onChange={e=>{const qs=[...questions];qs[qi].explanation=e.target.value;setQuestions(qs)}} style={{marginTop:'.4rem',fontSize:'.85rem'}} />
              </div>
            ))}
            <button className="btn btn-success" disabled={saving} onClick={saveQuest} style={{width:'100%',marginTop:'.5rem'}}>{saving?'⏳ Publishing...':'✅ Publish Quest'}</button>
          </div>
        </div>
      )}

      {/* NEW SUBJECT MODAL */}
      {showSubjModal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowSubjModal(false)}>
          <div className="modal" style={{maxWidth:400}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontWeight:900}}>📚 New Subject</h2>
              <button style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#6b7280'}} onClick={()=>setShowSubjModal(false)}>✕</button>
            </div>
            {msg.text && <div className={msg.type==='ok'?'alert-ok':'alert-err'}>{msg.text}</div>}
            <label>Subject Name</label><input placeholder="e.g. History" value={subjForm.name} onChange={e=>setSubjForm(f=>({...f,name:e.target.value}))} />
            <label>Icon (emoji)</label><input placeholder="📜" value={subjForm.icon} onChange={e=>setSubjForm(f=>({...f,icon:e.target.value}))} />
            <label>Color</label><input type="color" value={subjForm.color} onChange={e=>setSubjForm(f=>({...f,color:e.target.value}))} style={{height:44,padding:4,cursor:'pointer'}} />
            <button className="btn btn-primary" disabled={saving} onClick={saveSubject} style={{width:'100%',marginTop:'.75rem'}}>{saving?'⏳ Creating...':'✅ Create Subject'}</button>
          </div>
        </div>
      )}

      {/* UPLOAD CONTENT MODAL */}
      <ContentUploadModal 
        isOpen={showContentModal} 
        onClose={() => setShowContentModal(false)} 
        subjects={subjects}
        grade={grade}
        onSuccess={() => fetch(`/api/teacher/content?grade=${grade}`).then(r => r.json()).then(d => setContent(d.content || []))}
      />
    </>
  )
}

function QuestList({ subjects, loading, grade, expandedSubject, setExpandedSubject, onAdd }: any) {
  if (loading) return <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}><div style={{width:40,height:40,border:'4px solid #e0e7ff',borderTopColor:'#4f46e5',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 1rem'}}/>Loading...</div>
  const active = subjects.filter((s: any) => s.units.some((u: any) => u.quests.length > 0))
  if (!active.length) return (
    <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📭</div>
      <p style={{fontWeight:700}}>No quests for Grade {grade} yet.</p>
      <button className="btn btn-primary" style={{marginTop:'1rem',width:'auto'}} onClick={onAdd}>Add First Quest</button>
    </div>
  )
  return (
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
        <h2 style={{fontWeight:800}}>📋 Grade {grade} Content</h2>
        <span style={{color:'#6b7280',fontSize:'.88rem'}}>{subjects.reduce((n:number,s:any)=>n+s.units.reduce((m:number,u:any)=>m+u.quests.length,0),0)} quests</span>
      </div>
      {active.map((subject: any) => (
        <div key={subject.id} className="subj-block">
          <div className="subj-hdr" onClick={()=>setExpandedSubject(expandedSubject===subject.id?null:subject.id)} style={{borderBottom:expandedSubject===subject.id?'1px solid #e0e7ff':'none'}}>
            <span style={{fontSize:'1.5rem'}}>{subject.icon}</span>
            <div style={{flex:1}}><p style={{fontWeight:800}}>{subject.name}</p><p style={{fontSize:'.8rem',color:'#6b7280'}}>{subject.units.reduce((t:number,u:any)=>t+u.quests.length,0)} quests</p></div>
            <span style={{color:'#6b7280'}}>{expandedSubject===subject.id?'▲':'▼'}</span>
          </div>
          {expandedSubject===subject.id && subject.units.filter((u:any)=>u.quests.length>0).map((unit:any)=>(
            <div key={unit.id}>
              <div className="unit-lbl">📂 {unit.name}</div>
              {unit.quests.map((q:any)=>(
                <div key={q.id} className="quest-row">
                  <span style={{fontWeight:600,fontSize:'.92rem'}}>{q.type==='QUIZ'?'📝':q.type==='MATCH_PAIRS'?'🃏':'🎯'} {q.title}</span>
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <span className={`badge ${q.difficulty==='EASY'?'badge-success':q.difficulty==='MEDIUM'?'badge-warning':'badge-danger'}`}>{q.difficulty}</span>
                    <span className="badge badge-primary">+{q.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
