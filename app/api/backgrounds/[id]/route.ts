import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Background from "@/models/Background"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase()

    const id = params.id

    // Get the background
    const background = await Background.findById(id)

    if (!background) {
      return NextResponse.json(
        { success: false, message: "Background template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: background })
  } catch (error) {
    console.error("Error fetching background:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the background template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const id = params.id
    
    // Check if template is active
    const template = await Background.findById(id)
    
    if (!template) {
      return NextResponse.json({
        success: false,
        message: "Template not found"
      }, { status: 404 })
    }
    
    if (template.isActive) {
      return NextResponse.json({
        success: false,
        message: "Cannot delete active template. Please set another template as active first."
      }, { status: 400 })
    }
    
    // Delete the template
    await Background.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while deleting the template"
    }, { status: 500 })
  }
} 