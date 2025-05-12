import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CourseModel from "@/models/Course"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  description: string
  fee: number
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Get all courses
    const courses = await CourseModel.find({})
      .sort({ createdAt: -1 })
      .lean()
    
    console.log(`Test API found ${courses.length} courses`)
    
    // Log image URLs for debugging
    courses.forEach((course: Course) => {
      console.log(`Course: ${course.name}, Image URL: ${course.imageUrl || 'No image'}`)
    })

    return NextResponse.json(
      { 
        success: true, 
        data: courses,
        message: "Courses retrieved successfully with image debugging info in console" 
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        } 
      }
    )
  } catch (error: any) {
    console.error("Error in test courses API:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while fetching courses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Create test courses with images
    const testCourses = [
      {
        name: "Diploma in Computer Applications",
        code: "DCA",
        description: "Comprehensive course covering all aspects of computer applications",
        duration: "12 months",
        fee: 15000,
        imageUrl: "/images/courses/dca.jpg",
        isActive: true
      },
      {
        name: "Certificate in Web Development",
        code: "CWD",
        description: "Learn web development with HTML, CSS, and JavaScript",
        duration: "6 months",
        fee: 10000,
        imageUrl: "/images/courses/web.jpg",
        isActive: true
      },
      {
        name: "Tally Course",
        code: "TALLY",
        description: "Master Tally for accounting and business management",
        duration: "3 months",
        fee: 8000,
        imageUrl: "/images/courses/tally.jpg",
        isActive: true
      }
    ]
    
    // Clear existing test courses first
    await CourseModel.deleteMany({ code: { $in: ["DCA", "CWD", "TALLY"] } })
    
    // Insert new test courses
    const result = await CourseModel.insertMany(testCourses)
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${result.length} test courses successfully`,
      data: result 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating test courses:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating test courses" },
      { status: 500 }
    )
  }
} 