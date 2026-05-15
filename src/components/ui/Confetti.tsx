'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { useEffect, useState } from 'react'

const CONFETTI_COLORS = ['#FF6B35', '#2EC4B6', '#FFE066', '#06D6A0', '#EF476F', '#9B5DE5', '#00BBF9']

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 2 + Math.random() * 2
  const size = 6 + Math.random() * 8
  const rotation = Math.random() * 720

  return (
    <motion.div
      className="fixed z-[100] pointer-events-none"
      style={{
        left: `${left}%`,
        top: -20,
        width: size,
        height: size * (Math.random() > 0.5 ? 1 : 2.5),
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: '110vh',
        rotate: rotation,
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'linear',
      }}
    />
  )
}

export function Confetti() {
  const showConfetti = useGameStore((s) => s.showConfetti)
  const [pieces, setPieces] = useState<number[]>([])

  useEffect(() => {
    if (showConfetti) {
      setPieces(Array.from({ length: 60 }, (_, i) => i))
    } else {
      setPieces([])
    }
  }, [showConfetti])

  return (
    <AnimatePresence>
      {showConfetti && pieces.map((i) => <ConfettiPiece key={i} index={i} />)}
    </AnimatePresence>
  )
}
