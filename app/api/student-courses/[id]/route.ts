import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Student from "@/models/Student"
import Course from "@/models/Course"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the student ID from the params
    const { id } = params

    // Get the student with populated course
    const student = await Student.findById(id).populate("course")

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // If course is already populated as an object
    if (student.course && typeof student.course === 'object' && student.course.name) {
      return NextResponse.json({ 
        success: true, 
        data: student.course 
      })
    }

    // If course is just an ID, fetch the course details
    if (student.course) {
      const courseId = typeof student.course === 'object' ? student.course._id : student.course
      const course = await Course.findById(courseId)
      
      if (!course) {
        return NextResponse.json({ 
          success: false, 
          message: "Course not found" 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true, 
        data: course 
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: "Student does not have a course assigned" 
    }, { status: 404 })
  } catch (error) {
    console.error("Error fetching student course:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the student's course" },
      { status: 500 },
    )
  }
} 