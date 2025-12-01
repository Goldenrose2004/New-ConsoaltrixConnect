import { useEffect, useState } from 'react'
import { isOnline, isAnonymousMode, isOfflineAuthenticated } from '@/lib/offline-auth'

export interface OfflineModeState {
  isOffline: boolean
  isAnonymous: boolean
  isAuthenticated: boolean
  canAccessFeature: (feature: string) => boolean
}

/**
 * Hook to check offline mode status and permissions
 */
export function useOfflineMode(): OfflineModeState {
  const [state, setState] = useState<OfflineModeState>({
    isOffline: false,
    isAnonymous: false,
    isAuthenticated: false,
    canAccessFeature: () => true
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateState = () => {
      const isOffline = !isOnline()
      const isAnonymous = isAnonymousMode()
      const isAuthenticated = isOfflineAuthenticated()

      setState({
        isOffline,
        isAnonymous,
        isAuthenticated,
        canAccessFeature: (feature: string) => {
          // If online, all features are accessible
          if (!isOffline) return true
          
          // If authenticated (not anonymous), all offline-accessible features are available
          if (isAuthenticated && !isAnonymous) return true
          
          // If anonymous and offline, only offline-accessible features are available
          if (isAnonymous && isOffline) {
            const offlineFeatures = [
              'basic-education-dashboard',
              'college-dashboard',
              'about-us',
              'history',
              'core-values',
              'vision-mission',
              'consolarician-values',
              'institutional-objectives',
              'school-seal',
              'basic-education-department',
              'college-department',
              'sections',
              'records',
              'profile',
              'foreword',
              'ar-foundresses',
              'handbook-revision-process',
              'letter-to-students',
              'courses'
            ]
            return offlineFeatures.some(f => feature.includes(f))
          }
          
          return false
        }
      })
    }

    updateState()

    const handleOnlineStatusChange = () => {
      updateState()
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])

  if (!mounted) {
    return {
      isOffline: false,
      isAnonymous: false,
      isAuthenticated: false,
      canAccessFeature: () => true
    }
  }

  return state
}
