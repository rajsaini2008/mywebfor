"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Search, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface Student {
  _id: string
  studentId: string
  name: string
  photo?: string
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

export default function OnlineExamMarksUpdate() {
  const [applications, setApplications] = useState<ExamApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchOnlineExamApplications()
  }, [])

  const fetchOnlineExamApplications = async () => {
    try {
      setIsLoading(true)
      // Add a timestamp parameter to avoid caching
      const timestamp = new Date().getTime()
      
      console.log("Fetching online exam applications for ATC...")
      
      // Modified to only fetch applications for this ATC
      const response = await fetch(`/api/exam-applications?paperType=online&status=approved&atcId=${user?._id}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)
      
      if (data.success) {
        console.log("Online exam applications:", data.data)
        
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
        console.log("Valid applications:", validApplications)
        setApplications(validApplications)
      } else {
        console.error("API returned error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch online exam applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching online exam applications:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching online exam applications",
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
    fetchOnlineExamApplications()
    toast({
      title: "Data Refreshed",
      description: "The online exam application data has been refreshed",
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Online Exam Marks Update</h1>

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
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            {app.student?.photo ? (
                              <img
                                src={app.student.photo}
                                alt={app.student.name || 'Student'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                N/A
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {app.student?.course?.name || 'Unknown Course'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 inline-block">
                            Online
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {app.percentage ? (
                            <div className="font-medium">
                              {typeof app.percentage === 'number' ? app.percentage.toFixed(2) : app.percentage}%
                            </div>
                          ) : (
                            <div className="text-sm text-amber-600 font-medium">
                              Pending
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => router.push(`/atc/exams/online-marks/${app._id}`)}
                          >
                            Update Marks
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