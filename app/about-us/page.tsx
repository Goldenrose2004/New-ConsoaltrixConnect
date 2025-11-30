"use client"

import { useEffect, useState } from "react"
import { AuthenticatedHeader } from "@/components/authenticated-header"
import { Footer } from "@/components/footer"
import { Target, Eye, Check } from "lucide-react"

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
      <main className="px-4 sm:px-6 md:px-8 lg:px-12" style={{ paddingTop: "2rem", paddingBottom: "60px" }}>
        <div className="max-w-6xl mx-auto">
          {/* Top Section */}
          <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            {/* Tag */}
            <div className="inline-block mb-4 sm:mb-6">
              <span className="px-4 py-2 bg-blue-100 text-[#041A44] rounded-lg text-sm sm:text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                Digital Platform for Education
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="text-gray-900">About </span>
              <span className="text-[#041A44]">ConsolatrixConnect</span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Your all-in-one digital portal designed to simplify access to school services, updates, and communication for Consolatrix College.
            </p>
          </div>

          {/* What is ConsolatrixConnect Section - Light Blue Background */}
          <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              What is ConsolatrixConnect?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect is a unified online platform that simplifies access to school services, updates, and communication. It connects students, faculty, and administrators through a seamless and secure digital experience.
            </p>
          </div>

          {/* Three Feature Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#041A44] mb-2 sm:mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                CONNECTED
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                Bring everyone together in one unified platform
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#041A44] mb-2 sm:mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                ACCESSIBLE
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                Available anytime, anywhere for your convenience
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#041A44] mb-2 sm:mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                SECURE
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                Your data protected with modern security standards
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#041A44]" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Our Mission
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  To provide a modern and accessible school platform that improves communication and enhances the daily experience of the Consolatrix community.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-[#041A44]" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Our Vision
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  A connected digital campus where information, services, and support are available anytime, fostering a smarter and more efficient educational environment.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Matters Section */}
          <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              Why This Matters
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect was created to streamline communication, reduce confusion, and make school information easy to access. It brings services into one platform—faster, organized, and student-friendly.
            </p>
            <div className="space-y-4 sm:space-y-5">
              {[
                "Streamlined communication with all updates in one place",
                "Transparent organization of school policies and guidelines",
                "Environmental sustainability through reduced printed materials",
                "Enhanced accountability with tracking and record management"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-md flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#041A44]" />
                  </div>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              Stay Connected. Stay Informed.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              ConsolatrixConnect is built to support a smarter, more efficient school experience.
              <br className="hidden sm:block" />
              Join our community and experience the future of educational technology.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

