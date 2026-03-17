"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isOfflineAuthenticated, getOfflineUser, getDashboardUrl, isOnline } from '@/lib/offline-auth'

/**
 * Component that checks for offline authentication on app startup
 * and redirects authenticated users to their dashboard when offline
 */
export function OfflineAuthCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') {
      return
    }

    if (!isOnline()) {
      // Small delay to ensure localStorage is accessible
      const timeoutId = setTimeout(() => {
        if (isOfflineAuthenticated()) {
          const user = getOfflineUser()
          if (user) {
            const dashboardUrl = getDashboardUrl(user)
            // Redirect to dashboard
            router.push(dashboardUrl)
          }
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [pathname, router])

  return null
}

