import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Background from "@/models/Background"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const name = formData.get("name") as string

    if (!file || !type || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Ensure type is valid
    if (!["certificate", "marksheet", "subcenter"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid template type" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // For a real implementation, we would upload to a storage service
    // Here, we'll simulate it by creating a data URL
    const imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`

    // Create a new background document
    const background = await Background.create({
      type,
      name,
      imageUrl,
      isActive: false,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Background template uploaded successfully",
      data: background
    }, { status: 201 })
  } catch (error) {
    console.error("Error uploading background:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while uploading the background" },
      { status: 500 }
    )
  }
} 