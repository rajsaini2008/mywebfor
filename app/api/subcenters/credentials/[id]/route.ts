import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const centerId = params.id
    if (!centerId) {
      return NextResponse.json({
        success: false,
        message: "Center ID is required"
      }, { status: 400 })
    }

    console.log(`Fetching subcenter credentials for centerId: ${centerId}`)
    
    // Query the MongoDB subcenters collection directly, looking for the centerId field
    const subcenter = await mongoose.connection.db.collection('subcenters').findOne({
      centerId: centerId
    })
    
    if (!subcenter) {
      return NextResponse.json({
        success: false,
        message: "Subcenter not found"
      }, { status: 404 })
    }

    // Return the subcenter data including the password for auto-login
    return NextResponse.json({
      success: true,
      data: subcenter
    })
  } catch (error) {
    console.error("Error fetching subcenter credentials:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fetching subcenter credentials"
    }, { status: 500 })
  }
} 