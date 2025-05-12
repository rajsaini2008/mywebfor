import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CourseModel from "@/models/Course"
import mongoose from "mongoose"

// Make sure Subject model is available
import "@/models/Subject"

interface Course {
  _id: string
  name: string
  code: string
  description: string
  duration: string
  fee: number
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Helper function to handle errors
const handleApiError = (error: any) => {
  console.error("API Error:", error)
  
  // Specific error for MongoDB duplicate keys
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return NextResponse.json(
      { 
        success: false, 
        message: `A course with this ${field} already exists. Please use a unique ${field}.` 
      },
      { status: 400 }
    )
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map((err: any) => err.message)
    return NextResponse.json(
      { 
        success: false, 
        message: "Validation failed", 
        errors: validationErrors 
      },
      { status: 400 }
    )
  }
  
  // General error
  return NextResponse.json(
    { success: false, message: error.message || "An error occurred" },
    { status: 500 }
  )
}

// Generate a placeholder URL for courses that don't have an image
function generateCoursePlaceholder(courseCode: string) {
  // Generate a consistent color based on the course code
  const colors = [
    "blue", "green", "red", "orange", "purple", 
    "pink", "teal", "indigo", "yellow", "cyan"
  ];
  const colorIndex = courseCode.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Return a placeholder URL
  return `/placeholder.svg?text=${encodeURIComponent(courseCode)}&width=600&height=400&bg=${bgColor}`;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Parse request body
    const body = await request.json()
    
    // If imageUrl is not provided, generate a placeholder based on the course code
    if (!body.imageUrl) {
      body.imageUrl = generateCoursePlaceholder(body.code)
    }
    
    // Create a new course
    const newCourse = new CourseModel(body)
    const savedCourse = await newCourse.save()
    
    // Log activity for new course
    const Activity = mongoose.models.Activity
    if (Activity) {
      await Activity.create({
        activity: `New course '${body.name}' added`,
        type: "course",
        entityId: savedCourse._id,
        entityModel: "Course",
        metadata: { courseCode: body.code, courseDuration: body.duration }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: savedCourse,
      message: "Course created successfully"
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while creating the course" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get("refresh") === "true"
    
    // Get courses from the database
    const courses = await CourseModel.find({})
      .sort({ name: 1 })
      .lean()
    
    // Check for any courses with missing images
    let hasFixedImages = false
    const processedCourses = courses.map(course => {
      // If the course doesn't have a valid image URL, generate a placeholder
      if (!course.imageUrl || !(course.imageUrl.startsWith('/') || course.imageUrl.startsWith('http'))) {
        hasFixedImages = true
        course.imageUrl = generateCoursePlaceholder(course.code)
        
        // Update the course in the database with the new image URL
        CourseModel.updateOne(
          { _id: course._id },
          { imageUrl: course.imageUrl }
        ).catch(err => console.error(`Error updating course image for ${course.code}:`, err))
      }
      
      return course
    })
    
    if (hasFixedImages) {
      console.log("Fixed missing course images during GET request")
    }
    
    return NextResponse.json({
      success: true,
      data: processedCourses,
      count: processedCourses.length,
      message: hasFixedImages ? "Some course images were fixed" : "Courses retrieved successfully"
    })
  } catch (error: any) {
    console.error("Error getting courses:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while getting courses" },
      { status: 500 }
    )
  }
}
