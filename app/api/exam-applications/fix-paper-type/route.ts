import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

// This endpoint fixes paperType field on exam applications
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    console.log("Connected to database for fixing paperType field")
    
    const { defaultPaperType = 'offline' } = await request.json()
    console.log(`Using default paperType: ${defaultPaperType}`)
    
    const db = mongoose.connection.db
    if (!db) {
      console.error("Database connection not established")
      return NextResponse.json({
        success: false,
        message: "Database connection not established"
      }, { status: 500 })
    }
    
    // First check how many applications have missing paperType field
    const missingPaperType = await db.collection('examapplications').countDocuments({
      $or: [
        { paperType: { $exists: false } },
        { paperType: null },
        { paperType: "" }
      ]
    })
    console.log(`Found ${missingPaperType} applications with missing paperType field`)
    
    // Update all applications with missing paperType
    const updateResult = await db.collection('examapplications').updateMany(
      {
        $or: [
          { paperType: { $exists: false } },
          { paperType: null },
          { paperType: "" }
        ]
      },
      {
        $set: { paperType: defaultPaperType }
      }
    )
    
    console.log(`Updated ${updateResult.modifiedCount} applications with default paperType`)
    
    // Now check the total count of applications with each paperType
    const offlineCount = await db.collection('examapplications').countDocuments({ paperType: 'offline' })
    const onlineCount = await db.collection('examapplications').countDocuments({ paperType: 'online' })
    
    console.log(`Applications by paperType - offline: ${offlineCount}, online: ${onlineCount}`)
    
    return NextResponse.json({
      success: true,
      message: "Successfully fixed paperType field",
      updatedCount: updateResult.modifiedCount,
      offlineCount,
      onlineCount
    })
  } catch (error) {
    console.error("Error fixing paperType field:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fixing paperType field"
    }, { status: 500 })
  }
} 