import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import ExamApplication from "@/models/ExamApplication"
import mongoose from "mongoose"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const { id } = params
    console.log(`Updating exam application with ID: ${id}`)
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid application ID format"
      }, { status: 400 })
    }
    
    // Get the request body
    const body = await request.json()
    console.log(`Update data:`, body)
    
    // Validate the data
    if (!body) {
      return NextResponse.json({
        success: false,
        message: "Request body is required"
      }, { status: 400 })
    }
    
    // Find the exam application
    const examApplication = await ExamApplication.findById(id)
    
    if (!examApplication) {
      return NextResponse.json({
        success: false,
        message: "Exam application not found"
      }, { status: 404 })
    }
    
    // Update the application
    if (body.status) examApplication.status = body.status
    if (body.answers) examApplication.answers = body.answers
    if (body.score !== undefined) examApplication.score = body.score
    if (body.percentage !== undefined) examApplication.percentage = body.percentage
    if (body.endTime) examApplication.endTime = new Date(body.endTime)
    if (!examApplication.startTime) examApplication.startTime = new Date() // Set start time if not set
    
    // Save the updated application
    await examApplication.save()
    
    return NextResponse.json({
      success: true,
      message: "Exam application updated successfully",
      data: examApplication
    })
  } catch (error) {
    console.error("Error updating exam application:", error)
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating the exam application"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const { id } = params
    console.log(`Getting exam application with ID: ${id}`)
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid application ID format"
      }, { status: 400 })
    }
    
    // Find the exam application with related data
    const db = mongoose.connection.db
    
    // Get the application
    const application = await db.collection('examapplications').findOne({
      _id: new mongoose.Types.ObjectId(id)
    })
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: "Exam application not found"
      }, { status: 404 })
    }
    
    // Get the exam paper data
    if (application.examPaperId) {
      const examPaper = await db.collection('exampapers').findOne({
        _id: application.examPaperId
      })
      
      if (examPaper) {
        application.examPaper = examPaper
      }
    }
    
    // Get the student data
    if (application.studentId) {
      const student = await db.collection('students').findOne({
        _id: application.studentId
      })
      
      if (student) {
        application.student = student
      }
    }
    
    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error("Error getting exam application:", error)
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while getting the exam application"
    }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const applicationId = params.id
    const body = await request.json()
    
    console.log(`Updating exam application ${applicationId} with data:`, JSON.stringify(body))
    
    // Update the exam application using direct MongoDB connection for more control
    // Verify that the MongoDB connection is established
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("MongoDB connection not established");
    }
    
    const examApplicationsCollection = mongoose.connection.db.collection('examapplications');
    
    // Create the update object with mandatory fields
    const updateFields: any = {
      updatedAt: new Date(),
      status: body.status || 'scheduled'
    };
    
    // Only add score and percentage if they are explicitly provided and valid
    if (body.score !== undefined) {
      updateFields.score = Number(body.score);
    }
    
    if (body.percentage !== undefined && Number(body.percentage) > 0) {
      updateFields.percentage = Number(body.percentage);
    }
    
    // Add certificate number if provided
    if (body.certificateNo) {
      updateFields.certificateNo = body.certificateNo;
    }
    
    // Add student name if provided
    if (body.studentName) {
      updateFields.studentName = body.studentName;
    }
    
    // Add student ID if provided
    if (body.studentIdNumber) {
      updateFields.studentIdNumber = body.studentIdNumber;
    }
    
    // Add subjectMarks if provided
    if (body.subjectMarks) {
      updateFields.subjectMarks = body.subjectMarks;
    }
    
    const result = await examApplicationsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(applicationId) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Exam application not found"
      }, { status: 404 })
    }
    
    // Fetch the updated document to verify changes
    const updatedApplication = await examApplicationsCollection.findOne(
      { _id: new mongoose.Types.ObjectId(applicationId) }
    );
    
    if (!updatedApplication) {
      throw new Error("Failed to retrieve updated application");
    }
    
    console.log("Updated application:", {
      _id: updatedApplication._id,
      status: updatedApplication.status,
      percentage: updatedApplication.percentage,
      percentageType: typeof updatedApplication.percentage,
      score: updatedApplication.score
    });
    
    return NextResponse.json({
      success: true,
      data: updatedApplication
    })
    
  } catch (error) {
    console.error("Error updating exam application:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating the exam application"
    }, { status: 500 })
  }
}