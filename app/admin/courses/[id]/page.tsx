"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import SafeImage from "@/components/ui/SafeImage"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  fee: number
  description: string
  isActive: boolean
  imageUrl?: string
  subjects?: any[]
}

export default function CourseDetails() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/courses/${id}?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course. Status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setCourse(data.data)
        } else {
          throw new Error(data.message || "Failed to fetch course")
        }
      } catch (error: any) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchCourse()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-xl text-gray-600">Course not found</p>
        <Button
          className="mt-4"
          onClick={() => router.push("/admin/courses")}
        >
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Course Details</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Back to Courses
          </Button>
          <Button 
            onClick={() => router.push(`/admin/courses/${id}/edit`)}
          >
            Edit Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{course.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">Course Code</h3>
                <p>{course.code}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Duration</h3>
                <p>{course.duration}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Fee</h3>
                <p>₹{course.fee.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Status</h3>
                <p className={course.isActive ? "text-green-600" : "text-red-600"}>
                  {course.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-800 whitespace-pre-line">{course.description}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Course Image</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="border rounded overflow-hidden">
              <SafeImage
                src={course.imageUrl || `/placeholder.svg?text=${encodeURIComponent(course.code)}&width=600&height=400`}
                alt={course.name}
                width={300}
                height={200}
                type="course"
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Subject list section - can be expanded later */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {course.subjects && course.subjects.length > 0 ? (
            <ul className="list-disc list-inside">
              {course.subjects.map((subject: any) => (
                <li key={subject._id} className="py-1">
                  {subject.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No subjects added to this course yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/course-subjects/new?course=${course._id}`)}
          >
            Add Subject
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 