// Service Worker for ConsolatrixConnect PWA
// Version: 1.0.0

const CACHE_NAME = 'consolatrix-connect-v3'
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
  '/college-courses-offered',
  '/historical-background',
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

// Pages that should be accessible in anonymous offline mode
const ANONYMOUS_OFFLINE_PAGES = [
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
  '/college-courses-offered',
  '/historical-background',
  '/sections',
  '/records',
  '/profile',
  '/foreword',
  '/ar-foundresses',
  '/handbook-revision-process',
  '/letter-to-students',
  '/courses'
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
      console.log('[Service Worker] Pre-caching offline pages')
      // Pre-cache all offline pages so they're available immediately
      const pagesToCache = OFFLINE_PAGES.map(page => {
        // For root path, just use it as is
        if (page === '/') return page
        // For other paths, Next.js will handle routing
        return page
      })
      
      // Try to cache pages, but don't fail if some don't exist yet
      return Promise.allSettled(
        pagesToCache.map(page => cache.add(page).catch(err => {
          console.log(`[Service Worker] Could not cache ${page}:`, err.message)
        }))
      )
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
        // Show loading animation if offline
        if (request.mode === 'navigate') {
          return new Response(
            `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Loading...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    .container {
      background: white;
      border-radius: 1rem;
      padding: 3rem 2rem;
      text-align: center;
      max-width: 24rem;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .spinner {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 2rem;
      position: relative;
    }
    .spinner::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 4px solid #e5e7eb;
      border-radius: 50%;
    }
    .spinner::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 4px solid transparent;
      border-top-color: #667eea;
      border-right-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .countdown {
      font-size: 0.875rem;
      color: #9ca3af;
      margin-bottom: 1.5rem;
    }
    .countdown strong {
      color: #667eea;
      font-weight: 600;
    }
    .buttons {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    button {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .btn-secondary:hover {
      background: #d1d5db;
    }
    .info {
      font-size: 0.75rem;
      color: #d1d5db;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Loading Page</h1>
    <p>This page requires an internet connection. Please check your connection and try again.</p>
    <div class="countdown">
      Redirecting to home in <strong id="countdown">10</strong> seconds...
    </div>
    <div class="buttons">
      <button class="btn-primary" onclick="window.location.href='/'">Go Home Now</button>
      <button class="btn-secondary" onclick="window.history.back()">Go Back</button>
    </div>
    <p class="info">⚠️ You are currently offline. Some features may not be available.</p>
  </div>
  <script>
    let timeLeft = 10;
    const countdownEl = document.getElementById('countdown');
    const interval = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(interval);
        window.location.href = '/';
      }
    }, 1000);
  </script>
</body>
</html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
          )
        }
        // For non-navigation requests, return error
        return new Response('Offline', { status: 503 })
      })
    )
    return
  }

  // Check if this is an offline-allowed page
  const isOfflineAllowed = OFFLINE_PAGES.some(page => url.pathname === page || url.pathname.startsWith(page + '/'))

  if (isOfflineAllowed) {
    // For offline-allowed pages, use cache-first strategy with network fallback
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', url.pathname)
          return cachedResponse
        }

        // No cache, try network
        console.log('[Service Worker] Fetching from network:', url.pathname)
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200) {
              return response
            }

            // Clone the response for caching
            const responseToCache = response.clone()

            // Cache the response for future offline use
            caches.open(CACHE_NAME).then((cache) => {
              console.log('[Service Worker] Caching response:', url.pathname)
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch((error) => {
            // Network failed - try to serve from cache
            console.log('[Service Worker] Network failed, trying cache:', url.pathname, error)
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving cached fallback:', url.pathname)
                return cachedResponse
              }

              // No cache available - show offline page
              if (request.mode === 'navigate') {
                console.log('[Service Worker] No cache, showing offline fallback')
                return caches.match('/offline-fallback').then((response) => {
                  return response || new Response(
                    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f3f4f6;padding:1rem}div{background:white;border-radius:0.5rem;padding:2rem;text-align:center;max-width:24rem;width:100%}h1{font-size:1.5rem;font-weight:bold;margin-bottom:1rem;color:#111827}p{color:#6b7280;margin-bottom:1rem}button{background:#041A44;color:white;border:none;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;cursor:pointer;width:100%;margin-top:1rem}button:hover{background:#1e3a8a}</style></head><body><div><h1>Page Not Available Offline</h1><p>This page hasn\'t been cached yet. Please connect to the internet and visit the page first.</p><button onclick="window.location.href=\'/\'">Go to Home</button></div></body></html>',
                    {
                      status: 200,
                      headers: { 'Content-Type': 'text/html' }
                    }
                  )
                })
              }

              // For non-navigation requests, return error
              return new Response('Offline - Page not cached', { status: 503 })
            })
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

