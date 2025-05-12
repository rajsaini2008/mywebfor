"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import Link from "next/link"
import { Pencil, Calendar, Clock, Check } from "lucide-react"
import { storeStudentId, storeStudentEmail, getStudentId, getStudentEmail } from "@/lib/sessionHelper"

// Extended Session type to include id
interface ExtendedUser {
  name?: string | null
  email?: string | null
  image?: string | null
  id?: string
}

interface ExtendedSession extends Session {
  user: ExtendedUser
}

interface ExamApplication {
  _id: string
  status: string
  scheduledTime: string
  paperType?: string
  examPaper: {
    _id: string
    paperName: string
    time: number
    subject?: string
  }
  student?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  studentId?: string | { toString(): string }
}

export default function StudentExams() {
  const { data: sessionData, status } = useSession()
  const session = sessionData as ExtendedSession
  const [exams, setExams] = useState<ExamApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for session to be loaded (either authenticated or unauthenticated)
    if (status !== 'loading') {
      // If we have a session with user ID, store it in sessionStorage for compatibility
      if (session?.user?.id) {
        storeStudentId(session.user.id);
      }
      
      // Check for email in session and store it if available
      if (session?.user?.email) {
        storeStudentEmail(session.user.email);
      }
      
      fetchExams();
    }
  }, [status, session]);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      
      // Get any student ID available from session storage for compatibility
      const studentId = getStudentId(session?.user?.id);
      const studentEmail = getStudentEmail(session?.user?.email);
      
      // Log the available identification information
      console.log("Student identification:", {
        sessionId: sessionStorage.getItem("current_user_id"),
        sessionEmail: sessionStorage.getItem("current_user_email"),
        nextAuthId: session?.user?.id,
        nextAuthEmail: session?.user?.email,
        usingId: studentId,
        usingEmail: studentEmail
      });
      
      if (!studentId && !studentEmail) {
        console.error("No student identification available");
        toast({
          title: "Error",
          description: "Could not identify student. Please log in again.",
          variant: "destructive",
        });
        setExams([]);
        setIsLoading(false);
        return;
      }
      
      // Try to fetch exams using student email (preferred) or ID
      const params = new URLSearchParams();
      if (studentEmail) {
        params.append("studentEmail", studentEmail);
      }
      if (studentId) {
        params.append("studentId", studentId);
      }
      
      // Only show online exams that are scheduled
      params.append("paperType", "online");
      params.append("status", "scheduled");
      
      // Add cache busting parameter
      const timestamp = new Date().getTime();
      params.append("t", timestamp.toString());
      
      const url = `/api/exam-applications?${params.toString()}`;
      console.log("Fetching exams for student:", { 
        url,
        studentId: studentId || 'none', 
        email: studentEmail || 'none',
        paperType: "online",
        status: "scheduled"
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exams: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (data.success) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          // Make sure we're only showing exams that have been:
          // 1. Explicitly assigned with paperType='online'
          // 2. Status is 'scheduled'
          // 3. Have valid exam paper details
          // 4. Assigned to this specific student
          const validExams = data.data.filter((exam: ExamApplication) => {
            // Log each exam for debugging
            console.log("Checking exam:", {
              id: exam._id,
              paperType: exam.paperType,
              status: exam.status,
              hasExamPaper: !!exam.examPaper,
              studentId: typeof exam.studentId === 'object' ? exam.studentId.toString() : exam.studentId
            });
            
            // Basic validation first
            if (!exam.examPaper || !exam.examPaper._id) {
              console.log("Rejecting exam - missing exam paper details");
              return false;
            }
            
            // Check paperType - this is crucial
            if (exam.paperType !== 'online') {
              console.log("Rejecting exam - not online type");
              return false;
            }
            
            // Check status
            if (exam.status !== 'scheduled') {
              console.log("Rejecting exam - not scheduled status");
              return false;
            }
            
            // Now check if the exam is specifically assigned to this student
            let examStudentId: string | null = null;
            
            // Handle different studentId formats
            if (exam.studentId) {
              if (typeof exam.studentId === 'object') {
                examStudentId = exam.studentId.toString();
              } else {
                examStudentId = exam.studentId;
              }
            } else if (exam.student?._id) {
              examStudentId = exam.student._id.toString();
            }
            
            // Get student email
            const examStudentEmail = exam.student?.email;
            
            // Log the comparison
            console.log("Student ID comparison:", {
              examStudentId,
              sessionStudentId: studentId,
              examStudentEmail,
              sessionEmail: studentEmail,
              studentIdMatch: studentId && examStudentId === studentId,
              emailMatch: studentEmail && examStudentEmail === studentEmail
            });
            
            // Only match if student ID or email matches
            const matches = (studentId && examStudentId === studentId) || 
                    (studentEmail && examStudentEmail === studentEmail);
            
            if (matches) {
              console.log("Found matching online exam for student");
            }
            
            return matches;
          });
          
          console.log(`Found ${data.data.length} total exams, ${validExams.length} valid online exams for this student`);
          setExams(validExams);
        } else {
          console.log("No exams found in API response");
          setExams([]);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load exams: " + data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching exams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isExamTime = (scheduledTime: string) => {
    const examTime = new Date(scheduledTime)
    const now = new Date()
    const timeDiff = examTime.getTime() - now.getTime()
    // Allow exam access 5 minutes before scheduled time
    return timeDiff <= 5 * 60 * 1000 && timeDiff >= -(examTime.getTime() % (24 * 60 * 60 * 1000))
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">My Online Exams</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchExams}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-blue-800 mr-1"></span>
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Below are the online exams assigned to you by the administrator. You will be able to start the exam when the scheduled time arrives.
        </p>
      </div>

      {exams.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pencil className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Online Exams Assigned</h3>
            <p className="text-gray-500 mt-2 max-w-md text-center">
              You don't have any online exams scheduled at this time. The administrator needs to assign you an online exam from the admin panel first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam._id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-blue-600"></div>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-lg text-blue-800">{exam.examPaper.paperName}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-600">
                      {format(new Date(exam.scheduledTime), "PPpp")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-600">{exam.examPaper.time} minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-blue-600 mr-2" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(exam.status)}`}>
                      {exam.status}
                    </span>
                  </div>
                  {exam.examPaper.subject && (
                    <div className="flex items-center text-sm">
                      <Pencil className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-gray-600">{exam.examPaper.subject}</span>
                    </div>
                  )}
                </div>
                
                <Button
                  className={`w-full ${
                    isExamTime(exam.scheduledTime) 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                  disabled={!isExamTime(exam.scheduledTime)}
                >
                  {isExamTime(exam.scheduledTime) ? (
                    <Link href={`/student/exam/${exam._id}`} className="w-full flex justify-center">
                      Start Exam
                    </Link>
                  ) : (
                    "Wait for exam time"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 