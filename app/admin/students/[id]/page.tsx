"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Edit, Printer } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  address: string
  course: string
  enrollmentDate: string
  fatherName: string
  motherName: string
  photoUrl: string
  idCardUrl: string
  signatureUrl: string
  status: "active" | "inactive"
}

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch student data from API
    // For now, using mock data
    setTimeout(() => {
      setStudent({
        id: studentId,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
        address: "123 Main Street, New Delhi",
        course: "Diploma in Computer Applications",
        enrollmentDate: "2023-01-15",
        fatherName: "Rajesh Sharma",
        motherName: "Sunita Sharma",
        photoUrl: "/placeholder.svg?height=150&width=150",
        idCardUrl: "/placeholder.svg?height=300&width=200",
        signatureUrl: "/placeholder.svg?height=100&width=200",
        status: "active",
      })
      setLoading(false)
    }, 1000)
  }, [studentId])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Loading student details...</h1>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Student not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Student Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
                <p className="mt-1">{student.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{student.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Father's Name</h3>
                <p className="mt-1">{student.fatherName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mother's Name</h3>
                <p className="mt-1">{student.motherName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{student.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{student.phone}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{student.address}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Course</h3>
                <p className="mt-1">{student.course}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Enrollment Date</h3>
                <p className="mt-1">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 capitalize">{student.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
              <div className="relative h-40 w-40 mx-auto">
                <Image
                  src={student.photoUrl || "/placeholder.svg"}
                  alt={`${student.name}'s photo`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">ID Card</h3>
              <div className="relative h-32 w-48 mx-auto">
                <Image
                  src={student.idCardUrl || "/placeholder.svg"}
                  alt={`${student.name}'s ID card`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Signature</h3>
              <div className="relative h-16 w-48 mx-auto">
                <Image
                  src={student.signatureUrl || "/placeholder.svg"}
                  alt={`${student.name}'s signature`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Button asChild>
          <Link href={`/admin/students/${studentId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Details
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download ID Card
        </Button>
      </div>
    </div>
  )
}
