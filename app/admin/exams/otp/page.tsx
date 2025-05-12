"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Key, RefreshCw, Copy, Search, CheckCircle, XCircle, Download } from "lucide-react"

export default function ExamOTPPage() {
  // State for exams, students, and OTPs
  const [exams, setExams] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [otps, setOtps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // For demonstration purposes, we're using sample data.
        // In a real application, these would be fetched from an API.
        
        // Mock exams data
        setExams([
          { id: "1", name: "Basic Computer Skills" },
          { id: "2", name: "MS Office Advanced" },
          { id: "3", name: "Programming Fundamentals" },
          { id: "4", name: "Database Management" },
        ])
        
        // Mock students data
        setStudents([
          { id: "1", name: "Rahul Sharma", email: "rahul@example.com" },
          { id: "2", name: "Priya Patel", email: "priya@example.com" },
          { id: "3", name: "Amit Kumar", email: "amit@example.com" },
          { id: "4", name: "Neha Singh", email: "neha@example.com" },
        ])
        
        // Mock OTPs data
        setOtps([
          { id: "1", examId: "1", examName: "Basic Computer Skills", studentId: "1", studentName: "Rahul Sharma", otp: "123456", createdAt: "2023-05-10T10:30:00", status: "active" },
          { id: "2", examId: "2", examName: "MS Office Advanced", studentId: "2", studentName: "Priya Patel", otp: "789012", createdAt: "2023-05-09T14:20:00", status: "used" },
          { id: "3", examId: "3", examName: "Programming Fundamentals", studentId: "3", studentName: "Amit Kumar", otp: "345678", createdAt: "2023-05-11T09:15:00", status: "active" },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleGenerateOTP = () => {
    if (!selectedExam || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select both an exam and a student",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    // Generate a random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Get exam and student details
    const exam = exams.find(e => e.id === selectedExam)
    const student = students.find(s => s.id === selectedStudent)
    
    // In a real application, this would be sent to the server
    setTimeout(() => {
      const newOtpEntry = {
        id: Date.now().toString(),
        examId: selectedExam,
        examName: exam?.name,
        studentId: selectedStudent,
        studentName: student?.name,
        otp: newOtp,
        createdAt: new Date().toISOString(),
        status: "active"
      }
      
      setOtps([newOtpEntry, ...otps])
      
      toast({
        title: "OTP Generated",
        description: `OTP ${newOtp} created for ${student?.name} - ${exam?.name}`,
      })
      
      setIsGenerating(false)
    }, 1000)
  }

  const handleCopyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp)
    toast({
      title: "Copied",
      description: "OTP copied to clipboard",
    })
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    // Update the status of the OTP
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    
    // Update the OTPs state
    setOtps(otps.map(otp => 
      otp.id === id ? { ...otp, status: newStatus } : otp
    ))
    
    toast({
      title: "Status Updated",
      description: `OTP status changed to ${newStatus}`,
    })
  }

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ["Exam Name", "Student Name", "OTP", "Created At", "Status"]
    const csvContent = [
      headers.join(","),
      ...otps.map(otp => [
        otp.examName,
        otp.studentName,
        otp.otp,
        new Date(otp.createdAt).toLocaleString(),
        otp.status
      ].join(","))
    ].join("\n")
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exam_otps.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded",
      description: "OTP data has been downloaded as CSV",
    })
  }

  // Filter OTPs based on search query
  const filteredOtps = otps.filter(otp => 
    otp.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    otp.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    otp.otp.includes(searchQuery)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Exam OTP Management</h1>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate OTP</TabsTrigger>
          <TabsTrigger value="manage">Manage OTPs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Generate OTP Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New OTP</CardTitle>
              <CardDescription>
                Create a one-time password for a student to access an exam
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exam">Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger id="exam">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="student">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateOTP} 
                disabled={isGenerating || !selectedExam || !selectedStudent}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Generate OTP
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Manage OTPs Tab */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Existing OTPs</CardTitle>
              <CardDescription>
                View, search and manage all generated OTPs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by exam, student or OTP..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleDownloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>OTP</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOtps.length > 0 ? (
                      filteredOtps.map((otp) => (
                        <TableRow key={otp.id}>
                          <TableCell>{otp.examName}</TableCell>
                          <TableCell>{otp.studentName}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono">{otp.otp}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleCopyOTP(otp.otp)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(otp.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              otp.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : otp.status === 'used' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {otp.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {otp.status === 'inactive' && <XCircle className="mr-1 h-3 w-3" />}
                              {otp.status.charAt(0).toUpperCase() + otp.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={otp.status === 'active'}
                              onCheckedChange={() => 
                                handleToggleStatus(otp.id, otp.status)
                              }
                              disabled={otp.status === 'used'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No OTPs found matching your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>OTP Settings</CardTitle>
              <CardDescription>
                Configure OTP requirements for exams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Require OTP for all exams</h3>
                    <p className="text-sm text-gray-500">
                      When enabled, all student exams will require OTP verification
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-generate OTPs</h3>
                    <p className="text-sm text-gray-500">
                      Automatically generate OTPs when exams are scheduled
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Send OTP via Email</h3>
                    <p className="text-sm text-gray-500">
                      Automatically email OTPs to students when generated
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otpExpiry">OTP Expiry Time (hours)</Label>
                  <Input id="otpExpiry" type="number" defaultValue={24} min={1} max={72} />
                  <p className="text-xs text-gray-500">
                    Number of hours before an OTP expires
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 