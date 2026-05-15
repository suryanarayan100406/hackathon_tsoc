import { offlineDB, updateUserStateCache } from './db'

// Calculate XP based on score
function calculateXPLocally(data: { score: number; totalQuestions: number }): number {
  const percentage = (data.score / data.totalQuestions) * 100
  
  if (percentage >= 90) return 100
  if (percentage >= 75) return 75
  if (percentage >= 60) return 50
  if (percentage >= 50) return 25
  return 0
}

// Save progress locally (called when completing a quest offline)
export async function saveProgressOffline(data: {
  questId: string
  score: number
  totalQuestions: number
  timeSpent: number
  userId: string
}) {
  try {
    // Add to offline progress table
    const id = await offlineDB.progress.add({
      questId: data.questId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      timeSpent: data.timeSpent,
      completedAt: new Date(),
      synced: false
    })

    // Update local user state (XP)
    const xpEarned = calculateXPLocally(data)
    await updateUserStateCache(data.userId, {
      xp: (await offlineDB.userState.get(`user_${data.userId}`))?.xp || 0 + xpEarned
    })

    console.log(`[Offline] Saved progress for quest ${data.questId}, earned ${xpEarned} XP`)
    return { id, xpEarned }
  } catch (err) {
    console.error('Error saving offline progress:', err)
    throw err
  }
}

// Get unsynced progress
export async function getUnsyncedProgress() {
  try {
    const allProgress = await offlineDB.progress.toArray()
    return allProgress.filter(p => !p.synced)
  } catch (err) {
    console.error('Error fetching unsynced progress:', err)
    return []
  }
}

// Sync all unsynced progress when online
export async function syncOfflineProgress() {
  try {
    const unsynced = await getUnsyncedProgress()

    if (unsynced.length === 0) {
      console.log('[Sync] No progress to sync')
      return { synced: 0, error: false }
    }

    console.log(`[Sync] Syncing ${unsynced.length} quest completions...`)

    const response = await fetch('/api/sync/offline-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completions: unsynced.map(p => ({
          questId: p.questId,
          score: p.score,
          totalQuestions: p.totalQuestions,
          timeSpent: p.timeSpent,
          completedAt: p.completedAt
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }

    const result = await response.json()

    // Mark as synced
    for (const item of unsynced) {
      if (item.id) {
        await offlineDB.progress.update(item.id, { synced: true })
      }
    }

    console.log(`[Sync] Successfully synced ${unsynced.length} completions`)
    return { synced: unsynced.length, error: false }
  } catch (error) {
    console.error('[Sync] Failed:', error)
    return { synced: 0, error: true, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get sync status
export async function getSyncStatus() {
  try {
    const unsynced = await getUnsyncedProgress()
    return {
      needsSync: unsynced.length > 0,
      unsyncedCount: unsynced.length
    }
  } catch (err) {
    return { needsSync: false, unsyncedCount: 0 }
  }
}

// Clear synced progress (cleanup)
export async function clearSyncedProgress() {
  try {
    const allProgress = await offlineDB.progress.toArray()
    const syncedIds = allProgress
      .filter(p => p.synced)
      .map(p => p.id)
      .filter((id): id is number => id !== undefined)
    
    if (syncedIds.length > 0) {
      await offlineDB.progress.bulkDelete(syncedIds)
      console.log(`[Offline] Cleared ${syncedIds.length} synced progress records`)
    }
  } catch (err) {
    console.error('Error clearing synced progress:', err)
  }
}
