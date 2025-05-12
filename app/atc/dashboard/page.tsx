"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, Award, CircleDollarSign, UserPlus, Calendar } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Define types for our data
interface Student {
  _id: string
  name: string
  centerId: string
}

interface SubCenter {
  _id: string
  centerId: string
  name: string
  email: string
  phone: string
  address: string
  ownerImage: string
  photoIdImage: string
  centerLogo: string
  createdAt: string
  isActive: boolean
}

interface Course {
  _id: string
  name: string
  isActive: boolean
}

interface Activity {
  _id: string
  activity: string
  createdAt: string
  type: string
}

interface Certificate {
  _id: string
  studentId: string
  courseId: string
  centerId: string
  issueDate: string
}

export default function ATCDashboard() {
  // State for dashboard data
  const [studentCount, setStudentCount] = useState<number>(0)
  const [activeCoursesCount, setActiveCoursesCount] = useState<number>(0)
  const [certCount, setCertCount] = useState<number>(0)
  const [revenue, setRevenue] = useState<string>("₹0")
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [subcenterData, setSubcenterData] = useState<SubCenter | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    // Fetch all data for dashboard
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        
        if (!user?.userId) {
          throw new Error("No user ID found")
        }
        
        // Get subcenter data first
        const subcenterResponse = await fetch(`/api/subcenters?centerId=${user.userId}&t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          }
        })
        
        if (subcenterResponse.ok) {
          const subcenterData = await subcenterResponse.json()
          if (subcenterData.success && subcenterData.data.length > 0) {
            setSubcenterData(subcenterData.data[0])
            
            const centerId = subcenterData.data[0].centerId
            
            // Fetch students count for this subcenter
            const studentsResponse = await fetch(`/api/students?centerId=${centerId}&t=${timestamp}`, {
              headers: {
                'Cache-Control': 'no-store',
                'Pragma': 'no-cache'
              }
            })
            
            if (studentsResponse.ok) {
              const studentsData = await studentsResponse.json()
              if (studentsData.success) {
                setStudentCount(studentsData.data.length)
              }
            }
            
            // Fetch certificates for this subcenter
            const certificatesResponse = await fetch(`/api/certificates?centerId=${centerId}&t=${timestamp}`, {
              headers: {
                'Cache-Control': 'no-store',
                'Pragma': 'no-cache'
              }
            })
            
            if (certificatesResponse.ok) {
              const certificatesData = await certificatesResponse.json()
              if (certificatesData.success) {
                setCertCount(certificatesData.data.length)
              }
            }
            
            // Fetch recent activities for this subcenter
            const activitiesResponse = await fetch(`/api/activities?centerId=${centerId}&limit=5&t=${timestamp}`, {
              headers: {
                'Cache-Control': 'no-store',
                'Pragma': 'no-cache'
              }
            })
            
            if (activitiesResponse.ok) {
              const activitiesData = await activitiesResponse.json()
              if (activitiesData.success) {
                setRecentActivities(activitiesData.data)
              }
            }
          }
        }
        
        // Fetch active courses (common for all subcenters)
        const coursesResponse = await fetch(`/api/courses?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          }
        })
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json()
          if (coursesData.success) {
            // Count active courses
            const activeCourses = coursesData.data.filter((course: Course) => course.isActive)
            setActiveCoursesCount(activeCourses.length)
          }
        }

        // For now, we'll keep some mock data for revenue
        // In the future, this could be calculated from real data
        setRevenue("₹75,000")
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Set up interval to refresh data every minute
    const intervalId = setInterval(() => {
      fetchDashboardData()
    }, 60000) // 60,000 ms = 1 minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [user])

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Unknown time"
    }
  }

  // Prepare stats for the cards
  const stats = [
    {
      title: "Total Students",
      value: isLoading ? "Loading..." : studentCount.toString(),
      icon: <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />,
      change: "From your center",
    },
    {
      title: "Active Courses",
      value: isLoading ? "Loading..." : activeCoursesCount.toString(),
      icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />,
      change: "Available courses",
    },
    {
      title: "Certifications Issued",
      value: isLoading ? "Loading..." : certCount.toString(),
      icon: <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />,
      change: "From your center",
    },
    {
      title: "Revenue",
      value: isLoading ? "Loading..." : revenue,
      icon: <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />,
      change: "Total estimated",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ATC Dashboard</h1>
        {subcenterData && (
          <div className="text-sm text-gray-500">
            Center ID: <span className="font-medium">{subcenterData.centerId}</span>
          </div>
        )}
      </div>
      
      {subcenterData && (
        <Card className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-4 sm:p-6 flex flex-col justify-center">
              <div className="text-center mb-4">
                {subcenterData.centerLogo ? (
                  <img 
                    src={subcenterData.centerLogo} 
                    alt={subcenterData.name} 
                    className="h-24 w-24 mx-auto rounded-full object-cover border-4 border-blue-50"
                  />
                ) : (
                  <div className="h-24 w-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-500">
                      {subcenterData.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-center">{subcenterData.name}</h2>
              <p className="text-gray-500 text-center mt-1">{subcenterData.email}</p>
              <p className="text-gray-500 text-center">{subcenterData.phone}</p>
              
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs"
                >
                  <Link href="/atc/profile">View Profile</Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-2/3 bg-gray-50 p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Center Details</h3>
              <div className="space-y-2">
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium">Address:</div>
                  <div className="w-2/3 text-sm">{subcenterData.address}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium">Joined:</div>
                  <div className="w-2/3 text-sm">
                    {subcenterData.createdAt ? new Date(subcenterData.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 text-sm font-medium">Status:</div>
                  <div className="w-2/3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${subcenterData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {subcenterData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3 sm:gap-4 border-b pb-3 sm:pb-4 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600"></div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No recent activities found</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Link href="/atc/students/new">
                <Card className="cursor-pointer hover:bg-gray-50 h-full">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                    <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" />
                    <p className="text-xs sm:text-sm font-medium">Add New Student</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/atc/certificates/new">
                <Card className="cursor-pointer hover:bg-gray-50 h-full">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mb-2" />
                    <p className="text-xs sm:text-sm font-medium">Issue Certificate</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/atc/apply-for-exam">
                <Card className="cursor-pointer hover:bg-gray-50 h-full">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2" />
                    <p className="text-xs sm:text-sm font-medium">Apply For Exam</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/atc/students">
                <Card className="cursor-pointer hover:bg-gray-50 h-full">
                  <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2" />
                    <p className="text-xs sm:text-sm font-medium">View Students</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
