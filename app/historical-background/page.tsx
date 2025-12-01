"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { Footer } from "@/components/footer"

export default function HistoricalBackgroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const isOffline = !navigator.onLine
    const currentUser = localStorage.getItem("currentUser")

    // Check if anonymous offline mode is enabled
    const anonymousMode = localStorage.getItem('anonymousOfflineMode')
    if (isOffline && anonymousMode === 'true') {
      setIsLoading(false)
      return
    }

    // If offline, allow access even without currentUser (page is cached)
    if (isOffline) {
      if (currentUser) {
        setUser(JSON.parse(currentUser))
      }
      setIsLoading(false)
      return
    }

    // If online, require authentication
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)
    setIsLoading(false)
  }, [router])

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const userInitials = user ? ((user.firstName?.[0] || "U") + (user.lastName?.[0] || "")) : "U"
  const isBasicEducation = 
    user?.department === "Elementary" ||
    user?.department === "Junior High School" ||
    user?.department === "Senior High School"
  const homeHref = user?.department === "College" 
    ? "/college-dashboard" 
    : isBasicEducation 
    ? "/basic-education-dashboard" 
    : "/basic-education-dashboard"

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AuthenticatedHeader userName={user?.firstName} userInitials={userInitials} useLandingPageStylingMobileOnly={true} />

      <main className="max-w-4xl mx-auto px-2 sm:px-4 md:p-6 pb-16 md:pb-32">
        {/* Back to Dashboard Button */}
        <div className="mb-4 mt-8 md:mt-16">
          <Link
            href={homeHref}
            className="inline-flex items-center text-gray-800 transition-colors text-sm md:text-base"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Main Container */}
        <div className="rounded-lg shadow-xl overflow-hidden" style={{ backgroundColor: "#001E4D" }}>
          {/* Title Section */}
          <div className="text-white text-center py-4 md:py-8" style={{ backgroundColor: "#001E4D" }}>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wide px-2 md:px-0" style={{ fontFamily: "'Inter', sans-serif" }}>HISTORICAL BACKGROUND</h1>
            <div className="mt-2 h-1 mx-auto w-20 sm:w-24" style={{ backgroundColor: "#60A5FA" }}></div>
          </div>

          {/* Content Section */}
          <div className="mx-2 sm:mx-4 md:mx-8 my-4 md:my-8 rounded-lg p-3 sm:p-4 md:p-8" style={{ backgroundColor: "#1A355F" }}>
            <div className="text-white text-xs sm:text-base leading-relaxed space-y-3 md:space-y-4" style={{ textAlign: "justify" }}>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Foundation and Early Years</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Augustinian Recollect School of Consolacion was founded with a vision to provide quality education rooted in Christian values and the Augustinian Recollect charism. The institution began its journey with a commitment to academic excellence and holistic student development.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Growth and Development</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Over the years, the school expanded its programs and facilities to meet the evolving needs of students. From its humble beginnings, ARSC grew to become a leading educational institution offering programs from basic education to college level.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Academic Excellence</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  The school has consistently maintained high standards of academic excellence, producing graduates who excel in their chosen fields. Our faculty members are dedicated professionals committed to nurturing the intellectual and spiritual growth of our students.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Community and Service</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Throughout its history, ARSC has been deeply involved in community service and outreach programs. The school believes in the importance of developing socially responsible citizens who contribute meaningfully to society.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Modern Era</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  In recent years, ARSC has embraced technological advancement and modern pedagogical approaches while maintaining its core values. The school continues to innovate and adapt to prepare students for the challenges of the 21st century.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Legacy and Future</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  As ARSC looks to the future, it remains committed to its mission of providing transformative education grounded in faith, reason, and service. The school's legacy of excellence continues to inspire new generations of Consolatrians to make a positive impact in the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
