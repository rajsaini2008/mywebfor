"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"
import { fetchGlobalSettings, GlobalSettings, defaultSettings } from "@/lib/getGlobalSettings"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState("student")
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(defaultSettings)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  })
  const [studentCredentials, setStudentCredentials] = useState({
    id: "",
    password: "",
  })
  const [atcCredentials, setAtcCredentials] = useState({
    id: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showAtcPassword, setShowAtcPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [studentError, setStudentError] = useState("");
  const [atcError, setAtcError] = useState("");
  const [adminError, setAdminError] = useState("");

  // Load global settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchGlobalSettings()
        setGlobalSettings(settings)
      } catch (error) {
        console.error("Error loading global settings:", error)
      } finally {
        setIsSettingsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Set active tab based on URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const type = searchParams.get("type")
    const studentIdParam = searchParams.get("studentId")
    const centerIdParam = searchParams.get("centerId")
    
    // Set the active tab
    if (type === "student" || type === "atc" || type === "admin") {
      setActiveTab(type)
    }
    
    // If studentId is provided in the URL, pre-fill the form
    if (studentIdParam) {
      setStudentCredentials(prev => ({ ...prev, id: studentIdParam }))
    }
    
    // If centerId is provided in the URL, pre-fill the form
    if (centerIdParam) {
      setAtcCredentials(prev => ({ ...prev, id: centerIdParam }))
    }
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAdminError("");
    try {
      const success = await login("admin", adminCredentials.email, adminCredentials.password)
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        })
        router.push("/admin/dashboard")
      } else {
        setAdminError("Invalid email or password");
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      setAdminError("An error occurred during login");
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStudentError("");
    try {
      console.log("Student login attempt:", studentCredentials.id);
      
      // First use legacy login method for backward compatibility
      const success = await login("student", studentCredentials.id, studentCredentials.password)
      
      // Then use NextAuth for additional session support
      const nextAuthResult = await signIn("credentials", {
        id: studentCredentials.id,
        password: studentCredentials.password,
        redirect: false
      })
      
      console.log("NextAuth result:", nextAuthResult);

      if (success) {
        console.log("Student login successful");
        
        // Make sure to store the student ID in sessionStorage
        try {
          // Store raw student ID for compatibility with older code
          sessionStorage.setItem("current_user_id", studentCredentials.id);
          console.log("Stored student ID in sessionStorage:", studentCredentials.id);
        } catch (storageError) {
          console.error("Error storing student ID in sessionStorage:", storageError);
        }
        
        toast({
          title: "Login successful",
          description: "Welcome to the student portal",
        })
        router.push("/student/dashboard")
      } else {
        setStudentError("Invalid student ID or password");
        toast({
          title: "Login failed",
          description: "Invalid student ID or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStudentError("An error occurred during login");
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleATCLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAtcError("");
    try {
      console.log("ATC login attempt:", atcCredentials.id);
      const success = await login("atc", atcCredentials.id, atcCredentials.password)

      if (success) {
        console.log("ATC login successful");
        toast({
          title: "Login successful",
          description: "Welcome to the ATC panel",
        })
        router.push("/atc/dashboard")
      } else {
        setAtcError("Invalid ATC ID or password");
        toast({
          title: "Login failed",
          description: "Invalid ATC ID or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      setAtcError("An error occurred during login");
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get logo URL from global settings or use placeholder as fallback
  const logoUrl = globalSettings.logo || "/placeholder.svg?height=80&width=80";
  const siteName = globalSettings.websiteName || "Krishna Computers";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src={logoUrl}
              alt={`${siteName} Logo`}
              width={100}
              height={100}
              className="mx-auto"
              style={{ objectFit: 'contain' }}
              unoptimized={true}
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-blue-800">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger
              value="student"
              className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
            >
              Student
            </TabsTrigger>
            <TabsTrigger
              value="atc"
              className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
            >
              ATC
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
            >
              Admin
            </TabsTrigger>
          </TabsList>

          <Card className="mt-6 border-none shadow-lg">
            <TabsContent value="student" className="mt-0">
              <CardHeader>
                <CardTitle className="text-xl text-center">Student Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleStudentLogin}>
                  <div className="grid gap-2">
                    <label htmlFor="student-id" className="font-medium text-gray-700">
                      Student ID
                    </label>
                    <Input
                      id="student-id"
                      placeholder="Enter your student ID"
                      value={studentCredentials.id}
                      onChange={(e) => setStudentCredentials({ ...studentCredentials, id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="student-password" className="font-medium text-gray-700">
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-sm text-blue-800 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="student-password"
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={studentCredentials.password}
                        onChange={(e) => setStudentCredentials({ ...studentCredentials, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        onClick={() => setShowStudentPassword((v) => !v)}
                        aria-label={showStudentPassword ? "Hide password" : "Show password"}
                      >
                        {showStudentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {studentError && (
                      <div className="text-red-600 text-sm mt-1">{studentError}</div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-800 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/registration" className="text-blue-800 hover:underline">
                    Register Now
                  </Link>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="atc" className="mt-0">
              <CardHeader>
                <CardTitle className="text-xl text-center">ATC Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleATCLogin}>
                  <div className="grid gap-2">
                    <label htmlFor="atc-id" className="font-medium text-gray-700">
                      ATC ID
                    </label>
                    <Input
                      id="atc-id"
                      placeholder="Enter your ATC ID"
                      value={atcCredentials.id}
                      onChange={(e) => setAtcCredentials({ ...atcCredentials, id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="atc-password" className="font-medium text-gray-700">
                        Password
                      </label>
                      <Link href="/forgot-password?type=atc" className="text-sm text-blue-800 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="atc-password"
                        type={showAtcPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={atcCredentials.password}
                        onChange={(e) => setAtcCredentials({ ...atcCredentials, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        onClick={() => setShowAtcPassword((v) => !v)}
                        aria-label={showAtcPassword ? "Hide password" : "Show password"}
                      >
                        {showAtcPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {atcError && (
                      <div className="text-red-600 text-sm mt-1">{atcError}</div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-800 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-gray-600">
                  Need to become an ATC?{" "}
                  <Link href="/franchise-registration" className="text-blue-800 hover:underline">
                    Register As ATC
                  </Link>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <CardHeader>
                <CardTitle className="text-xl text-center">Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleAdminLogin}>
                  <div className="grid gap-2">
                    <label htmlFor="admin-email" className="font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="admin-password" className="font-medium text-gray-700">
                        Password
                      </label>
                      <Link href="/admin/reset-password" className="text-sm text-blue-800 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                        onClick={() => setShowAdminPassword((v) => !v)}
                        aria-label={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {adminError && (
                      <div className="text-red-600 text-sm mt-1">{adminError}</div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-800 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}
