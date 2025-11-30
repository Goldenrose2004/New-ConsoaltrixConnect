import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { OfflineDetector } from "@/components/offline-detector"
import { AutoLoginCheck } from "@/components/auto-login-check"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConsolatrixConnect - Digital School Handbook",
  description:
    "Your school policy handbook, digitized. Access information, resources, and stay connected with ConsolatrixConnect.",
  icons: {
    icon: [
      {
        url: "/images/logo-icon.png",
        type: "image/png",
      },
      {
        url: "/images/logo-icon.png",
        type: "image/png",
      },
    ],
    apple: "/images/logo-icon.png",
  },
  manifest: "/manifest.json",
  themeColor: "#041A44",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ConsolatrixConnect",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={`${geist.className} font-sans antialiased`}>
        <ServiceWorkerRegister />
        <OfflineDetector />
        <AutoLoginCheck />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
