import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Certificate from "@/models/Certificate"
import ExamApplication from "@/models/ExamApplication"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { examApplicationId, certificateNo } = body

    if (!examApplicationId || !certificateNo) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: examApplicationId or certificateNo"
      }, { status: 400 })
    }

    console.log(`Saving certificate number ${certificateNo} for exam application ${examApplicationId}`)

    // Check if MongoDB connection is established
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("MongoDB connection not established")
    }

    // Check if certificateNo already exists
    const existingApplication = await ExamApplication.findOne({ certificateNo })

    if (existingApplication && existingApplication._id.toString() !== examApplicationId) {
      return NextResponse.json({
        success: false,
        message: "Certificate number already exists for another application"
      }, { status: 409 })
    }

    // Update the exam application with certificate number
    const examApplicationsCollection = mongoose.connection.db.collection('examapplications')

    const result = await examApplicationsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(examApplicationId) },
      { 
        $set: {
          certificateNo,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Exam application not found"
      }, { status: 404 })
    }

    // Get the updated application
    const updatedApplication = await examApplicationsCollection.findOne(
      { _id: new mongoose.Types.ObjectId(examApplicationId) }
    )

    return NextResponse.json({
      success: true,
      message: "Certificate number saved successfully",
      data: updatedApplication
    })
  } catch (error) {
    console.error("Error saving certificate number:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while saving certificate number"
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const studentId = searchParams.get("studentId")
    const centerId = searchParams.get("centerId")
    const atcId = searchParams.get("atcId")

    if (id) {
      // Get a specific certificate
      const certificate = await Certificate.findById(id)
        .populate("student")
        .populate("course")

      if (!certificate) {
        return NextResponse.json(
          { success: false, message: "Certificate not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: certificate })
    }

    // Build query based on parameters
    const query: any = {}
    
    // Filter by studentId if provided
    if (studentId) {
      query.studentId = studentId
    }
    
    // Filter by centerId if provided
    if (centerId) {
      query.centerId = centerId
    }
    
    // Map atcId to centerId if provided
    if (atcId && !centerId) {
      query.centerId = atcId
    }

    // Get certificates with filters
    const certificates = await Certificate.find(query)
      .populate("student")
      .populate("course")
      .sort({ createdAt: -1 })

    return NextResponse.json(
      { success: true, data: certificates },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching certificates" },
      { status: 500 }
    )
  }
}
