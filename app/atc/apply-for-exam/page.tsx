"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"

interface Student {
  _id: string
  studentId: string
  name: string
  course?: {
    _id: string
    name: string
  }
}

interface ExamPaper {
  _id: string
  paperId: string
  paperName: string
  time: number // in minutes
  passPercentage: number
  paperType?: string
}

export default function ApplyForExam() {
  const [students, setStudents] = useState<Student[]>([])
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [paperType, setPaperType] = useState("online")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  // Fetch students and exam papers on component mount
  useEffect(() => {
    fetchStudents()
    fetchExamPapers()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      // Add atcId parameter to get only ATC students
      const response = await fetch(`/api/students?atcId=${user?._id}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`Loaded ${data.data.length} students from database`)
        
        // Map the API response to include course details if available
        const mappedStudents = data.data.map((student: any) => ({
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          course: student.courseDetails || {
            _id: student.course,
            name: "Unknown Course"
          }
        }))
        
        setStudents(mappedStudents || [])
      } else {
        throw new Error(data.message || "Failed to load students")
      }
    } catch (error) {
      console.error("Error loading students:", error)
      toast({
        title: "Error loading students",
        description: "There was a problem loading the student data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExamPapers = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/exam-papers?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`Loaded ${data.data.length} exam papers from database`)
        setExamPapers(data.data || [])
      } else {
        throw new Error(data.message || "Failed to load exam papers")
      }
    } catch (error) {
      console.error("Error loading exam papers:", error)
      toast({
        title: "Error loading exam papers",
        description: "There was a problem loading the exam paper data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedExam) {
      toast({
        title: "Error",
        description: "Please select an exam paper",
        variant: "destructive",
      })
      return
    }
    
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      })
      return
    }
    
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Error",
        description: "Please select a scheduled date and time",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Combine date and time for scheduling
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`)
      
      const applicationData = {
        examPaperId: selectedExam,
        studentIds: selectedStudents,
        scheduledTime: scheduledDateTime.toISOString(),
        paperType: paperType,
        atcId: user?._id  // Add the ATC ID to associate with the ATC
      }
      
      const response = await fetch('/api/exam-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Successfully applied for exam for ${data.count} students`,
        })
        
        // Reset form
        setSelectedStudents([])
        setSelectedExam("")
        setScheduledDate("")
        setScheduledTime("")
      } else {
        throw new Error(data.message || "Failed to apply for exam")
      }
    } catch (error) {
      console.error("Error applying for exam:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Apply For Exam</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exam Selection */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examPaper">Exam Paper <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedExam}
                  onValueChange={setSelectedExam}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an exam paper" />
                  </SelectTrigger>
                  <SelectContent>
                    {examPapers.map((paper) => (
                      <SelectItem key={paper._id} value={paper._id}>
                        {paper.paperName} ({paper.time} mins)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paperType">Exam Type <span className="text-red-500">*</span></Label>
                <Select
                  value={paperType}
                  onValueChange={setPaperType}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Exam</SelectItem>
                    <SelectItem value="offline">Offline Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date <span className="text-red-500">*</span></Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Scheduled Time <span className="text-red-500">*</span></Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || selectedStudents.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Applying...
                  </>
                ) : (
                  `Apply for ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Select Students</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="Search students..."
                className="max-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={selectAllStudents}
                    />
                    <Label htmlFor="selectAll" className="text-sm font-medium">
                      Select All ({filteredStudents.length})
                    </Label>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedStudents.length} of {filteredStudents.length} selected
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-[auto_1fr_1fr] text-xs font-medium text-gray-500 border-b bg-gray-50 py-2">
                    <div className="px-4"></div>
                    <div className="px-4">Name & ID</div>
                    <div className="px-4">Course</div>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div
                          key={student._id}
                          className="grid grid-cols-[auto_1fr_1fr] items-center border-b py-2 hover:bg-gray-50"
                        >
                          <div className="px-4">
                            <Checkbox
                              id={`student-${student._id}`}
                              checked={selectedStudents.includes(student._id)}
                              onCheckedChange={() => handleStudentSelection(student._id)}
                            />
                          </div>
                          <div className="px-4">
                            <Label
                              htmlFor={`student-${student._id}`}
                              className="font-medium cursor-pointer"
                            >
                              {student.name}
                            </Label>
                            <div className="text-xs text-gray-500">
                              {student.studentId}
                            </div>
                          </div>
                          <div className="px-4 text-sm">
                            {student.course?.name || "No course assigned"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        {searchTerm
                          ? "No students found matching your search."
                          : "No students available."}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 