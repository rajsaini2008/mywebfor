"use client"

import type React from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      {/* No header or navigation for login page */}
      {children}
      {/* No footer for login page */}
    </div>
  )
} 