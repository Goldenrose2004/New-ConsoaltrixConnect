"use client"

import { useEffect, useState, useRef } from 'react'
import { X, Download } from 'lucide-react'

/**
 * Component that shows a banner when a new PWA update is available
 * Users can click to update the app
 */
export function PWAUpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Listen for update available message from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        console.log('[PWA Update] New version available')
        setUpdateAvailable(true)
      }
    }

    // Use BroadcastChannel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('pwa-updates')
        broadcastChannelRef.current = channel
        
        channel.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            console.log('[PWA Update] Update notification received via BroadcastChannel')
            setUpdateAvailable(true)
          }
        })
      } catch (error) {
        console.error('[PWA Update] BroadcastChannel not supported:', error)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close()
      }
    }
  }, [mounted])

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return

    setIsUpdating(true)

    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations()

      for (const registration of registrations) {
        // Check for updates
        await registration.update()

        // If there's a waiting service worker, activate it
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })

          // Listen for controller change
          const onControllerChange = () => {
            console.log('[PWA Update] Controller changed, reloading...')
            window.location.reload()
          }

          navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, { once: true })

          // Set a timeout to reload if controller doesn't change
          setTimeout(() => {
            window.location.reload()
          }, 1000)

          return
        }
      }
    } catch (error) {
      console.error('[PWA Update] Error updating:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
  }

  if (!mounted || !updateAvailable) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-3 px-4 z-50 shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-full">
        <div className="flex items-center gap-3 flex-1">
          <Download className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              New version available!
            </p>
            <p className="text-xs text-blue-100">
              Click update to get the latest features and improvements.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-white text-blue-600 px-3 py-1.5 rounded font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update'
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="text-white hover:text-blue-100 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Dismiss update banner"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
