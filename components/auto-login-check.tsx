"use client"

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isOfflineAuthenticated, getOfflineUser, getDashboardUrl, hasValidSession, getPersistentSession } from '@/lib/offline-auth'

/**
 * Global component that checks for stored authentication on app startup
 * Auto-logs in users if they have valid stored credentials (both online and offline)
 */
export function AutoLoginCheck() {
  const router = useRouter()
  const pathname = usePathname()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Only check once on mount
    if (hasCheckedRef.current) {
      return
    }
    hasCheckedRef.current = true

    // Check immediately (localStorage is always available)
    const checkAuth = () => {
      // Don't auto-redirect if anonymous offline mode is enabled (user chose to browse anonymously)
      const anonymousMode = localStorage.getItem('anonymousOfflineMode')
      if (anonymousMode === 'true' && !navigator.onLine) {
        // User is browsing anonymously offline - don't redirect
        return
      }

      // First, check for valid persistent session
      if (hasValidSession()) {
        const session = getPersistentSession()
        if (session) {
          // Check if user data exists
          if (isOfflineAuthenticated()) {
            const user = getOfflineUser()
            if (user) {
              // If on home page, login page, or signup page, redirect to dashboard
              if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
                const dashboardUrl = getDashboardUrl(user)
                router.push(dashboardUrl)
                return
              }
            }
          }
        }
      }

      // Fallback: try offline auth utility
      if (isOfflineAuthenticated()) {
        const user = getOfflineUser()
        if (user) {
          // If on home page, login page, or signup page, redirect to dashboard
          if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
            const dashboardUrl = getDashboardUrl(user)
            router.push(dashboardUrl)
            return
          }
        }
      }

      // Final fallback: check currentUser directly
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser)
          
          // Validate user data
          if (user.id && user.email) {
            // Generate token if missing
            const token = localStorage.getItem('pwa_auth_token')
            if (!token && user.id) {
              const newToken = btoa(`${user.id}:${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '')
              localStorage.setItem('pwa_auth_token', newToken)
              
              // Update user data
              const updatedUser = {
                ...user,
                loginToken: newToken,
                loginTimestamp: user.loginTimestamp || Date.now()
              }
              localStorage.setItem('currentUser', JSON.stringify(updatedUser))
            }

            // If on home page, login page, or signup page, redirect to dashboard
            if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
              const dashboardUrl = getDashboardUrl(user)
              router.push(dashboardUrl)
            }
          }
        } catch (error) {
          console.error('Error checking auto-login:', error)
        }
      }
    }

    // Check immediately
    checkAuth()
    
    // Also check after a small delay (in case localStorage wasn't ready)
    const timeoutId = setTimeout(checkAuth, 50)

    return () => clearTimeout(timeoutId)
  }, [pathname, router])

  return null
}

