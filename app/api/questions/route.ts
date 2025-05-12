import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Question, { IQuestion } from "@/models/Question"
import mongoose from "mongoose"

// Helper function to decode text properly
function decodeText(text: string | null | undefined): string {
  if (!text) return "";
  try {
    // First try direct decoding
    const decoded = decodeURIComponent(text);
    if (decoded !== text) return decoded;
    
    // If that doesn't work, try Buffer decoding
    const buffer = Buffer.from(text);
    return buffer.toString('utf8');
  } catch (error) {
    console.error("Error decoding text:", error);
    return text || "";
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const paperId = searchParams.get("paperId")
    const subjectId = searchParams.get("subjectId")
    const useDirectQuery = searchParams.get("direct") === "true"
    const debug = searchParams.get("debug") === "true"
    const exactMatch = searchParams.get("exactMatch") === "true"

    console.log(`Fetching questions with paperId: ${paperId}, subjectId: ${subjectId}, exactMatch: ${exactMatch}`)

    // Validate required parameters
    if (!paperId) {
      return NextResponse.json({ 
        success: false, 
        message: "Paper ID is required" 
      }, { status: 400 })
    }

    let questionResults: any[] = [];
    let debugInfo: any = {};
    
    // Get the database connection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // First try to get the exam paper to understand its structure
    console.log("Fetching exam paper details...");
    const examPaper = await db.collection('exampapers').findOne({ 
      $or: [
        { paperId: paperId },
        ...(mongoose.Types.ObjectId.isValid(paperId) 
          ? [{ _id: new mongoose.Types.ObjectId(paperId) }] 
          : []
        )
      ]
    });

    if (!examPaper) {
      console.log("Exam paper not found");
      if (debug) {
        debugInfo.examPaperFound = false;
      }
    } else {
      console.log("Found exam paper:", examPaper.paperName);
      if (debug) {
        debugInfo.examPaperFound = true;
        debugInfo.examPaper = {
          paperId: examPaper.paperId,
          paperName: examPaper.paperName,
          subjects: examPaper.subjects
        };
      }
    }

    // Try to find the target subject
    let targetSubject = null;
    if (examPaper && examPaper.subjects && subjectId) {
      targetSubject = examPaper.subjects.find((s: any) => 
        s.subjectId === subjectId || 
        s._id.toString() === subjectId ||
        (s.subjectName && s.subjectName.toLowerCase() === decodeText(subjectId).toLowerCase())
      );
      
      if (targetSubject) {
        console.log("Found target subject:", targetSubject.subjectName);
        if (debug) {
          debugInfo.targetSubject = targetSubject;
        }
      }
    }

    // Build the query conditions
    const paperIdConditions = [
      ...(examPaper?.paperId ? [{ paperId: examPaper.paperId }] : []), // Use the actual paper ID from the exam paper if available
      { paperId: paperId }
    ];

    // Add subject conditions if we have a subject ID
    const subjectConditions = [];
    if (subjectId) {
      // Try exact subject ID match
      subjectConditions.push({ subjectId: subjectId });

      // If we found the target subject, also try matching by name
      if (targetSubject && targetSubject.subjectName) {
        subjectConditions.push({ 
          subjectName: targetSubject.subjectName 
        });
      }
    }

    // Build the final query
    const query = {
      $and: [
        { $or: paperIdConditions },
        ...(subjectConditions.length > 0 ? [{ $or: subjectConditions }] : [])
      ]
    };

    console.log("Final query:", JSON.stringify(query, null, 2));

    // Execute the query
    questionResults = await db.collection('questions').find(query).toArray();
    console.log(`Found ${questionResults.length} questions`);

    if (debug) {
      // Get diagnostic information
      debugInfo.query = query;
      debugInfo.totalQuestions = await db.collection('questions').countDocuments();
      debugInfo.paperQuestions = await db.collection('questions').countDocuments({ 
        $or: paperIdConditions 
      });
      if (subjectId) {
        debugInfo.subjectQuestions = await db.collection('questions').countDocuments({ 
          $or: subjectConditions 
        });
      }
      debugInfo.availableSubjectNames = await db.collection('questions')
        .distinct('subjectName', { $or: paperIdConditions });
      debugInfo.sampleQuestions = await db.collection('questions')
        .find({})
        .limit(3)
        .toArray();
    }

    // Post-process questions to ensure default values for empty fields
    const processedQuestions = questionResults.map((q, index) => {
      return {
        ...q,
        questionText: q.questionText && q.questionText.trim() !== '' 
          ? decodeText(q.questionText)
          : `Question ${index + 1}`,
        optionA: decodeText(q.optionA) || "Option A",
        optionB: decodeText(q.optionB) || "Option B",
        optionC: decodeText(q.optionC) || "Option C",
        optionD: decodeText(q.optionD) || "Option D",
        correctOption: q.correctOption || "A"
      };
    });

    // Set proper content type for UTF-8
    const headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        data: processedQuestions,
        ...(debug ? { debug: debugInfo } : {})
      }), 
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while fetching questions" 
      }, 
      { status: 500 }
    )
  }
} 