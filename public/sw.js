// Service Worker for VidyaQuest - Offline Support
const CACHE_VERSION = 'v1'
const CACHE_NAME = `vidyaquest-${CACHE_VERSION}`
const RUNTIME_CACHE = `vidyaquest-runtime-${CACHE_VERSION}`
const API_CACHE = `vidyaquest-api-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/manifest.json',
]

// Offline fallback page
const OFFLINE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>VidyaQuest - Offline</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
    h1 { color: #FF6B35; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>You are offline</h1>
  <p>VidyaQuest is currently offline. Your progress is being saved locally and will sync when you reconnect.</p>
  <p>You can still view cached content while offline.</p>
</body>
</html>
`

// Install: cache static shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(`vidyaquest-${CACHE_VERSION}`)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and extension requests
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return
  }

  // Sync endpoint: Network only (don't cache)
  if (url.pathname === '/api/sync/offline-progress') {
    event.respondWith(fetch(request))
    return
  }

  // API calls: network-first
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          const clone = response.clone()
          caches.open(API_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'offline', message: 'You are offline' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
  } else {
    // Static assets & pages: Stale-while-revalidate
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        return cached || fetchPromise
      }).catch(() => {
        // Offline - return cached version or offline page
        return caches.match(request) || 
               new Response(OFFLINE_HTML, {
                 status: 503,
                 statusText: 'Service Unavailable',
                 headers: { 'Content-Type': 'text/html' }
               })
      })
    )
  }
})

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
