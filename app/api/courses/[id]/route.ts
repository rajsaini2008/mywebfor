import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Course from "@/models/Course"
import mongoose from "mongoose"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the course ID from the params
    const { id } = params

    // Delete the course
    const result = await Course.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the course" },
      { status: 500 },
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const includeSubjects = searchParams.get("include") === "subjects"
    
    // Convert id to ObjectId
    const courseId = params.id
    const objectId = new mongoose.Types.ObjectId(courseId)
    
    console.log(`Fetching course with id: ${courseId}, includeSubjects: ${includeSubjects}`)
    
    let query = Course.findById(objectId)
    
    // If subjects should be included, populate the subjects field
    if (includeSubjects) {
      query = query.populate('subjects')
    }
    
    const course = await query.exec()
    
    if (!course) {
      return NextResponse.json({
        success: false,
        message: "Course not found"
      }, { status: 404 })
    }
    
    // If subjects are not populated, initialize an empty array
    if (!includeSubjects && !course.subjects) {
      course.subjects = []
    }
    
    return NextResponse.json({
      success: true,
      data: course
    })
    
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fetching course"
    }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the course ID from the params
    const { id } = params

    // Parse the request body
    const body = await request.json()

    // Update the course
    const course = await Course.findByIdAndUpdate(id, body, { new: true })

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the course" },
      { status: 500 },
    )
  }
}
