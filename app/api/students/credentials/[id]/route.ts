import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const studentId = params.id
    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: "Student ID is required"
      }, { status: 400 })
    }

    console.log(`Fetching student credentials for studentId: ${studentId}`)
    
    // Query the MongoDB students collection directly, looking for the studentId field
    // (not using _id which is different from studentId)
    const student = await mongoose.connection.db.collection('students').findOne({
      studentId: studentId
    })
    
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 })
    }

    // Return the student data including the password for auto-login
    return NextResponse.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error("Error fetching student credentials:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fetching student credentials"
    }, { status: 500 })
  }
} 