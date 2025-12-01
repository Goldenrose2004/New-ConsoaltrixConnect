"use client"

import { useEffect, useState, useRef } from 'react'
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

export function OfflineDetector() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOffline, setIsOffline] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const redirectHandledRef = useRef<string | null>(null)

  // Only run after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

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
    }
  }, [mounted, pathname, router])

  useEffect(() => {
    if (!mounted) return

    // Reset redirect handler when pathname changes
    redirectHandledRef.current = null

    // If offline, check if we need to redirect
    if (isOffline) {
      const timeoutId = setTimeout(() => {
        // Prevent multiple redirects for the same pathname
        if (redirectHandledRef.current === pathname) {
          return
        }
        redirectHandledRef.current = pathname

        // If user is authenticated offline, allow access to offline pages
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
          
          // Check if they have currentUser in localStorage
          const currentUser = localStorage.getItem('currentUser')
          if (currentUser) {
            // They have stored user data - allow access to offline pages
            if (OFFLINE_ALLOWED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
              return // Allow access to offline pages
            }
          }
          
          // No valid auth and not on allowed route, redirect to offline fallback
          if (!OFFLINE_ALLOWED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
            router.push('/offline-fallback')
          }
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [pathname, isOffline, mounted, router])

  useEffect(() => {
    if (!mounted) return

    // Handle online/offline status changes
    const updateOnlineStatus = () => {
      const online = isOnline()
      setIsOffline(!online)
      redirectHandledRef.current = null
    }

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [mounted])

  // Show offline indicator
  if (!mounted) {
    return null
  }

  if (isOffline && !bannerDismissed) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white py-1.5 px-4 z-50 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.526a6 6 0 008.367 8.368l-1.5-1.5a4 4 0 00-5.657-5.657l1.5 1.5a2 2 0 11-2.828 2.829l-1.5-1.5a4 4 0 005.657 5.657l1.5 1.5zm2.122-15.026a2 2 0 11-2.828 2.828l-1.5-1.5a4 4 0 005.657 5.657l1.5 1.5a6 6 0 01-8.367-8.368l1.5 1.5a2 2 0 102.828-2.829l1.5 1.5z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium">
            No internet connection
          </p>
        </div>
        <button
          onClick={() => setBannerDismissed(true)}
          className="flex-shrink-0 text-white hover:text-gray-300 transition-colors p-0.5"
          aria-label="Dismiss offline indicator"
          title="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return null
}
