import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"
import Question from "@/models/Question"

// Define types for our database status object
interface DBStats {
  questionsCount?: number;
  sample?: any[];
  isConnected?: boolean;
  collections?: string[];
  examPapers?: any[];
  questionsByPaper?: { [key: string]: number };
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase()
    
    const stats: DBStats = {
      isConnected: mongoose.connection.readyState === 1
    }
    
    // Get database connection
    const db = mongoose.connection.db
    
    if (db) {
      // Get list of collections
      const collections = await db.listCollections().toArray()
      stats.collections = collections.map(c => c.name)
      
      // Check questions collection
      if (collections.some(c => c.name === 'questions')) {
        // Count total questions
        stats.questionsCount = await db.collection('questions').countDocuments()
        
        // Get a sample of questions
        stats.sample = await db.collection('questions')
          .find({})
          .limit(3)
          .toArray()
          
        // Get all unique paper IDs
        const paperIds = await db.collection('questions').distinct('paperId')
        
        // Count questions per paper
        stats.questionsByPaper = {}
        for (const paperId of paperIds) {
          stats.questionsByPaper[paperId] = await db.collection('questions').countDocuments({ paperId })
        }
      }
      
      // Get exam papers
      if (collections.some(c => c.name === 'exampapers')) {
        stats.examPapers = await db.collection('exampapers')
          .find({})
          .toArray()
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: stats
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while testing database" 
      }, 
      { status: 500 }
    )
  }
} 