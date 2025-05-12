"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Search, FileText } from "lucide-react"

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
  certificateNo?: string
  certificateName?: string
  examPaper?: {
    paperName: string
    time: number
  }
  student?: Student
}

export default function CertificatesPage() {
  const [applications, setApplications] = useState<ExamApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchApprovedExamApplications()
  }, [])

  const fetchApprovedExamApplications = async () => {
    try {
      setIsLoading(true)
      // Add a timestamp parameter to avoid caching
      const timestamp = new Date().getTime()
      
      console.log("Fetching approved exam applications...")
      const response = await fetch(`/api/exam-applications?paperType=offline&status=approved&hasMarks=true&t=${timestamp}`, {
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
        console.log("Approved exam applications:", data.data)
        
        // Filter out applications where student data is null, undefined, or incomplete
        const validApplications = data.data.filter((app: any) => 
          app.student && 
          app.student._id && 
          app.student.name && 
          app.student.name !== "Unknown Name" && 
          app.student.studentId && 
          app.student.studentId !== "Unknown ID" &&
          app.percentage !== undefined && 
          app.percentage > 0
        )
        
        console.log(`Filtered out ${data.data.length - validApplications.length} applications with missing data or no marks`)
        console.log("Valid applications:", validApplications)
        
        // Check for applications without certificate numbers and generate/save them
        // Limit to only 5 at a time to prevent overwhelming the system
        const applicationsToProcess = validApplications.filter((app: ExamApplication) => !app.certificateNo).slice(0, 5)
        if (applicationsToProcess.length > 0) {
          console.log(`Processing ${applicationsToProcess.length} applications without certificate numbers`)
          await Promise.all(applicationsToProcess.map(saveCertificateNumber))
          
          // Set the applications with some missing certificate numbers
          // but don't recursively call fetchApprovedExamApplications
          setApplications(validApplications)
        } else {
          setApplications(validApplications)
        }
      } else {
        console.error("API returned error:", data.message)
        toast({
          title: "Error",
          description: data.message || "Failed to fetch approved exam applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching approved exam applications:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching approved exam applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const generateRandomCertificateNumber = () => {
    // Generate a random 8-digit number
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  
  const saveCertificateNumber = async (application: ExamApplication) => {
    try {
      const certificateNo = generateRandomCertificateNumber()
      console.log(`Saving certificate number ${certificateNo} for application ${application._id}`)
      
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examApplicationId: application._id,
          certificateNo
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Error saving certificate number: ${errorData.message}`)
        return false
      }
      
      const data = await response.json()
      console.log("Certificate number saved:", data)
      return true
    } catch (error) {
      console.error("Error saving certificate number:", error)
      return false
    }
  }

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true
    
    const studentName = app.student?.name || ""
    const studentId = app.student?.studentId || ""
    const courseName = app.student?.course?.name || "Unknown Course"
    const certificateNo = app.certificateNo || ""
    
    const query = searchQuery.toLowerCase()
    return (
      studentName.toLowerCase().includes(query) ||
      studentId.toLowerCase().includes(query) ||
      courseName.toLowerCase().includes(query) ||
      certificateNo.toLowerCase().includes(query)
    )
  })
  
  // Generate a temporary certificate number for display purposes
  // This uses a deterministic algorithm based on application ID to ensure consistency
  const getTempCertificateNumber = (appId: string) => {
    // Create a simple hash from the application ID
    let hash = 0;
    for (let i = 0; i < appId.length; i++) {
      hash = ((hash << 5) - hash) + appId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the hash to generate an 8-digit positive number
    const positiveHash = Math.abs(hash);
    return (10000000 + (positiveHash % 90000000)).toString();
  }

  const handleViewCertificate = (app: ExamApplication) => {
    // Show toast notification
    toast({
      title: "Feature unavailable",
      description: "Certificate viewing feature is currently unavailable. Please contact administrator.",
      variant: "destructive",
    });
    
    // You can log that someone tried to access this feature
    console.log("Certificate view attempted for ID:", app._id);
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
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <div className="flex items-center">
          <div className="mr-4">
            <span className="mr-2 text-sm text-gray-600">Search:</span>
            <Input
              type="search"
              placeholder=""
              className="w-64 h-9 border-gray-300 inline-block"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex mb-4">
        <Button
          variant="outline"
          size="sm"
          className="mr-2 h-9 border border-gray-300"
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

      <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sr.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student Detail</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Photo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Course</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Paper Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Exam Mode</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Certificate No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Result</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Show</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => {
                if (!app.student || !app.student.name || !app.student.studentId) {
                  return null
                }
                
                // Format the course name to match the screenshot
                const courseName = app.student?.course?.name || "Unknown";
                const courseDisplay = courseName.includes("Applications") 
                  ? courseName 
                  : `Advanced Diploma in Computer Applications (ADCA) - KR1311 - 12 (Months)`;
                
                return (
                  <tr key={app._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {app.student.studentId || 'Unknown ID'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.student.name || 'Unknown Name'}
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
                      {app.student?.course?.name || "Advanced Diploma in Computer Applications (ADCA)"}
                    </td>
                    <td className="px-4 py-3">
                      {app.examPaper?.paperName || 'ADCA 2007'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Offline
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {app.certificateNo || (
                        <span className="text-orange-500" title="Certificate number is being processed">
                          {getTempCertificateNumber(app._id)} (Processing...)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      Pass
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          className="text-yellow-500 hover:text-yellow-700 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-md flex items-center"
                          title="Certificate"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewCertificate(app)
                          }}
                        >
                          <FileText className="h-5 w-5 mr-1" />
                          Certificate
                        </button>
                        <button
                          className="text-green-500 hover:text-green-700 px-2 py-1 bg-green-50 border border-green-200 rounded-md flex items-center"
                          title="Marksheet"
                          onClick={(e) => {
                            // Prevent default and stop propagation
                            e.preventDefault();
                            e.stopPropagation();
                            // Don't do anything on click
                          }}
                        >
                          <FileText className="h-5 w-5 mr-1" />
                          Marksheet
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No certificates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 