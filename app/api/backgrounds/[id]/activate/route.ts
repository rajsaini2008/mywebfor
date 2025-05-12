import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Background from "@/models/Background"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const id = params.id
    const body = await request.json()
    const { type } = body
    
    if (!type) {
      return NextResponse.json({
        success: false,
        message: "Type is required"
      }, { status: 400 })
    }
    
    // First, deactivate all templates of this type
    await Background.updateMany(
      { type },
      { $set: { isActive: false } }
    )
    
    // Then, activate the selected template
    const updatedTemplate = await Background.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    )
    
    if (!updatedTemplate) {
      return NextResponse.json({
        success: false,
        message: "Template not found"
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedTemplate
    })
  } catch (error) {
    console.error("Error activating template:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while activating the template"
    }, { status: 500 })
  }
} 