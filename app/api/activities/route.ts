import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Activity from "@/models/Activity"

// GET: Fetch activities, optionally limit by count or type
export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const centerId = searchParams.get("centerId")
    const atcId = searchParams.get("atcId")

    if (id) {
      // Get a specific activity
      const activity = await Activity.findById(id)

      if (!activity) {
        return NextResponse.json(
          { success: false, message: "Activity not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: activity })
    }

    // Build query based on parameters
    const query: any = {}
    if (type) {
      query.type = type
    }
    
    // Filter by centerId if provided
    if (centerId) {
      query.centerId = centerId
    }
    
    // Map atcId to centerId if provided
    if (atcId && !centerId) {
      query.centerId = atcId
    }

    // Get activities with limit and sorted by created date (newest first)
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json(
      { success: true, data: activities },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching activities" },
      { status: 500 }
    )
  }
}

// POST: Create a new activity
export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the activity data from the request body
    const data = await request.json()

    // Validate required fields
    if (!data.activity) {
      return NextResponse.json(
        { success: false, message: "Activity description is required" },
        { status: 400 }
      )
    }

    // Create the activity
    const activity = await Activity.create(data)

    return NextResponse.json(
      { success: true, data: activity },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the activity" },
      { status: 500 }
    )
  }
} 