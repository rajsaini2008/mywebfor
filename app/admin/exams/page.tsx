"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Eye, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExamPaper {
  _id: string;
  paperId: string;
  paperName: string;
  courseName?: string;
  course: any;
  totalQuestions: number;
  passingMarks: number;
  time: number;
  status?: string;
  paperType: string;
  examType: string;
  subjects?: {
    subjectId: string;
    subjectName: string;
    uploadStatus?: boolean;
    questionCount?: number;
  }[];
  questionsUploaded?: boolean;
}

export default function ExamsPage() {
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchExamPapers()
  }, [])

  const fetchExamPapers = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching exam papers...")
      const response = await fetch('/api/exam-papers')
      
      if (!response.ok) {
        console.error("Failed to fetch exam papers, status:", response.status)
        throw new Error(`Failed to fetch exam papers: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API response:", data)
      
      if (data.success) {
        // Process the exam papers to add courseName from course object
        console.log(`Received ${data.data.length} exam papers from the API`)
        const processedPapers = data.data.map((paper: any) => {
          console.log("Processing paper:", paper.paperId, paper.paperName)
          return {
            ...paper,
            courseName: paper.course?.name || 'Unknown Course',
            // Use status directly from backend
            status: paper.status || 'Inactive'
          }
        })
        
        console.log(`Processed ${processedPapers.length} exam papers`)
        setExamPapers(processedPapers)
      } else {
        console.error("API returned error:", data.message)
        throw new Error(data.message || 'Error fetching exam papers')
      }
      } catch (error) {
      console.error("Error loading exam papers:", error)
        toast({
          title: "Error loading exams",
          description: "There was a problem loading the exam data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam paper?")) {
      try {
        const response = await fetch(`/api/exam-papers/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete exam paper')
        }
        
        const result = await response.json()
        
        if (result.success) {
          // Remove the deleted exam from the state
          setExamPapers(prev => prev.filter(paper => paper._id !== id))
      
      toast({
            title: "Success",
            description: "Exam paper deleted successfully",
          })
        } else {
          throw new Error(result.message || 'Error deleting exam paper')
        }
      } catch (error) {
        console.error("Error deleting exam paper:", error)
        toast({
          title: "Error",
          description: "Failed to delete exam paper",
          variant: "destructive",
        })
      }
    }
  }

  // Function to check if exam has all questions uploaded
  const examHasAllQuestions = (paper: ExamPaper) => {
    // If subjects array is available, check it
    if (paper.subjects && paper.subjects.length > 0) {
      return paper.subjects.every(subject => subject.uploadStatus === true);
    }
    
    // If questionsUploaded field is available, use it
    if (paper.questionsUploaded !== undefined) {
      return paper.questionsUploaded;
    }
    
    // If the paper is active, it must have all questions uploaded
    if (paper.status === 'active') {
      return true;
    }
    
    // By default, assume we don't know - to be safe, assume it doesn't have questions
    return false;
  }

  // Function to get the appropriate status color
  const getStatusColor = (paper: ExamPaper) => {
    // Paper is active (from database)
    if (paper.status === 'active') {
      return "text-green-600";
    }
    
    // Paper is inactive (from database) and has no questions
    const missingQuestions = !examHasAllQuestions(paper);
    if (paper.status === 'inactive' && missingQuestions) {
      return "text-red-600";
    }
    
    // Paper is inactive for other reasons
    return "text-yellow-600";
  }

  // Function to get the status display text
  const getStatusDisplay = (paper: ExamPaper) => {
    // Convert status from database format to display format (capitalize first letter)
    const status = paper.status || 'inactive';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Calculate pagination
  const totalPages = Math.ceil(examPapers.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayedPapers = examPapers.slice(startIndex, endIndex)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">All Exams</h1>
        <Link href="/admin/exams/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Exam
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-b">
          <CardTitle>Exam List</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Show per page : </span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm">entries</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : examPapers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exam papers found. Add a new exam to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="py-3 px-4 text-left font-medium text-sm">Sr.</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Paper Id</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Paper Name</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Course Name</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">No of Question</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Passing Marks</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Timing (min)</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Status</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Paper Type</th>
                    <th className="py-3 px-4 text-left font-medium text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPapers.map((paper, index) => (
                    <tr key={paper._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{startIndex + index + 1}</td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/exams/${paper._id}`} className="text-blue-600 hover:underline cursor-pointer">
                          {paper.paperId}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{paper.paperName}</td>
                      <td className="py-3 px-4">{paper.courseName}</td>
                      <td className="py-3 px-4">{paper.totalQuestions}</td>
                      <td className="py-3 px-4">{paper.passingMarks}</td>
                      <td className="py-3 px-4">{paper.time}</td>
                      <td className={`py-3 px-4 font-medium ${getStatusColor(paper)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusDisplay(paper)}
                          {paper.status === 'inactive' && !examHasAllQuestions(paper) && (
                            <div title="Questions not uploaded for all subjects" className="text-red-600 font-bold">
                              ⚠️
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{paper.examType || "Main"}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            title="Delete"
                            onClick={() => handleDelete(paper._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/exams/${paper._id}`}>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-blue-800"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                              </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && examPapers.length > 0 && (
            <div className="flex justify-between items-center p-4 text-sm">
              <div>
                Showing {startIndex + 1} to {Math.min(endIndex, examPapers.length)} of {examPapers.length} entries
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  First
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 