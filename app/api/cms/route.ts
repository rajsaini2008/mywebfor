import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CmsContent from "@/models/CmsContent"

// Get CMS content by section
export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section")

    if (section) {
      // Get all content for a section
      const contents = await CmsContent.find({ section }).sort({ key: 1 })
      
      return NextResponse.json({
        success: true,
        data: contents
      })
    }

    // Get all CMS content
    const contents = await CmsContent.find({}).sort({ section: 1, key: 1 })
    
    return NextResponse.json({
      success: true,
      data: contents
    })
  } catch (error) {
    console.error("Error fetching CMS content:", error)
    return NextResponse.json({
      success: false,
      message: "An error occurred while fetching CMS content"
    }, { status: 500 })
  }
}

// Create or update CMS content - simplified based on screenshot
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { section, key, value } = body

    if (!section || !key) {
      return NextResponse.json({
        success: false,
        message: "Section and key are required"
      }, { status: 400 })
    }

    // Use findOneAndUpdate with upsert to create or update
    await CmsContent.findOneAndUpdate(
      { section, key },
      { value },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({
      success: true,
      message: `Page updated successfully!`
    })
  } catch (error) {
    console.error("Error updating CMS content:", error)
    return NextResponse.json({
      success: false,
      message: "An error occurred while updating CMS content"
    }, { status: 500 })
  }
} 