"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isOfflineAuthenticated, getOfflineUser, getDashboardUrl, isOnline, isAnonymousMode } from '@/lib/offline-auth'

const ONLINE_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/profile/edit',
  '/violations',
  '/chats',
  '/admin'
]

const OFFLINE_ALLOWED_ROUTES = [
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

export function OfflineDetector() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOffline, setIsOffline] = useState(false)
  const redirectHandledRef = useRef<string | null>(null)

  const handleOfflineRedirect = useCallback(() => {
    // Prevent multiple redirects for the same pathname
    if (redirectHandledRef.current === pathname) {
      return
    }
    redirectHandledRef.current = pathname

    // If user is authenticated offline, redirect to dashboard if on home/login/signup
    if (isOfflineAuthenticated()) {
      const user = getOfflineUser()
      if (user) {
        // If on home, login, or signup page, redirect to dashboard
        if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
          const dashboardUrl = getDashboardUrl(user)
          router.push(dashboardUrl)
          return
        }
        // If on an online-only route, redirect to dashboard
        if (ONLINE_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
          const dashboardUrl = getDashboardUrl(user)
          router.push(dashboardUrl)
          return
        }
        // User is authenticated and on allowed route - allow access
        return
      }
    }

    // If on an online-only route while offline and NOT authenticated, redirect to fallback
    if (ONLINE_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
      router.push('/offline-fallback')
      return
    }

    // If user is not authenticated and trying to access offline pages
    if (!isOfflineAuthenticated() && pathname !== '/offline-fallback') {
      // Check if anonymous offline mode is enabled
      const anonymousMode = isAnonymousMode()
      
      // If anonymous mode is enabled, allow access to offline-allowed routes and dashboards
      if (anonymousMode) {
        // Allow access to dashboards and static pages
        if (OFFLINE_ALLOWED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return // Allow access
        }
        // If trying to access online-only route, redirect to fallback
        if (ONLINE_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
          router.push('/offline-fallback')
          return
        }
        // Allow access to dashboards in anonymous mode
        if (pathname === '/basic-education-dashboard' || pathname === '/college-dashboard' || pathname.startsWith('/basic-education-dashboard/') || pathname.startsWith('/college-dashboard/')) {
          return // Allow access
        }
      }
      
      // Check if they have currentUser in localStorage (from previous online session)
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        // No valid auth, redirect to offline fallback if not on allowed route
        if (!OFFLINE_ALLOWED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          router.push('/offline-fallback')
        }
      }
    }
  }, [pathname, router])

  useEffect(() => {
    // Check initial online status
    const online = isOnline()
    setIsOffline(!online)

    // If offline on app startup, check for authenticated user and auto-redirect
    if (!online) {
      // Check if user is authenticated offline
      if (isOfflineAuthenticated()) {
        const user = getOfflineUser()
        if (user) {
          const dashboardUrl = getDashboardUrl(user)
          // If not already on dashboard or allowed offline page, redirect
          if (pathname === '/' || pathname === '/login' || pathname === '/signup' || 
              ONLINE_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
            // Small delay to prevent flickering
            setTimeout(() => {
              router.push(dashboardUrl)
            }, 200)
            return
          }
        }
      }
      
      // Small delay to prevent flickering
      const timeoutId = setTimeout(() => {
        handleOfflineRedirect()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, []) // Only run once on mount

  useEffect(() => {
    // Reset redirect handler when pathname changes (to allow checking new routes)
    redirectHandledRef.current = null

    // If offline, check if we need to redirect
    if (isOffline) {
      const timeoutId = setTimeout(() => {
        handleOfflineRedirect()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [pathname, isOffline, handleOfflineRedirect])

  useEffect(() => {
    // Handle online/offline status changes
    const updateOnlineStatus = () => {
      const online = isOnline()
      setIsOffline(!online)
      
      // Reset redirect handler when status changes
      redirectHandledRef.current = null
      
      // If going offline, check for redirect
      if (!online) {
        setTimeout(() => {
          handleOfflineRedirect()
        }, 100)
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [handleOfflineRedirect])

  // Show offline indicator
  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50">
        <p className="text-sm font-medium">
          ⚠️ You are currently offline. Some features may not be available.
        </p>
      </div>
    )
  }

  return null
}
