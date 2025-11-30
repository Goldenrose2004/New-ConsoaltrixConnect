// Service Worker for ConsolatrixConnect PWA
// Version: 1.0.0

const CACHE_NAME = 'consolatrix-connect-v1'
const OFFLINE_PAGES = [
  '/',
  '/basic-education-dashboard',
  '/college-dashboard',
  '/about-us',
  '/history',
  '/core-values',
  '/vision-mission',
  '/consolarician-values',
  '/institutional-objectives',
  '/school-seal',
  '/basic-education-department',
  '/college-department',
  '/sections',
  '/records',
  '/profile',
  '/foreword',
  '/ar-foundresses',
  '/handbook-revision-process',
  '/letter-to-students',
  '/courses',
  '/offline-fallback'
]

// Pages that should NOT be cached (require online connection)
const ONLINE_ONLY_PAGES = [
  '/login',
  '/signup',
  '/profile/edit',
  '/violations',
  '/chats',
  '/admin',
  '/announcements'
]

// Install event - cache offline pages
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching offline pages')
      // Cache only the HTML structure - assets will be cached on demand
      return cache.addAll(OFFLINE_PAGES.map(page => page + '.html').filter(() => false)) // Don't pre-cache, cache on demand
    })
  )
  self.skipWaiting() // Activate immediately
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim() // Take control of all pages immediately
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API routes - they should always go to network
  if (url.pathname.startsWith('/api/')) {
    // For API routes, try network first, but don't cache
    event.respondWith(
      fetch(request).catch(() => {
        // Return a JSON error response if offline
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'This feature requires an internet connection.' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    return
  }

  // Check if this is an online-only page
  const isOnlineOnly = ONLINE_ONLY_PAGES.some(page => url.pathname.startsWith(page))
  if (isOnlineOnly) {
    // For online-only pages, always try network first
    event.respondWith(
      fetch(request).catch(() => {
        // Redirect to offline fallback if offline
        return caches.match('/offline-fallback').then((response) => {
          return response || new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>This page requires an internet connection</h1><p><a href="/">Go to Home</a></p></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            }
          )
        })
      })
    )
    return
  }

  // Check if this is an offline-allowed page
  const isOfflineAllowed = OFFLINE_PAGES.some(page => url.pathname === page || url.pathname.startsWith(page + '/'))

  if (isOfflineAllowed) {
    // For offline-allowed pages, use cache-first strategy
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        // Try network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // If offline and no cache, try to serve a basic offline page
            if (request.mode === 'navigate') {
              return caches.match('/offline-fallback').then((response) => {
                return response || new Response(
                  '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>You are offline</h1><p>This page is not available offline. <a href="/">Go to Home</a></p></body></html>',
                  {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                  }
                )
              })
            }
            // For non-navigation requests, return a basic error
            return new Response('Offline', { status: 503 })
          })
      })
    )
  } else {
    // For other pages, try network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Try cache as fallback
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 })
          })
        })
    )
  }
})

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

