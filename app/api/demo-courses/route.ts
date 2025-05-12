import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CourseModel from "@/models/Course"

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Create the courses shown in the screenshot
    const demoCourses = [
      {
        name: "New Query",
        code: "10379",
        description: "Complete computer course",
        duration: "12 months",
        fee: 6000,
        imageUrl: "/images/courses/computer-course.jpg",
        isActive: true
      },
      {
        name: "Krishna Computershh",
        code: "102188",
        description: "Advanced computer training",
        duration: "12 months",
        fee: 10000,
        imageUrl: "/images/courses/advanced-course.jpg",
        isActive: true
      },
      {
        name: "Krishna Computers",
        code: "10216",
        description: "Professional computer training",
        duration: "12 months",
        fee: 8000,
        imageUrl: "/images/courses/professional-course.jpg",
        isActive: true
      }
    ]
    
    // Clear existing demo courses first
    await CourseModel.deleteMany({ code: { $in: ["10379", "102188", "10216"] } })
    
    // Insert new demo courses
    const result = await CourseModel.insertMany(demoCourses)
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${result.length} demo courses successfully`,
      data: result 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating demo courses:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating demo courses" },
      { status: 500 }
    )
  }
} 