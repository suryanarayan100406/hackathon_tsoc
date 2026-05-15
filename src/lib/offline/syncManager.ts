import { syncOfflineProgress, getSyncStatus } from './progressSync'
import { cleanupOldCache } from './questCache'

let syncInProgress = false
let lastSyncTime = 0

// Callback function for sync events
let onSyncCallback: ((status: any) => void) | null = null

export function setSyncCallback(callback: (status: any) => void) {
  onSyncCallback = callback
}

// Emit sync status update
function emitSyncStatus(status: any) {
  if (onSyncCallback) {
    onSyncCallback(status)
  }
  // Also dispatch custom event
  window.dispatchEvent(new CustomEvent('vidyaquest:sync-status', { detail: status }))
}

// Attempt to sync, with debouncing
async function attemptSync() {
  if (syncInProgress) return
  if (Date.now() - lastSyncTime < 5000) return // Debounce: min 5s between syncs

  syncInProgress = true
  lastSyncTime = Date.now()

  try {
    emitSyncStatus({ status: 'syncing', message: 'Syncing progress...' })
    
    const result = await syncOfflineProgress()

    if (result.error) {
      emitSyncStatus({
        status: 'sync-failed',
        message: 'Sync failed, will retry later',
        error: result.message
      })
    } else if (result.synced > 0) {
      emitSyncStatus({
        status: 'synced',
        message: `✓ Synced ${result.synced} quest result${result.synced !== 1 ? 's' : ''}!`,
        count: result.synced
      })
    }

    // Cleanup old cache
    await cleanupOldCache()
  } catch (err) {
    console.error('[SyncManager] Error during sync:', err)
    emitSyncStatus({
      status: 'sync-error',
      message: 'An error occurred while syncing',
      error: err instanceof Error ? err.message : 'Unknown error'
    })
  } finally {
    syncInProgress = false
  }
}

// Initialize sync manager
export function initSyncManager() {
  console.log('[SyncManager] Initializing...')

  // Listen for online event
  window.addEventListener('online', () => {
    console.log('[SyncManager] Back online!')
    emitSyncStatus({ status: 'online', message: 'You are back online' })
    attemptSync()
  })

  // Listen for offline event
  window.addEventListener('offline', () => {
    console.log('[SyncManager] Going offline')
    emitSyncStatus({ status: 'offline', message: 'You are offline. Progress will sync when connected.' })
  })

  // Periodic sync attempt (every 60s if online)
  setInterval(() => {
    if (navigator.onLine) {
      attemptSync()
    }
  }, 60000)

  // Initial check
  if (!navigator.onLine) {
    emitSyncStatus({ status: 'offline', message: 'You are offline' })
  } else {
    getSyncStatus().then(status => {
      if (status.needsSync) {
        attemptSync()
      }
    })
  }
}

// Cleanup on logout
export function cleanupSyncManager() {
  onSyncCallback = null
  syncInProgress = false
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
}

// Manual sync trigger
export async function manualSync() {
  console.log('[SyncManager] Manual sync requested')
  await attemptSync()
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine
}

// Get current online status listener
export function onStatusChange(callback: (isOnline: boolean) => void) {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
