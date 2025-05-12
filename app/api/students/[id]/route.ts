import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Student from "@/models/Student"
import mongoose from "mongoose"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the student ID from the params
    const { id } = params

    // 1. Delete the student
    const result = await Student.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // 2. Delete all exam applications for this student
    // Access the exam applications collection directly
    const deleteApplications = await mongoose.connection.db.collection('examapplications').deleteMany({
      studentId: new mongoose.Types.ObjectId(id)
    })

    console.log(`Deleted ${deleteApplications.deletedCount} exam applications for student ${id}`)

    return NextResponse.json({ 
      success: true, 
      message: "Student and their exam applications deleted successfully",
      studentDeleted: true,
      examApplicationsDeleted: deleteApplications.deletedCount
    })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the student" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the student ID from the params
    const { id } = params

    // Get the student
    const student = await Student.findById(id).populate("course")

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the student" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the student ID from the params
    const { id } = params

    // Parse the request body
    const body = await request.json()

    // Update the student
    const student = await Student.findByIdAndUpdate(id, body, { new: true })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the student" },
      { status: 500 },
    )
  }
}
