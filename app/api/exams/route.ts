import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Exam from "@/models/Exam"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Create a new exam
    const exam = await Exam.create(body)

    return NextResponse.json({ success: true, data: exam }, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ success: false, message: "An error occurred while creating the exam" }, { status: 500 })
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
      // Get a specific exam
      const exam = await Exam.findById(id).populate("subject course")

      if (!exam) {
        return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: exam })
    }

    // Get all exams
    const exams = await Exam.find({}).populate("subject course").sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: exams })
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching exams" }, { status: 500 })
  }
}
