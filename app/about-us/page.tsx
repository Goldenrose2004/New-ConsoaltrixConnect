"use client"

import { useEffect, useState } from "react"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { Footer } from "@/components/footer"


const Users = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const Lock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const Check = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

export default function AboutUsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  const userInitials = (user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")

  return (
    <div className="min-h-screen bg-white">
      <AuthenticatedHeader userName={user?.firstName} userInitials={userInitials} useLandingPageStylingMobileOnly={true} />
      <main className="px-4 sm:px-6 md:px-8 lg:px-12" style={{ paddingTop: "4rem", paddingBottom: "80px" }}>
        <div className="max-w-5xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-24 sm:mb-32 md:mb-40">
            
            {/* Tag */}
            <div className="inline-block mb-6">
              <span className="px-3 py-1 border border-blue-100 text-[#041A44] rounded-full text-xs sm:text-sm font-medium bg-transparent" style={{ fontFamily: "'Inter', sans-serif" }}>
                Digital Platform for Education
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
              About ConsolatrixConnect
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your all-in-one digital portal designed to simplify access to school services, updates, and communication for Consolatrix College.
            </p>
          </div>

          {/* What is ConsolatrixConnect Section */}
          <div className="text-center mb-24 sm:mb-32 md:mb-40">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              What is ConsolatrixConnect?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect is a unified online platform that simplifies access to school services, updates, and communication. It connects students, faculty, and administrators through a seamless and secure digital experience.
            </p>
          </div>

          {/* Three Feature Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-24 sm:mb-32 md:mb-40">
            <div className="text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
              </div>
              <h3 className="text-base sm:text-xl font-medium text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Connected
              </h3>
              <p className="text-xs sm:text-base text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                Bring everyone together in one unified platform
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
              </div>
              <h3 className="text-base sm:text-xl font-medium text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Accessible
              </h3>
              <p className="text-xs sm:text-base text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                Available anytime, anywhere for your convenience
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3 sm:mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
              </div>
              <h3 className="text-base sm:text-xl font-medium text-gray-900 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Secure
              </h3>
              <p className="text-xs sm:text-base text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your data protected with modern security standards
              </p>
            </div>
          </div>

          {/* Mission and Vision Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mb-24 sm:mb-32 md:mb-40">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Our Mission
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                To provide a modern and accessible school platform that improves communication and enhances the daily experience of the Consolatrix community.
              </p>
            </div>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Our Vision
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                A connected digital campus where information, services, and support are available anytime, fostering a smarter and more efficient educational environment.
              </p>
            </div>
          </div>

          {/* Why This Matters Section */}
          <div className="mb-24 sm:mb-32 md:mb-40">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-10 sm:mb-14" style={{ fontFamily: "'Inter', sans-serif" }}>
              Why This Matters
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-center mb-10 sm:mb-12 max-w-3xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect was created to streamline communication, reduce confusion, and make school information easy to access. It brings services into one platform—faster, organized, and student-friendly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {[
                "Streamlined communication with all updates in one place",
                "Transparent organization of school policies and guidelines",
                "Environmental sustainability through reduced printed materials",
                "Enhanced accountability with tracking and record management"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-gray-700" />
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Section */}
          <div className="text-center py-16 sm:py-20 md:py-28">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              Stay Connected. Stay Informed.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect is built to support a smarter, more efficient school experience. Join our community and experience the future of educational technology.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

