'use client'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', grade: 9 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role
      router.push(role === 'TEACHER' ? '/teacher' : '/dashboard')
    }
  }, [status])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await signIn('credentials', { redirect: false, email: form.email, password: form.password })
    setLoading(false)
    if (res?.error) setError('Invalid email or password.')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, grade: form.grade })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Registration failed.')
    setSuccess('Account created! You can now log in.'); setMode('login')
  }

  const fill = (role: string) => {
    const map: any = { student: { email: 'ravi@dps.com', password: 'student123' }, teacher: { email: 'teacher@dps.com', password: 'teacher123' } }
    if (map[role]) setForm(f => ({ ...f, ...map[role] }))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Nunito',sans-serif;background:#F0F4FF;color:#1E1B4B}
        .auth-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 45%,#7c3aed 75%,#0891b2 100%);position:relative;overflow:hidden}
        .auth-card{background:#fff;border-radius:28px;padding:2.5rem;width:100%;max-width:440px;box-shadow:0 25px 50px rgba(0,0,0,.25);position:relative;z-index:1}
        .auth-logo{text-align:center;margin-bottom:1.5rem}
        .logo-icon{width:80px;height:80px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto .75rem;box-shadow:0 8px 24px rgba(79,70,229,.4)}
        h1.app-name{font-family:'Baloo 2',cursive;font-size:2rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .tagline{color:#6B7280;font-size:.8rem;letter-spacing:1.5px;font-weight:700;text-transform:uppercase;margin-top:.25rem}
        .demo-box{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.82rem}
        .demo-box h5{color:#92400e;font-size:.73rem;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.4rem;font-weight:800}
        .demo-row{display:flex;align-items:center;gap:6px;padding:2px 0;color:#6B7280;flex-wrap:wrap}
        .demo-row strong{color:#1E1B4B}
        .fill-btn{background:none;border:none;cursor:pointer;color:#4F46E5;font-weight:700;font-size:.75rem;padding:2px 8px;border-radius:4px;margin-left:auto}
        .fill-btn:hover{background:#EEF2FF}
        .form-group{margin-bottom:1.1rem}
        label{display:block;font-weight:700;margin-bottom:.4rem;font-size:.88rem}
        input,select{width:100%;padding:11px 14px;border:2px solid #E5E7EB;border-radius:12px;font-family:'Nunito',sans-serif;font-size:1rem;color:#1E1B4B;background:#fff;outline:none;transition:border-color .2s}
        input:focus,select:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.15)}
        .pw-wrap{position:relative}
        .pw-wrap input{padding-right:44px}
        .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:#6B7280;font-size:1.1rem;user-select:none}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.95rem;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;transition:all .2s;text-decoration:none;width:100%;margin-top:.5rem}
        .btn-primary{background:#4F46E5;color:#fff;box-shadow:0 4px 0 #3730A3}
        .btn-primary:hover{background:#3730A3;transform:translateY(-1px)}
        .btn-success{background:#10B981;color:#fff;box-shadow:0 4px 0 #059669}
        .btn-success:hover{background:#059669;transform:translateY(-1px)}
        .btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;box-shadow:none!important}
        .links{display:flex;justify-content:space-between;margin-top:1rem;font-size:.88rem}
        .links a{color:#4F46E5;cursor:pointer;font-weight:700}
        .links a:hover{text-decoration:underline}
        .alert-err{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:12px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.88rem;font-weight:600}
        .alert-ok{background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;border-radius:12px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.88rem;font-weight:600}
        .role-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;margin-bottom:1rem}
        .role-btn{padding:.75rem;border:2.5px solid #E5E7EB;border-radius:12px;cursor:pointer;text-align:center;font-weight:700;font-size:.85rem;background:#fff;transition:all .2s;width:100%}
        .role-btn.active{border-color:#4F46E5;background:#EEF2FF;color:#4F46E5}
        .feature-badges{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;position:relative;z-index:1}
        .fbadge{background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);color:#fff;padding:5px 12px;border-radius:20px;font-size:.73rem;font-weight:700}
        .shape{position:absolute;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
      `}</style>
      <div className="auth-wrapper" id="auth-wrapper">
        <div className="shape" style={{width:500,height:500,top:-150,right:-150}}/>
        <div className="shape" style={{width:300,height:300,bottom:-80,left:-80}}/>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-icon">⚡</div>
              <h1 className="app-name">VidyaQuest</h1>
              <p className="tagline">Learn · Play · Grow</p>
            </div>

            {error && <div className="alert-err">⚠️ {error}</div>}
            {success && <div className="alert-ok">✅ {success}</div>}

            {/* LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="demo-box">
                  <h5>🎯 Demo Accounts</h5>
                  <div className="demo-row">🎒 <strong>ravi@dps.com</strong> / student123 <button type="button" className="fill-btn" onClick={() => fill('student')}>Fill ↗</button></div>
                  <div className="demo-row">👩‍🏫 <strong>teacher@dps.com</strong> / teacher123 <button type="button" className="fill-btn" onClick={() => fill('teacher')}>Fill ↗</button></div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="you@school.edu" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="pw-wrap">
                    <input type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
                    <span className="pw-toggle" onClick={() => setShowPw(p=>!p)}>{showPw?'🙈':'👁'}</span>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                <div className="links">
                  <a onClick={() => { setMode('forgot'); setError(''); }}>Forgot Password?</a>
                  <a onClick={() => { setMode('signup'); setError(''); }}>New here? <strong>Sign Up →</strong></a>
                </div>
              </form>
            )}

            {/* SIGNUP */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>I am a...</label>
                  <div className="role-grid">
                    {[{v:'STUDENT',l:'🎒 Student'},{v:'TEACHER',l:'👩‍🏫 Teacher'}].map(r => (
                      <button key={r.v} type="button" className={`role-btn${form.role===r.v?' active':''}`} onClick={() => setForm(f=>({...f,role:r.v}))}>{r.l}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group"><label>Full Name</label><input type="text" placeholder="Priya Sharma" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required /></div>
                <div className="form-group"><label>Email</label><input type="email" placeholder="priya@school.edu" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required /></div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="pw-wrap">
                    <input type={showPw?'text':'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required minLength={6} />
                    <span className="pw-toggle" onClick={() => setShowPw(p=>!p)}>{showPw?'🙈':'👁'}</span>
                  </div>
                </div>
                {form.role === 'STUDENT' && (
                  <div className="form-group">
                    <label>Class</label>
                    <select value={form.grade} onChange={e => setForm(f=>({...f,grade:parseInt(e.target.value)}))}>
                      {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Class {g}</option>)}
                    </select>
                  </div>
                )}
                <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Creating...' : 'Create Account 🚀'}</button>
                <div className="links" style={{justifyContent:'center'}}>
                  <a onClick={() => { setMode('login'); setError(''); }}>← Back to Login</a>
                </div>
              </form>
            )}

            {/* FORGOT */}
            {mode === 'forgot' && (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:'.5rem'}}>🔑</div>
                <h3 style={{marginBottom:'.5rem',fontFamily:"'Baloo 2',cursive"}}>Forgot Password?</h3>
                <p style={{color:'#6B7280',fontSize:'.88rem',marginBottom:'1.5rem'}}>Please contact your teacher or admin to reset your password.</p>
                <div className="links" style={{justifyContent:'center'}}>
                  <a onClick={() => { setMode('login'); setError(''); }}>← Back to Login</a>
                </div>
              </div>
            )}
          </div>
          <div className="feature-badges">
            <span className="fbadge">🎮 Gamified Learning</span>
            <span className="fbadge">🏆 Leaderboards</span>
            <span className="fbadge">📴 Offline Support</span>
            <span className="fbadge">🌐 Hindi + English</span>
          </div>
        </div>
      </div>
    </>
  )
}
