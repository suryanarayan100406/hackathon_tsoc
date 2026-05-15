'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    setIsOffline(!navigator.onLine)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="sticky top-0 z-50 overflow-hidden"
        >
          <div
            className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium"
            style={{
              background: 'linear-gradient(90deg, var(--warning), var(--accent-dark))',
              color: '#1A1A2E',
            }}
          >
            <WifiOff size={16} />
            <span>You&apos;re offline — progress will sync when connected</span>
            <RefreshCw size={14} className="animate-spin opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
