import { NextResponse } from "next/server"
import mongoose from "mongoose"

/**
 * This is a special API endpoint to help clear cached MongoDB connections
 * and models, which can sometimes cause issues in development.
 */
export async function GET() {
  try {
    console.log("Refresh DB endpoint called - resetting MongoDB connection")
    
    // Force disconnect from MongoDB
    if (mongoose.connection.readyState !== 0) {
      console.log("Closing existing mongoose connection...")
      try {
        await mongoose.connection.close()
        console.log("Mongoose connection closed")
      } catch (err) {
        console.error("Error closing connection:", err)
      }
    }
    
    // Clear all model definitions
    if (mongoose.connection.models) {
      console.log("Clearing all mongoose models...")
      Object.keys(mongoose.connection.models).forEach(modelName => {
        delete mongoose.connection.models[modelName]
        console.log(`Model ${modelName} cleared`)
      })
    }
    
    // Create a fresh connection with all options explicitly set
    console.log("Creating a fresh MongoDB connection...")
    
    // Get the MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI || 
      "mongodb+srv://rajindoriyaofficial5:raj123@cluster0.b6ybqao.mongodb.net/krishnakaman"
    
    // Connect with explicit options
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      maxPoolSize: 10,         // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Server selection timeout
    })
    
    console.log("Fresh MongoDB connection established")
    console.log("Connection state:", mongoose.connection.readyState)
    
    // Return success response with diagnostic information
    return NextResponse.json({ 
      success: true, 
      message: "Database connection refreshed successfully",
      details: {
        connectionState: mongoose.connection.readyState,
        models: Object.keys(mongoose.connection.models),
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    })
  } catch (error) {
    console.error("Error refreshing database connection:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Error refreshing database connection",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 