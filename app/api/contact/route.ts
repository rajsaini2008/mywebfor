import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Contact from "@/models/Contact"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Validate the required fields
    const { name, email, phone, subject, message } = body

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create a new contact entry
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    })

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (error) {
    console.error("Error in contact form submission:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while submitting the form" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get all contacts
    const contacts = await Contact.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching contacts" }, { status: 500 })
  }
}
