"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, Search, MoreHorizontal } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Subject {
  id: string
  name: string
  code: string
  description: string
  courses: string[]
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    courses: [] as string[],
  })

  useEffect(() => {
    // Load subjects and courses
    const loadData = () => {
      try {
        // Load courses
        const storedCourses = localStorage.getItem("courses")
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses))
        }

        // Load subjects
        const storedSubjects = localStorage.getItem("subjects")
        if (storedSubjects) {
          setSubjects(JSON.parse(storedSubjects))
        } else {
          // Add some mock data if no subjects exist
          const mockSubjects = [
            {
              id: "1",
              name: "Computer Fundamentals",
              code: "CF101",
              description: "Introduction to computer systems, hardware, and software concepts.",
              courses: ["1", "2"], // DCA and CCC
            },
            {
              id: "2",
              name: "MS Office",
              code: "MSO201",
              description: "Microsoft Office suite including Word, Excel, PowerPoint, and Outlook.",
              courses: ["1", "2"], // DCA and CCC
            },
            {
              id: "3",
              name: "Tally Basics",
              code: "TB301",
              description: "Introduction to Tally accounting software and its features.",
              courses: ["3"], // Tally
            },
          ]
          localStorage.setItem("subjects", JSON.stringify(mockSubjects))
          setSubjects(mockSubjects)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading the subject data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      const updatedSubjects = subjects.filter((subject) => subject.id !== id)
      setSubjects(updatedSubjects)
      localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
      toast({
        title: "Subject deleted",
        description: "The subject has been deleted successfully.",
      })
    }
  }

  const handleEdit = (subject: Subject) => {
    setCurrentSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      courses: subject.courses,
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setCurrentSubject(null)
    setFormData({
      name: "",
      code: "",
      description: "",
      courses: [],
    })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCoursesChange = (selectedCourses: string[]) => {
    setFormData((prev) => ({ ...prev, courses: selectedCourses }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditing && currentSubject) {
      // Update existing subject
      const updatedSubjects = subjects.map(subject => 
        subject.id === currentSubject.id ? { ...subject, ...formData } : subject
      )
      setSubjects(updatedSubjects)
      localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
      toast({
        title: "Subject updated",
        description: "The subject has been updated successfully.",
      })
    } else {
      // Add new subject
      const newSubject = {
        id: Date.now().toString(),
        ...formData,
      }
      const updatedSubjects = [...subjects, newSubject]
      setSubjects(updatedSubjects)
      localStorage.setItem("subjects", JSON.stringify(updatedSubjects))
      toast({
        title: "Subject added",
        description: "The subject has been added successfully.",
      })
    }
    
    setIsDialogOpen(false)
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Subject
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>All Subjects</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              className="pl-8"
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
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No subjects found matching your search."
                : "No subjects found. Add a new subject to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Associated Courses</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                      <TableCell>
                        {subject.courses.map(courseId => {
                          const course = courses.find(c => c.id === courseId)
                          return course ? course.code : ""
                        }).join(", ")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(subject)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(subject.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Subject Form Dialog would go here */}
    </div>
  )
}
