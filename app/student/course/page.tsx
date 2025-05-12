"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, BookOpen, FileText, Calendar, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

// Get tab-specific storage key
const getStorageKey = (key: string) => {
  if (typeof window === "undefined") return key;
  
  const tabId = sessionStorage.getItem("tab_id");
  if (!tabId) return key; // Fallback to regular key if no tab ID found
  
  return `${tabId}_${key}`;
}

// Function to fetch subjects with fallback options
const fetchSubjects = async (courseId: string, timestamp: number) => {
  // Try the main API endpoint first
  try {
    console.log(`Trying to fetch subjects from /api/courses/${courseId}/subjects`)
    const response = await fetch(`/api/courses/${courseId}/subjects?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        console.log("Subjects loaded successfully:", data.data)
        return data.data
      } else {
        console.warn("API returned success:false -", data.message)
      }
    } else {
      console.warn(`First API endpoint failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error fetching from first API endpoint:", error)
  }
  
  // Try fallback API endpoint with 'include=subjects' parameter
  try {
    console.log(`Trying fallback: /api/courses/${courseId}?include=subjects`)
    const response = await fetch(`/api/courses/${courseId}?include=subjects&t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data && data.data.subjects) {
        console.log("Subjects loaded from fallback:", data.data.subjects)
        return data.data.subjects
      } else {
        console.warn("Fallback API returned no subjects")
      }
    } else {
      console.warn(`Fallback API failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error fetching from fallback API:", error)
  }
  
  // If all attempts fail, return empty array
  return []
}

export default function StudentCourse() {
  const [course, setCourse] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState('overview')

  // Fetch course and subjects data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setSubjectsError(null)
        
        // Get current student ID from sessionStorage with tab-specific key
        const currentUserId = sessionStorage.getItem(getStorageKey("current_user_id"))
        
        console.log("Current user ID:", currentUserId)
        
        if (!currentUserId) {
          throw new Error("No user ID found in session storage")
        }
        
        // Fetch course data for the student
        const timestamp = new Date().getTime()
        console.log(`Fetching course data for student ID: ${currentUserId}`)
        const courseResponse = await fetch(`/api/student-courses/${currentUserId}?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course data: ${courseResponse.status} ${courseResponse.statusText}`)
        }
        
        const courseData = await courseResponse.json()
        
        if (!courseData.success || !courseData.data) {
          throw new Error(courseData.message || "Failed to load course information")
        }
        
        console.log("Course data loaded:", courseData.data)
        setCourse(courseData.data)
        
        // Fetch subjects for this course
        if (courseData.data._id) {
          try {
            const subjectsData = await fetchSubjects(courseData.data._id, timestamp)
            if (subjectsData.length > 0) {
              setSubjects(subjectsData)
            } else {
              setSubjectsError("No subjects found for this course.")
            }
          } catch (subjectError: any) {
            console.error("Error fetching subjects:", subjectError)
            setSubjectsError(subjectError.message || "Failed to load subjects")
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message || "Failed to load course information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to retry loading subjects
  const retryLoadSubjects = async () => {
    if (!course || !course._id) return
    
    try {
      setSubjectsError(null)
      const timestamp = new Date().getTime()
      const subjectsData = await fetchSubjects(course._id, timestamp)
      
      if (subjectsData.length > 0) {
        setSubjects(subjectsData)
        toast({
          title: "Subjects loaded",
          description: `Successfully loaded ${subjectsData.length} subject(s)`,
          variant: "default",
        })
      } else {
        setSubjectsError("No subjects found for this course.")
        toast({
          title: "No subjects found",
          description: "This course doesn't have any subjects assigned yet.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error retrying subject load:", error)
      setSubjectsError(error.message || "Failed to load subjects")
      toast({
        title: "Error",
        description: error.message || "Failed to load subjects",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-gray-600 mt-2">Unable to load course information.</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="mt-4">
          <p className="text-sm text-gray-500">Please try the following:</p>
          <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
            <li>Refresh the page</li>
            <li>Log out and log back in</li>
            <li>Contact administrator if the problem persists</li>
          </ul>
        </div>
      </div>
    )
  }

  // Format duration
  const formatDuration = (duration: any) => {
    if (!duration) return 'Not specified';
    
    if (typeof duration === 'number') {
      return `${duration} ${duration === 1 ? 'month' : 'months'}`;
    }
    
    return duration;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">My Course</h1>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Duration: {formatDuration(course.duration)}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <FileText className="w-4 h-4 mr-1" /> {subjects.length} Subject{subjects.length !== 1 ? 's' : ''}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <Clock className="w-4 h-4 mr-1" /> {course.type || 'Regular Course'}
              </span>
            </div>
            <p className="text-gray-700">{course.description || 'No course description available.'}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-blue-50 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-md"
          >
            Course Overview
          </TabsTrigger>
          <TabsTrigger 
            value="subjects" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-md"
          >
            Subjects ({subjects.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Course Overview Tab */}
        <TabsContent value="overview">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Course Name</h3>
                    <p className="text-lg font-medium text-gray-900">{course.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="text-lg font-medium text-gray-900">{formatDuration(course.duration)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Course Code</h3>
                    <p className="text-lg font-medium text-gray-900">{course.code || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Course Type</h3>
                    <p className="text-lg font-medium text-gray-900">{course.type || 'Regular Course'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">No. of Subjects</h3>
                    <p className="text-lg font-medium text-gray-900">{subjects.length}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Skill Level</h3>
                    <p className="text-lg font-medium text-gray-900">{course.level || 'Intermediate'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Language</h3>
                    <p className="text-lg font-medium text-gray-900">{course.language || 'Hindi/English'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Certificate</h3>
                    <p className="text-lg font-medium text-gray-900">
                      {course.hasCertificate !== false ? 'Yes (Upon completion)' : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
              
              {course.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Course Description</h3>
                  <p className="text-gray-700">{course.description}</p>
                </div>
              )}
              
              {course.learningOutcomes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Outcomes</h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Course Progress Section in Overview Tab */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Course Progress</h3>
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Overall Completion</span>
                  <span className="text-sm font-medium text-blue-600">35%</span>
                </div>
                <Progress value={35} className="h-2 bg-blue-100" />
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button 
                onClick={() => setCurrentTab('subjects')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                View Subjects
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Course Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subjects.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {subjects.map((subject, index) => (
                    <div key={subject._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                              <span className="font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                              <p className="text-sm text-gray-500">{subject.code || ''}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-2">{subject.description || 'No description available.'}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {subject.totalMarks && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                Theory: {subject.totalMarks} marks
                              </span>
                            )}
                            {subject.totalPracticalMarks && (
                              <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                Practical: {subject.totalPracticalMarks} marks
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full md:w-24 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex flex-col items-center justify-center border-4 border-blue-100">
                            <span className="text-lg font-bold text-blue-600">30%</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No subjects found</h3>
                  <p className="text-gray-500 text-center mt-1">
                    This course doesn't have any subjects assigned yet.
                  </p>
                  {error && (
                    <div className="mt-4 text-red-500 text-center">
                      <p>Error: {error}</p>
                      <Button 
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="mt-2"
                      >
                        Refresh Page
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 