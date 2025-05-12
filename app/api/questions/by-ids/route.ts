import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Question, { IQuestion } from "@/models/Question"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { questionIds } = body

    console.log(`Fetching questions by IDs: ${questionIds?.length || 0} IDs provided`)

    // Validate required parameters
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Question IDs are required (must be an array)" 
      }, { status: 400 })
    }

    let questions = [];

    // Try using Mongoose first
    try {
      const validObjectIds = questionIds.filter(id => mongoose.Types.ObjectId.isValid(id))
      
      if (validObjectIds.length > 0) {
        questions = await Question.find({
          _id: { $in: validObjectIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).lean().exec()
      }
      
      console.log(`Found ${questions.length} questions using Mongoose`)
    } catch (error) {
      console.error("Mongoose query failed:", error)
    }

    // If Mongoose approach didn't find all questions, try direct MongoDB access
    if (questions.length < questionIds.length) {
      console.log("Not all questions found with Mongoose, trying direct MongoDB")
      
      const db = mongoose.connection.db
      if (db) {
        // Build an OR query with all possible ID formats
        const filter = {
          $or: questionIds.map(id => {
            // Try different formats for the ID
            return {
              $or: [
                // As string
                { _id: id.toString() },
                // As ObjectId if possible
                ...(mongoose.Types.ObjectId.isValid(id) 
                  ? [{ _id: new mongoose.Types.ObjectId(id) }] 
                  : [])
              ]
            }
          })
        }
        
        const dbQuestions = await db.collection('questions').find(filter).toArray()
        console.log(`Found ${dbQuestions.length} questions using direct MongoDB`)
        
        // Merge unique questions
        const existingIds = new Set(questions.map(q => q._id.toString()))
        const newQuestions = dbQuestions.filter(q => !existingIds.has(q._id.toString()))
        
        questions = [...questions, ...newQuestions]
      }
    }

    console.log(`Returning ${questions.length} questions total`)

    // Post-process questions to ensure default values for empty fields
    const processedQuestions = questions.map((q, index) => {
      const question = typeof q.toObject === 'function' ? q.toObject() : q;
      
      return {
        ...question,
        questionText: question.questionText && question.questionText.trim() !== '' 
          ? question.questionText 
          : `Question ${index + 1}`,
        optionA: question.optionA || "Option A",
        optionB: question.optionB || "Option B",
        optionC: question.optionC || "Option C",
        optionD: question.optionD || "Option D",
        correctOption: question.correctOption || "A"
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: processedQuestions
    })
  } catch (error) {
    console.error("Error fetching questions by IDs:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while fetching questions" 
      }, 
      { status: 500 }
    )
  }
} 