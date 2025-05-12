import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Course from "@/models/Course"
import Subject from "@/models/Subject"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    const courseId = params.id
    
    // Parse the request body
    const body = await request.json()
    const { subjects } = body

    if (!Array.isArray(subjects)) {
      return NextResponse.json(
        { success: false, message: "Subjects must be an array" },
        { status: 400 }
      )
    }

    // First, clear all subject references to this course
    await Subject.updateMany(
      { courses: courseId },
      { $pull: { courses: courseId } }
    )

    // Update each subject to include this course
    if (subjects.length > 0) {
      await Subject.updateMany(
        { _id: { $in: subjects } },
        { $addToSet: { courses: courseId } }
      )
    }

    // Update the course with the new subjects
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { subjects, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Course subjects updated successfully",
      data: updatedCourse 
    })
  } catch (error) {
    console.error("Error updating course subjects:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating course subjects" },
      { status: 500 }
    )
  }
} 