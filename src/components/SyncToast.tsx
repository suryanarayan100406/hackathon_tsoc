'use client'

import { useEffect, useState } from 'react'
import { setSyncCallback } from '@/lib/offline/syncManager'

interface SyncNotification {
  id: string
  status: 'syncing' | 'synced' | 'sync-failed' | 'sync-error' | 'online' | 'offline'
  message: string
  timestamp: number
}

export function SyncToast() {
  const [notifications, setNotifications] = useState<SyncNotification[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleSyncStatus = (event: Event) => {
      const customEvent = event as CustomEvent
      const { status, message } = customEvent.detail

      // Don't show offline/online status as toast (banner handles this)
      if (status === 'offline' || status === 'online') {
        return
      }

      const id = `${Date.now()}-${Math.random()}`
      const notification: SyncNotification = {
        id,
        status,
        message,
        timestamp: Date.now()
      }

      setNotifications(prev => [...prev, notification])

      // Auto-remove after 4 seconds for success, 6 for error
      const timeout = (status === 'synced') ? 4000 : 6000
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, timeout)
    }

    setSyncCallback((status) => {
      handleSyncStatus(new CustomEvent('sync', { detail: status }))
    })

    window.addEventListener('vidyaquest:sync-status', handleSyncStatus)

    return () => {
      window.removeEventListener('vidyaquest:sync-status', handleSyncStatus)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 pointer-events-none max-w-sm z-40">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-white text-sm
            animate-in slide-in-from-bottom-2 fade-in duration-300
            ${
              notification.status === 'synced'
                ? 'bg-green-500'
                : notification.status === 'syncing'
                  ? 'bg-blue-500'
                  : 'bg-red-500'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {notification.status === 'syncing' && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {notification.status === 'synced' && (
              <span className="text-lg">✓</span>
            )}
            {(notification.status === 'sync-failed' || notification.status === 'sync-error') && (
              <span className="text-lg">⚠</span>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
