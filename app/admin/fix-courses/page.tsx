"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface ApiResponse {
  success: boolean
  message: string
  data?: any[]
}

export default function FixCoursesPage() {
  const [isLoading, setIsLoading] = useState({
    placeholder: false,
    demo: false,
    test: false
  })
  const [results, setResults] = useState<{
    placeholder: ApiResponse | null,
    demo: ApiResponse | null,
    test: ApiResponse | null
  }>({
    placeholder: null,
    demo: null,
    test: null
  })

  const updateCoursePlaceholders = async () => {
    setIsLoading(prev => ({ ...prev, placeholder: true }))
    try {
      const response = await fetch('/api/update-course-images')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setResults(prev => ({ ...prev, placeholder: data }))
      } else {
        throw new Error(data.message || "Failed to update course placeholders")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, placeholder: false }))
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

  const addTestCourses = async () => {
    setIsLoading(prev => ({ ...prev, test: true }))
    try {
      const response = await fetch('/api/test-courses', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setResults(prev => ({ ...prev, test: data }))
      } else {
        throw new Error(data.message || "Failed to add test courses")
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(prev => ({ ...prev, test: false }))
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fix Course Images</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Placeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Update all courses with colorful placeholder images based on their code.</p>
            <Button 
              onClick={updateCoursePlaceholders} 
              disabled={isLoading.placeholder}
              className="w-full"
            >
              {isLoading.placeholder ? "Updating..." : "Update Placeholders"}
            </Button>
            {results.placeholder && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <p>Updated {results.placeholder.data?.length || 0} courses</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Demo Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add the demo courses shown in the screenshot.</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Add Test Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add test courses with placeholder images.</p>
            <Button 
              onClick={addTestCourses} 
              disabled={isLoading.test}
              className="w-full"
            >
              {isLoading.test ? "Adding..." : "Add Test Courses"}
            </Button>
            {results.test && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <p>Added {results.test.data?.length || 0} test courses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 