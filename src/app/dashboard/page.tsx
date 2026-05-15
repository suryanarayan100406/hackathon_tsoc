'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;background:#F0F4FF;color:#1E1B4B}
:root{--primary:#4F46E5;--primary-dark:#3730A3;--primary-light:#EEF2FF;--accent:#F59E0B;--success:#10B981;--danger:#EF4444;--purple:#8B5CF6;--bg:#F0F4FF;--card:#fff;--text:#1E1B4B;--muted:#6B7280;--border:#E5E7EB;--sidebar-w:260px;--ff:'Nunito',sans-serif;--ffd:'Baloo 2',cursive}
.sidebar{width:var(--sidebar-w);height:100vh;background:var(--card);border-right:1px solid var(--border);position:fixed;left:0;top:0;display:flex;flex-direction:column;z-index:100;box-shadow:0 4px 6px rgba(0,0,0,.07)}
.sidebar-logo{padding:1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px}
.logo-mark{width:42px;height:42px;background:linear-gradient(135deg,var(--primary),var(--purple));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#fff;font-weight:900;font-family:var(--ffd);flex-shrink:0;box-shadow:0 4px 12px rgba(79,70,229,.4)}
.logo-text{font-family:var(--ffd);font-weight:800;font-size:1.2rem;color:var(--primary)}
.logo-sub{font-size:.7rem;color:var(--muted);font-weight:600}
.sidebar-nav{padding:1rem 0;flex:1;overflow-y:auto}
.nav-lbl{padding:.5rem 1.5rem;font-size:.7rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.nav-item{display:flex;align-items:center;gap:12px;padding:11px 1.5rem;color:var(--muted);font-weight:600;font-size:.95rem;cursor:pointer;transition:all .15s;position:relative;text-decoration:none;border:none;background:none;width:100%;text-align:left}
.nav-item:hover,.nav-item.active{background:var(--primary-light);color:var(--primary)}
.nav-item.active::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:4px;background:var(--primary);border-radius:0 4px 4px 0}
.nav-icon{font-size:1.2rem;width:24px;text-align:center}
.sidebar-bottom{padding:1rem 1.5rem;border-top:1px solid var(--border)}
.user-mini{display:flex;align-items:center;gap:10px}
.avatar{width:36px;height:36px;background:linear-gradient(135deg,var(--primary),var(--purple));border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.85rem;flex-shrink:0}
.main{margin-left:var(--sidebar-w);padding:2rem;min-height:100vh}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem}
.page-header h1{font-family:var(--ffd);font-size:1.8rem}
.page-subtitle{color:var(--muted);font-size:.9rem;margin-top:.25rem}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:1.5rem}
.stat-card{background:var(--card);border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,.08);display:flex;align-items:center;gap:1rem;border:1px solid var(--border)}
.stat-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
.stat-value{font-family:var(--ffd);font-size:1.8rem;font-weight:800;line-height:1}
.stat-label{font-size:.78rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.card{background:var(--card);border-radius:20px;padding:1.5rem;box-shadow:0 4px 6px rgba(0,0,0,.07);transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-2px);box-shadow:0 10px 15px rgba(0,0,0,.1)}
.card-flat{box-shadow:none;border:1px solid var(--border)}
.xp-wrap{background:#e9ecef;border-radius:20px;height:12px;overflow:hidden}
.xp-bar{height:100%;background:linear-gradient(90deg,var(--primary),var(--purple));border-radius:20px;transition:width .8s cubic-bezier(.4,2,.6,1)}
.streak-badge{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;padding:6px 14px;border-radius:20px;font-weight:800;font-size:.9rem}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}
.subj-card{border-radius:20px;padding:1.5rem 1.25rem;display:flex;flex-direction:column;align-items:flex-start;gap:.75rem;cursor:pointer;transition:all .2s;color:#fff;box-shadow:0 10px 15px rgba(0,0,0,.1);text-decoration:none;border:none}
.subj-card:hover{transform:translateY(-4px) scale(1.02)}
.subj-icon{font-size:2.5rem}
.subj-title{font-family:var(--ffd);font-size:1.1rem;font-weight:800}
.subj-prog{font-size:.82rem;opacity:.85}
.subj-bar-wrap{width:100%;height:6px;background:rgba(255,255,255,.3);border-radius:10px;overflow:hidden}
.subj-bar{height:100%;background:rgba(255,255,255,.9);border-radius:10px;transition:width .8s}
.lb-item{display:flex;align-items:center;gap:1rem;padding:.875rem 1.25rem;border-radius:12px;transition:background .15s}
.lb-item:hover{background:var(--primary-light)}
.lb-item.me{background:var(--primary-light);border:2px solid var(--primary)}
.rank-badge{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.85rem;flex-shrink:0}
.r1{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff}
.r2{background:linear-gradient(135deg,#9ca3af,#6b7280);color:#fff}
.r3{background:linear-gradient(135deg,#b45309,#92400e);color:#fff}
.ro{background:#E5E7EB;color:var(--muted)}
.badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:1rem}
.badge-item{display:flex;flex-direction:column;align-items:center;gap:6px;padding:1rem;background:#fff;border-radius:12px;border:2px solid var(--border);text-align:center;transition:all .2s}
.badge-item.earned{border-color:var(--accent);background:linear-gradient(135deg,#fffbeb,#fef3c7)}
.badge-item.earned:hover{transform:scale(1.05) rotate(-2deg)}
.badge-item:not(.earned){opacity:.4;filter:grayscale(1)}
.badge-icon-big{font-size:2.2rem}
.badge-name{font-weight:800;font-size:.75rem}
.daily-card{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:20px;padding:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.9rem;padding:10px 22px;border-radius:10px;border:none;cursor:pointer;transition:all .2s;text-decoration:none}
.btn-primary{background:var(--primary);color:#fff;box-shadow:0 4px 0 var(--primary-dark)}
.btn-primary:hover{background:var(--primary-dark);transform:translateY(-1px)}
.btn-outline{background:transparent;border:2px solid var(--primary);color:var(--primary)}
.btn-outline:hover{background:var(--primary-light)}
.btn-danger{background:var(--danger);color:#fff}
.btn-sm{padding:7px 14px;font-size:.82rem;border-radius:8px}
.section-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.section-hdr h2{font-family:var(--ffd);font-size:1.3rem}
/* Subject drill-in */
.back-btn{display:inline-flex;align-items:center;gap:8px;color:var(--primary);font-weight:700;cursor:pointer;border:none;background:none;font-family:'Nunito',sans-serif;font-size:.95rem;margin-bottom:1.5rem;padding:8px 14px;border-radius:10px;border:2px solid var(--primary)}
.back-btn:hover{background:var(--primary-light)}
.unit-label{padding:.4rem 1rem;font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
.quest-item{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border-radius:14px;border:2px solid var(--border);background:var(--card);margin-bottom:.6rem;cursor:pointer;transition:all .2s}
.quest-item:hover{border-color:var(--primary);background:var(--primary-light);transform:translateX(4px)}
.quest-item.done{border-color:var(--success);background:#f0fdf4}
.quest-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
.pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:800}
.pill-easy{background:rgba(16,185,129,.12);color:#065f46}
.pill-medium{background:rgba(245,158,11,.12);color:#92400e}
.pill-hard{background:rgba(239,68,68,.12);color:#991b1b}
.pill-primary{background:var(--primary-light);color:var(--primary)}
@media(max-width:900px){.sidebar{display:none}.main{margin-left:0}.grid-4{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}}
`

const BADGES = [
  { id:'streak_7', icon:'🔥', name:'7-Day Learner' },
  { id:'xp_500',   icon:'🌟', name:'Rising Star' },
  { id:'xp_1000',  icon:'🏆', name:'Knowledge Hero' },
  { id:'first_quest', icon:'📝', name:'First Quest' },
]

const CHALLENGES = [
  { title:'Complete an Algebra Quest', desc:'Test your equation skills!', reward:'+100 XP' },
  { title:'Finish a Science Quest', desc:'Explore the natural world!', reward:'+120 XP' },
  { title:'Try a Tech Quest', desc:'Code your way to the top!', reward:'+150 XP' },
]

const SUBJ_COLORS: Record<string,string> = {
  default: 'linear-gradient(135deg,#6366f1,#4f46e5)',
}
function subjColor(color?: string) { return color || SUBJ_COLORS.default }

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState<'quests'|'leaderboard'|'badges'>('quests')
  const [selectedSubject, setSelectedSubject] = useState<string|null>(null)
  const [lb, setLb] = useState<any[]>([])
  const [lbLoading, setLbLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      if (role === 'TEACHER') router.push('/teacher')
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/student/dashboard').then(r => r.json()).then(setData).catch(console.error)
  }, [status])

  useEffect(() => {
    if (tab !== 'leaderboard' || lb.length) return
    setLbLoading(true)
    fetch('/api/student/leaderboard').then(r => r.json()).then(d => setLb(d.leaderboard || [])).finally(() => setLbLoading(false))
  }, [tab])

  if (status === 'loading' || !data) return (
    <>
      <style>{CSS}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F0F4FF'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem',animation:'spin 1s linear infinite'}}>⚡</div>
          <p style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.2rem',color:'#4F46E5',fontWeight:800}}>Loading...</p>
        </div>
      </div>
    </>
  )

  const user = data.user || {}
  const subjects = data.subjects || []
  const badges = data.badges || []
  const stats = data.stats || {}
  const xp = user.xp || 0
  const level = Math.floor(xp / 1000)
  const xpInLevel = xp % 1000
  const xpPct = Math.min((xpInLevel / 1000) * 100, 100)
  const name = user.name || session?.user?.name || 'Student'
  const uid = (session?.user as any)?.id
  const challenge = CHALLENGES[new Date().getDay() % CHALLENGES.length]
  const earnedIds = badges.map((b: any) => b.badge?.slug || b.badge?.name || b.slug || b.name)
  const myRank = lb.findIndex((e: any) => e.userId === uid) + 1

  const subj = subjects.find((s: any) => s.id === selectedSubject)

  const diffPill = (d: string) => {
    if (d === 'EASY') return 'pill pill-easy'
    if (d === 'MEDIUM') return 'pill pill-medium'
    return 'pill pill-hard'
  }

  return (
    <>
      <style>{CSS}</style>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">VQ</div>
          <div>
            <div className="logo-text">VidyaQuest</div>
            <div className="logo-sub">Student Portal</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-lbl">MAIN</div>
          <button className={`nav-item${tab==='quests'?' active':''}`} onClick={() => { setTab('quests'); setSelectedSubject(null) }}>
            <span className="nav-icon">🏠</span> Dashboard
          </button>
          <button className={`nav-item${tab==='leaderboard'?' active':''}`} onClick={() => setTab('leaderboard')}>
            <span className="nav-icon">🏆</span> Leaderboard
          </button>
          <button className={`nav-item${tab==='badges'?' active':''}`} onClick={() => setTab('badges')}>
            <span className="nav-icon">🌸</span> Badges
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{fontWeight:700,fontSize:'.9rem'}}>{name}</div>
              <div style={{fontSize:'.75rem',color:'var(--muted)'}}>Grade {user.grade}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{width:'100%',marginTop:'.75rem'}} onClick={() => signOut({ callbackUrl:'/login' })}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {name.split(' ')[0]}! ☀️
            </h1>
            <p className="page-subtitle">Grade {user.grade} · VidyaQuest</p>
          </div>
          <div className="streak-badge">🔥 {user.streakDays || 0} days</div>
        </div>

        {/* Stats Row */}
        <div className="grid-4">
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#eef2ff',color:'#4F46E5'}}>⚡</div>
            <div><div className="stat-value">{xp.toLocaleString()}</div><div className="stat-label">XP Points</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#fff7ed',color:'#ea580c'}}>🔥</div>
            <div><div className="stat-value">{user.streakDays || 0}</div><div className="stat-label">Day Streak</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#f0fdf4',color:'#10B981'}}>⭐</div>
            <div><div className="stat-value">{stats.totalStars || 0}</div><div className="stat-label">Stars Earned</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#fdf4ff',color:'#8B5CF6'}}>🎯</div>
            <div><div className="stat-value">{myRank > 0 ? '#'+myRank : '#-'}</div><div className="stat-label">Rank</div></div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <div>
              <h3 style={{fontFamily:"'Baloo 2',cursive"}}>Level {level} Progress</h3>
              <p style={{color:'var(--muted)',fontSize:'.85rem',marginTop:'.25rem'}}>{xpInLevel} / 1000 XP to Level {level+1}</p>
            </div>
            <span className="pill pill-primary" style={{fontSize:'.85rem',padding:'6px 14px'}}>Lv. {level}</span>
          </div>
          <div className="xp-wrap"><div className="xp-bar" style={{width:`${xpPct}%`}}/></div>
        </div>

        {/* Daily Challenge */}
        <div className="daily-card">
          <div>
            <div style={{fontSize:'.78rem',fontWeight:700,opacity:.8,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'.5rem'}}>Today's Mission</div>
            <h2 style={{fontSize:'1.1rem',marginBottom:'.4rem',fontFamily:"'Baloo 2',cursive"}}>{challenge.title}</h2>
            <p style={{opacity:.85,fontSize:'.88rem'}}>{challenge.desc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:'1.8rem',fontWeight:900,fontFamily:"'Baloo 2',cursive"}}>{challenge.reward}</div>
            <button className="btn btn-sm" style={{background:'rgba(255,255,255,.2)',color:'#fff',border:'1px solid rgba(255,255,255,.4)',marginTop:'.5rem'}}
              onClick={() => { setTab('quests'); setSelectedSubject(null) }}>Start Now! →</button>
          </div>
        </div>

        {/* ── QUESTS TAB ── */}
        {tab === 'quests' && !selectedSubject && (
          <div>
            <div className="section-hdr"><h2>📚 Subjects</h2></div>
            <div className="grid-2" style={{gap:'1rem'}}>
              {subjects.map((s: any) => {
                const total = s.units.reduce((n: number, u: any) => n + u.quests.length, 0)
                const done  = s.units.reduce((n: number, u: any) => n + u.quests.filter((q: any) => !!q.progress).length, 0)
                const pct = total > 0 ? Math.round((done/total)*100) : 0
                return (
                  <button key={s.id} className="subj-card" style={{background: subjColor(s.color)}} onClick={() => setSelectedSubject(s.id)}>
                    <div className="subj-icon">{s.icon}</div>
                    <div className="subj-title">{s.name}</div>
                    <div className="subj-prog">{total} quests · {pct}% done</div>
                    <div className="subj-bar-wrap"><div className="subj-bar" style={{width:`${pct}%`}}/></div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SUBJECT DRILL-IN ── */}
        {tab === 'quests' && selectedSubject && subj && (
          <div>
            <button className="back-btn" onClick={() => setSelectedSubject(null)}>← Back to Subjects</button>
            <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
              <span style={{fontSize:'2.5rem'}}>{subj.icon}</span>
              <div>
                <h2 style={{fontFamily:"'Baloo 2',cursive"}}>{subj.name}</h2>
                <p style={{color:'var(--muted)',fontSize:'.88rem'}}>{subj.units.reduce((n: number, u: any) => n+u.quests.length, 0)} quests across {subj.units.length} units</p>
              </div>
            </div>
            {subj.units.map((unit: any) => (
              <div key={unit.id} style={{marginBottom:'1.5rem'}}>
                <div className="unit-label">📂 {unit.name}</div>
                {unit.quests.map((q: any) => {
                  const done = !!q.progress
                  const stars = q.progress?.stars ?? 0
                  return (
                    <div key={q.id} className={`quest-item${done?' done':''}`} onClick={() => router.push(`/quests/${q.id}`)}>
                      <div className="quest-icon" style={{background: done ? 'rgba(16,185,129,.12)' : '#EEF2FF'}}>
                        {done ? '✅' : q.type === 'QUIZ' ? '📝' : q.type === 'MATCH_PAIRS' ? '🃏' : '🎯'}
                      </div>
                      <div style={{flex:1}}>
                        <p style={{fontWeight:700,fontSize:'.95rem'}}>{q.title}</p>
                        <div style={{display:'flex',gap:'.5rem',marginTop:'.25rem',alignItems:'center'}}>
                          <span className={diffPill(q.difficulty)}>{q.difficulty}</span>
                          <span style={{fontSize:'.78rem',color:'var(--muted)'}}>+{q.xpReward} XP</span>
                          {done && <span style={{fontSize:'.78rem'}}>{'⭐'.repeat(stars)}</span>}
                        </div>
                      </div>
                      <span style={{color:'var(--muted)',fontSize:'1.2rem'}}>›</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === 'leaderboard' && (
          <div>
            <div className="section-hdr"><h2>🏆 Leaderboard</h2></div>
            <div className="card card-flat">
              {lbLoading ? (
                <p style={{textAlign:'center',padding:'2rem',color:'var(--muted)'}}>Loading...</p>
              ) : lb.length === 0 ? (
                <p style={{textAlign:'center',padding:'2rem',color:'var(--muted)'}}>No data yet. Be the first!</p>
              ) : lb.map((e: any, i: number) => {
                const isMe = e.userId === uid
                const rankCls = i===0?'r1':i===1?'r2':i===2?'r3':'ro'
                const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':null
                return (
                  <div key={e.userId} className={`lb-item${isMe?' me':''}`}>
                    <div className={`rank-badge ${rankCls}`}>{medal || i+1}</div>
                    <div className="avatar">{(e.name||'?').charAt(0)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700}}>{e.name || 'Student'} {isMe && <span className="pill pill-primary">You</span>}</div>
                      <div style={{fontSize:'.8rem',color:'var(--muted)'}}>Grade {e.grade || '-'}</div>
                    </div>
                    <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:'var(--primary)'}}>{(e.xp||0).toLocaleString()} XP</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {tab === 'badges' && (
          <div>
            <div className="section-hdr"><h2>🌸 My Badges</h2><span style={{color:'var(--muted)',fontSize:'.88rem'}}>{badges.length} earned</span></div>
            <div className="card">
              <div className="badge-grid">
                {BADGES.map(b => {
                  const earned = earnedIds.includes(b.id)
                  return (
                    <div key={b.id} className={`badge-item${earned?' earned':''}`}>
                      <div className="badge-icon-big">{b.icon}</div>
                      <div className="badge-name">{b.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
