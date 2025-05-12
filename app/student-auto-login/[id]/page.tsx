"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader } from "lucide-react"

export default function StudentAutoLogin() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const [message, setMessage] = useState("Fetching student information...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const autoLogin = async () => {
      try {
        if (!studentId) {
          throw new Error("No student ID provided")
        }

        // Step 1: Fetch student details including password
        setMessage("Retrieving student information...")
        const response = await fetch(`/api/students/credentials/${studentId}`)
        
        if (!response.ok) {
          throw new Error(`Student lookup failed: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success || !data.data) {
          throw new Error(data.message || "Student not found")
        }
        
        const student = data.data
        const password = student.password

        if (!password) {
          throw new Error("Student password not available")
        }

        // Step 2: Perform automatic login
        setMessage("Logging in...")
        
        // Set up tab_id in session storage if it doesn't exist
        if (!sessionStorage.getItem("tab_id")) {
          sessionStorage.setItem("tab_id", Math.random().toString(36).substring(2, 15))
        }
        
        // Save login details to session storage directly (matching the way the login page does it)
        const tabId = sessionStorage.getItem("tab_id")
        
        // Store student information in session storage
        sessionStorage.setItem(`${tabId}_current_user_id`, student._id)
        sessionStorage.setItem(`${tabId}_auth_token`, "auto_login_token")
        sessionStorage.setItem(`${tabId}_user_type`, "student")
        
        // Redirect to student dashboard
        setMessage("Login successful! Redirecting to dashboard...")
        router.push("/student/dashboard")
      } catch (error) {
        console.error("Auto-login failed:", error)
        setError(error instanceof Error ? error.message : "Login failed")
        
        // Fallback to regular login
        setTimeout(() => {
          router.push(`/login?type=student&studentId=${encodeURIComponent(studentId)}`)
        }, 3000)
      }
    }

    autoLogin()
  }, [studentId, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-800">Student Portal</h2>
          <p className="mt-2 text-gray-600">Automatic Login</p>
        </div>

        {error ? (
          <div className="p-4 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <p className="text-gray-600">Redirecting to manual login...</p>
            <div className="mt-4">
              <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">{message}</p>
            <Loader className="h-10 w-10 animate-spin mx-auto text-blue-600" />
          </div>
        )}
      </div>
    </div>
  )
} 