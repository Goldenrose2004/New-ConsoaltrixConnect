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

  return null
}
