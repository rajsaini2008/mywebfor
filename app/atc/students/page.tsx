"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Search, User, Pencil } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { useAuth } from "@/lib/auth"

interface Student {
  _id: string
  studentId: string
  name: string
  email: string
  mobile: string
  phone?: string
  photo?: string
  photoUrl?: string
  enrollmentDate: string
  status: string
  atcId?: string
}

export default function AllStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      
      // Add atcId parameter to only get students of this ATC
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
        // Map the API response fields to ensure mobile number is accessible
        const mappedStudents = data.data.map((student: any) => ({
          ...student,
          mobile: student.mobile || student.phone || "", // Ensure mobile field exists
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student? This will also delete all their exam applications.")) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Remove student from state
          setStudents(students.filter((student) => student._id !== id))
          
          // Show toast with information about exam applications
          const examMsg = data.examApplicationsDeleted > 0 
            ? `and ${data.examApplicationsDeleted} exam applications` 
            : '';
            
          toast({
            title: "Student deleted",
            description: `The student ${examMsg} has been deleted successfully.`,
          })
        } else {
          throw new Error(data.message || "Failed to delete student")
        }
      } catch (error) {
        console.error("Error deleting student:", error)
        toast({
          title: "Error deleting student",
          description: "There was a problem deleting the student.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile?.includes(searchTerm) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return "text-green-600";
      case 'inactive':
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  }

  const getStudentPhotoUrl = (student: Student) => {
    return student.photo || student.photoUrl || "/placeholder-avatar.jpg";
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  }

  const exportToPDF = () => {
    // PDF export functionality would go here
    toast({
      title: "PDF Export",
      description: "PDF export functionality will be implemented here.",
    });
  }

  const openStudentPortal = (student: Student) => {
    // Open auto-login page which will handle automatic login with credentials and redirect to dashboard
    window.open(`/student-auto-login/${encodeURIComponent(student.studentId)}`, '_blank');
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">All Students</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            <Button 
              variant="outline" 
              className="bg-gray-100 hover:bg-gray-200"
              onClick={exportToPDF}
            >
              PDF
            </Button>
          </CardTitle>
          <div className="flex items-center">
            <Label htmlFor="search" className="mr-2">Search:</Label>
            <Input
              id="search"
              placeholder="Search..."
              className="max-w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No students found matching your search."
                : "No students found. Add a new student to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Sr.</TableHead>
                    <TableHead className="text-left">Photo</TableHead>
                    <TableHead className="text-left">ID</TableHead>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Mob._No.</TableHead>
                    <TableHead className="text-left">D.O.J.</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-left">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image 
                            src={getStudentPhotoUrl(student)}
                            alt={student.name}
                            className="object-cover"
                            fill
                            sizes="40px"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.mobile || student.phone || "N/A"}</TableCell>
                      <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                      <TableCell>
                        <span className={getStatusClass(student.status)}>
                          {student.status || "Active"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/atc/students/${student._id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-gray-100"
                            onClick={() => handleDelete(student._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                            onClick={() => openStudentPortal(student)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 