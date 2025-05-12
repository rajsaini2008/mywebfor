import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import TemplateConfig from "@/models/TemplateConfig"

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId")
    const type = searchParams.get("type")
    
    if (!templateId || !type) {
      return NextResponse.json(
        { success: false, message: "Template ID and type are required" },
        { status: 400 }
      )
    }
    
    const config = await TemplateConfig.findOne({ templateId, type })
    
    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error("Error fetching template config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch template configuration" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const data = await request.json()
    
    if (!data.templateId || !data.type) {
      return NextResponse.json(
        { success: false, message: "Template ID and type are required" },
        { status: 400 }
      )
    }
    
    // Update or create template configuration
    const config = await TemplateConfig.findOneAndUpdate(
      { templateId: data.templateId, type: data.type },
      data,
      { new: true, upsert: true }
    )
    
    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error("Error saving template config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save template configuration" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase()
    
    // Parse the request body
    const body = await request.json()
    
    if (!body._id) {
      return NextResponse.json({
        success: false,
        message: "Configuration ID is required"
      }, { status: 400 })
    }
    
    // Update the template configuration
    const updatedConfig = await TemplateConfig.findByIdAndUpdate(
      body._id,
      body,
      { new: true }
    )
    
    if (!updatedConfig) {
      return NextResponse.json({
        success: false,
        message: "Template configuration not found"
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedConfig
    })
  } catch (error) {
    console.error("Error updating template configuration:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating template configuration"
    }, { status: 500 })
  }
} 