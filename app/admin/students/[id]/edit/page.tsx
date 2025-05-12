"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import StudentRegistration from "@/app/components/StudentRegistration"
import type { StudentData } from "@/app/components/StudentRegistration"

export default function EditStudent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  // Load student data
  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/students/${params.id}?t=${timestamp}`, {
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
      
      if (data.success && data.data) {
        const student = data.data
        console.log("Student data loaded for editing:", student)
        
        // Format student data to match StudentData type
        const formattedData: StudentData = {
          name: student.name || '',
          email: student.email || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
          dateOfJoining: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
          gender: student.gender || '',
          aadharNo: student.aadharNo || '',
          course: student.course?._id || '',
          state: student.state || '',
          district: student.district || '',
          city: student.city || '',
          address: student.address || '',
          landmark: student.landmark || '',
          pincode: student.pincode || '',
          phone: student.phone || '',
          mobile: student.mobile || '',
          
          // Document URLs
          photoUrl: student.photoUrl || student.photo || '',
          signatureUrl: student.signatureUrl || '',
          aadharCardUrl: student.aadharCardUrl || '',
          previousMarksheetUrl: student.previousMarksheetUrl || '',
          photoIdProofUrl: student.photoIdProofUrl || '',
          certificateProofUrl: student.certificateProofUrl || '',
          idCardUrl: student.idCardUrl || '',
          
          // Additional details
          rollNo: student.rollNo || '',
          photoIdType: student.photoIdType || '',
          photoIdNumber: student.photoIdNumber || '',
          qualificationType: student.qualificationType || '',
          certificateNumber: student.certificateNumber || '',
          
          // Payment details
          courseFee: student.courseFee || 0,
          admissionFee: student.admissionFee || 0,
          examFee: student.examFee || 0,
          discount: student.discount || 0,
          totalFee: student.totalFee || 0,
          payableAmount: student.payableAmount || student.totalFee || 0,
          installmentCount: student.installmentCount || 1,
          intervalInMonths: student.intervalInMonths || 0,
          admissionRemark: student.admissionRemark || '',
          
          // System fields
          status: student.status || 'Active',
          centerId: student.centerId || '',
        }
        
        setStudentData(formattedData)
      } else {
        throw new Error(data.message || "Unknown error from API")
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error loading student",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Student Not Found</h2>
          <p className="mt-2 text-gray-600">The student you're looking for could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
      <StudentRegistration initialData={studentData} isEditing={true} studentId={params.id} />
    </div>
  )
}
