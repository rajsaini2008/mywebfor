"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import StudentSidebar from "@/components/student/student-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, userType } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== "student")) {
      router.push("/login?tab=student")
    }
  }, [isAuthenticated, isLoading, userType, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (!isAuthenticated || userType !== "student") {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <StudentSidebar />
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <main className="p-3 sm:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
