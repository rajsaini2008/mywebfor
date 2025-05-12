"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { Separator } from "@/components/ui/separator"
import { Clock } from "lucide-react"
import { storeStudentId, storeStudentEmail } from "@/lib/sessionHelper"

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

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: string
  marks: number
}

interface ExamPaper {
  _id: string
  paperId: string
  paperName: string
  time: number
  subject?: string
  totalMarks: number
  questions: Question[]
}

interface ExamApplication {
  _id: string
  status: string
  scheduledTime: string
  paperType: string
  examPaper: ExamPaper
}

export default function ExamPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: sessionData } = useSession()
  const session = sessionData as ExtendedSession
  const [examApplication, setExamApplication] = useState<ExamApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExamApplication = async () => {
      try {
        setLoading(true)
        console.log("Fetching exam application with ID:", id)
        
        // Store the student ID from session if available
        if (session?.user?.id) {
          storeStudentId(session.user.id);
        }
        
        // Store the student email if available
        if (session?.user?.email) {
          storeStudentEmail(session.user.email);
        }
        
        const response = await fetch(`/api/exam-applications?id=${id}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch exam: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Exam application API response:", data)
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch exam application")
        }
        
        if (!data.data) {
          throw new Error("No exam application data returned")
        }
        
        // Check if this is an online exam
        if (data.data.paperType !== 'online') {
          throw new Error("This is not an online exam. Please contact your administrator.")
        }
        
        // Check if exam has questions
        if (!data.data.examPaper || !data.data.examPaper.questions || data.data.examPaper.questions.length === 0) {
          throw new Error("This exam has no questions. Please contact your administrator.")
        }
        
        setExamApplication(data.data)
        
        // Set time remaining
        if (data.data.examPaper.time) {
          setTimeRemaining(data.data.examPaper.time * 60) // Convert minutes to seconds
        }
      } catch (error) {
        console.error("Error fetching exam:", error)
        setError(error instanceof Error ? error.message : "An error occurred while loading the exam")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while loading the exam",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchExamApplication()
    }
  }, [id])
  
  // Timer functionality
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    
    if (examStarted && timeRemaining > 0 && !examSubmitted) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            // Auto-submit when time is up
            clearInterval(timer!)
            handleSubmit()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [examStarted, timeRemaining, examSubmitted])
  
  const handleStartExam = () => {
    setExamStarted(true)
    toast({
      title: "Exam Started",
      description: "Your exam has started. Good luck!",
    })
  }
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':')
  }
  
  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      if (!examApplication) {
        throw new Error("Exam data not available")
      }
      
      // Calculate score
      const questions = examApplication.examPaper.questions
      let score = 0
      let totalPossible = 0
      
      questions.forEach(question => {
        totalPossible += question.marks
        if (answers[question._id] === question.correctAnswer) {
          score += question.marks
        }
      })
      
      // Update exam application status
      const response = await fetch(`/api/exam-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          answers,
          score,
          percentage: (score / totalPossible) * 100,
          endTime: new Date().toISOString()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setExamSubmitted(true)
        toast({
          title: "Exam Submitted",
          description: "Your exam has been submitted successfully!",
        })
        
        // Redirect to results page after a short delay
        setTimeout(() => {
          router.push('/student/results')
        }, 3000)
      } else {
        throw new Error(data.message || "Failed to submit exam")
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit exam",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading your exam...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Exam</h2>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <Button 
          onClick={() => router.push('/student/exams')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Back to Exams
        </Button>
      </div>
    )
  }
  
  if (!examApplication) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-600">Exam Not Found</h2>
        <p className="text-gray-600 mt-2">The requested exam could not be found or has been deleted.</p>
        <Button 
          onClick={() => router.push('/student/exams')}
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          Back to Exams
        </Button>
      </div>
    )
  }

  if (examSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-green-600">Exam Submitted Successfully!</h2>
        <p className="text-gray-600 mt-2">Thank you for completing the exam.</p>
        <p className="text-gray-500 mt-1">You will be redirected to the results page shortly...</p>
        <Button 
          onClick={() => router.push('/student/results')}
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          View Results
        </Button>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-2xl text-blue-800">{examApplication.examPaper.paperName}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{examApplication.examPaper.subject || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Marks</p>
                  <p className="font-medium">{examApplication.examPaper.totalMarks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{examApplication.examPaper.time} minutes</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="font-medium">{examApplication.examPaper.questions?.length || 0}</p>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Exam Instructions:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>This is an online examination. Once you start, the timer cannot be paused.</li>
                  <li>You have <strong>{examApplication.examPaper.time} minutes</strong> to complete the exam.</li>
                  <li>All questions are multiple choice with a single correct answer.</li>
                  <li>Your answers are automatically saved when you submit the exam.</li>
                  <li>If you run out of time, your exam will be automatically submitted.</li>
                  <li>Do not refresh or navigate away from this page during the exam.</li>
                </ul>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleStartExam} 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                >
                  Start Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <Card className="border-0 shadow-lg mb-4">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-blue-800">{examApplication.examPaper.paperName}</CardTitle>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow">
              <Clock className="h-5 w-5 text-red-500 mr-2" />
              <span className={`font-mono font-bold text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-8 mb-12">
        {examApplication.examPaper.questions.map((question, index) => (
          <Card key={question._id} className="border-0 shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-base font-medium flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 shrink-0">
                  {index + 1}
                </span>
                <span>{question.question}</span>
              </CardTitle>
              <div className="text-xs text-gray-500 mt-1">Marks: {question.marks}</div>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup
                value={answers[question._id] || ""}
                onValueChange={(value) => handleAnswerChange(question._id, value)}
                className="space-y-3"
              >
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md">
                    <RadioGroupItem value={option} id={`${question._id}-${optIndex}`} />
                    <Label htmlFor={`${question._id}-${optIndex}`} className="cursor-pointer flex-grow">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">{Object.keys(answers).length}</span> of{" "}
          <span className="font-medium">{examApplication.examPaper.questions.length}</span> questions answered
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? "Submitting..." : "Submit Exam"}
        </Button>
      </div>
    </div>
  )
} 