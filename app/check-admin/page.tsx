"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckAdminPage() {
  const [loading, setLoading] = useState(false)
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [message, setMessage] = useState("")
  
  // Check if admin user exists
  const checkAdmin = async () => {
    setLoading(true)
    setMessage("")
    
    try {
      const response = await fetch("/api/admin/profile")
      const data = await response.json()
      
      if (data.success) {
        setAdminExists(true)
        setMessage(`Admin user exists with username: ${data.profile.username} and email: ${data.profile.email}`)
      } else {
        setAdminExists(false)
        setMessage("Admin user does not exist or could not be found")
      }
    } catch (error) {
      setAdminExists(false)
      setMessage("Error checking admin status. Database connection may be down.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  // Reset admin to default
  const resetAdmin = async () => {
    setLoading(true)
    setMessage("")
    
    try {
      const response = await fetch("/api/force-admin-setup")
      const data = await response.json()
      
      if (data.success) {
        setMessage(data.message)
        setTimeout(() => {
          checkAdmin()
        }, 1000)
      } else {
        setMessage(`Failed to reset admin: ${data.message}`)
      }
    } catch (error) {
      setMessage("Error resetting admin user")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkAdmin()
  }, [])

  return (
    <div className="container my-10 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Admin Account Status</CardTitle>
          <CardDescription>
            Check and reset the admin account if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="font-medium mb-2">Status:</div>
              {loading ? (
                <div className="text-gray-500">Checking...</div>
              ) : (
                <div className={adminExists ? "text-green-600" : "text-red-600"}>
                  {adminExists === null ? "Unknown" : adminExists ? "Admin user exists" : "No admin user found"}
                </div>
              )}
              {message && <div className="mt-2 text-sm">{message}</div>}
            </div>
            
            <div className="text-sm text-gray-500">
              <p>If you can't login to admin panel, use the button below to reset the admin credentials to default:</p>
              <p className="mt-2"><strong>Email:</strong> admin@krishnacomputers.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={checkAdmin} disabled={loading} variant="outline">
            Check Status
          </Button>
          <Button onClick={resetAdmin} disabled={loading} variant="destructive">
            Reset Admin
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 