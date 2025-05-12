"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { RefreshCcw } from "lucide-react"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

interface Student {
  _id: string
  registrationId: string
  studentId: string
  name: string
  email: string
  mobile: string
  photo: string
  course: {
    _id: string
    name: string
  }
}

interface Exam {
  _id: string
  paperId: string
  paperName: string
  examType: string  // 'Main' or 'Practice'
  paperType: string  // 'online' or 'offline'
  status: string
  course?: {
    _id: string
    name: string
  }
}

interface ExamApplication {
  _id: string
  examPaperId: string
  studentId: string  // Single student ID, not an array
  scheduledTime: string
  paperType: string  // 'online' or 'offline'
  status: string  // 'scheduled', 'completed', 'cancelled'
  score?: number
  startTime?: string
  endTime?: string
  examPaper?: {
    paperName: string
    time: number
  }
  student?: {
    name: string
    registrationId: string
  }
}

export default function ApplyForExam() {
  const [students, setStudents] = useState<Student[]>([])
  const [examPapers, setExamPapers] = useState<Exam[]>([])
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [selectedPaperType, setSelectedPaperType] = useState<string>("online")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTime, setSelectedTime] = useState("")
  const [appliedStudents, setAppliedStudents] = useState<Map<string, string>>(new Map())
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [examApplied, setExamApplied] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [debugState, setDebugState] = useState<string[]>([])
  const [forceRefresh, setForceRefresh] = useState(0)

  useEffect(() => {
    async function initialLoad() {
      try {
        setIsLoading(true)
        // First load students
        await fetchStudents()
        
        // Then load exam papers
        await fetchExamPapers() 
        
        // Finally load exam applications (depends on students being loaded)
        await fetchExamApplications()
        
        addDebugLog("Initial data loading complete")
      } catch (error) {
        console.error("Error during initial data loading:", error)
        addDebugLog(`Error during initial loading: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsInitialLoad(false)
        setIsLoading(false)
      }
    }
    
    initialLoad()
  }, [])

  useEffect(() => {
    // Call fetchExamApplications immediately after students are loaded or when forcedRefresh changes
    if (!isInitialLoad && students.length > 0) {
      fetchExamApplications();
    }
  }, [isInitialLoad, students.length, forceRefresh]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        console.log("Students data:", data.data)
        setStudents(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExamPapers = async () => {
    try {
      console.log(`Fetching active Main exam papers`)
      setLoadingExams(true)
      
      // First fetch all exams to see what's in the database without any filters
      const allResponse = await fetch('/api/exam-papers', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      const allData = await allResponse.json()
      if (allData.success) {
        console.log(`Found ${allData.data.length} total exam papers in database`)
        console.log("Paper types:", allData.data.map((p: any) => p.paperType || 'undefined'))
        console.log("Exam types:", allData.data.map((p: any) => p.examType || 'undefined'))
        console.log("Statuses:", allData.data.map((p: any) => p.status || 'undefined'))
        
        // Log full details to debug
        if (allData.data.length > 0) {
          console.log("Sample papers:", allData.data.slice(0, 3).map((p: any) => ({
            id: p._id,
            paperId: p.paperId,
            name: p.paperName,
            paperType: p.paperType,
            examType: p.examType,
            status: p.status
          })))
        }
      }
      
      // Try to load active papers with more explicit parameters
      const response = await fetch('/api/exam-papers?status=active&examType=Main', {
        method: 'GET',
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
        console.log(`Found ${data.data.length} active Main exam papers`)
        
        if (data.data.length === 0 && allData.data.length > 0) {
          // If we found papers in the database but none are active Main exams,
          // show a more helpful error message
          addDebugLog("No active Main exam papers found - check exam status and type")
          toast({
            title: "No Active Exams",
            description: "There are exam papers in the database, but none are marked as active Main exams.",
            variant: "destructive",
          })
        }
        
        // Set the exam papers state
        setExamPapers(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch exam papers")
      }
    } catch (error) {
      console.error("Error fetching exam papers:", error)
      addDebugLog(`Error fetching exam papers: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to load exam papers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingExams(false)
      setIsLoading(false)
    }
  }

  const fetchExamApplications = async () => {
    try {
      addDebugLog("Fetching exam applications...")
      
      // Show the API URL we're using to fetch applications
      const apiUrl = '/api/exam-applications?nocache=true';
      addDebugLog(`Using API URL: ${apiUrl}`);
      
      // Use nocache parameter to ensure we get fresh data
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error when fetching applications: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const applicationCount = data.data?.length || 0;
        console.log(`Received ${applicationCount} exam applications`);
        addDebugLog(`Received ${applicationCount} exam applications`);
        
        // Log detailed info about the first few records to help debug
        if (Array.isArray(data.data) && data.data.length > 0) {
          const sampleApp = data.data[0];
          console.log("Sample application data:", sampleApp);
          addDebugLog(`Sample application structure: 
            ID: ${sampleApp._id}
            StudentID type: ${typeof sampleApp.studentId}
            StudentID value: ${JSON.stringify(sampleApp.studentId)}
            ExamPaperID type: ${typeof sampleApp.examPaperId}
            PaperType: ${sampleApp.paperType || 'undefined'}
          `)
        } else {
          addDebugLog("No exam applications found in the database");
          console.warn("API returned success but no exam applications data:", data);
        }
        
        // Create a map of student IDs to exam details
        const appliedMap = new Map<string, string>();
        
        if (Array.isArray(data.data) && data.data.length > 0) {
          addDebugLog(`Processing ${data.data.length} applications...`);
          
          data.data.forEach((app: any) => {
            try {
              // Get the student ID - handle different formats
              let studentId: string = '';
              
              // Debug output
              console.log("Processing application:", {
                id: app._id,
                studentId: app.studentId,
                studentIdType: typeof app.studentId,
                student: app.student,
                paperType: app.paperType
              });
              
              // If studentId is an object with _id property
              if (app.studentId && typeof app.studentId === 'object' && app.studentId._id) {
                studentId = app.studentId._id.toString();
                console.log(`Using studentId._id: ${studentId}`);
              } 
              // If studentId is a string (direct reference)
              else if (app.studentId && typeof app.studentId === 'string') {
                studentId = app.studentId;
                console.log(`Using direct studentId: ${studentId}`);
              }
              // If there's a student object instead
              else if (app.student && typeof app.student === 'object') {
                if (app.student._id) {
                  studentId = app.student._id.toString();
                  console.log(`Using student._id: ${studentId}`);
                }
              }
              
              if (studentId) {
                // Store the paper type for this application (with fallback to 'online')
                const paperType = app.paperType || 'online';
                appliedMap.set(studentId, paperType);
                addDebugLog(`Found application for student ${studentId} with mode ${paperType}`);
              } else {
                console.warn("Application missing student ID:", app);
              }
            } catch (err) {
              console.error("Error processing application:", err, app);
            }
          });
        }
        
        console.log(`Processed ${appliedMap.size} applications, mapping students to their exam mode`);
        console.log("Applied students map:", Object.fromEntries(appliedMap));
        
        // Update UI with the mapped applications
        setAppliedStudents(appliedMap);
        
        // Save mapping to localStorage for backup
        try {
          localStorage.setItem('appliedStudentsMap', JSON.stringify(Object.fromEntries(appliedMap)));
        } catch (storageErr) {
          console.warn("Failed to save to localStorage:", storageErr);
        }
      } else {
        addDebugLog(`API error: ${data.message || "Unknown error"}`);
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (error) {
      console.error("Error fetching exam applications:", error);
      addDebugLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Try to restore from localStorage if API failed
      try {
        const savedMap = localStorage.getItem('appliedStudentsMap');
        if (savedMap) {
          const mapObject = JSON.parse(savedMap);
          const restoredMap = new Map<string, string>(Object.entries(mapObject));
          setAppliedStudents(restoredMap);
          addDebugLog(`Restored ${restoredMap.size} applied students from localStorage`);
        }
      } catch (storageErr) {
        console.warn("Failed to restore from localStorage:", storageErr);
      }
    }
  }

  const handleStudentSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleApplyExam = async () => {
    if (!selectedExamType) {
      toast({
        title: "Error",
        description: "Please select an exam",
        variant: "destructive",
      })
      return
    }

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select exam time",
        variant: "destructive",
      })
      return
    }

    if (selectedStudents.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      addDebugLog(`Applying exam ${selectedExamType} for ${selectedStudents.size} students with mode ${selectedPaperType}`)
      addDebugLog(`Selected students: ${Array.from(selectedStudents).join(', ')}`)
      
      // Validate the paperType
      if (selectedPaperType !== 'online' && selectedPaperType !== 'offline') {
        addDebugLog(`Invalid paperType: ${selectedPaperType}, defaulting to 'online'`);
      }
      
      const response = await fetch('/api/exam-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examPaperId: selectedExamType,
          studentIds: Array.from(selectedStudents),
          scheduledTime: selectedTime,
          paperType: selectedPaperType
        }),
      })

      const data = await response.json()
      addDebugLog(`API response: ${JSON.stringify(data)}`)
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Exam applied successfully",
        })
        
        // Update applied students map to reflect the new application
        const newAppliedStudents = new Map(appliedStudents)
        const appliedStudentsList = Array.from(selectedStudents)
        
        appliedStudentsList.forEach(id => {
          newAppliedStudents.set(id, selectedPaperType)
          addDebugLog(`Updated student ${id} with mode ${selectedPaperType}`)
        })
        
        // Save to localStorage as backup
        try {
          const mapAsObject = Object.fromEntries(newAppliedStudents);
          localStorage.setItem('appliedStudentsMap', JSON.stringify(mapAsObject));
          addDebugLog("Saved updated applied students map to localStorage");
        } catch (err) {
          console.error("Failed to save to localStorage:", err);
        }
        
        setAppliedStudents(newAppliedStudents)
        
        // Reset selections
        setSelectedStudents(new Set())
        setSelectedExamType("")
        setSelectedTime("")
        
        // Immediately refresh the data to show updated status
        addDebugLog("Refreshing exam applications data...")
        await fetchExamApplications()
        
        // Force UI refresh for the student list
        setStudents(prevStudents => {
          // Create a deep copy of students array to ensure React detects the change
          return JSON.parse(JSON.stringify(prevStudents));
        })
      } else {
        addDebugLog(`API error: ${data.message || "Unknown error"}`)
        throw new Error(data.message || "Failed to apply exam")
      }
    } catch (error) {
      console.error("Error applying exam:", error)
      addDebugLog(`Error applying exam: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply exam",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.mobile === searchQuery
  )

  const filteredExams = useMemo(() => {
    if (examPapers.length === 0) {
      return []
    }
    
    // Return all exams without filtering (API already filters by paperType)
    console.log("Available exams:", examPapers.map(e => ({
      id: e._id,
      name: e.paperName || e.paperId,
      type: e.paperType
    })))
    
    return examPapers
  }, [examPapers])

  const addDebugLog = (message: string) => {
    console.log(message)
    setDebugState(prev => [...prev, message])
  }

  const fetchExams = async () => {
    try {
      setLoadingExams(true)
      addDebugLog("Fetching exams...")
      
      // Use the status=active&examType=Main to get only active Main exams
      const response = await fetch(`/api/exam-papers?status=active&examType=Main`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exams: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      addDebugLog(`Fetch exams response: ${JSON.stringify(data.success)}`)
      
      if (data.success) {
        const fetchedExams = data.data
        addDebugLog(`Got ${fetchedExams.length} exams`)
        
        if (fetchedExams.length === 0) {
          addDebugLog("No exams found - this could be a filter issue")
        } else {
          // Log a sample exam to help with debugging
          addDebugLog(`Sample exam: ${JSON.stringify({
            id: fetchedExams[0]._id,
            name: fetchedExams[0].paperName,
            examType: fetchedExams[0].examType,
            status: fetchedExams[0].status
          })}`)
        }
        
        setExamPapers(fetchedExams)
      } else {
        throw new Error(data.message || "Failed to fetch exams")
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      addDebugLog(`Error fetching exams: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to load exams. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingExams(false)
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    const foundStudent = students.find(
      (student) => 
        student.studentId.toLowerCase() === searchQuery.toLowerCase() ||
        student.name.toLowerCase() === searchQuery.toLowerCase() ||
        student.email.toLowerCase() === searchQuery.toLowerCase() ||
        student.mobile === searchQuery
    )

    if (foundStudent) {
      setSelectedStudent(foundStudent)
      // Check if student has already applied for an exam
      if (selectedExamType) {
        checkStudentExamStatus(foundStudent._id)
      }
    } else {
      setSelectedStudent(null)
      toast({
        title: "Error",
        description: "No student found with the provided details",
        variant: "destructive",
      })
    }
  }

  const checkStudentExamStatus = async (studentId: string) => {
    if (!selectedExamType) return
    
    try {
      const response = await fetch(`/api/exam-applications?student=${studentId}&exam=${selectedExamType}`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        setExamApplied(true)
        addDebugLog("Student has already applied for this exam")
      } else {
        setExamApplied(false)
        addDebugLog("Student has not applied for this exam yet")
      }
    } catch (error) {
      console.error("Error checking exam status:", error)
      setExamApplied(false)
    }
  }

  const handleApplyForExam = async () => {
    if (!selectedStudent || !selectedExamType) {
      toast({
        title: "Error",
        description: "Please select both student and exam",
        variant: "destructive",
      })
      return
    }

    if (!selectedTime) {
      toast({
        title: "Error",
        description: "Please select exam time",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      addDebugLog(`Applying exam ${selectedExamType} for student ${selectedStudent._id} with mode ${selectedPaperType}`)
      
      // Validate the paperType
      if (selectedPaperType !== 'online' && selectedPaperType !== 'offline') {
        addDebugLog(`Invalid paperType: ${selectedPaperType}, defaulting to 'online'`);
      }
      
      const response = await fetch('/api/exam-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Match the expected API structure from route.ts
          examPaperId: selectedExamType,
          studentIds: [selectedStudent._id],
          scheduledTime: selectedTime,
          paperType: selectedPaperType
        }),
      })
      
      const responseData = await response.json()
      addDebugLog(`API response: ${JSON.stringify(responseData)}`)
      
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Successfully applied for the exam",
        })
        setExamApplied(true)
        
        // Update applied students map to reflect the new application
        const newAppliedStudents = new Map(appliedStudents)
        newAppliedStudents.set(selectedStudent._id, selectedPaperType)
        addDebugLog(`Updated student ${selectedStudent._id} with mode ${selectedPaperType}`)
        
        // Save to localStorage as backup
        try {
          const mapAsObject = Object.fromEntries(newAppliedStudents);
          localStorage.setItem('appliedStudentsMap', JSON.stringify(mapAsObject));
          addDebugLog("Saved updated applied students map to localStorage");
        } catch (err) {
          console.error("Failed to save to localStorage:", err);
        }
        
        setAppliedStudents(newAppliedStudents)
        
        // Immediately refresh exam applications to show correct status
        await fetchExamApplications()
        
        // Force UI refresh by updating state
        setStudents(prevStudents => {
          // Create a deep copy of students array to ensure React detects the change
          return JSON.parse(JSON.stringify(prevStudents));
        })
      } else {
        addDebugLog(`API error: ${responseData.message || "Unknown error"}`)
        throw new Error(responseData.message || "Failed to apply for exam")
      }
    } catch (error) {
      console.error("Error applying for exam:", error)
      addDebugLog(`Error applying for exam: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply for exam",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a special function to handle direct database check
  const checkExamApplicationsDirectly = async () => {
    try {
      addDebugLog("Performing direct database check for exam applications...");
      setIsLoading(true);
      
      // Use HEAD request to get quick counts
      const headResponse = await fetch('/api/exam-applications', {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      // Extract the counts from response headers
      const offlineCount = headResponse.headers.get('X-Offline-Count') || '0';
      const approvedCount = headResponse.headers.get('X-Approved-Count') || '0';
      
      addDebugLog(`Database counts: ${offlineCount} offline exams, ${approvedCount} approved exams`);
      
      // Now try to map applications to students
      await fetchExamApplications();
      
      toast({
        title: "Database Check Complete",
        description: `Found ${offlineCount} offline and ${approvedCount} approved exam applications`,
      });
    } catch (error) {
      console.error("Error in direct database check:", error);
      addDebugLog(`Database check error: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Error",
        description: "Failed to perform database check",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students Apply For Exams</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={fetchExamPapers}
            variant="outline"
            className="text-sm"
            disabled={loadingExams}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            {loadingExams ? "Refreshing Exams..." : "Refresh Exams"}
          </Button>
          
          <Button 
            onClick={() => {
              addDebugLog("Manual refresh triggered");
              setForceRefresh(prev => prev + 1);
            }}
            variant="outline"
            className="text-sm bg-blue-50"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Status Data
          </Button>
          
          <Button
            onClick={checkExamApplicationsDirectly}
            variant="outline"
            className="text-sm bg-yellow-50 border-yellow-200"
          >
            Database Check
          </Button>
        </div>
      </div>

      {/* Add a status dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="font-semibold text-blue-700">Applied Students</div>
            <div className="text-2xl font-bold mt-1">{appliedStudents.size}</div>
            <div className="text-sm text-gray-500 mt-1">
              Students who have exams scheduled
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="font-semibold text-green-700">Online Exams</div>
            <div className="text-2xl font-bold mt-1">
              {Array.from(appliedStudents.values()).filter(mode => mode === 'online').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Students scheduled for online mode
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="font-semibold text-purple-700">Offline Exams</div>
            <div className="text-2xl font-bold mt-1">
              {Array.from(appliedStudents.values()).filter(mode => mode === 'offline').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Students scheduled for offline mode
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isInitialLoad && (
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4 flex items-center">
          <span className="animate-spin h-4 w-4 border-2 border-amber-600 rounded-full mr-2"></span>
          <span>Loading student exam data...</span>
        </div>
      )}
      
      <div className="flex gap-4 items-center flex-wrap">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
          <Select value={selectedExamType} onValueChange={setSelectedExamType}>
            <SelectTrigger className="bg-white text-gray-900 border-gray-200">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200 max-h-60 overflow-y-auto">
              {filteredExams && filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    <div className="truncate max-w-[200px]">
                      <span className="font-medium">{exam.paperName || exam.paperId || "Unnamed Exam"}</span>
                      {exam.course?.name && (
                        <span className="text-gray-500 ml-1">- {exam.course.name}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-exams" disabled>
                  No active Main exams found. Please add Main exams in "Add Exam" page.
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {filteredExams && filteredExams.length === 0 && (
            <p className="text-orange-600 text-xs mt-1">
              No active Main exams found. Please add Main exams in "Add Exam" page.
            </p>
          )}
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date & Time</label>
          <Input
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-white text-gray-900 border-gray-200"
          />
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Mode</label>
          <Select value={selectedPaperType} onValueChange={setSelectedPaperType}>
            <SelectTrigger className="bg-white text-gray-900 border-gray-200">
              <SelectValue placeholder="Select Exam Mode" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900 border-gray-200">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-5">
          <Button 
            onClick={handleApplyExam}
            disabled={selectedStudents.size === 0 || !selectedExamType || !selectedTime || selectedExamType === "no-exams"}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply For Exam
          </Button>
        </div>
      </div>

      <Card className="bg-white text-gray-900 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-gray-200">
          <CardTitle className="text-gray-900">Students List</CardTitle>
          <Input
            type="search"
            placeholder="Search students..."
            className="max-w-sm bg-white text-gray-900 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-gray-200">
                  <th className="p-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === students.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(new Set(students.map(s => s._id)))
                        } else {
                          setSelectedStudents(new Set())
                        }
                      }}
                      className="rounded bg-white border-gray-300"
                    />
                  </th>
                  <th className="p-2 text-left text-gray-900">Sr.No</th>
                  <th className="p-2 text-left text-gray-900">Student ID</th>
                  <th className="p-2 text-left text-gray-900">Exam Status</th>
                  <th className="p-2 text-left text-gray-900">Exam Mode</th>
                  <th className="p-2 text-left text-gray-900">Photo</th>
                  <th className="p-2 text-left text-gray-900">Name</th>
                  <th className="p-2 text-left text-gray-900">Course</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  // Check if this student has an applied exam
                  const studentId = student._id;
                  const hasApplied = appliedStudents.has(studentId);
                  const examMode = hasApplied ? appliedStudents.get(studentId) : null;
                  
                  return (
                    <tr key={studentId} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(studentId)}
                          onChange={() => handleStudentSelect(studentId)}
                          className="rounded bg-white border-gray-300"
                        />
                      </td>
                      <td className="p-2 text-gray-900">{index + 1}</td>
                      <td className="p-2 text-gray-900">{student.studentId}</td>
                      <td className="p-2 text-center">
                        {hasApplied ? (
                          <div 
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium inline-block"
                            title={`Student ID: ${studentId}`}
                          >
                            Applied
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium inline-block">
                            Not Applied
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {hasApplied ? (
                          <div 
                            className={`px-2 py-1 ${
                              examMode === 'offline' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            } rounded-full text-xs font-medium inline-block`}
                          >
                            {examMode === 'offline' ? 'Offline' : 'Online'}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        {student.photo ? (
                          <div className="relative w-10 h-10">
                            <img
                              src={student.photo}
                              alt={`${student.name} photo`}
                              className="rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        )}
                      </td>
                      <td className="p-2 text-gray-900">{student.name}</td>
                      <td className="p-2 text-gray-900">{student.course?.name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <div className="mt-4">
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-4">Student Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name:</Label>
                  <div className="mt-1 font-medium">{selectedStudent.name}</div>
                </div>
                
                <div>
                  <Label>Student ID:</Label>
                  <div className="mt-1 font-medium">{selectedStudent.studentId}</div>
                </div>
                
                <div>
                  <Label>Email:</Label>
                  <div className="mt-1 text-sm">{selectedStudent.email}</div>
                </div>
                
                <div>
                  <Label>Mobile:</Label>
                  <div className="mt-1 font-medium">{selectedStudent.mobile}</div>
                </div>
                
                <div>
                  <Label>Course:</Label>
                  <div className="mt-1 font-medium">{selectedStudent.course?.name}</div>
                </div>
                
                <div>
                  <Label>Exam Status:</Label>
                  <div className="mt-1 font-medium text-sm">
                    <span className={`px-2 py-1 rounded-full ${examApplied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {examApplied ? 'Applied' : 'Not Applied'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <Label>Exam Mode:</Label>
                    <Select value={selectedPaperType} onValueChange={setSelectedPaperType}>
                      <SelectTrigger className="bg-white text-gray-900 border-gray-200">
                        <SelectValue placeholder="Select Exam Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-gray-900 border-gray-200">
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleApplyForExam}
                  disabled={isLoading || examApplied || !selectedExamType}
                  className="w-full bg-blue-800 hover:bg-blue-900"
                >
                  {isLoading ? "Processing..." : examApplied ? "Already Applied" : "Apply for Exam"}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center items-center border rounded-lg p-4 bg-gray-50">
              {selectedStudent.photo ? (
                <div className="relative h-48 w-48">
                  <Image
                    src={selectedStudent.photo}
                    alt={selectedStudent.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
              ) : (
                <div className="h-48 w-48 flex items-center justify-center text-gray-400 border rounded">
                  No photo available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug panel for admins - can be commented out in production */}
      {debugState.length > 0 && (
        <div className="mt-8">
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
                {debugState.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Applied Students Data</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
                <div className="mb-2">Total applied students: {appliedStudents.size}</div>
                {Array.from(appliedStudents.entries()).map(([id, mode], index) => (
                  <div key={index} className="text-xs mb-1">
                    Student ID: {id}, Mode: {mode}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-2 bg-gray-50 border-b">
                <CardTitle className="text-lg font-medium">Manual Data Check</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Student IDs</h4>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono h-40 overflow-y-auto">
                      {students.map((student, i) => (
                        <div key={i} className="mb-1">
                          {student._id} - {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Force Map Student to Mode</h4>
                    <div className="flex gap-2 mb-4">
                      <Select 
                        value={selectedStudent ? selectedStudent._id : ""} 
                        onValueChange={(val) => {
                          const student = students.find(s => s._id === val);
                          if (student) setSelectedStudent(student);
                        }}
                      >
                        <SelectTrigger className="bg-white text-gray-900 border-gray-200">
                          <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900 border-gray-200">
                          {students.map((student) => (
                            <SelectItem key={student._id} value={student._id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedPaperType} onValueChange={setSelectedPaperType}>
                        <SelectTrigger className="bg-white text-gray-900 border-gray-200">
                          <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900 border-gray-200">
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={() => {
                          if (selectedStudent) {
                            const newMap = new Map(appliedStudents);
                            newMap.set(selectedStudent._id, selectedPaperType);
                            setAppliedStudents(newMap);
                            addDebugLog(`Manually set student ${selectedStudent.name} to ${selectedPaperType} mode`);
                          }
                        }}
                        disabled={!selectedStudent}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Force Map
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}