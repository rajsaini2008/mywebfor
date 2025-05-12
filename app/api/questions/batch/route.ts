import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Question, { IQuestion } from "@/models/Question"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { questions, paperId, subjectId, subjectName } = body

    console.log(`Received batch upload request with ${questions?.length || 0} questions for subject: ${subjectName}`)
    
    // Validate required data
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions provided or invalid format" },
        { status: 400 }
      )
    }

    if (!paperId) {
      return NextResponse.json(
        { success: false, message: "Paper ID is required" },
        { status: 400 }
      )
    }

    if (!subjectId) {
      return NextResponse.json(
        { success: false, message: "Subject ID is required" },
        { status: 400 }
      )
    }

    // Make sure we have a subject name (use a default if not provided)
    const finalSubjectName = subjectName || "Unknown Subject";
    console.log(`Using subject name: ${finalSubjectName}`);

    // Delete existing questions for this paper and subject if they exist
    console.log(`Deleting existing questions for paperId: ${paperId}, subjectId: ${subjectId}`)
    await Question.deleteMany({ paperId, subjectId })

    // Validate all questions have required content
    const validQuestions = questions.filter(q => 
      q.questionText && q.questionText.trim() !== '' && 
      q.questionText !== 'Question text not available'
    );
    
    if (validQuestions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid questions with question text found in the uploaded data" },
        { status: 400 }
      )
    }
    
    if (validQuestions.length !== questions.length) {
      console.warn(`Warning: ${questions.length - validQuestions.length} questions were invalid and will be skipped`);
    }

    // Generate proper question documents with the right fields
    console.log("Preparing questions data...")
    const processedQuestions = validQuestions.map((q, index) => {
      // Start with provided data but ensure we have defaults for missing fields
      const questionData = {
        paperId,
        subjectId,
        subjectName: finalSubjectName,
        questionText: q.questionText || `Question ${index + 1}`,
        optionA: q.optionA || "Option A",
        optionB: q.optionB || "Option B",
        optionC: q.optionC || "Option C",
        optionD: q.optionD || "Option D",
        correctOption: q.correctOption || "A",
        updatedAt: new Date(),
        createdAt: new Date()
      };
      
      // Log the first question for debugging
      if (index === 0) {
        console.log("Sample question data:", JSON.stringify(questionData, null, 2));
      }
      
      return questionData;
    });

    // Insert all questions
    console.log(`Inserting ${processedQuestions.length} questions`)
    
    // Force the question save without validation if necessary
    const result = await Question.insertMany(processedQuestions);

    console.log(`Successfully saved ${result.length} questions`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded ${result.length} questions`,
      count: result.length
    }, { status: 201 })
  } catch (error) {
    console.error("Error uploading questions:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while uploading questions" 
      }, 
      { status: 500 }
    )
  }
} 