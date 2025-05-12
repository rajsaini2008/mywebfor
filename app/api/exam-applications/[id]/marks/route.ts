import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import ExamApplication from "@/models/ExamApplication"
import mongoose from "mongoose"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const applicationId = params.id
    console.log(`Updating marks for exam application: ${applicationId}`)
    
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.error(`Invalid application ID format: ${applicationId}`)
      return NextResponse.json({
        success: false,
        message: "Invalid application ID format"
      }, { status: 400 })
    }
    
    const body = await request.json()
    const { subjectMarks, percentage, atcId } = body
    
    console.log(`Received marks update from ATC ${atcId}:`, { 
      percentage, 
      subjectMarksCount: Object.keys(subjectMarks || {}).length 
    })
    
    // Validate required data
    if (!subjectMarks || typeof percentage !== 'number') {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: subjectMarks and a valid percentage are required"
      }, { status: 400 })
    }
    
    // Retrieve the current application to validate permission and data
    const application = await ExamApplication.findById(applicationId)
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: "Exam application not found"
      }, { status: 404 })
    }
    
    // Calculate total score from subject marks
    let totalScore = 0
    Object.values(subjectMarks).forEach((marks: any) => {
      if (marks.theoryMarks) totalScore += Number(marks.theoryMarks) || 0
      if (marks.practicalMarks) totalScore += Number(marks.practicalMarks) || 0
    })
    
    // Create update data
    const updateData = {
      subjectMarks,
      percentage: Number(percentage),
      score: totalScore,
      updatedAt: new Date(),
      // If we're updating marks, set status to approved
      status: 'approved'
    }
    
    console.log(`Updating application ${applicationId} with data:`, {
      score: updateData.score,
      percentage: updateData.percentage,
      numberOfSubjects: Object.keys(subjectMarks).length
    })
    
    try {
      // Use findOneAndUpdate with atomic operation
      const result = await ExamApplication.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(applicationId) },
        { $set: updateData },
        { new: true } // Return the updated document
      )
      
      if (!result) {
        console.error(`Failed to update application ${applicationId}`)
        return NextResponse.json({
          success: false,
          message: "Failed to update exam application"
        }, { status: 500 })
      }
      
      console.log(`Successfully updated marks for application ${applicationId}:`, {
        id: result._id,
        percentage: result.percentage,
        score: result.score,
        status: result.status
      })
      
      return NextResponse.json({
        success: true,
        message: "Marks updated successfully",
        data: {
          applicationId: result._id,
          percentage: result.percentage,
          score: result.score,
          status: result.status
        }
      })
    } catch (dbError) {
      console.error(`Database error when updating application ${applicationId}:`, dbError)
      return NextResponse.json({
        success: false,
        message: "Database error when updating marks"
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating exam marks:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating exam marks"
    }, { status: 500 })
  }
} 