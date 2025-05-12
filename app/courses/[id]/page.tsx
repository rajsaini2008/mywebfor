"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Clock, Award } from "lucide-react"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  description: string
  fee: number
  imageUrl?: string
  subjects: Array<{
    _id: string
    name: string
    code: string
  }>
  isActive: boolean
}

export default function CourseDetail() {
  const params = useParams()
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses?id=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCourse(data.data)
          } else {
            setError(data.message || "Failed to load course details")
          }
        } else {
          setError("Server error: Failed to load course details")
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Failed to connect to the server")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Course</h1>
        <p className="mb-6">{error || "Course not found"}</p>
        <Link href="/courses">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Course Banner */}
      <div className="relative">
        <div className="h-[300px] relative">
          <Image
            src={course.imageUrl || `/placeholder.svg?height=600&width=1200&text=${course.code}`}
            alt={course.name}
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center px-4">{course.name}</h1>
          <div className="flex gap-4">
            <span className="bg-blue-800 px-4 py-2 rounded">Code: {course.code}</span>
            <span className="bg-blue-800 px-4 py-2 rounded">Duration: {course.duration}</span>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-blue-800 mr-2" />
                  <h3 className="text-xl font-bold">Duration</h3>
                </div>
                <p>{course.duration}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-blue-800 mr-2" />
                  <h3 className="text-xl font-bold">Certification</h3>
                </div>
                <p>Official certification upon completion</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Check className="h-6 w-6 text-blue-800 mr-2" />
                  <h3 className="text-xl font-bold">Fee</h3>
                </div>
                <p>₹{course.fee.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Subjects */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Course Curriculum</h2>
            
            {course.subjects && course.subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.subjects.map((subject) => (
                  <Card key={subject._id} className="border-l-4 border-l-blue-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold">{subject.name}</h3>
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p>No subjects are currently associated with this course.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our {course.name} course and take your first step towards a successful career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button className="bg-blue-800 hover:bg-blue-900">Apply Now</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 