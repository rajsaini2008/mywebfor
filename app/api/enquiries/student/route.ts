import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import StudentEnquiry from "@/models/StudentEnquiry"
import Course from "@/models/Course"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    
    // Get query parameters
    const url = new URL(req.url)
    const searchQuery = url.searchParams.get("search") || ""
    const statusFilter = url.searchParams.get("status") || ""
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    
    // Build filter object
    const filter: any = {}
    
    if (searchQuery) {
      filter["$or"] = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
        { applicationId: { $regex: searchQuery, $options: "i" } },
      ]
    }
    
    if (statusFilter) {
      filter.status = statusFilter
    }
    
    // Get total count for pagination
    const total = await StudentEnquiry.countDocuments(filter)
    
    // Fetch student enquiries with pagination
    const studentEnquiries = await StudentEnquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("course", "name code")
      .lean()
    
    return NextResponse.json({
      success: true,
      data: studentEnquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error: any) {
    console.error("Error fetching student enquiries:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch student enquiries" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await req.json()
    
    // Generate application ID if not provided
    if (!body.applicationId) {
      const year = new Date().getFullYear().toString().slice(-2)
      const randomNum = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
      body.applicationId = `APP${year}${randomNum}`
    }
    
    // Validate course exists
    if (body.course) {
      const courseExists = await Course.findById(body.course)
      if (!courseExists) {
        return NextResponse.json(
          { success: false, message: "Selected course does not exist" },
          { status: 400 }
        )
      }
    }
    
    // Create new student enquiry
    const newEnquiry = await StudentEnquiry.create(body)
    
    return NextResponse.json({
      success: true,
      message: "Student enquiry submitted successfully",
      data: newEnquiry,
    })
  } catch (error: any) {
    console.error("Error creating student enquiry:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit student enquiry" },
      { status: 500 }
    )
  }
} 