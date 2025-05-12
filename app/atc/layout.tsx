"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import ATCSidebar from "@/components/atc/atc-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"

export default function ATCLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, userType } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      console.log("ATC layout auth check:", { isAuthenticated, userType });
      
      if (!isAuthenticated || userType !== "atc") {
        console.log("Redirecting from ATC panel to login - Not authenticated or wrong user type");
        
        toast({
          title: "Authentication required",
          description: "Please login as an ATC user to access this area",
          variant: "destructive",
        })
        
        router.push("/login?tab=atc")
      }
      
      setAuthChecked(true)
    }
  }, [isAuthenticated, isLoading, userType, router])

  if (isLoading || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
        <p className="ml-4 text-blue-800">Verifying authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated || userType !== "atc") {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <ATCSidebar />
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <main className="p-3 sm:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
