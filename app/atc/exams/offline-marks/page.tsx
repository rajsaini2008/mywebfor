"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Search, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Image from "next/image"

interface Student {
  _id: string
  studentId: string
  name: string
  photo?: string
  photoUrl?: string
  course?: {
    _id: string
    name: string
  }
}

interface ExamApplication {
  _id: string
  examPaperId: string
  studentId: string
  scheduledTime: string
  paperType: string
  status: string
  score?: number
  percentage?: number
  examPaper?: {
    paperName: string
    time: number
  }
  student?: Student
}

export default function OfflineExamMarksUpdate() {
  const [applications, setApplications] = useState<ExamApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Function to get the correct photo URL
  const getStudentPhotoUrl = (student: Student) => {
    // If student object is null or undefined
    if (!student) {
      return "/placeholder-avatar.jpg";
    }
    
    // Get photo from either photo or photoUrl property
    const photoPath = student.photo || student.photoUrl;
    
    // If no photo path is available
    if (!photoPath || photoPath === "") {
      return "/placeholder-avatar.jpg";
    }
    
    // Handle different URL formats
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
      // Absolute URL or data URL - use as is
      return photoPath;
    } else if (photoPath.startsWith('/uploads/')) {
      // URL starting with /uploads/ - use as is
      return photoPath;
    } else if (photoPath.includes('/')) {
      // Any URL with slashes - likely a relative path, use as is
      return photoPath;
    } else {
      // Simple filename - add API uploads prefix
      return `/api/uploads/${photoPath}`;
    }
  }

  // Component for displaying student photo with proper error handling
  const StudentPhoto = ({ student }: { student: Student | undefined }) => {
    const [imageError, setImageError] = useState(false);
    
    // Reset error state if student changes
    useEffect(() => {
      setImageError(false);
    }, [student]);
    
    // If no student data, show placeholder
    if (!student) {
      return (
        <div className="passport-photo h-32 w-24 overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-center text-gray-400 px-2">No Student Data</span>
        </div>
      );
    }
    
    // If image previously failed to load or no photo data, show placeholder
    if (imageError || (!student.photo && !student.photoUrl)) {
      return (
        <div className="passport-photo h-32 w-24 overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-center text-gray-400 px-2">No Photo Available</span>
        </div>
      );
    }
    
    // Otherwise show the image with error handling
    return (
      <div className="passport-photo h-32 w-24 overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        <img
          src={getStudentPhotoUrl(student)}
          alt={student.name || 'Student'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  useEffect(() => {
    fetchOfflineExamApplications()
  }, [])

  const fetchOfflineExamApplications = async () => {
    try {
      setIsLoading(true)
      // Add a timestamp parameter to avoid caching
      const timestamp = new Date().getTime()
      
      console.log("Fetching offline exam applications for ATC...")
      console.log("Current user ID:", user?._id)
      
      if (!user?._id) {
        console.error("No user ID available - user may not be logged in")
        toast({
          title: "Error",
          description: "User authentication required. Please log in again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
      
      // First check if offline applications exist
      console.log("Checking if offline applications exist...")
      const checkUrl = `/api/exam-applications/check-offline?atcId=${user?._id}&t=${timestamp}`
      
      try {
        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          console.log("Check response:", checkData)
          
          if (!checkData.success) {
            throw new Error(checkData.message || "Failed to check for offline applications")
          }
          
          if (checkData.count === 0) {
            console.log("No offline applications found")
            setApplications([])
            setIsLoading(false)
            return
          }
          
          console.log(`Found ${checkData.count} offline applications, proceeding to fetch details`)
        } else {
          console.log("Check request failed, proceeding with regular fetch")
        }
      } catch (checkError) {
        console.error("Error checking offline applications:", checkError)
        console.log("Proceeding with regular fetch anyway")
      }
      
      // Modified to only fetch applications for this ATC
      const apiUrl = `/api/exam-applications?paperType=offline&status[$in]=approved,scheduled&atcId=${user?._id}&t=${timestamp}`
      console.log("Fetching from URL:", apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }

      const data = await response.json()
      console.log("API response:", data)
      
      if (data.success) {
        console.log("Offline exam applications:", data.data)
        
        // Filter out applications where student data is null, undefined, or incomplete
        const validApplications = data.data.filter((app: any) => 
          app.student && 
          app.student._id && 
          app.student.name && 
          app.student.name !== "Unknown Name" && 
          app.student.studentId && 
          app.student.studentId !== "Unknown ID"
        )
        
        console.log(`Filtered out ${data.data.length - validApplications.length} applications with missing student data`)
        
        // Process student photo fields to ensure they're properly formatted
        const processedApplications = validApplications.map((app: any) => {
          if (app.student) {
            // Ensure photo field is properly set
            if (!app.student.photo && app.student.photoUrl) {
              app.student.photo = app.student.photoUrl;
            }
            
            // If photo is just a filename without path, format it properly
            if (app.student.photo && !app.student.photo.includes('/') && !app.student.photo.startsWith('http')) {
              app.student.photo = `/uploads/${app.student.photo}`;
            }
          }
          return app;
        });
        
        console.log("Processed applications:", processedApplications)
        setApplications(processedApplications)
      } else {
        console.error("API returned error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch offline exam applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching offline exam applications:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error details:", errorMessage)
      
      toast({
        title: "Error",
        description: "An error occurred while fetching offline exam applications: " + errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true
    
    const studentName = app.student?.name || ""
    const studentId = app.student?.studentId || ""
    const courseName = app.student?.course?.name || "Unknown Course"
    
    const query = searchQuery.toLowerCase()
    return (
      studentName.toLowerCase().includes(query) ||
      studentId.toLowerCase().includes(query) ||
      courseName.toLowerCase().includes(query)
    )
  })

  const refreshData = () => {
    fetchOfflineExamApplications()
    toast({
      title: "Data Refreshed",
      description: "The offline exam application data has been refreshed",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Offline Exam Marks Update</h1>

      <div className="flex gap-2 mb-6">
        <div className="relative w-[150px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 border border-gray-300 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="h-9 border border-gray-300"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 border border-gray-300"
          onClick={() => {
            toast({
              title: "Excel Export",
              description: "Excel export functionality will be implemented soon",
            })
          }}
        >
          Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 border border-gray-300"
          onClick={() => {
            toast({
              title: "PDF Export",
              description: "PDF export functionality will be implemented soon",
            })
          }}
        >
          PDF
        </Button>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2 bg-gray-50 border-b">
          <CardTitle className="text-lg font-medium">Student Exam Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b uppercase">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">SR.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">STUDENT DETAIL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">PHOTO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">COURSE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">EXAM MODE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">RESULT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app, index) => {
                    if (!app.student || !app.student.name || !app.student.studentId) {
                      return null
                    }
                    
                    return (
                      <tr key={app._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {app.student?.studentId || 'Unknown ID'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {app.student?.name || 'Unknown Name'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StudentPhoto student={app.student} />
                        </td>
                        <td className="px-4 py-3">
                          {app.student?.course?.name || 'Unknown Course'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 inline-block">
                            Offline
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {app.percentage ? (
                            <div className="font-medium">
                              {typeof app.percentage === 'number' ? app.percentage.toFixed(2) : app.percentage}%
                            </div>
                          ) : (
                            <div className="text-sm text-amber-600 font-medium">
                              {app.status === 'approved' ? 'Pending' : 'New - Not Approved'}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => router.push(`/atc/exams/offline-marks/${app._id}`)}
                          >
                            {app.status === 'approved' ? 'Update Marks' : 'Start Exam'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-800 mr-2"></div>
                          Loading applications...
                        </div>
                      ) : (
                        "No exam applications found."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 