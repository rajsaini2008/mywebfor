import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CmsContent from "@/models/CmsContent"

// Create or update multiple CMS content items at once
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Items array is required and must not be empty"
      }, { status: 400 })
    }

    // Process each item in the array
    const results = []
    for (const item of items) {
      const { section, key, value } = item
      
      if (!section || !key) {
        return NextResponse.json({
          success: false,
          message: "Section and key are required for all items"
        }, { status: 400 })
      }

      // Use findOneAndUpdate with upsert to create or update
      const result = await CmsContent.findOneAndUpdate(
        { section, key },
        { value },
        { upsert: true, new: true }
      )
      
      results.push(result)
    }
    
    return NextResponse.json({
      success: true,
      message: "All items updated successfully",
      data: results
    })
  } catch (error) {
    console.error("Error updating batch CMS content:", error)
    return NextResponse.json({
      success: false,
      message: "An error occurred while updating CMS content"
    }, { status: 500 })
  }
} 