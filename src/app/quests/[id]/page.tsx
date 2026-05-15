'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ScorePopup } from '@/components/ui/ScorePopup'
import { Check, X, ArrowRight, Home } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  explanation?: string
}

interface QuestData {
  id: string
  title: string
  type: string
  xpReward: number
  content: { questions: Question[] }
}

interface SubmitResult {
  success: boolean
  score: number
  stars: number
  xpEarned: number
  leveledUp: boolean
  badges: any[]
}

// ─── Shared submit helper ─────────────────────────────────────────────
async function submitQuest(questId: string, score: number, total: number) {
  const res = await fetch(`/api/quests/${questId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, totalQuestions: total, timeSpent: 60 }),
  })
  return res.json()
}

// ─── Victory Screen ───────────────────────────────────────────────────
function VictoryScreen({ result, total, onHome }: { result: SubmitResult; total: number; onHome: () => void }) {
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
      className="glass-card p-8 rounded-3xl max-w-md w-full text-center"
      style={{ border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
      <div className="text-6xl mb-4">{result.stars === 3 ? '🏆' : result.stars > 0 ? '⭐' : '😅'}</div>
      <h1 className="text-3xl font-bold mb-2 gradient-text">Quest Complete!</h1>
      <div className="flex justify-center gap-1 mb-6">
        {[1, 2, 3].map(star => (
          <motion.div key={star} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + star * 0.2 }} className="text-4xl"
            style={{ filter: star <= result.stars ? 'none' : 'grayscale(100%) opacity(30%)' }}>⭐</motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>SCORE</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.score} / {total}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>XP EARNED</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>+{result.xpEarned}</p>
        </div>
      </div>
      {result.leveledUp && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}
          className="mb-6 p-3 rounded-2xl font-bold text-lg" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--primary)' }}>
          🎉 Level Up!
        </motion.div>
      )}
      {result.badges?.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>NEW BADGES!</p>
          <div className="flex justify-center gap-3">
            {result.badges.map((b: any, i: number) => (
              <motion.div key={b.badge?.id || i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.2, type: 'spring' }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}>
                {b.badge?.icon}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <button onClick={onHome} className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
        <Home size={20} /> Back to Dashboard
      </button>
    </motion.div>
  )
}

// ─── QUIZ Engine ──────────────────────────────────────────────────────
function QuizEngine({ quest, onComplete }: { quest: QuestData; onComplete: (score: number) => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const questions = quest.content.questions
  const q = questions[index]
  const total = questions.length

  const check = () => { if (selected === null) return; setAnswered(true); if (selected === q.correct) setScore(s => s + 1) }
  const next = () => {
    if (index < total - 1) { setIndex(i => i + 1); setSelected(null); setAnswered(false) }
    else onComplete(score + (selected === q.correct ? 1 : 0))
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col justify-center">
        <p className="text-xs font-bold mb-6 text-center" style={{ color: 'var(--text-muted)' }}>Q{index + 1} of {total}</p>
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>{q.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.filter(Boolean).map((opt, idx) => {
                let style: any = { border: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }
                if (answered) {
                  if (idx === q.correct) style = { background: 'rgba(6,214,160,0.1)', border: '2px solid #06d6a0', color: '#06d6a0' }
                  else if (idx === selected) style = { background: 'rgba(239,71,111,0.1)', border: '2px solid #ef476f', color: '#ef476f' }
                  else style = { opacity: 0.5, border: '2px solid var(--border-color)' }
                } else if (idx === selected) style = { border: '2px solid var(--primary)', background: 'rgba(255,107,53,0.05)' }
                return (
                  <motion.button key={idx} whileHover={!answered ? { scale: 1.02 } : {}} whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => !answered && setSelected(idx)}
                    className="p-5 rounded-2xl text-lg font-semibold text-left flex items-center justify-between"
                    style={{ color: 'var(--text-primary)', ...style }}>
                    <span>{opt}</span>
                    {answered && idx === q.correct && <Check size={22} style={{ color: '#06d6a0' }} />}
                    {answered && idx === selected && idx !== q.correct && <X size={22} style={{ color: '#ef476f' }} />}
                  </motion.button>
                )
              })}
            </div>
            {answered && q.explanation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <span className="font-bold text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>EXPLANATION</span>
                {q.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="p-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="font-bold" style={{ color: answered ? (selected === q.correct ? '#06d6a0' : '#ef476f') : 'transparent' }}>
          {answered ? (selected === q.correct ? 'Awesome! ✨' : 'Not quite! 😅') : '.'}
        </div>
        {!answered ? (
          <button onClick={check} disabled={selected === null}
            className="px-10 py-3.5 rounded-2xl font-bold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>Check</button>
        ) : (
          <button onClick={next} className="px-10 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))' }}>
            {index < total - 1 ? 'Continue' : 'Finish'} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MATCH PAIRS Engine ───────────────────────────────────────────────
function MatchPairsEngine({ quest, onComplete }: { quest: QuestData; onComplete: (score: number) => void }) {
  const questions = quest.content.questions.slice(0, 6) // max 6 pairs
  const pairs = questions.map(q => ({ question: q.question, answer: q.options[q.correct] }))

  type Card = { id: string; text: string; type: 'q' | 'a'; pairIdx: number }
  const makeCards = (): Card[] => {
    const qs: Card[] = pairs.map((p, i) => ({ id: `q-${i}`, text: p.question, type: 'q', pairIdx: i }))
    const as: Card[] = pairs.map((p, i) => ({ id: `a-${i}`, text: p.answer, type: 'a', pairIdx: i }))
    return [...qs, ...as].sort(() => Math.random() - 0.5)
  }

  const [cards] = useState<Card[]>(makeCards)
  const [selected, setSelected] = useState<Card | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrong, setWrong] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)

  const tap = (card: Card) => {
    if (matched.includes(card.id) || wrong.includes(card.id)) return
    if (!selected) { setSelected(card); return }
    if (selected.id === card.id) { setSelected(null); return }
    if (selected.pairIdx === card.pairIdx && selected.type !== card.type) {
      setMatched(m => [...m, selected.id, card.id])
      setCorrectCount(c => c + 1)
      setSelected(null)
      if (matched.length + 2 === cards.length) setTimeout(() => onComplete(pairs.length), 600)
    } else {
      setWrong([selected.id, card.id])
      setTimeout(() => { setWrong([]); setSelected(null) }, 800)
    }
  }

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) onComplete(pairs.length)
  }, [matched])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Match the Pairs</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{correctCount} / {pairs.length} matched</p>
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {cards.map(card => {
          const isMatched = matched.includes(card.id)
          const isWrong = wrong.includes(card.id)
          const isSelected = selected?.id === card.id
          return (
            <motion.button key={card.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => tap(card)}
              className="p-4 rounded-2xl text-sm font-semibold text-center min-h-[80px] flex items-center justify-center"
              style={{
                border: isMatched ? '2px solid #06d6a0' : isWrong ? '2px solid #ef476f' : isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: isMatched ? 'rgba(6,214,160,0.1)' : isWrong ? 'rgba(239,71,111,0.1)' : isSelected ? 'rgba(255,107,53,0.08)' : 'var(--bg-secondary)',
                color: isMatched ? '#06d6a0' : isWrong ? '#ef476f' : 'var(--text-primary)',
                opacity: isMatched ? 0.7 : 1,
              }}>
              {card.text}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function QuestPlayer({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quest, setQuest] = useState<QuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  useEffect(() => {
    fetch(`/api/quests/${params.id}`)
      .then(r => r.json())
      .then(d => { if (d.quest) setQuest(d.quest); else alert('Quest not found') })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const handleComplete = async (score: number) => {
    if (!quest) return
    setIsFinished(true)
    setSubmitting(true)
    const total = quest.content.questions.length
    const data = await submitQuest(quest.id, score, total)
    setResult(data)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!quest || !quest.content?.questions?.length) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
      <p className="text-5xl">😕</p>
      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>This quest has no questions yet.</p>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-3 rounded-2xl font-bold text-white"
        style={{ background: 'var(--primary)' }}>Back to Dashboard</button>
    </div>
  )

  // Victory screen
  if (isFinished) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <ScorePopup show={!!result} xp={result?.xpEarned || 0} message={result?.leveledUp ? 'Level Up! 🎉' : 'Quest Complete!'} />
      {submitting ? (
        <p className="text-xl font-bold animate-pulse" style={{ color: 'var(--primary)' }}>Calculating rewards...</p>
      ) : result ? (
        <VictoryScreen result={result} total={quest.content.questions.length} onHome={() => router.push('/dashboard')} />
      ) : null}
    </div>
  )

  // Top bar (shared)
  const topBar = (
    <header className="sticky top-0 z-10 p-4 flex items-center gap-4"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
      <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
        <X size={20} />
      </button>
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{quest.title}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{quest.type.replace('_', ' ')}</p>
      </div>
      <div className="text-sm font-bold px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--primary)' }}>+{quest.xpReward} XP</div>
    </header>
  )

  // Dispatch to correct game engine
  if (quest.type === 'MATCH_PAIRS') return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {topBar}
      <MatchPairsEngine quest={quest} onComplete={handleComplete} />
    </div>
  )

  // Default: QUIZ (also covers DRAG_DROP, NUMBER_NINJA, STORY until they are built)
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {topBar}
      <QuizEngine quest={quest} onComplete={handleComplete} />
    </div>
  )
}
