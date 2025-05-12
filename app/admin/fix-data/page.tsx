"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function FixDataPage() {
  const [isLoading, setIsLoading] = useState({
    courses: false,
    images: false,
    students: false,
    demo: false
  })
  const [results, setResults] = useState<Record<string, any>>({
    courses: null,
    images: null,
    students: null,
    demo: null
  })
  const [isFixingCourseImages, setIsFixingCourseImages] = useState(false);
  const [isFixingStudentImages, setIsFixingStudentImages] = useState(false);
  const [courseImagesResult, setCourseImagesResult] = useState<any>(null);
  const [studentImagesResult, setStudentImagesResult] = useState<any>(null);

  const fixCourseImages = async () => {
    setIsLoading(prev => ({ ...prev, images: true }))
    try {
      // First try the new specific course image fixer
      const response = await fetch('/api/fix-course-images')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setResults(prev => ({ ...prev, images: data }))
      } else {
        // If that fails, try the old method
        const fallbackResponse = await fetch('/api/update-course-images')
        const fallbackData = await fallbackResponse.json()
        
        if (fallbackData.success) {
          toast({
            title: "Success (Fallback)",
            description: fallbackData.message,
          })
          setResults(prev => ({ ...prev, images: fallbackData }))
        } else {
          throw new Error(data.message || "Failed to update course images")
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, images: false }))
    }
  }

  const addDemoCourses = async () => {
    setIsLoading(prev => ({ ...prev, demo: true }))
    try {
      const response = await fetch('/api/demo-courses')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setResults(prev => ({ ...prev, demo: data }))
      } else {
        throw new Error(data.message || "Failed to add demo courses")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, demo: false }))
    }
  }

  const fixStudentData = async () => {
    setIsLoading(prev => ({ ...prev, students: true }))
    try {
      const response = await fetch('/api/fix-students')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setResults(prev => ({ ...prev, students: data }))
      } else {
        throw new Error(data.message || "Failed to fix student data")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, students: false }))
    }
  }

  const handleFixCourseImages = async () => {
    setIsFixingCourseImages(true);
    try {
      const response = await fetch("/api/fix-course-images");
      const data = await response.json();
      setCourseImagesResult(data);
      toast({
        title: data.success ? "Success" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error fixing course images:", error);
      toast({
        title: "Error",
        description: "An error occurred while fixing course images",
        variant: "destructive",
      });
    } finally {
      setIsFixingCourseImages(false);
    }
  };

  const handleFixStudentImages = async () => {
    setIsFixingStudentImages(true);
    try {
      const response = await fetch("/api/repair-student-images");
      const data = await response.json();
      setStudentImagesResult(data);
      toast({
        title: data.success ? "Success" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error fixing student images:", error);
      toast({
        title: "Error",
        description: "An error occurred while fixing student images",
        variant: "destructive",
      });
    } finally {
      setIsFixingStudentImages(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Data Repair Tools</h1>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
        <h2 className="text-lg font-medium text-blue-800 mb-2">Image Upload Guide</h2>
        <p className="text-sm text-blue-700 mb-2">
          The system uses a 4-step method for handling images:
        </p>
        <ol className="list-decimal pl-5 text-sm text-blue-700 mb-2">
          <li>Image is uploaded from form</li>
          <li>Server saves image to local storage</li>
          <li>URL is generated for the image</li>
          <li>URL is saved in database</li>
        </ol>
        <a 
          href="/docs/image-upload-guide.html" 
          target="_blank" 
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          View Complete Documentation
        </a>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Course Images</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Update all courses with colorful placeholder images based on their code.</p>
                <Button 
                  onClick={handleFixCourseImages} 
                  disabled={isFixingCourseImages}
                  className="w-full"
                >
                  {isFixingCourseImages ? "Fixing..." : "Fix Course Images"}
                </Button>
                {courseImagesResult && (
                  <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <p>{courseImagesResult.message}</p>
                    {courseImagesResult.updatedCourses && (
                      <p className="text-sm mt-2">
                        Updated {courseImagesResult.updatedCourses.length} courses
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Demo Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Add demo courses with proper images to match the design.</p>
                <Button 
                  onClick={addDemoCourses} 
                  disabled={isLoading.demo}
                  className="w-full"
                >
                  {isLoading.demo ? "Adding..." : "Add Demo Courses"}
                </Button>
                {results.demo && (
                  <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <p>Added {results.demo.data?.length || 0} demo courses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fix Student Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Fix issues with student data like missing course references or status values.</p>
              <Button 
                onClick={fixStudentData} 
                disabled={isLoading.students}
                className="w-full"
              >
                {isLoading.students ? "Fixing..." : "Fix Student Data"}
              </Button>
              {results.students && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <p>Fixed {results.students.stats?.fixed || 0} out of {results.students.stats?.total || 0} students</p>
                  {results.students.stats?.errors > 0 && (
                    <p className="text-red-500 mt-2">Errors: {results.students.stats.errors}</p>
                  )}
                  {results.students.fixedStudents && results.students.fixedStudents.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Fixed students:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {results.students.fixedStudents.slice(0, 5).map((student: any, index: number) => (
                          <li key={index}>
                            {student.name} - Fixed: {student.updates.join(', ')}
                          </li>
                        ))}
                        {results.students.fixedStudents.length > 5 && (
                          <li>...and {results.students.fixedStudents.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fix Student Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This tool will scan all student records and fix any missing or invalid image URLs
                  by generating appropriate placeholder images for photos, ID cards, and signatures.
                </p>
                <Button 
                  onClick={handleFixStudentImages} 
                  disabled={isFixingStudentImages}
                >
                  {isFixingStudentImages ? "Fixing..." : "Fix Student Images"}
                </Button>

                {studentImagesResult && (
                  <div className="mt-4 p-4 border rounded bg-muted">
                    <h3 className="font-medium mb-2">Results:</h3>
                    <p>{studentImagesResult.message}</p>
                    {studentImagesResult.updatedStudents && (
                      <p className="text-sm mt-2">
                        Updated {studentImagesResult.updatedStudents.length} student records
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 