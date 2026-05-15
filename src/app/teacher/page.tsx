'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, ChevronDown, BookOpen, Trash2, Check } from 'lucide-react'

const GRADES = [6, 7, 8, 9, 10, 11, 12]
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
const TYPES = ['QUIZ', 'DRAG_DROP', 'NUMBER_NINJA', 'STORY', 'MATCH_PAIRS']

interface Subject { id: string; name: string; slug: string; icon: string; units: { id: string; name: string; quests: { id: string; title: string; difficulty: string; xpReward: number }[] }[] }

const emptyQuestion = () => ({ id: Date.now().toString(), question: '', options: ['', '', '', ''], correct: 0, explanation: '' })

export default function TeacherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grade, setGrade] = useState(8)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', icon: '📖', color: '#6366f1' })

  const [form, setForm] = useState({
    subjectSlug: '', unitId: '', unitName: '', title: '',
    type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300,
  })
  const [questions, setQuestions] = useState([emptyQuestion()])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'TEACHER') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch(`/api/teacher/quests?grade=${grade}`)
      .then(r => r.json())
      .then(d => setSubjects(d.subjects || []))
      .finally(() => setLoading(false))
  }, [grade, status])

  const handleSave = async () => {
    if (!form.title || !form.subjectSlug || (!form.unitId && !form.unitName)) {
      alert('Fill in Subject, Unit, and Quest Title')
      return
    }
    setSaving(true)
    const res = await fetch('/api/teacher/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, grade, questions }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setSaved(true)
      setShowForm(false)
      setForm({ subjectSlug: '', unitId: '', unitName: '', title: '', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300 })
      setQuestions([emptyQuestion()])
      setTimeout(() => setSaved(false), 3000)
      // Refresh list
      fetch(`/api/teacher/quests?grade=${grade}`).then(r => r.json()).then(d => setSubjects(d.subjects || []))
    } else {
      alert(data.error || 'Failed to save')
    }
  }

  const handleSaveSubject = async () => {
    if (!subjectForm.name) return alert('Name is required')
    setSaving(true)
    const res = await fetch('/api/teacher/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectForm),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setSaved(true)
      setShowSubjectForm(false)
      setSubjectForm({ name: '', icon: '📖', color: '#6366f1' })
      setTimeout(() => setSaved(false), 3000)
      fetch(`/api/teacher/quests?grade=${grade}`).then(r => r.json()).then(d => setSubjects(d.subjects || []))
    } else {
      alert(data.error || 'Failed to save subject')
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  const selectedSubject = subjects.find(s => s.slug === form.subjectSlug)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xl">👩‍🏫</span>
          <div>
            <p className="font-bold text-sm gradient-text">Teacher Dashboard</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session?.user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(6,214,160,0.15)', color: '#06d6a0' }}>
              <Check size={14} /> Saved!
            </motion.div>
          )}
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Grade Selector */}
        <div className="glass-card p-4 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Select Grade to Manage</p>
          <div className="flex gap-2 flex-wrap">
            {GRADES.map(g => (
              <button key={g} onClick={() => setGrade(g)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: grade === g ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: grade === g ? 'white' : 'var(--text-muted)',
                }}>
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Add Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => { setShowForm(!showForm); setShowSubjectForm(false) }}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 4px 20px rgba(255,107,53,0.3)' }}>
            <Plus size={18} /> Add Quest
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => { setShowSubjectForm(!showSubjectForm); setShowForm(false) }}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))', boxShadow: '0 4px 20px rgba(6,214,160,0.3)' }}>
            <Plus size={18} /> New Subject
          </motion.button>
        </div>

        {/* Subject Form */}
        <AnimatePresence>
          {showSubjectForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-card p-5 rounded-2xl space-y-4" style={{ border: '1px solid var(--border-color)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>📚 Create New Subject</h2>
              
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>NAME *</label>
                <input placeholder="e.g. History" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>ICON (Emoji)</label>
                  <input placeholder="📜" value={subjectForm.icon} onChange={e => setSubjectForm({ ...subjectForm, icon: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>THEME COLOR</label>
                  <input type="color" value={subjectForm.color} onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })}
                    className="w-full h-10 p-1 rounded-xl cursor-pointer"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
                </div>
              </div>

              <button onClick={handleSaveSubject} disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))' }}>
                {saving ? '⏳ Saving...' : '✅ Create Subject'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-card p-5 rounded-2xl space-y-4" style={{ border: '1px solid var(--border-color)' }}>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>📝 New Quest — Grade {grade}</h2>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>SUBJECT *</label>
                <select value={form.subjectSlug} onChange={e => setForm({ ...form, subjectSlug: e.target.value, unitId: '', unitName: '' })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.name}</option>)}
                </select>
              </div>

              {/* Unit */}
              {form.subjectSlug && (
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>UNIT *</label>
                  <select value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value, unitName: '' })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm mb-2"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    <option value="">-- Existing Unit --</option>
                    {selectedSubject?.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  {!form.unitId && (
                    <input placeholder="Or type new unit name..." value={form.unitName}
                      onChange={e => setForm({ ...form, unitName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                  )}
                </div>
              )}

              {/* Quest Details */}
              <input placeholder="Quest Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>TYPE</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>DIFFICULTY</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>XP REWARD</label>
                  <input type="number" value={form.xpReward} onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>QUESTIONS</label>
                  <button onClick={() => setQuestions([...questions, emptyQuestion()])}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                    <Plus size={12} /> Add Question
                  </button>
                </div>
                {questions.map((q, qi) => (
                  <div key={q.id} className="p-3 rounded-xl mb-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Q{qi + 1}</span>
                      {questions.length > 1 && (
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}>
                          <Trash2 size={12} style={{ color: 'var(--error, #ef476f)' }} />
                        </button>
                      )}
                    </div>
                    <input placeholder="Question text" value={q.question}
                      onChange={e => { const qs = [...questions]; qs[qi].question = e.target.value; setQuestions(qs) }}
                      className="w-full px-3 py-2 rounded-lg text-xs mb-2"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 mb-1">
                        <button onClick={() => { const qs = [...questions]; qs[qi].correct = oi; setQuestions(qs) }}
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                          style={{ borderColor: q.correct === oi ? '#06d6a0' : 'var(--border-color)', background: q.correct === oi ? '#06d6a0' : 'transparent' }}>
                          {q.correct === oi && <Check size={10} className="text-white" />}
                        </button>
                        <input placeholder={`Option ${oi + 1}`} value={opt}
                          onChange={e => { const qs = [...questions]; qs[qi].options[oi] = e.target.value; setQuestions(qs) }}
                          className="flex-1 px-2 py-1.5 rounded-lg text-xs"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                      </div>
                    ))}
                    <input placeholder="Explanation (optional)" value={q.explanation}
                      onChange={e => { const qs = [...questions]; qs[qi].explanation = e.target.value; setQuestions(qs) }}
                      className="w-full px-3 py-1.5 rounded-lg text-xs mt-1"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }} />
                  </div>
                ))}
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                {saving ? '⏳ Saving...' : '✅ Publish Quest'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Quests */}
        <div className="space-y-3">
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
            📚 Grade {grade} Quests
          </h2>
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : subjects.filter(s => s.units.some(u => u.quests.length > 0)).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No quests for Grade {grade} yet. Add one above!</p>
            </div>
          ) : subjects.map(subject => subject.units.filter(u => u.quests.length > 0).map(unit => (
            <div key={unit.id} className="glass-card p-4 rounded-2xl" style={{ border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{subject.icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{subject.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{unit.name}</p>
                </div>
              </div>
              {unit.quests.map(q => (
                <div key={q.id} className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{q.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: q.difficulty === 'EASY' ? 'rgba(6,214,160,0.15)' : q.difficulty === 'MEDIUM' ? 'rgba(255,209,102,0.15)' : 'rgba(239,71,111,0.15)',
                      color: q.difficulty === 'EASY' ? '#06d6a0' : q.difficulty === 'MEDIUM' ? '#ffd166' : '#ef476f'
                    }}>{q.difficulty}</span>
                    <span className="text-xs" style={{ color: 'var(--accent)' }}>+{q.xpReward}XP</span>
                  </div>
                </div>
              ))}
            </div>
          )))}
        </div>
      </div>
    </div>
  )
}
