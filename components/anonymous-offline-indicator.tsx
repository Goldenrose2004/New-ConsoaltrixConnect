"use client"

import { useEffect, useState } from 'react'
import { isOnline, isAnonymousMode } from '@/lib/offline-auth'

/**
 * Component that shows an indicator when user is in anonymous offline mode
 */
export function AnonymousOfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted flag first to prevent hydration mismatch
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const online = isOnline()
    setIsOffline(!online)
    setIsAnonymous(isAnonymousMode())

    const handleOnlineStatusChange = () => {
      setIsOffline(!isOnline())
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [mounted])

  if (!mounted || !isOffline || !isAnonymous) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-3 px-4 z-50 shadow-md">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zm-2-5a.75.75 0 100-1.5.75.75 0 000 1.5zM5 12a2 2 0 11-4 0 2 2 0 014 0zM0 12a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        <p className="text-sm font-medium">
          📱 Offline Mode (Anonymous) - Limited features available. Some pages require internet connection.
        </p>
      </div>
    </div>
  )
}
