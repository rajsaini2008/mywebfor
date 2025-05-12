"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, userType } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== "admin")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, userType, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (!isAuthenticated || userType !== "admin") {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <main className="p-3 sm:p-6 min-h-[calc(100vh-2rem)]">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
