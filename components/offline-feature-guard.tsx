"use client"

import { useEffect, useState } from 'react'
import { isOnline, isAnonymousMode, isFeatureOnlineOnly } from '@/lib/offline-auth'

interface OfflineFeatureGuardProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that guards features requiring internet connection
 * Shows a message if the feature is not available offline
 */
export function OfflineFeatureGuard({ feature, children, fallback }: OfflineFeatureGuardProps) {
  const [isOffline, setIsOffline] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  // Check if this feature requires internet and we're offline in anonymous mode
  const featureRequiresInternet = isFeatureOnlineOnly(feature)
  const shouldBlockFeature = isOffline && isAnonymous && featureRequiresInternet

  if (shouldBlockFeature) {
    return (
      fallback || (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16H5m13 0h3m-11-4V8m0 8v3m0-11v3m11-8v8m0-8V8m0 8v3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This feature requires internet connection</h3>
          <p className="text-gray-600 mb-4">
            You're currently browsing offline in anonymous mode. Please connect to the internet to access this feature.
          </p>
          <p className="text-sm text-gray-500">
            Feature: <span className="font-mono font-semibold">{feature}</span>
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
