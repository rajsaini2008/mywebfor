import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Subject from "@/models/Subject"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Create a new subject
    const subject = await Subject.create(body)

    return NextResponse.json({ success: true, data: subject }, { status: 201 })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the subject" },
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

    if (id) {
      // Get a specific subject
      const subject = await Subject.findById(id).populate("courses")

      if (!subject) {
        return NextResponse.json({ success: false, message: "Subject not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: subject })
    }

    // Get all subjects
    const subjects = await Subject.find({}).populate("courses").sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: subjects })
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching subjects" }, { status: 500 })
  }
}
