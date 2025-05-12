import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

// This is a simpler endpoint to check if offline applications exist
export async function GET(request: Request) {
  try {
    await connectToDatabase()
    console.log("Connected to database for checking offline applications")
    
    const { searchParams } = new URL(request.url)
    const atcId = searchParams.get("atcId")
    
    const db = mongoose.connection.db
    if (!db) {
      console.error("Database connection not established")
      return NextResponse.json({
        success: false,
        message: "Database connection not established"
      }, { status: 500 })
    }
    
    // Build basic query
    const query: any = {
      paperType: "offline",
      status: { $in: ["approved", "scheduled"] }
    }
    
    // Add ATC ID if provided
    if (atcId) {
      try {
        query.centerId = new mongoose.Types.ObjectId(atcId)
      } catch (err) {
        console.error("Invalid atcId format:", atcId, err)
      }
    }
    
    console.log("Check query:", JSON.stringify(query))
    
    // Just get the count to check if any exist
    const count = await db.collection('examapplications').countDocuments(query)
    console.log(`Found ${count} offline applications (approved or scheduled)`)
    
    // Get separate counts for each status
    const approvedCount = await db.collection('examapplications').countDocuments({ 
      paperType: "offline", 
      status: "approved",
      ...(atcId ? { centerId: new mongoose.Types.ObjectId(atcId) } : {})
    })
    
    const scheduledCount = await db.collection('examapplications').countDocuments({ 
      paperType: "offline", 
      status: "scheduled",
      ...(atcId ? { centerId: new mongoose.Types.ObjectId(atcId) } : {})
    })
    
    console.log(`Status breakdown - approved: ${approvedCount}, scheduled: ${scheduledCount}`)
    
    // If we have applications, get a sample for debugging
    let sample = null
    if (count > 0) {
      const samples = await db.collection('examapplications').find(query).limit(1).toArray()
      if (samples.length > 0) {
        sample = {
          id: samples[0]._id,
          paperType: samples[0].paperType,
          status: samples[0].status,
          studentId: samples[0].studentId
        }
        console.log("Sample application:", sample)
        
        // Look up the student data for this application
        if (samples[0].studentId) {
          const student = await db.collection('students').findOne({
            _id: samples[0].studentId
          })
          if (student) {
            console.log("Found associated student:", {
              id: student._id,
              name: student.name,
              studentId: student.studentId
            })
          } else {
            console.log("No student found with ID:", samples[0].studentId)
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      count,
      sample,
      message: count > 0 ? "Offline applications found" : "No offline applications found"
    })
  } catch (error) {
    console.error("Error checking offline applications:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while checking offline applications"
    }, { status: 500 })
  }
} 