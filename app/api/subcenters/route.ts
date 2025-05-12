import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import SubCenter from "@/models/SubCenter"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Create a new subcenter
    const subcenter = await SubCenter.create(body)

    return NextResponse.json({ success: true, data: subcenter }, { status: 201 })
  } catch (error) {
    console.error("Error creating subcenter:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the subcenter" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const centerId = searchParams.get("centerId")
    const atcId = searchParams.get("atcId")

    if (id) {
      // Get a specific subcenter
      const subcenter = await SubCenter.findById(id)

      if (!subcenter) {
        return NextResponse.json({ success: false, message: "SubCenter not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: subcenter })
    }

    // Check if we should filter by centerId or atcId
    if (centerId || atcId) {
      const lookupId = centerId || atcId;
      console.log(`Filtering subcenters by centerId/atcId: ${lookupId}`);
      
      // Find by centerId
      const subcenter = await SubCenter.find({ centerId: lookupId });
      return NextResponse.json({ success: true, data: subcenter });
    }

    // Get all subcenters
    const subcenters = await SubCenter.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: subcenters })
  } catch (error) {
    console.error("Error fetching subcenters:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching subcenters" },
      { status: 500 },
    )
  }
}
