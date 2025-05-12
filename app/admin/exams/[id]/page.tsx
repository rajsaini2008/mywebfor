"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import * as XLSX from 'xlsx'
import Link from "next/link"

interface SubjectQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface Subject {
  subjectId: string;
  subjectName: string;
  numberOfQuestions: number;
  isIndividual: boolean;
  passingMarks: number;
  theoreticalMarks: number;
  practicalMarks: number;
  uploadStatus?: boolean;
  questionCount?: number;
}

interface ExamPaper {
  _id: string;
  paperId: string;
  paperName: string;
  paperType: string;
  totalQuestions: number;
  correctMarksPerQuestion: number;
  passingMarks: number;
  time: number;
  startDate: string;
  endDate: string;
  reAttempt: number;
  reAttemptTime: number;
  isNegativeMark: boolean;
  negativeMarks: number;
  positiveMarks: number;
  courseType: string;
  course: any;
  subjects: Subject[];
  status: string;
}

export default function ExamPaperDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [examPaper, setExamPaper] = useState<ExamPaper | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingSubject, setUploadingSubject] = useState<string | null>(null)
  const [savingQuestions, setSavingQuestions] = useState(false)
  const [previewSubject, setPreviewSubject] = useState<string | null>(null)
  const [previewQuestions, setPreviewQuestions] = useState<SubjectQuestion[]>([])
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  
  useEffect(() => {
    fetchExamPaper()
  }, [id])
  
  const fetchExamPaper = async () => {
    try {
      setIsLoading(true)
      console.log(`Fetching exam paper with ID: ${id}`)
      const response = await fetch(`/api/exam-papers/${id}`)
      
      if (!response.ok) {
        console.error(`Failed to fetch exam paper: ${response.status}`)
        throw new Error(`Failed to fetch exam paper: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API response:", data)
      
      if (data.success) {
        // Fetch question counts for each subject
        const examData = data.data
        console.log("Exam data received:", examData)
        
        // Check if subjects exist
        if (examData.subjects && Array.isArray(examData.subjects)) {
          console.log(`Found ${examData.subjects.length} subjects in exam paper`)
          // Get question counts for each subject
          let allSubjectsHaveQuestions = true;
          
          for (let i = 0; i < examData.subjects.length; i++) {
            const subject = examData.subjects[i]
            try {
              console.log(`Fetching questions for subject: ${subject.subjectName} (${subject.subjectId})`)
              const questionsResponse = await fetch(`/api/questions?paperId=${examData.paperId}&subjectId=${subject.subjectId}`)
              const questionsData = await questionsResponse.json()
              
              if (questionsData.success) {
                subject.questionCount = questionsData.data.length
                subject.uploadStatus = questionsData.data.length > 0
                console.log(`Found ${questionsData.data.length} questions for subject ${subject.subjectName}`)
                
                // Check if this subject has no questions
                if (questionsData.data.length === 0) {
                  allSubjectsHaveQuestions = false;
                }
              }
            } catch (error) {
              console.error(`Error fetching questions for subject ${subject.subjectName}:`, error)
              subject.questionCount = 0
              subject.uploadStatus = false
              allSubjectsHaveQuestions = false;
            }
          }
          
          // If all subjects have questions but the exam is inactive, automatically activate it
          if (allSubjectsHaveQuestions && examData.status === 'inactive') {
            console.log("All subjects have questions but exam is inactive. Automatically activating paper.")
            try {
              const activateResponse = await fetch(`/api/exam-papers/${examData._id}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  status: 'active'
                }),
              });
              
              const activateResult = await activateResponse.json();
              if (activateResult.success) {
                console.log("Exam automatically activated");
                examData.status = 'active';
                toast({
                  title: "Success",
                  description: "Paper has been automatically activated as all subjects have questions",
                });
              }
            } catch (activateError) {
              console.error("Error auto-activating paper:", activateError);
            }
          }
        } else {
          console.warn("No subjects found in the exam paper or subjects is not an array")
        }
        
        setExamPaper(examData)
      } else {
        console.error("API returned error:", data.message)
        throw new Error(data.message || 'Error fetching exam paper')
      }
    } catch (error) {
      console.error("Error loading exam paper:", error)
      toast({
        title: "Error",
        description: "Failed to load exam paper details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFileSelect = (subjectId: string) => {
    if (fileInputRefs.current[subjectId]) {
      fileInputRefs.current[subjectId]?.click()
    }
  }
  
  const processExcelFile = async (file: File, subjectId: string, subjectName: string) => {
    try {
      setUploadingSubject(subjectId)
      setSelectedSubjectName(subjectName)
      
      // Read the Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      // Validate Excel structure
      if (jsonData.length === 0) {
        throw new Error("Excel file is empty or has invalid format")
      }
      
      // Get actual column names from the first row
      const firstRow = jsonData[0] as any
      const actualColumns = Object.keys(firstRow)
      console.log("Excel columns:", actualColumns)
      
      // Define potential column name mappings
      const columnMappings = {
        question: ['Question', 'question', 'Question Text', 'questionText', 'QuestionText'],
        optionA: ['Option A', 'optionA', 'A', 'OptionA', 'option a', 'option_a'],
        optionB: ['Option B', 'optionB', 'B', 'OptionB', 'option b', 'option_b'],
        optionC: ['Option C', 'optionC', 'C', 'OptionC', 'option c', 'option_c'],
        optionD: ['Option D', 'optionD', 'D', 'OptionD', 'option d', 'option_d'],
        correctOption: ['Correct Option', 'correctOption', 'Correct', 'CorrectOption', 'correct', 'Answer']
      }
      
      // Find actual column names in the Excel file
      const foundColumns: Record<string, string> = {}
      
      for (const [key, possibleNames] of Object.entries(columnMappings)) {
        const found = possibleNames.find(name => 
          actualColumns.includes(name) || 
          actualColumns.some(col => col.toLowerCase() === name.toLowerCase()) ||
          actualColumns.some(col => col.replace(/\s+/g, '') === name.replace(/\s+/g, ''))
        )
        
        if (found) {
          const exactMatch = actualColumns.find(col => col === found)
          const lowercaseMatch = actualColumns.find(col => col.toLowerCase() === found.toLowerCase())
          const noSpaceMatch = actualColumns.find(col => col.replace(/\s+/g, '') === found.replace(/\s+/g, ''))
          
          foundColumns[key] = exactMatch || lowercaseMatch || noSpaceMatch || ''
        } else {
          throw new Error(`Missing required column: ${key}`)
        }
      }
      
      console.log("Mapped columns:", foundColumns)
      
      // Process and map questions
      const questions = jsonData.map((row: any, index) => {
        // Extract question text and validate
        const rawQuestionText = row[foundColumns.question];
        const questionText = typeof rawQuestionText === 'string' && rawQuestionText.trim() !== '' 
          ? rawQuestionText.trim() 
          : '';
          
        // Extract options
        const optionA = typeof row[foundColumns.optionA] === 'string' ? row[foundColumns.optionA].trim() : 'Option A';
        const optionB = typeof row[foundColumns.optionB] === 'string' ? row[foundColumns.optionB].trim() : 'Option B';
        const optionC = typeof row[foundColumns.optionC] === 'string' ? row[foundColumns.optionC].trim() : 'Option C';
        const optionD = typeof row[foundColumns.optionD] === 'string' ? row[foundColumns.optionD].trim() : 'Option D';
        
        // Extract correct option and validate it's one of A, B, C, D
        let correctOption = typeof row[foundColumns.correctOption] === 'string' 
          ? row[foundColumns.correctOption].trim().toUpperCase() 
          : 'A';
          
        // Ensure correctOption is valid
        if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
          correctOption = 'A';
        }
        
        // Log the first few questions for debugging
        if (index < 2) {
          console.log(`Question ${index + 1} data:`, {
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption
          });
        }
        
        return {
          paperId: examPaper?.paperId,
          subjectId,
          subjectName,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption
        }
      });
      
      // Filter out questions with empty text
      const validQuestions = questions.filter(q => q.questionText && q.questionText.trim() !== '');
      
      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in the Excel file. Please check the file format.");
      }
      
      if (validQuestions.length !== questions.length) {
        console.warn(`Filtered out ${questions.length - validQuestions.length} invalid questions`);
        toast({
          title: "Warning",
          description: `${questions.length - validQuestions.length} questions were skipped due to missing question text`,
        });
      }
      
      // Show preview instead of directly uploading
      setPreviewQuestions(validQuestions);
      setPreviewSubject(subjectId);
      
    } catch (error) {
      console.error("Error processing Excel file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error processing Excel file",
        variant: "destructive",
      })
      setUploadingSubject(null)
    } finally {
      setUploadingSubject(null)
    }
  }
  
  const saveQuestions = async () => {
    try {
      setSavingQuestions(true)
      
      // Submit questions to API
      const response = await fetch('/api/questions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: previewQuestions,
          paperId: examPaper?.paperId,
          subjectId: previewSubject
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Uploaded ${previewQuestions.length} questions for ${selectedSubjectName}`,
        })
        
        // Reset preview
        setPreviewQuestions([])
        setPreviewSubject(null)
        
        // Check if all subjects have questions and activate paper if needed
        await checkAndActivatePaper()
        
        // Refresh the exam paper data to update question counts
        fetchExamPaper()
      } else {
        throw new Error(result.message || "Failed to upload questions")
      }
    } catch (error) {
      console.error("Error saving questions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error saving questions",
        variant: "destructive",
      })
    } finally {
      setSavingQuestions(false)
    }
  }
  
  const checkAndActivatePaper = async () => {
    if (!examPaper) return
    
    try {
      // Check if each subject has questions
      let allSubjectsHaveQuestions = true
      
      for (const subject of examPaper.subjects) {
        const response = await fetch(`/api/questions?paperId=${examPaper.paperId}&subjectId=${subject.subjectId}`)
        const data = await response.json()
        
        if (!data.success || data.data.length === 0) {
          allSubjectsHaveQuestions = false
          break
        }
      }
      
      // If all subjects have questions, automatically activate the paper if not already active
      if (allSubjectsHaveQuestions && examPaper.status !== 'active') {
        console.log("All subjects have questions, automatically activating paper")
        
        const response = await fetch(`/api/exam-papers/${examPaper._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'active'
          }),
        })
        
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Success",
            description: "Paper has been automatically activated as all subjects have questions",
          })
          
          // Always fetch the latest exam paper data after status change
          await fetchExamPaper()
          
          // Return so that the caller doesn't need to fetch again
          return true
        }
      }
      
      return allSubjectsHaveQuestions
    } catch (error) {
      console.error("Error checking/activating paper:", error)
      return false
    }
  }
  
  const togglePaperStatus = async () => {
    if (!examPaper) return
    
    try {
      setUpdatingStatus(true)
      const newStatus = examPaper.status === 'active' ? 'inactive' : 'active'
      
      // If trying to activate, first check if all subjects have questions
      if (newStatus === 'active') {
        let allSubjectsHaveQuestions = true
        
        for (const subject of examPaper.subjects) {
          const response = await fetch(`/api/questions?paperId=${examPaper.paperId}&subjectId=${subject.subjectId}`)
          const data = await response.json()
          
          if (!data.success || data.data.length === 0) {
            allSubjectsHaveQuestions = false
            toast({
              title: "Cannot Activate Paper",
              description: `Subject "${subject.subjectName}" does not have any questions. All subjects must have questions to activate the paper.`,
              variant: "destructive",
            })
            break
          }
        }
        
        if (!allSubjectsHaveQuestions) {
          setUpdatingStatus(false)
          return
        }
      }
      
      const response = await fetch(`/api/exam-papers/${examPaper._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Paper status updated to ${newStatus}`,
        })
        fetchExamPaper() // Refresh to show updated status
      } else {
        throw new Error(result.message || "Failed to update paper status")
      }
    } catch (error) {
      console.error("Error toggling paper status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating paper status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, subjectId: string, subjectName: string) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file extension
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        })
        return
      }
      
      processExcelFile(file, subjectId, subjectName)
    }
  }
  
  const cancelPreview = () => {
    setPreviewQuestions([])
    setPreviewSubject(null)
  }
  
  const downloadSampleTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        'Sr.No': 1,
        'Paper Id': 'P1234',
        'Question': 'What is the capital of France?',
        'Option A': 'London',
        'Option B': 'Paris',
        'Option C': 'Berlin',
        'Option D': 'Madrid',
        'Correct Option': 'B'
      },
      {
        'Sr.No': 2,
        'Paper Id': 'P1234',
        'Question': 'Who invented the telephone?',
        'Option A': 'Thomas Edison',
        'Option B': 'Alexander Graham Bell',
        'Option C': 'Nikola Tesla',
        'Option D': 'Albert Einstein',
        'Correct Option': 'B'
      }
    ]
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(sampleData)
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    
    // Generate and download the file
    XLSX.writeFile(wb, 'question_template.xlsx')
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
  
  if (!examPaper) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="text-red-500 text-2xl font-bold mb-4">!</div>
              <h2 className="text-xl font-semibold mb-2">Exam Paper Not Found</h2>
              <p className="text-gray-500 mb-6">The exam paper you're looking for doesn't exist or has been deleted.</p>
              <Link href="/admin/exams">
                <Button>Back to Exams</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paper Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="default">
            Edit Paper
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Paper History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paper ID</p>
              <p className="font-medium">{examPaper.paperId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Paper Name</p>
              <p className="font-medium">{examPaper.paperName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">No of Questions</p>
              <p className="font-medium">{examPaper.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Passing Marks</p>
              <p className="font-medium">{examPaper.passingMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Timing (Minutes)</p>
              <p className="font-medium">{examPaper.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="font-medium">{formatDate(examPaper.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p className="font-medium">{formatDate(examPaper.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Correct marks per Question</p>
              <p className="font-medium">{examPaper.correctMarksPerQuestion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Re-Attempt</p>
              <p className="font-medium">{examPaper.reAttempt}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Course Type</p>
              <p className="font-medium">{examPaper.courseType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Course</p>
              <p className="font-medium">{examPaper.course?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Negative Marks</p>
              <p className="font-medium">
                {examPaper.isNegativeMark ? `${examPaper.negativeMarks} / ${examPaper.positiveMarks}` : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Paper Status</p>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium ${
                    examPaper.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {examPaper.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={togglePaperStatus}
                    disabled={updatingStatus || (examPaper.status !== 'active' && !examPaper.subjects.every(s => s.uploadStatus))}
                    className={examPaper.status === 'active' ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}
                  >
                    {updatingStatus ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-blue-600"></div>
                    ) : (
                      examPaper.status === 'active' ? 'Deactivate' : 'Activate'
                    )}
                  </Button>
                </div>
                
                {examPaper.status !== 'active' && (
                  <div className="text-xs text-red-500 mt-1">
                    {!examPaper.subjects.every(s => s.uploadStatus) 
                      ? "Paper is inactive because all subjects don't have uploaded questions" 
                      : "Paper is inactive but all questions are uploaded. You can activate it."}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {examPaper.subjects.filter(s => s.uploadStatus).length} of {examPaper.subjects.length} subjects have questions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Subjects and Question Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Subject Questions</h2>
          <Button 
            variant="outline" 
            onClick={downloadSampleTemplate}
            className="flex items-center gap-2"
          >
            Download Sample
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="border px-4 py-2 text-left">Sr.No</th>
                <th className="border px-4 py-2 text-left">Subject Name</th>
                <th className="border px-4 py-2 text-left">Number Of Questions</th>
                <th className="border px-4 py-2 text-left">Is Individual</th>
                <th className="border px-4 py-2 text-left">Passing Marks</th>
                <th className="border px-4 py-2 text-left">Practical Marks</th>
                <th className="border px-4 py-2 text-left">Uploaded Question</th>
                <th className="border px-4 py-2 text-left">Choose Paper</th>
                <th className="border px-4 py-2 text-left">Upload Paper</th>
              </tr>
            </thead>
            <tbody>
              {examPaper.subjects.map((subject, index) => (
                <tr key={subject.subjectId} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{subject.subjectName}</td>
                  <td className="border px-4 py-2">{subject.numberOfQuestions}</td>
                  <td className="border px-4 py-2">{subject.isIndividual ? 'Yes' : 'No'}</td>
                  <td className="border px-4 py-2">{subject.passingMarks}</td>
                  <td className="border px-4 py-2">{subject.practicalMarks}</td>
                  <td className="border px-4 py-2">
                    {subject.uploadStatus ? (
                      <div className="flex items-center text-green-600">
                        <span>✓ {subject.questionCount || 0}</span>
                      </div>
                    ) : (
                      <span className="text-red-500">Not uploaded</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[subject.subjectId] = el;
                      }}
                      onChange={(e) => handleFileUpload(e, subject.subjectId, subject.subjectName)}
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleFileSelect(subject.subjectId)}
                    >
                      Choose file
                    </Button>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-around gap-2">
                      <Button
                        disabled={uploadingSubject === subject.subjectId}
                        onClick={() => handleFileSelect(subject.subjectId)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {uploadingSubject === subject.subjectId ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white"></div>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                      
                      {subject.uploadStatus && (
                        <Link href={`/admin/exams/${id}/questions/${subject.subjectId}`} passHref prefetch={false}>
                          <Button 
                            variant="outline" 
                            className="text-blue-600"
                            onClick={(e) => {
                              // Force a hard navigation to avoid any caching issues
                              e.preventDefault();
                              window.location.href = `/admin/exams/${id}/questions/${subject.subjectId}`;
                            }}
                          >
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Question Preview Section */}
      {previewSubject && previewQuestions.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Questions Preview - {selectedSubjectName}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelPreview}>
                  Cancel
                </Button>
                <Button 
                  onClick={saveQuestions} 
                  disabled={savingQuestions}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {savingQuestions ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white"></div>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </CardTitle>
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
                  {previewQuestions.map((question, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{question.questionText}</td>
                      <td className="border px-4 py-2">{question.optionA}</td>
                      <td className="border px-4 py-2">{question.optionB}</td>
                      <td className="border px-4 py-2">{question.optionC}</td>
                      <td className="border px-4 py-2">{question.optionD}</td>
                      <td className="border px-4 py-2">{question.correctOption}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={saveQuestions} 
                disabled={savingQuestions}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {savingQuestions ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white"></div>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 