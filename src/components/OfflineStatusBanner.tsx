'use client'

import { useEffect, useState } from 'react'
import { onStatusChange } from '@/lib/offline/syncManager'

export function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const cleanup = onStatusChange((online) => {
      setIsOnline(online)
    })

    return cleanup
  }, [])

  if (!mounted || isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800 z-50">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
        <span>You are offline. Your progress will be synced when you reconnect.</span>
      </div>
    </div>
  )
}
