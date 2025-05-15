"use client"

import { useEffect, useState } from "react"

export function EnsureAdmin() {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Call the API to ensure admin exists
        const res = await fetch('/api/setup/admin')
        const data = await res.json()

        if (data.success) {
          setStatus(data.message)
        } else {
          console.error("Failed to setup admin:", data.message)
        }
      } catch (error) {
        console.error("Error setting up admin:", error)
      }
    }

    setupAdmin()
  }, [])

  return null // This component doesn't render anything
} 