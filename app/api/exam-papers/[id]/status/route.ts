import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import ExamPaper from "@/models/ExamPaper"
import Question from "@/models/Question"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    const id = params.id
    
    // Parse the request body
    const body = await request.json()
    const { status } = body

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value. Must be 'active' or 'inactive'" },
        { status: 400 }
      )
    }

    // Check if all subjects have questions before activating
    if (status === 'active') {
      // Get the exam paper
      const examPaper = await ExamPaper.findById(id)

      if (!examPaper) {
        return NextResponse.json(
          { success: false, message: "Exam paper not found" },
          { status: 404 }
        )
      }

      // Check if all subjects have questions
      for (const subject of examPaper.subjects) {
        const questionCount = await Question.countDocuments({ 
          paperId: examPaper.paperId, 
          subjectId: subject.subjectId 
        })

        if (questionCount === 0) {
          return NextResponse.json(
            { 
              success: false, 
              message: `Subject "${subject.subjectName}" does not have any questions. All subjects must have questions to activate the paper.` 
            },
            { status: 400 }
          )
        }
      }
    }

    // Update the exam paper status
    const updatedExamPaper = await ExamPaper.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )

    if (!updatedExamPaper) {
      return NextResponse.json(
        { success: false, message: "Exam paper not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Exam paper status updated to "${status}" successfully`,
      data: updatedExamPaper 
    })
  } catch (error) {
    console.error("Error updating exam paper status:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the exam paper status" },
      { status: 500 }
    )
  }
} 