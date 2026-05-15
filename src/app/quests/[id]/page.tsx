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
  content: {
    questions: Question[]
  }
}

interface SubmitResult {
  success: boolean
  score: number
  stars: number
  xpEarned: number
  streakMultiplier: number
  leveledUp: boolean
  badges: any[]
}

export default function QuestPlayer({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quest, setQuest] = useState<QuestData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Game State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  
  // Result State
  const [isFinished, setIsFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  useEffect(() => {
    fetch(`/api/quests/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.quest) setQuest(d.quest)
        else alert('Quest not found')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSelect = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
  }

  const handleCheck = () => {
    if (selectedOption === null || !quest) return
    setIsAnswered(true)
    
    const currentQuestion = quest.content.questions[currentIndex]
    if (selectedOption === currentQuestion.correct) {
      setScore(s => s + 1)
      // Optional: Play a sound effect here
    }
  }

  const handleNext = async () => {
    if (!quest) return
    
    if (currentIndex < quest.content.questions.length - 1) {
      setCurrentIndex(c => c + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      // Finish Quest
      setIsFinished(true)
      setSubmitting(true)
      try {
        const res = await fetch(`/api/quests/${quest.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: score + (selectedOption === quest.content.questions[currentIndex].correct ? 1 : 0),
            totalQuestions: quest.content.questions.length,
            timeSpent: 60 // Mock time spent for now
          })
        })
        const data = await res.json()
        setResult(data)
      } catch (e) {
        console.error(e)
        alert('Failed to submit quest')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
    </div>
  )
  
  if (!quest) return null

  const totalQuestions = quest.content.questions.length
  const currentQuestion = quest.content.questions[currentIndex]
  const progress = ((currentIndex) / totalQuestions) * 100

  // -------------------- VICTORY SCREEN --------------------
  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <ScorePopup show={!!result} xp={result?.xpEarned || 0} message={result?.leveledUp ? 'Level Up! 🎉' : 'Quest Complete!'} />
        
        {submitting ? (
          <p className="text-xl font-bold animate-pulse" style={{ color: 'var(--primary)' }}>Calculating rewards...</p>
        ) : result ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: 'spring', delay: 0.2 }}
            className="glass-card p-8 rounded-3xl max-w-md w-full text-center"
            style={{ border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="text-6xl mb-4">
              {result.stars === 3 ? '🏆' : result.stars > 0 ? '⭐' : '😅'}
            </div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Quest Complete!</h1>
            
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3].map(star => (
                <motion.div 
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + (star * 0.2) }}
                  className="text-4xl"
                  style={{ filter: star <= result.stars ? 'none' : 'grayscale(100%) opacity(30%)' }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>SCORE</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.score} / {totalQuestions}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>XP EARNED</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>+{result.xpEarned}</p>
              </div>
            </div>

            {result.badges && result.badges.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>NEW BADGES UNLOCKED!</p>
                <div className="flex justify-center gap-3">
                  {result.badges.map((b: any, i: number) => (
                    <motion.div 
                      key={b.badge.id}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + (i*0.2), type: 'spring' }}
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl relative group"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}
                    >
                      {b.badge.icon}
                      <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {b.badge.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <Home size={20} /> Back to Dashboard
            </button>
          </motion.div>
        ) : null}
      </div>
    )
  }

  // -------------------- QUEST ENGINE --------------------
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <header className="p-4 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-8 h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div 
            className="h-full"
            style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
            initial={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
          {currentIndex + 1} / {totalQuestions}
        </div>
      </header>

      {/* Question Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx
                const isCorrect = idx === currentQuestion.correct
                
                let stateStyle = {}
                if (isAnswered) {
                  if (isCorrect) stateStyle = { background: 'rgba(6,214,160,0.1)', border: '2px solid #06d6a0', color: '#06d6a0' }
                  else if (isSelected) stateStyle = { background: 'rgba(239,71,111,0.1)', border: '2px solid #ef476f', color: '#ef476f' }
                  else stateStyle = { opacity: 0.5, border: '2px solid var(--border-color)' }
                } else if (isSelected) {
                  stateStyle = { border: '2px solid var(--primary)', background: 'rgba(255,107,53,0.05)' }
                } else {
                  stateStyle = { border: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(idx)}
                    className="p-5 rounded-2xl text-lg font-semibold text-left flex items-center justify-between transition-all"
                    style={{ color: 'var(--text-primary)', ...stateStyle }}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <Check size={24} style={{ color: '#06d6a0' }} />}
                    {isAnswered && isSelected && !isCorrect && <X size={24} style={{ color: '#ef476f' }} />}
                  </motion.button>
                )
              })}
            </div>
            
            {/* Explanation box */}
            {isAnswered && currentQuestion.explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 rounded-xl text-sm"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <span className="font-bold text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>EXPLANATION</span>
                {currentQuestion.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action Bar */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            {isAnswered && (
              <div className="font-bold text-lg" style={{ color: selectedOption === currentQuestion.correct ? '#06d6a0' : '#ef476f' }}>
                {selectedOption === currentQuestion.correct ? 'Awesome! ✨' : 'Not quite right. 😅'}
              </div>
            )}
          </div>
          
          {!isAnswered ? (
            <button 
              onClick={handleCheck}
              disabled={selectedOption === null}
              className="px-10 py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
            >
              Check Answer
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-10 py-3.5 rounded-2xl font-bold text-white transition-all flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent))' }}
            >
              {currentIndex < totalQuestions - 1 ? 'Continue' : 'Finish Quest'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
