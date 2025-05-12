import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    console.log("Testing database connection...")
    const connection = await connectToDatabase()
    
    // Get a list of all collections
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(col => col.name)
    
    // Check if ExamPaper collection exists
    const hasExamPapers = collectionNames.includes("exampapers")
    const examPapersCount = hasExamPapers 
      ? await db.collection("exampapers").countDocuments() 
      : 0
    
    // Get collection stats
    const stats = {}
    for (const name of collectionNames) {
      stats[name] = await db.collection(name).countDocuments()
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      connectionState: mongoose.connection.readyState,
      connectionString: process.env.MONGODB_URI ? "Configured" : "Missing",
      collections: collectionNames,
      stats,
      hasExamPapers,
      examPapersCount
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Database connection failed",
        error: error instanceof Error ? error.toString() : "Unknown error"
      }, 
      { status: 500 }
    )
  }
} 