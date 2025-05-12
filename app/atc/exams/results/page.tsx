"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "../../../components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "@/components/ui/use-toast"
import { Search, FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"

interface Student {
  _id: string
  studentId: string
  name: string
  photo?: string
  photoUrl?: string
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
    _id: string
    paperName: string
    time: number
  }
  student?: Student
  courseDetails?: {
    _id: string
    name: string
  }
}

export default function ExamResults() {
  const [applications, setApplications] = useState<ExamApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ExamApplication[]>([])
  const [paperTypes, setPaperTypes] = useState<string[]>([])
  const [examPapers, setExamPapers] = useState<any[]>([])
  const [selectedPaperType, setSelectedPaperType] = useState<string>("all")
  const [selectedExamPaper, setSelectedExamPaper] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchExamResults()
  }, [])

  useEffect(() => {
    // Apply filters when applications, search, or selections change
    filterApplications()
  }, [applications, searchQuery, selectedPaperType, selectedExamPaper])

  const fetchExamResults = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      
      // Add atcId parameter to only get results for this ATC's students
      const response = await fetch(`/api/exam-applications?hasMarks=true&atcId=${user?._id}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Extract unique paper types and exam papers for filters
        const applications = data.data.filter((app: any) => app.percentage !== undefined && app.percentage > 0)
        
        // Sort by date, most recent first
        applications.sort((a: any, b: any) => {
          return new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
        })
        
        setApplications(applications)
        
        // Extract unique paper types for filter
        const uniquePaperTypes = [...new Set(applications.map((app: any) => app.paperType))]
        setPaperTypes(uniquePaperTypes)
        
        // Extract unique exam papers for filter
        const uniqueExamPapers = [...new Set(applications.map((app: any) => 
          app.examPaper ? { id: app.examPaper._id, name: app.examPaper.paperName } : null
        ))]
        .filter(Boolean)
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        
        setExamPapers(uniqueExamPapers)
        
        // Initially set filtered applications to all applications
        setFilteredApplications(applications)
      } else {
        throw new Error(data.message || "Failed to fetch exam results")
      }
    } catch (error) {
      console.error("Error fetching exam results:", error)
      toast({
        title: "Error",
        description: "Failed to fetch exam results",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = [...applications]
    
    // Filter by paper type
    if (selectedPaperType !== "all") {
      filtered = filtered.filter(app => app.paperType === selectedPaperType)
    }
    
    // Filter by exam paper
    if (selectedExamPaper !== "all") {
      filtered = filtered.filter(app => app.examPaper?._id === selectedExamPaper)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app => 
        app.student?.name?.toLowerCase().includes(query) ||
        app.student?.studentId?.toLowerCase().includes(query) ||
        app.examPaper?.paperName?.toLowerCase().includes(query) ||
        app.courseDetails?.name?.toLowerCase().includes(query)
      )
    }
    
    setFilteredApplications(filtered)
  }

  const resetFilters = () => {
    setSelectedPaperType("all")
    setSelectedExamPaper("all")
    setSearchQuery("")
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy hh:mm a')
    } catch {
      return 'Invalid Date'
    }
  }

  const columns: ColumnDef<ExamApplication>[] = [
    {
      accessorKey: "index",
      header: "SR.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "student",
      header: "STUDENT DETAILS",
      cell: ({ row }) => {
        const student = row.original.student
        return student ? (
          <div>
            <div className="font-medium">{student.studentId || "Unknown ID"}</div>
            <div className="text-sm text-gray-500">{student.name || "Unknown Name"}</div>
          </div>
        ) : "Unknown Student"
      },
    },
    {
      accessorKey: "courseDetails.name",
      header: "COURSE",
      cell: ({ row }) => row.original.courseDetails?.name || "Unknown Course",
    },
    {
      accessorKey: "examPaper.paperName",
      header: "EXAM PAPER",
      cell: ({ row }) => row.original.examPaper?.paperName || "Unknown Paper",
    },
    {
      accessorKey: "paperType",
      header: "EXAM MODE",
      cell: ({ row }) => {
        const paperType = row.original.paperType
        return (
          <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
            ${paperType === "online" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
            {paperType === "online" ? "Online" : "Offline"}
          </div>
        )
      },
    },
    {
      accessorKey: "scheduledTime",
      header: "EXAM DATE",
      cell: ({ row }) => formatDate(row.original.scheduledTime),
    },
    {
      accessorKey: "percentage",
      header: "SCORE",
      cell: ({ row }) => {
        const percentage = row.original.percentage
        return percentage !== undefined ? (
          <div className="font-medium">
            {typeof percentage === 'number' ? percentage.toFixed(2) : percentage}%
          </div>
        ) : "Pending"
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const application = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => {
              // Will implement certificate generation in future
              toast({
                title: "Certificate",
                description: "Certificate generation will be implemented in a future update.",
              })
            }}
          >
            <FileText className="w-4 h-4 mr-1" />
            Certificate
          </Button>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Exam Results</h1>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/4">
              <Select 
                value={selectedPaperType} 
                onValueChange={setSelectedPaperType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Paper Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Paper Types</SelectItem>
                  {paperTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === "online" ? "Online" : "Offline"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/4">
              <Select 
                value={selectedExamPaper} 
                onValueChange={setSelectedExamPaper}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam Paper" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Papers</SelectItem>
                  {examPapers.map(paper => (
                    <SelectItem key={paper.id} value={paper.id}>
                      {paper.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search student..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-1/4 flex gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
              <Button 
                variant="outline"
                className="flex-shrink-0"
                onClick={() => {
                  toast({
                    title: "Export",
                    description: "Export functionality will be implemented in a future update.",
                  })
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 pt-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No exam results found matching your criteria.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredApplications}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 