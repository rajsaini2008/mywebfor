import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Question, { IQuestion } from "@/models/Question"
import { compareSubjectNames } from "@/lib/utils"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const paperId = searchParams.get("paperId")
    const subjectName = searchParams.get("subjectName")
    const strict = searchParams.get("strict") === "true"

    console.log(`Fetching questions by name with paperId: ${paperId}, subjectName: ${subjectName}, strict: ${strict}`)

    // Validate required parameters
    if (!paperId) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID is required" 
      }, { status: 400 })
    }

    if (!subjectName) {
      return NextResponse.json({ 
        success: false, 
        message: "Subject name is required" 
      }, { status: 400 })
    }

    let questionResults: any[] = [];

    // Create a flexible filter for paper ID similar to the main questions API
    const paperIdConditions: any[] = [
      { paperId: paperId },
      // Also check for shortened versions or prefixed versions
      { paperId: { $regex: new RegExp(paperId.replace(/^[a-zA-Z]+/, ''), 'i') } },
      { paperId: { $regex: new RegExp(`P${paperId.slice(-4)}`, 'i') } }
    ];

    // Create a filter that uses paper ID conditions and subject name
    const filter: any = {
      $or: paperIdConditions,
      subjectName: strict
        ? subjectName // strict exact match
        : { $regex: new RegExp(subjectName, 'i') } // case-insensitive partial match
    };
    
    console.log("Mongoose filter by subject name:", filter)
    
    // Get questions matching the filter
    questionResults = await Question.find(filter).lean().exec()
    
    console.log(`Found ${questionResults.length} questions matching the criteria`)

    // If still no questions found, try a more flexible approach with direct MongoDB
    if (questionResults.length === 0 && !strict) {
      console.log("No questions found with exact match, trying more flexible approach")
      
      try {
        const db = mongoose.connection.db
        if (db) {
          // Get all questions for this paper
          const allPaperQuestions = await db.collection('questions').find({ 
            $or: paperIdConditions 
          }).toArray()
          console.log(`Found ${allPaperQuestions.length} total questions for this paper in database`)
          
          // Find questions that might match by comparing subject names
          const flexibleMatches = allPaperQuestions.filter(q => {
            // Check paper ID match
            const paperIdMatch = 
              (q.paperId && q.paperId.includes(paperId)) || 
              (paperId.includes(q.paperId)) ||
              (q.paperId && paperId.slice(-4) === q.paperId.slice(-4));
            
            // Use our new utility function to compare subject names more flexibly
            const subjectNameMatch = compareSubjectNames(q.subjectName, subjectName);
              
            return paperIdMatch && subjectNameMatch;
          });
          
          console.log(`Found ${flexibleMatches.length} questions using flexible subject name matching`)
          
          if (flexibleMatches.length > 0) {
            questionResults = flexibleMatches;
          } else {
            // If we still don't have matches, try getting all available subjects
            const availableSubjects = await db.collection('questions')
              .distinct('subjectName', { $or: paperIdConditions });
            
            console.log("Available subjects:", availableSubjects);
            
            // Try finding the closest match among available subjects
            let bestMatch = '';
            let bestMatchCount = 0;
            
            for (const availSubject of availableSubjects) {
              if (compareSubjectNames(availSubject, subjectName)) {
                // If we find a match, get the questions for this subject
                const matchQuestions = allPaperQuestions.filter(q => 
                  compareSubjectNames(q.subjectName, availSubject)
                );
                
                if (matchQuestions.length > bestMatchCount) {
                  bestMatch = availSubject;
                  bestMatchCount = matchQuestions.length;
                  questionResults = matchQuestions;
                }
              }
            }
            
            if (bestMatch) {
              console.log(`Found best match subject: ${bestMatch} with ${bestMatchCount} questions`);
            }
          }
        }
      } catch (error) {
        console.error("Error with flexible subject matching:", error);
      }
    }

    // Post-process questions to ensure default values for empty fields
    const processedQuestions = questionResults.map((q, index) => {
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
    console.error("Error fetching questions by name:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while fetching questions" 
      }, 
      { status: 500 }
    )
  }
} 