"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, Award, CircleDollarSign, UserPlus, PlusCircle } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

// Define types for our data
interface Student {
  _id: string
  name: string
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

export default function AdminDashboard() {
  // State for dashboard data
  const [studentCount, setStudentCount] = useState<number>(0)
  const [activeCoursesCount, setActiveCoursesCount] = useState<number>(0)
  const [certCount, setCertCount] = useState<number>(0)
  const [revenue, setRevenue] = useState<string>("₹0")
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Fetch all data for dashboard
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        
        // Fetch students count
        const studentsResponse = await fetch(`/api/students?t=${timestamp}`, {
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
        
        // Fetch courses
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
        
        // Fetch recent activities
        const activitiesResponse = await fetch(`/api/activities?limit=5&t=${timestamp}`, {
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

        // For now, we'll keep some mock data for certificates and revenue
        // In the future, these could be calculated from real data
        setCertCount(856)
        setRevenue("₹4,56,789")
        
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
  }, [])

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
      change: "Updated in real-time",
    },
    {
      title: "Active Courses",
      value: isLoading ? "Loading..." : activeCoursesCount.toString(),
      icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />,
      change: "Updated in real-time",
    },
    {
      title: "Certifications Issued",
      value: isLoading ? "Loading..." : certCount.toString(),
      icon: <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />,
      change: "+43 this month",
    },
    {
      title: "Revenue",
      value: isLoading ? "Loading..." : revenue,
      icon: <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />,
      change: "+8% from last month",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

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
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Add New Student</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <PlusCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Add New Course</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Issue Certificate</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
                  <CircleDollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Record Payment</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
