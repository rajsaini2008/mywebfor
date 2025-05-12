import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import ExamPaper, { IExamPaper } from "@/models/ExamPaper"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the exam paper
    const examPaper = await ExamPaper.findById(params.id).populate("course")

    if (!examPaper) {
      return NextResponse.json(
        { success: false, message: "Exam paper not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: examPaper })
  } catch (error) {
    console.error("Error fetching exam paper:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the exam paper" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Parse the request body
    const body = await request.json()

    // Update the exam paper
    const updatedExamPaper = await ExamPaper.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )

    if (!updatedExamPaper) {
      return NextResponse.json(
        { success: false, message: "Exam paper not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updatedExamPaper })
  } catch (error) {
    console.error("Error updating exam paper:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the exam paper" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Delete the exam paper
    const deletedExamPaper = await ExamPaper.findByIdAndDelete(params.id)

    if (!deletedExamPaper) {
      return NextResponse.json(
        { success: false, message: "Exam paper not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Exam paper deleted successfully",
      data: deletedExamPaper 
    })
  } catch (error) {
    console.error("Error deleting exam paper:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the exam paper" },
      { status: 500 }
    )
  }
} 