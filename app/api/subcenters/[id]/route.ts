import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import SubCenter from "@/models/SubCenter"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the subcenter ID from the params
    const { id } = params

    // Delete the subcenter
    const result = await SubCenter.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ success: false, message: "SubCenter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "SubCenter deleted successfully" })
  } catch (error) {
    console.error("Error deleting subcenter:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the subcenter" },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the subcenter ID from the params
    const { id } = params

    // Get the subcenter
    const subcenter = await SubCenter.findById(id)

    if (!subcenter) {
      return NextResponse.json({ success: false, message: "SubCenter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: subcenter })
  } catch (error) {
    console.error("Error fetching subcenter:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the subcenter" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the subcenter ID from the params
    const { id } = params

    // Parse the request body
    const body = await request.json()

    // Update the subcenter
    const subcenter = await SubCenter.findByIdAndUpdate(id, body, { new: true })

    if (!subcenter) {
      return NextResponse.json({ success: false, message: "SubCenter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: subcenter })
  } catch (error) {
    console.error("Error updating subcenter:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the subcenter" },
      { status: 500 },
    )
  }
} 