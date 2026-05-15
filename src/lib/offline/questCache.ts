import { offlineDB } from './db'

// Cache quest content when student loads dashboard
export async function cacheQuestContent(questId: string, content: any) {
  try {
    await offlineDB.quests.put({
      id: questId,
      questId: questId,
      content: JSON.stringify(content),
      cachedAt: new Date()
    })
  } catch (err) {
    console.error('Error caching quest:', err)
  }
}

// Cache all quests for a subject/unit
export async function cacheUnitsQuests(units: any[]) {
  try {
    const quests = []
    for (const unit of units) {
      if (unit.quests && Array.isArray(unit.quests)) {
        for (const quest of unit.quests) {
          quests.push({
            id: quest.id,
            questId: quest.id,
            content: JSON.stringify(quest),
            cachedAt: new Date()
          })
        }
      }
    }
    
    if (quests.length > 0) {
      await offlineDB.quests.bulkPut(quests)
      console.log(`[Offline] Cached ${quests.length} quests`)
    }
  } catch (err) {
    console.error('Error caching quests:', err)
  }
}

// Get quest from cache (offline fallback)
export async function getQuestOffline(questId: string): Promise<any | null> {
  try {
    const cached = await offlineDB.quests.get(questId)
    return cached ? JSON.parse(cached.content) : null
  } catch (err) {
    console.error('Error retrieving cached quest:', err)
    return null
  }
}

// Get all cached quests
export async function getAllCachedQuests(): Promise<any[]> {
  try {
    const cached = await offlineDB.quests.toArray()
    return cached.map(c => JSON.parse(c.content))
  } catch (err) {
    console.error('Error retrieving cached quests:', err)
    return []
  }
}

// Check if quest is cached
export async function isQuestCached(questId: string): Promise<boolean> {
  try {
    const cached = await offlineDB.quests.get(questId)
    return cached !== undefined
  } catch (err) {
    return false
  }
}

// Remove old cached quests (older than 7 days)
export async function cleanupOldCache() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oldQuests = await offlineDB.quests
      .where('cachedAt').below(sevenDaysAgo)
      .toArray()
    
    if (oldQuests.length > 0) {
      await offlineDB.quests.bulkDelete(oldQuests.map(q => q.id))
      console.log(`[Offline] Cleaned up ${oldQuests.length} old cached quests`)
    }
  } catch (err) {
    console.error('Error cleaning cache:', err)
  }
}
