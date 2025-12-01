"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { Footer } from "@/components/footer"
export default function CollegeCoursesOfferedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isOffline = !navigator.onLine

    // Check if anonymous offline mode is enabled
    const anonymousMode = localStorage.getItem('anonymousOfflineMode')
    if (isOffline && anonymousMode === 'true') {
      setIsLoading(false)
      return
    }

    // If offline, allow access even without currentUser (page is cached)
    if (isOffline) {
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        setUser(JSON.parse(currentUser))
      }
      setIsLoading(false)
      return
    }

    // If online, require authentication
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
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
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wide px-2 md:px-0" style={{ fontFamily: "'Inter', sans-serif" }}>COLLEGE COURSES OFFERED</h1>
            <div className="mt-2 h-1 mx-auto w-20 sm:w-24" style={{ backgroundColor: "#60A5FA" }}></div>
          </div>

          {/* Content Section */}
          <div className="mx-2 sm:mx-4 md:mx-8 my-4 md:my-8 rounded-lg p-3 sm:p-4 md:p-8" style={{ backgroundColor: "#1A355F" }}>
            <div className="text-white text-xs sm:text-base leading-relaxed space-y-3 md:space-y-4" style={{ textAlign: "justify" }}>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Science in Information Technology</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Prepare for a career in technology with our comprehensive IT program covering software development, database management, and network administration.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Science in Business Administration</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Develop business acumen and leadership skills through courses in management, accounting, marketing, and entrepreneurship.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Science in Education</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Become an effective educator with training in pedagogy, curriculum development, and specialized teaching methodologies.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Science in Nursing</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Pursue a rewarding healthcare career with comprehensive nursing education and clinical training.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Arts in Liberal Arts</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Explore diverse disciplines including literature, history, philosophy, and social sciences for a well-rounded education.
                </p>
              </div>

              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Bachelor of Science in Engineering</h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }}>
                  Master engineering principles and practices to solve real-world problems in civil, electrical, and mechanical engineering.
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
