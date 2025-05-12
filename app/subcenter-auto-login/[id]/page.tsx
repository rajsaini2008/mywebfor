"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { User } from "lucide-react"

export default function SubcenterAutoLogin() {
  const params = useParams()
  const router = useRouter()
  const centerId = params.id as string
  const [message, setMessage] = useState("Fetching subcenter information...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const autoLogin = async () => {
      try {
        if (!centerId) {
          throw new Error("No center ID provided")
        }

        // Step 1: Fetch subcenter details including password
        setMessage("Retrieving subcenter information...")
        const response = await fetch(`/api/subcenters/credentials/${centerId}`)
        
        if (!response.ok) {
          throw new Error(`Subcenter lookup failed: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success || !data.data) {
          throw new Error(data.message || "Subcenter not found")
        }
        
        const subcenter = data.data
        const password = subcenter.password

        if (!password) {
          throw new Error("Subcenter password not available")
        }

        // Step 2: Perform automatic login
        setMessage("Logging in...")
        
        // Set up tab_id in session storage if it doesn't exist
        if (!sessionStorage.getItem("tab_id")) {
          sessionStorage.setItem("tab_id", Math.random().toString(36).substring(2, 15))
        }
        
        // Save login details to session storage directly
        const tabId = sessionStorage.getItem("tab_id")
        
        // Store subcenter information in session storage
        sessionStorage.setItem(`${tabId}_current_user_id`, subcenter._id)
        sessionStorage.setItem(`${tabId}_auth_token`, "auto_login_token")
        sessionStorage.setItem(`${tabId}_user_type`, "atc")
        
        // Redirect to ATC dashboard
        setMessage("Login successful! Redirecting to dashboard...")
        router.push("/atc/dashboard")
      } catch (error) {
        console.error("Auto-login failed:", error)
        setError(error instanceof Error ? error.message : "Login failed")
        
        // Fallback to regular login
        setTimeout(() => {
          router.push(`/login?type=atc&centerId=${encodeURIComponent(centerId)}`)
        }, 3000)
      }
    }

    autoLogin()
  }, [centerId, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-800">Subcenter Portal</h2>
          <p className="mt-2 text-gray-600">Automatic Login</p>
        </div>

        {error ? (
          <div className="p-4 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <p className="text-gray-600">Redirecting to manual login...</p>
            <div className="mt-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-800 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  )
} 