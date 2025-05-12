import { NextResponse } from "next/server"
import mongoose from "mongoose"

/**
 * Creates a direct MongoDB connection to test connectivity
 * This bypasses the connectToDatabase function to test raw connection
 */
export async function GET() {
  try {
    console.log("Test DB connection endpoint called")
    
    // MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI || 
      "mongodb+srv://rajindoriyaofficial5:raj123@cluster0.b6ybqao.mongodb.net/krishnakaman"
    
    let conn: mongoose.Connection
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Using existing mongoose connection")
      conn = mongoose.connection
    } else {
      console.log("Creating a direct test connection to MongoDB...")
      
      // Connect with explicit options
      await mongoose.connect(MONGODB_URI, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      })
      
      conn = mongoose.connection
      console.log("Direct test connection successful")
    }
    
    // Test that we can perform a MongoDB operation
    const collections = await conn.db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    // Check if courses collection exists
    const hasCourses = collectionNames.includes('courses')
    
    // Try to count documents in courses collection
    let courseCount = 0
    if (hasCourses) {
      courseCount = await conn.db.collection('courses').countDocuments()
    }
    
    // Test response data
    const responseData = {
      success: true,
      connection: {
        readyState: conn.readyState,
        host: conn.host,
        name: conn.name,
        models: Object.keys(mongoose.models),
      },
      collections: {
        list: collectionNames,
        count: collectionNames.length,
        hasCourses: hasCourses,
        courseCount: courseCount
      },
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 