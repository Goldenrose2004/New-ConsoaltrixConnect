"use client"

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[Service Worker] Registration successful:', registration.scope)

          const updateInterval = setInterval(() => {
            console.log('[Service Worker] Checking for updates...')
            registration.update()
          }, 30 * 60 * 1000)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available - notify the app
                  console.log('[Service Worker] New version available')
                  
                  // Broadcast to all windows/tabs
                  if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('pwa-updates')
                    channel.postMessage({
                      type: 'UPDATE_AVAILABLE',
                      message: 'New version available'
                    })
                    channel.close()
                  }
                }
              })
            }
          })

          // Cleanup interval on unmount
          return () => clearInterval(updateInterval)
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error)
        })

      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[Service Worker] Message received:', event.data)
        
        // Broadcast update message to all windows
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('pwa-updates')
            channel.postMessage(event.data)
            channel.close()
          }
        }
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Service Worker] Controller changed')
      })
    }
  }, [])

  return null
}

