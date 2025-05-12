import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ExamPaper from '@/models/ExamPaper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define interface for ExamPaper to fix type errors
interface IExamPaper {
  _id: string;
  paperId: string;
  paperName: string;
  paperType: string;
  examType: string;
  course: any;
  status?: string;
  subjects?: Array<{
    subjectId: string;
    subjectName: string;
    numberOfQuestions: number;
    passingMarks: number;
    theoreticalMarks: number;
  }>;
  createdAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    console.log("Connecting to database...")
    await connectToDatabase()
    console.log("Connected to database successfully")

    // Parse the request body
    const body = await request.json()
    console.log("Received exam paper data:", JSON.stringify(body, null, 2))

    // Validate subjects data
    if (body.subjects && Array.isArray(body.subjects)) {
      console.log(`Processing ${body.subjects.length} subjects`)
      body.subjects = body.subjects.filter((subject: any) => 
        subject.subjectId && 
        subject.subjectName && 
        subject.numberOfQuestions !== undefined && 
        subject.passingMarks !== undefined &&
        subject.theoreticalMarks !== undefined
      )
      console.log(`After filtering, ${body.subjects.length} valid subjects remain`)
    }
    
    // Make sure examType is set
    if (!body.examType) {
      body.examType = "Main"; // Default to Main if not specified
      console.log("No examType specified, defaulting to 'Main'");
    }
    
    // Always set status to inactive for new exams
    body.status = "inactive"; 
    console.log("Setting exam status to 'inactive' by default");
    
    // Create a new exam paper
    console.log("Attempting to create exam paper in database...")
    const examPaper = await ExamPaper.create(body)
    console.log("Exam paper created successfully with ID:", examPaper._id)

    return NextResponse.json({ success: true, data: examPaper }, { status: 201 })
  } catch (error) {
    console.error("Error creating exam paper:", error)
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "An error occurred while creating the exam paper" }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    console.log("Connecting to database for GET request...")
    await connectToDatabase()
    console.log("Connected to database successfully")

    // Get the URL parameters
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const courseId = url.searchParams.get("course");
    const status = url.searchParams.get("status");
    const paperType = url.searchParams.get("paperType");
    const examType = url.searchParams.get("examType");
    const forApplyPage = url.searchParams.get("forApplyPage") === "true";
    
    console.log("Query parameters:", { id, courseId, status, paperType, examType, forApplyPage });

    if (id) {
      // Get a specific exam paper
      console.log(`Fetching specific exam paper with ID: ${id}`)
      const examPaper = await ExamPaper.findById(id).populate("course")

      if (!examPaper) {
        console.log(`No exam paper found with ID: ${id}`)
        return NextResponse.json({ success: false, message: "Exam paper not found" }, { status: 404 })
      }

      console.log("Found exam paper:", examPaper.paperId)
      return NextResponse.json({ success: true, data: examPaper })
    }

    // Build filter object
    let filter: Record<string, any> = {};
    
    // If this request is from apply-for-exam page, only show active Main exams
    if (forApplyPage) {
      filter = {
        examType: "Main",
        status: "active"
      };
      console.log("Filtering for apply-for-exam page: returning only active Main exams");
    } else {
      // Add course filter if provided
      if (courseId) {
        filter.course = courseId
        console.log("Added course filter:", courseId);
      }
      
      // Add status filter if provided
      if (status) {
        filter.status = status
        console.log("Added status filter:", status);
      }
      
      // Add paperType filter if provided - case insensitive
      if (paperType) {
        // Use regex for case-insensitive matching
        filter.paperType = { $regex: new RegExp(`^${paperType}$`, 'i') }
        console.log("Added paperType filter:", paperType);
      }
      
      // Add examType filter if provided
      if (examType) {
        filter.examType = examType
        console.log("Added examType filter:", examType);
      }
    }
    
    console.log("Using filter:", JSON.stringify(filter));
    
    // Get all exam papers
    console.log("Fetching exam papers with filters...")
    const examPapers = await ExamPaper.find(filter).populate("course").sort({ createdAt: -1 })
    console.log(`Found ${examPapers.length} exam papers`)
    
    // Log the first exam paper to help debugging
    if (examPapers.length > 0) {
      console.log("First exam paper sample:", {
        _id: examPapers[0]._id,
        paperId: examPapers[0].paperId,
        paperName: examPapers[0].paperName,
        paperType: examPapers[0].paperType,
        examType: examPapers[0].examType,
        status: examPapers[0].status
      })
    } else {
      console.log("No exam papers matched the filter criteria");
      
      // Check if there are any exam papers in the database at all
      const totalCount = await ExamPaper.countDocuments({});
      console.log(`Total exam papers in database: ${totalCount}`);
      
      if (totalCount > 0) {
        // Sample a few papers to see what's in the database
        const samples = await ExamPaper.find({}).limit(3);
        console.log("Sample exam papers in database:", 
          samples.map((p: any) => ({ 
            id: p._id, 
            paperType: p.paperType,
            examType: p.examType || 'undefined',
            name: p.paperName 
          }))
        );
      }
    }
    
    return NextResponse.json({ success: true, data: examPapers })
  } catch (error) {
    console.error("Error fetching exam papers:", error)
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "An error occurred while fetching exam papers" }, 
      { status: 500 }
    )
  }
} 