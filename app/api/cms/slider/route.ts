import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CmsContent from "@/models/CmsContent"

// The section identifier for slider content
const SECTION = "slider"

// Get slider content
export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") // Optional slider ID (1, 2, 3, etc.)

    let query = { section: SECTION }
    
    // If id is provided, filter content for that specific slider
    if (id) {
      query = { 
        section: SECTION,
        key: { $regex: `^slider${id}_` }
      }
    }
    
    // Fetch slider content
    const contents = await CmsContent.find(query).sort({ key: 1 })
    
    // If no content exists yet, return empty object
    if (contents.length === 0) {
      return NextResponse.json({
        success: true,
        data: {}
      })
    }
    
    // Format the data for easy consumption by the frontend
    const formattedData = {}
    
    contents.forEach(item => {
      // Extract the slider ID and field name from the key
      // e.g., "slider1_title" => { sliderId: "1", field: "title" }
      const keyMatch = item.key.match(/^slider(\d+)_(.+)$/)
      
      if (keyMatch) {
        const sliderId = keyMatch[1]
        const field = keyMatch[2]
        
        if (!formattedData[sliderId]) {
          formattedData[sliderId] = {}
        }
        
        formattedData[sliderId][field] = item.value
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedData
    })
  } catch (error) {
    console.error("Error fetching slider content:", error)
    return NextResponse.json({
      success: false,
      message: "An error occurred while fetching slider content"
    }, { status: 500 })
  }
}

// Create or update slider content
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { sliderId, ...sliderData } = body
    
    if (!sliderId || Object.keys(sliderData).length === 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid request format. Expected 'sliderId' and slider data."
      }, { status: 400 })
    }
    
    // Update each field for the slider
    const updatePromises = Object.entries(sliderData).map(async ([field, value]) => {
      const key = `slider${sliderId}_${field}`
      
      const result = await CmsContent.findOneAndUpdate(
        { section: SECTION, key },
        { section: SECTION, key, value },
        { upsert: true, new: true }
      )
      
      return { field, value: result.value }
    })
    
    const results = await Promise.all(updatePromises)
    
    return NextResponse.json({
      success: true,
      message: `Slider ${sliderId} content updated successfully`,
      data: results
    })
  } catch (error) {
    console.error("Error updating slider content:", error)
    return NextResponse.json({
      success: false,
      message: "An error occurred while updating slider content"
    }, { status: 500 })
  }
} 