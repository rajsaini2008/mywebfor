"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Search, RefreshCw, BookOpen } from "lucide-react"

interface Subject {
  _id: string
  name: string
  code: string
}

interface Course {
  _id: string
  name: string
  shortName?: string
  duration?: number
  durationType?: string
  subjects?: Subject[]
  passingMarks?: number
  totalMarks?: number
}

export default function ATCCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/courses?refresh=true&t=${timestamp}`, {
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
        setCourses(data.data)
        console.log(`Loaded ${data.data.length} courses from database`)
      } else {
        throw new Error(data.message || "Failed to load courses")
      }
    } catch (error) {
      console.error("Error loading courses:", error)
      toast({
        title: "Error loading courses",
        description: "There was a problem loading the course data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCourses = () => {
    if (!searchTerm) {
      setFilteredCourses(courses)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = courses.filter(course => 
      course.name.toLowerCase().includes(term) || 
      course.shortName?.toLowerCase().includes(term)
    )
    setFilteredCourses(filtered)
  }

  const refreshData = () => {
    fetchCourses()
    toast({
      title: "Refreshed",
      description: "Course data has been refreshed",
    })
  }

  const formatDuration = (duration?: number, type?: string) => {
    if (!duration) return "N/A"
    return `${duration} ${type || "Months"}`
  }

  const getSubjectCount = (subjects?: Subject[]) => {
    if (!subjects) return 0
    return subjects.length
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Courses</h1>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Available Courses</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="w-[200px] pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No courses found matching your search." : "No courses available."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden">
                  <div className="bg-blue-600 h-2"></div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{course.name}</h3>
                        {course.shortName && (
                          <p className="text-sm text-gray-500 mt-1">
                            {course.shortName}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <p className="text-gray-600">{formatDuration(course.duration, course.durationType)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Subjects:</span>
                            <p className="text-gray-600">{getSubjectCount(course.subjects)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Passing Marks:</span>
                            <p className="text-gray-600">{course.passingMarks || "N/A"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Total Marks:</span>
                            <p className="text-gray-600">{course.totalMarks || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 