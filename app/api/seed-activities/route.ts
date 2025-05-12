import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

// This is a utility endpoint to seed some test activities
// It should only be used in development or for demonstration purposes
export async function GET() {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        message: "This endpoint is only available in development mode" 
      }, { status: 403 })
    }
    
    // Connect to the database
    await connectToDatabase()
    
    // Get the Activity model
    const Activity = mongoose.models.Activity
    if (!Activity) {
      return NextResponse.json({ 
        success: false, 
        message: "Activity model not found" 
      }, { status: 500 })
    }
    
    // Sample activities to seed
    const sampleActivities = [
      {
        activity: "New student Amit Kumar enrolled in DCA course",
        type: "student",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        activity: "Certificate issued to Priya Patel for CCC course",
        type: "certificate",
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
      {
        activity: "New course 'Advanced Web Development' added",
        type: "course",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        activity: "Fee payment received from Rahul Sharma",
        type: "payment",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
      },
      {
        activity: "New ATC center registered: Tech Learners Hub",
        type: "other",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      }
    ]
    
    // Clear existing activities
    await Activity.deleteMany({})
    
    // Insert sample activities
    const result = await Activity.insertMany(sampleActivities)
    
    return NextResponse.json({ 
      success: true, 
      message: `Seeded ${result.length} activities`,
      data: result
    })
    
  } catch (error) {
    console.error("Error seeding activities:", error)
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred while seeding activities",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 