import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Contact from "@/models/Contact"

export async function GET(req: NextRequest) {
  try {
    console.log("Attempting to fetch contact enquiries...")
    await connectToDatabase()
    console.log("Database connection successful")
    
    // Get query parameters
    const url = new URL(req.url)
    const searchQuery = url.searchParams.get("search") || ""
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    
    console.log(`Query params: search=${searchQuery}, page=${page}, limit=${limit}`)
    
    // Build filter object
    const filter: any = {}
    
    if (searchQuery) {
      filter["$or"] = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
        { subject: { $regex: searchQuery, $options: "i" } },
      ]
    }
    
    console.log("Filter:", JSON.stringify(filter))
    
    // Get total count for pagination
    const total = await Contact.countDocuments(filter)
    console.log(`Total documents found: ${total}`)
    
    // Fetch contact enquiries with pagination
    const contactEnquiries = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    console.log(`Retrieved ${contactEnquiries.length} contact enquiries`)
    
    return NextResponse.json({
      success: true,
      data: contactEnquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error: any) {
    console.error("Error fetching contact enquiries:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch contact enquiries" },
      { status: 500 }
    )
  }
} 