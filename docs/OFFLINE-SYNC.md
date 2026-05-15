# 📴 VidyaQuest — Offline Sync Architecture

## Priority: P1 (Required for Hackathon)

## Overview
Students in rural India often have intermittent internet. VidyaQuest must:
1. **Cache quest content** for offline play
2. **Store progress locally** when offline
3. **Sync progress** automatically when reconnected
4. **Show clear offline/online status** to users

---

## Architecture

```
┌─ Browser ─────────────────────────────────────────┐
│                                                    │
│  ┌─ Service Worker ──────────────────────────┐    │
│  │  Cache API: static assets, quest JSON     │    │
│  │  Strategy: Cache-first (static)           │    │
│  │  Strategy: Network-first (API)            │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  ┌─ IndexedDB (Dexie.js) ───────────────────┐    │
│  │  quests_cache: downloaded quest content   │    │
│  │  offline_progress: pending completions    │    │
│  │  user_state: XP, level, streak cache      │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  ┌─ Sync Manager ───────────────────────────┐    │
│  │  On reconnect: POST /api/sync/offline     │    │
│  │  Queue: FIFO, retry on failure            │    │
│  └───────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

---

## Implementation

### 1. Service Worker Setup

Use `next-pwa` or manual service worker registration.

```javascript
// public/sw.js (simplified)
const CACHE_NAME = 'vidyaquest-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/profile',
  '/leaderboard',
  '/manifest.json',
  // CSS, JS bundles auto-cached by Next.js
]

// Install: cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.url.includes('/api/')) {
    // Network-first for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (request.method === 'GET') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request)) // Fallback to cache
    )
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
  }
})
```

### 2. IndexedDB Schema (Dexie.js)

```typescript
// src/lib/offline/db.ts
import Dexie, { type Table } from 'dexie'

interface CachedQuest {
  id: string
  questId: string
  content: string  // JSON string
  cachedAt: Date
}

interface OfflineProgress {
  id?: number       // auto-increment
  questId: string
  score: number
  totalQuestions: number
  timeSpent: number
  completedAt: Date
  synced: boolean
}

interface UserStateCache {
  key: string       // 'current_user'
  xp: number
  level: number
  streakDays: number
  badges: string[]  // badge IDs
  lastUpdated: Date
}

class VidyaQuestDB extends Dexie {
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
```

### 3. Quest Caching Strategy

```typescript
// src/lib/offline/questCache.ts

// Cache quest content when student loads dashboard
export async function cacheQuestsForGrade(grade: number) {
  const response = await fetch(`/api/quests?grade=${grade}`)
  const quests = await response.json()

  for (const quest of quests) {
    await offlineDB.quests.put({
      id: quest.id,
      questId: quest.id,
      content: JSON.stringify(quest),
      cachedAt: new Date()
    })
  }
}

// Get quest from cache (offline fallback)
export async function getQuestOffline(questId: string) {
  const cached = await offlineDB.quests.get(questId)
  return cached ? JSON.parse(cached.content) : null
}
```

### 4. Offline Progress Storage

```typescript
// src/lib/offline/progressSync.ts

// Save progress locally (called when completing a quest)
export async function saveProgressOffline(data: {
  questId: string
  score: number
  totalQuestions: number
  timeSpent: number
}) {
  await offlineDB.progress.add({
    ...data,
    completedAt: new Date(),
    synced: false
  })

  // Also update local user state
  const state = await offlineDB.userState.get('current_user')
  if (state) {
    const xpEarned = calculateXPLocally(data)
    await offlineDB.userState.put({
      ...state,
      xp: state.xp + xpEarned,
      lastUpdated: new Date()
    })
  }
}

// Sync all unsynced progress when online
export async function syncOfflineProgress() {
  const unsynced = await offlineDB.progress
    .where('synced').equals(0)
    .toArray()

  if (unsynced.length === 0) return { synced: 0 }

  try {
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

    const result = await response.json()

    // Mark as synced
    for (const item of unsynced) {
      await offlineDB.progress.update(item.id!, { synced: true })
    }

    return result
  } catch (error) {
    console.log('Sync failed, will retry later')
    return { synced: 0, error: true }
  }
}
```

### 5. Auto-Sync on Reconnect

```typescript
// src/lib/offline/syncManager.ts

export function initSyncManager() {
  // Listen for online event
  window.addEventListener('online', async () => {
    console.log('Back online! Syncing progress...')
    const result = await syncOfflineProgress()
    if (result.synced > 0) {
      // Show toast: "Synced X quest results!"
      showSyncNotification(result.synced)
    }
  })

  // Periodic sync attempt (every 60s if online)
  setInterval(async () => {
    if (navigator.onLine) {
      await syncOfflineProgress()
    }
  }, 60000)
}
```

### 6. Download Manager (Student Settings)

```typescript
// UI: Settings → Download Content
// Shows per-subject download status

interface DownloadStatus {
  subject: string
  totalQuests: number
  cachedQuests: number
  sizeEstimate: string  // e.g., "12 MB"
  status: 'not_downloaded' | 'downloading' | 'downloaded' | 'outdated'
}

// Get storage usage
async function getStorageUsage(): Promise<string> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const usedMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(1)
    const quotaMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(0)
    return `${usedMB} MB used / ${quotaMB} MB available`
  }
  return 'Storage info unavailable'
}
```

---

## PWA Manifest

```json
// public/manifest.json
{
  "name": "VidyaQuest — Level Up Your Learning",
  "short_name": "VidyaQuest",
  "description": "Gamified STEM learning for students",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0D1B2A",
  "theme_color": "#FF6B35",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Offline UI Indicators

| State | UI Element |
|-------|-----------|
| Offline | Yellow banner: "You're offline — progress will sync when connected" |
| Syncing | Banner: "Syncing X results..." with spinner |
| Synced | Green toast: "✓ All progress synced!" (auto-dismiss 3s) |
| Sync failed | Red toast: "Sync failed, will retry automatically" |
| Content cached | Badge on quest node: "📥 Available offline" |

---

## Testing Checklist
- [ ] Play a quiz with Wi-Fi off → progress saved locally
- [ ] Turn Wi-Fi on → progress syncs automatically
- [ ] XP updates correctly after sync
- [ ] Badge triggers work after sync
- [ ] Streak not broken by offline day (if quest completed)
- [ ] Download Manager shows correct storage usage
- [ ] App installs via "Add to Home Screen"
- [ ] Cached quests load instantly offline
