"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { WifiOff, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import { isOfflineAuthenticated, getOfflineUser, getDashboardUrl, isOnline } from "@/lib/offline-auth"

export default function OfflineFallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated offline
    if (isOfflineAuthenticated()) {
      const user = getOfflineUser()
      if (user) {
        const dashboardUrl = getDashboardUrl(user)
        router.push(dashboardUrl)
      }
    }

    // Listen for online event
    const handleOnline = () => {
      // Reload page when back online
      window.location.reload()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [router])

  const handleRetry = () => {
    if (isOnline()) {
      window.location.reload()
    } else {
      // If authenticated, try to go to dashboard
      if (isOfflineAuthenticated()) {
        const user = getOfflineUser()
        if (user) {
          router.push(getDashboardUrl(user))
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            You're Offline
          </h1>
          <p className="text-gray-600 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isOfflineAuthenticated() 
              ? "You're currently offline. Some features require an internet connection."
              : "You need to be online to log in. Please connect to the internet and try again."}
          </p>
        </div>

        <div className="space-y-3">
          {isOfflineAuthenticated() ? (
            <>
              <Link
                href={getDashboardUrl(getOfflineUser())}
                className="block w-full bg-[#041A44] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#1e3a8a] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Home className="w-5 h-5 inline-block mr-2" />
                Go to Dashboard
              </Link>
              <button
                onClick={handleRetry}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <RefreshCw className="w-5 h-5 inline-block mr-2" />
                Retry Connection
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                This page requires an internet connection. You can browse static content offline without logging in.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('anonymousOfflineMode', 'true')
                  router.push('/')
                }}
                className="w-full bg-[#041A44] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#1e3a8a] transition-colors flex items-center justify-center mb-3"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Continue Anonymously
              </button>
              <button
                onClick={handleRetry}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <RefreshCw className="w-5 h-5 inline-block mr-2" />
                Retry Connection
              </button>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
            ConsolatrixConnect - Digital School Handbook
          </p>
        </div>
      </div>
    </div>
  )
}

