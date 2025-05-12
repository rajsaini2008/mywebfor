import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Subject from "@/models/Subject"

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

    // Update the subject
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )

    if (!updatedSubject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updatedSubject })
  } catch (error) {
    console.error("Error updating subject:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the subject" },
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

    const id = params.id

    // Delete the subject
    const deletedSubject = await Subject.findByIdAndDelete(id)

    if (!deletedSubject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subject deleted successfully",
      data: deletedSubject 
    })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the subject" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    const id = params.id

    // Get the subject
    const subject = await Subject.findById(id).populate("courses")

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: subject })
  } catch (error) {
    console.error("Error fetching subject:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the subject" },
      { status: 500 }
    )
  }
} 