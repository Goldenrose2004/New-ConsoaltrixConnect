"use client"

import { useEffect, useState } from 'react'
import { Download, Share2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function HeroSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setDeferredPrompt(null)
      // Keep button visible even after installation
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Note: We don't hide the button even if already installed
    // The button will always show "Install Now" for consistency

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS install instructions (always show, even if already installed)
      setShowIOSInstructions(true)
      return
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
      // Already installed - show message or do nothing
      // Button still visible but won't trigger install
      return
    }

    if (!deferredPrompt) {
      // If no prompt available, the button is still visible
      // User can try installing manually via browser menu
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt but keep button visible
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return (
    <>
      <section
        className="relative w-full min-h-[300px] sm:min-h-[360px] md:min-h-[450px] lg:min-h-[650px] flex items-center justify-start px-3 sm:px-4 md:px-6 lg:px-12 bg-cover bg-[position:80%_center] md:bg-center"
        style={{
          backgroundImage: "url(/images/hero-building.jpg)",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 max-w-xl w-full ml-0 sm:ml-2 md:ml-12 lg:ml-32 xl:ml-40 px-2 sm:px-3 md:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-5 leading-tight text-balance" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your School Policy Handbook, Digitized
          </h1>
          <p className="text-sm sm:text-base md:text-base lg:text-lg text-white/95 mb-4 sm:mb-4 md:mb-5 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            <span className="block sm:inline">ConsolatrixConnect brings school information, resources, and</span>
            <span className="block sm:inline"> student chat together in one easy-to-use platform. Stay informed,</span>
            <span className="block sm:inline"> stay engaged, and make campus life simpler.</span> 
          </p>
          <button 
            onClick={handleInstallClick}
            className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-200 rounded font-semibold text-sm sm:text-base whitespace-nowrap touch-manipulation flex items-center gap-2" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isIOS ? (
              <>
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Install Now
              </>
            ) : (
              <>
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Install Now
              </>
            )}
          </button>
        </div>
      </section>

      {/* iOS Install Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Install ConsolatrixConnect
            </h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Tap the Share button</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Look for the Share icon <Share2 className="w-4 h-4 inline" /> at the bottom of your Safari browser
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Select "Add to Home Screen"</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Scroll down and tap "Add to Home Screen" from the menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Confirm installation</p>
                  <p className="text-sm text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Tap "Add" in the top right corner to install the app
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-[#041A44] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1e3a8a] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
