"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Search, RefreshCw } from "lucide-react"

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

export default function OfflineExamMarksUpdate() {
  const [applications, setApplications] = useState<ExamApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchOfflineExamApplications()
  }, [])

  const fetchOfflineExamApplications = async () => {
    try {
      setIsLoading(true)
      // Add a timestamp parameter to avoid caching
      const timestamp = new Date().getTime()
      
      console.log("Fetching offline exam applications...")
      
      // First check if offline applications exist
      console.log("Checking if offline applications exist...")
      const checkUrl = `/api/exam-applications/check-offline?t=${timestamp}`
      
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
      
      const apiUrl = `/api/exam-applications?paperType=offline&status[$in]=approved,scheduled&t=${timestamp}`
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
        console.log("Valid applications:", validApplications)
        setApplications(validApplications)
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
                          {app.student?.course?.name || 'ADCA'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            Offline
                          </span>
                        </td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          {app.percentage !== undefined && app.percentage > 0
                            ? `Pass (${Number(app.percentage).toFixed(2)}%)` 
                            : app.status === 'approved' ? 'Pending Marks' : 'Waiting Approval'}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${app.percentage !== undefined && app.percentage > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' : app.status === 'approved' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'}`}
                            onClick={() => router.push(`/admin/exams/offline-marks/${app._id}`)}
                          >
                            {app.percentage !== undefined && app.percentage > 0 
                              ? 'Edit Approved Marks' 
                              : app.status === 'approved' 
                                ? 'Update Marks' 
                                : 'Approve & Enter Marks'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No approved exam applications found.
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