'use client'

import { useEffect } from 'react'
import { initSyncManager, cleanupSyncManager } from '@/lib/offline/syncManager'
import { useSession } from 'next-auth/react'

export function ClientInit() {
  const { data: session } = useSession()

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('[App] Service Worker registered:', registration)
          
          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000)
        })
        .catch(error => {
          console.error('[App] Service Worker registration failed:', error)
        })
    }

    // Initialize sync manager
    if (session?.user?.id) {
      initSyncManager()
      console.log('[App] Sync manager initialized')
    }

    // Cleanup on unmount
    return () => {
      if (session?.user?.id) {
        cleanupSyncManager()
      }
    }
  }, [session?.user?.id])

  return null
}
