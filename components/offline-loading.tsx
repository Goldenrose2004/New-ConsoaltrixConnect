"use client"

import { useEffect, useState } from 'react'

/**
 * Offline Loading Component
 * Shows a loading animation when trying to access a page that requires internet
 * Automatically redirects to home after timeout
 */
export function OfflineLoading() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  useEffect(() => {
    // Check if we should show loading
    const checkOfflineLoading = () => {
      const isOfflineLoading = sessionStorage.getItem('offlineLoading') === 'true'
      setIsVisible(isOfflineLoading)

      if (isOfflineLoading) {
        // Start countdown
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              sessionStorage.removeItem('offlineLoading')
              // Redirect to home
              window.location.href = '/'
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(interval)
      }
    }

    checkOfflineLoading()
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          Loading Page
        </h2>
        <p className="text-center text-gray-600 mb-6">
          This page requires an internet connection. Please check your connection and try again.
        </p>

        {/* Countdown */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Redirecting to home in <span className="font-bold text-blue-600">{timeLeft}</span> seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem('offlineLoading')
              setIsVisible(false)
              window.location.href = '/'
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Home Now
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('offlineLoading')
              setIsVisible(false)
            }}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          You are currently offline. Some features may not be available.
        </p>
      </div>
    </div>
  )
}
