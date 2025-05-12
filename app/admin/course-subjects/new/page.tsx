"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { ResponsiveTable } from "@/components/ui/responsive-table"

interface Course {
  _id: string
  name: string
  code: string
}

interface Subject {
  _id: string
  name: string
  code: string
  position?: number
  selected?: boolean
}

export default function AddCourseMultipleSubject() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("25")
  const [selectedSubjects, setSelectedSubjects] = useState<{[key: string]: Subject & {position: number}}>({})

  // Fetch courses and subjects from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch courses
        const coursesResponse = await fetch('/api/courses')
        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch courses')
        }
        const coursesData = await coursesResponse.json()
        
        // Fetch subjects
        const subjectsResponse = await fetch('/api/subjects')
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects')
        }
        const subjectsData = await subjectsResponse.json()
        
        if (coursesData.success && subjectsData.success) {
          setCourses(coursesData.data)
          setSubjects(subjectsData.data)
        } else {
          throw new Error('Error fetching data')
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading courses and subjects.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // When a course is selected, fetch its existing subjects
  useEffect(() => {
    const fetchCourseSubjects = async () => {
      if (!selectedCourse) {
        setSelectedSubjects({})
        return
      }
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/courses/${selectedCourse}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course details')
        }
        
        const data = await response.json()
        if (data.success && data.data.subjects) {
          // Reset current selections
          const courseSubjects = data.data.subjects || []
          const subjectMap: {[key: string]: Subject & {position: number}} = {}
          
          // Loop through the course subjects and create a map with positions
          for (let i = 0; i < courseSubjects.length; i++) {
            const subjectId = courseSubjects[i]
            const subject = subjects.find(s => s._id === subjectId)
            if (subject) {
              subjectMap[subjectId] = {
                ...subject,
                position: i + 1
              }
            }
          }
          
          setSelectedSubjects(subjectMap)
        }
      } catch (error) {
        console.error("Error fetching course subjects:", error)
        toast({
          title: "Error",
          description: "Could not load selected course's subjects",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (subjects.length > 0) {
      fetchCourseSubjects()
    }
  }, [selectedCourse, subjects])

  // Toggle subject selection
  const toggleSubjectSelection = (subject: Subject) => {
    setSelectedSubjects(prev => {
      const updated = {...prev}
      
      if (updated[subject._id]) {
        // If already selected, remove it
        delete updated[subject._id]
      } else {
        // Add it with the next available position number
        const positions = Object.values(updated).map(s => s.position)
        const nextPosition = positions.length > 0 ? Math.max(...positions) + 1 : 1
        updated[subject._id] = {...subject, position: nextPosition}
      }
      
      return updated
    })
  }

  // Update subject position
  const updateSubjectPosition = (subjectId: string, position: number) => {
    setSelectedSubjects(prev => {
      if (!prev[subjectId]) return prev
      
      return {
        ...prev,
        [subjectId]: {
          ...prev[subjectId],
          position
        }
      }
    })
  }

  // Remove subject
  const removeSubject = (subjectId: string) => {
    setSelectedSubjects(prev => {
      const updated = {...prev}
      delete updated[subjectId]
      return updated
    })
  }

  // Save course subjects
  const handleSave = async () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive"
      })
      return
    }
    
    // Validate subject selection based on course type
    const selectedCourseData = courses.find(c => c._id === selectedCourse)
    if (!selectedCourseData) return
    
    const isTypingCourse = selectedCourseData.code.includes('typing') || 
                           selectedCourseData.name.toLowerCase().includes('typing')
    
    const selectedCount = Object.keys(selectedSubjects).length
    
    if ((isTypingCourse && (selectedCount < 1 || selectedCount > 3)) ||
        (!isTypingCourse && (selectedCount < 1 || selectedCount > 8))) {
      toast({
        title: "Invalid Selection",
        description: isTypingCourse
          ? "Typing courses must have between 1 and 3 subjects"
          : "Regular courses must have between 1 and 8 subjects",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Sort subjects by position
      const sortedSubjectIds = Object.values(selectedSubjects)
        .sort((a, b) => a.position - b.position)
        .map(subject => subject._id)
      
      // Update course with selected subjects
      const response = await fetch(`/api/courses/${selectedCourse}/subjects`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjects: sortedSubjectIds
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update course subjects')
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Course subjects updated successfully"
        })
        
        // Optionally clear selections
        setSelectedCourse("")
        setSelectedSubjects({})
      } else {
        throw new Error(result.message || 'Error updating course subjects')
      }
    } catch (error) {
      console.error("Error saving course subjects:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving course subjects",
        variant: "destructive"
      })
    }
  }

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(
    subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get the selected course data
  const selectedCourseData = selectedCourse 
    ? courses.find(course => course._id === selectedCourse)
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add Course Multiple Subject</h1>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course" className="text-red-500">Select Course *</Label>
              <Select 
                value={selectedCourse} 
                onValueChange={setSelectedCourse}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCourseData && (
              <p className="text-red-500 text-sm">
                Please Select Subject In Regular Course Minimum 1 And Maximum 8 & In Typing Course Minimum 1 And Maximum 3
              </p>
            )}
            
            {/* Subjects Table */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span>Show per page:</span>
                  <Select 
                    value={entriesPerPage} 
                    onValueChange={setEntriesPerPage}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue>{entriesPerPage}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No subjects found matching your search."
                    : "No subjects found."}
                </div>
              ) : (
                <ResponsiveTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Sr.</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="w-24">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects.map((subject, index) => {
                        const isSelected = !!selectedSubjects[subject._id]
                        return (
                          <TableRow key={subject._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>
                              {isSelected && (
                                <Input 
                                  type="number"
                                  min="1"
                                  value={selectedSubjects[subject._id].position}
                                  onChange={(e) => updateSubjectPosition(
                                    subject._id, 
                                    parseInt(e.target.value) || 1
                                  )}
                                  className="w-24"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSubjectSelection(subject)}
                                />
                                {isSelected && (
                                  <Button 
                                    className="h-8 w-8 p-0 hover:bg-gray-100" 
                                    onClick={() => removeSubject(subject._id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ResponsiveTable>
              )}
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button 
                type="button" 
                className="bg-orange-400 hover:bg-orange-500"
                onClick={handleSave}
                disabled={!selectedCourse || Object.keys(selectedSubjects).length === 0}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 