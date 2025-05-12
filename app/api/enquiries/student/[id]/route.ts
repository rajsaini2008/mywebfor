import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import StudentEnquiry from "@/models/StudentEnquiry"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const id = params.id
    const body = await req.json()
    const { status } = body
    
    // Validate status value
    const validStatuses = ["New", "Contacted", "Enrolled", "Rejected"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid status value. Must be one of: New, Contacted, Enrolled, Rejected" 
        },
        { status: 400 }
      )
    }
    
    // Find and update the enquiry
    const updatedEnquiry = await StudentEnquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    
    if (!updatedEnquiry) {
      return NextResponse.json(
        { success: false, message: "Student enquiry not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Student enquiry updated successfully",
      data: updatedEnquiry,
    })
  } catch (error: any) {
    console.error("Error updating student enquiry:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update student enquiry" },
      { status: 500 }
    )
  }
} 