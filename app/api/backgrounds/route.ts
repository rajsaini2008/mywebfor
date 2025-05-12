import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Background from "@/models/Background"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Create a new background
    const background = await Background.create(body)

    return NextResponse.json({ success: true, data: background }, { status: 201 })
  } catch (error) {
    console.error("Error creating background:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the background" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase()
    
    // Get search parameters from the request URL
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const active = url.searchParams.get('active')
    const id = url.searchParams.get('id')
    
    // Build the query
    const query: any = {}
    
    if (id) {
      query._id = id
    }
    
    if (type) {
      query.type = type
    }
    
    if (active === 'true') {
      query.isActive = true
    }
    
    // Execute the query
    const backgrounds = await Background.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      data: backgrounds
    })
  } catch (error) {
    console.error("Error fetching backgrounds:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fetching backgrounds"
    }, { status: 500 })
  }
}
