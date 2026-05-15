import Dexie, { type Table } from 'dexie'

export interface CachedQuest {
  id: string
  questId: string
  content: string  // JSON string
  cachedAt: Date
}

export interface OfflineProgress {
  id?: number
  questId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: Date
  synced: boolean
}

export interface UserStateCache {
  key: string
  xp: number
  level: number
  streakDays: number
  badges: string[]
  lastUpdated: Date
}

export class VidyaQuestDB extends Dexie {
  quests!: Table<CachedQuest>
  progress!: Table<OfflineProgress>
  userState!: Table<UserStateCache>

  constructor() {
    super('VidyaQuestDB')
    this.version(1).stores({
      quests: 'id, questId, cachedAt',
      progress: '++id, questId, synced, completedAt',
      userState: 'key'
    })
  }
}

export const offlineDB = new VidyaQuestDB()

// Initialize user state cache
export async function initUserStateCache(userId: string, initialData: any) {
  await offlineDB.userState.put({
    key: `user_${userId}`,
    xp: initialData.xp || 0,
    level: initialData.level || 1,
    streakDays: initialData.streakDays || 0,
    badges: initialData.badges || [],
    lastUpdated: new Date()
  })
}

// Get current user state from cache
export async function getUserStateCache(userId: string): Promise<UserStateCache | undefined> {
  return offlineDB.userState.get(`user_${userId}`)
}

// Update user state cache
export async function updateUserStateCache(userId: string, updates: Partial<UserStateCache>) {
  const current = await getUserStateCache(userId)
  if (current) {
    await offlineDB.userState.put({
      ...current,
      ...updates,
      lastUpdated: new Date()
    })
  }
}

// Clear all offline data
export async function clearOfflineData() {
  await offlineDB.quests.clear()
  await offlineDB.progress.clear()
  await offlineDB.userState.clear()
}

// Get storage usage
export async function getStorageUsage(): Promise<string> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const usedMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(1)
      const quotaMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(0)
      return `${usedMB} MB / ${quotaMB} MB`
    }
    return 'Storage info unavailable'
  } catch (err) {
    console.error('Error getting storage info:', err)
    return 'Unknown'
  }
}
