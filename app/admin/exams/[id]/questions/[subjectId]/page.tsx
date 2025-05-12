"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { compareSubjectNames } from "@/lib/utils"

interface Question {
  _id: string;
  paperId: string;
  subjectId: string;
  subjectName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

// Define a type for the debug question data which might be incomplete
interface DebugQuestion {
  _id: string;
  paperId: string;
  subjectId: string;
  subjectName: string;
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  [key: string]: any; // Allow any other properties
}

// Define a type for subject data
interface Subject {
  subjectId: string;
  subjectName: string;
  [key: string]: any;
}

// Define a type for the question group
interface QuestionGroup {
  subjectName: string;
  questions: DebugQuestion[];
}

export default function SubjectQuestions() {
  const params = useParams()
  const router = useRouter()
  
  // Extract and decode the parameters
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  const subjectId = typeof params.subjectId === 'string' ? params.subjectId : Array.isArray(params.subjectId) ? params.subjectId[0] : ''
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [examPaperName, setExamPaperName] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    console.log("Component mounted with params:", { id, subjectId })
    fetchQuestions()
  }, [id, subjectId])
  
  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Ensure parameters are properly encoded for URL
      const encodedPaperId = encodeURIComponent(id)
      const encodedSubjectId = encodeURIComponent(subjectId)
      
      // First try getting the exam paper details to find the correct subject name
      console.log("First fetching exam paper details to get subject info")
      const examPaperResponse = await fetch(`/api/exam-papers/${encodedPaperId}?t=${Date.now()}`, {
        headers: { 
          'Cache-Control': 'no-cache',
          'Accept': 'application/json; charset=utf-8'
        }
      })
      
      let currentSubjectName = "";
      let allSubjects: any[] = [];
      
      if (examPaperResponse.ok) {
        const examData = await examPaperResponse.json()
        if (examData.success && examData.data.subjects) {
          allSubjects = examData.data.subjects;
          const currentSubject = examData.data.subjects.find((s: any) => s.subjectId === subjectId)
          if (currentSubject) {
            currentSubjectName = currentSubject.subjectName;
            setSubjectName(currentSubjectName);
            setExamPaperName(examData.data.paperName);
            console.log(`Found subject name from exam paper: ${currentSubjectName}`);
          }
        }
      }

      // Try to get questions with debug info first
      const debugUrl = `/api/questions?paperId=${encodedPaperId}&subjectId=${encodedSubjectId}&debug=true`;
      console.log(`Making debug API request to: ${debugUrl}`);
      
      const debugResponse = await fetch(`${debugUrl}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json; charset=utf-8'
        }
      });
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log("Debug API response:", debugData);
        
        if (debugData.success) {
          // If we have questions in the direct response, use them
          if (debugData.data && Array.isArray(debugData.data) && debugData.data.length > 0) {
            console.log(`Found ${debugData.data.length} questions directly`);
            setQuestions(debugData.data);
            return;
          }
          
          // If we have debug info about available subjects
          if (debugData.debug && debugData.debug.availableSubjectNames) {
            const availableSubjects = debugData.debug.availableSubjectNames;
            console.log("Available subjects:", availableSubjects);
            
            // Try to find a matching subject name
            if (currentSubjectName) {
              const matchingSubject = availableSubjects.find((s: string) => 
                s.toLowerCase() === currentSubjectName.toLowerCase()
              );
              
              if (matchingSubject) {
                // Try to get questions by subject name
                const subjectUrl = `/api/questions?paperId=${encodedPaperId}&subjectId=${encodeURIComponent(matchingSubject)}`;
                console.log(`Trying to get questions by subject name: ${subjectUrl}`);
                
                const subjectResponse = await fetch(subjectUrl, {
                  headers: {
                    'Accept': 'application/json; charset=utf-8'
                  }
                });
                if (subjectResponse.ok) {
                  const subjectData = await subjectResponse.json();
                  if (subjectData.success && subjectData.data && subjectData.data.length > 0) {
                    console.log(`Found ${subjectData.data.length} questions by subject name`);
                    setQuestions(subjectData.data);
                    return;
                  }
                }
              }
            }
            
            // If we still don't have questions, show available subjects in error
            setError(`No questions found for subject '${currentSubjectName || subjectId}'. Available subjects: ${availableSubjects.join(", ")}`);
          } else {
            setError(`No questions found for subject '${currentSubjectName || subjectId}'. Please check if questions have been uploaded.`);
          }
        }
      }
      
      setQuestions([]);
    } catch (error) {
      console.error("Error loading questions:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRefresh = () => {
    fetchQuestions()
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/admin/exams/${id}`}>
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">
            {examPaperName}: {subjectName} Questions
          </h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh
          </Button>
          <Button 
            onClick={() => window.open(`/api/questions?paperId=${encodeURIComponent(id)}&subjectId=${encodeURIComponent(subjectId)}&debug=true`, '_blank')}
            variant="ghost" 
            size="sm"
          >
            Debug API
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Questions Found</h2>
              <p className="text-gray-500 mb-6">There are no questions for this subject yet.</p>
              <div className="flex justify-center gap-4">
                <Link href={`/admin/exams/${id}`}>
                  <Button>Back to Exam Paper</Button>
                </Link>
                <Button onClick={handleRefresh} variant="outline">Refresh</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Questions List ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border px-4 py-2 text-left">Sr.No</th>
                    <th className="border px-4 py-2 text-left">Question</th>
                    <th className="border px-4 py-2 text-left">Option A</th>
                    <th className="border px-4 py-2 text-left">Option B</th>
                    <th className="border px-4 py-2 text-left">Option C</th>
                    <th className="border px-4 py-2 text-left">Option D</th>
                    <th className="border px-4 py-2 text-left">Correct Option</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={question._id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">
                        {question.questionText && question.questionText !== "Question text not available" 
                          ? question.questionText 
                          : <span className="text-red-500">Question {index + 1} - Text missing</span>
                        }
                      </td>
                      <td className="border px-4 py-2">{question.optionA || "Option A"}</td>
                      <td className="border px-4 py-2">{question.optionB || "Option B"}</td>
                      <td className="border px-4 py-2">{question.optionC || "Option C"}</td>
                      <td className="border px-4 py-2">{question.optionD || "Option D"}</td>
                      <td className="border px-4 py-2">{question.correctOption || "A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 