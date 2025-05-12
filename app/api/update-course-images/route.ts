import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CourseModel from "@/models/Course"

interface Course {
  _id: string
  name: string
  code: string
}

// Function to generate a reliable placeholder image URL
function generatePlaceholderUrl(courseCode: string) {
  // Clean the course code to ensure it's valid for a URL
  const cleanCode = encodeURIComponent(courseCode.trim());
  
  // Generate a predictable color based on the course code
  const colors = [
    'blue', 'green', 'red', 'orange', 'purple', 
    'pink', 'teal', 'indigo', 'yellow', 'cyan'
  ];
  const colorIndex = courseCode.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Return a placeholder URL that will work reliably
  return `/placeholder.svg?text=${cleanCode}&width=600&height=400&bg=${bgColor}`;
}

// Shared function to update course images
async function updateCourseImages() {
  try {
    // Connect to the database
    await connectToDatabase()
    
    // Get all courses
    const courses = await CourseModel.find({})
      .select('_id name code imageUrl')
      .lean()
    
    console.log(`Found ${courses.length} courses to update images`)
    
    // Update each course with a placeholder image URL based on its code
    const updatedCourses = []
    
    for (const course of courses) {
      try {
        // Check if the course already has a valid image URL
        const hasValidImage = course.imageUrl && 
          (course.imageUrl.startsWith('/') || 
           course.imageUrl.startsWith('http'));
        
        // Create a placeholder URL if needed
        const placeholderUrl = generatePlaceholderUrl(course.code);
        
        // Only update if the image URL is missing or invalid
        if (!hasValidImage) {
          console.log(`Updating image for course: ${course.name} (${course.code})`)
          
          // Update the course with the new imageUrl
          const updatedCourse = await CourseModel.findByIdAndUpdate(
            course._id,
            { imageUrl: placeholderUrl },
            { new: true }
          )
          
          updatedCourses.push(updatedCourse)
        } else {
          console.log(`Course ${course.name} already has a valid image: ${course.imageUrl}`)
          updatedCourses.push(course)
        }
      } catch (err) {
        console.error(`Error updating course ${course._id}:`, err)
      }
    }
    
    return {
      success: true,
      message: `Updated ${updatedCourses.length} courses with placeholder images`,
      data: updatedCourses.map(c => ({ 
        id: c._id, 
        name: c.name, 
        code: c.code, 
        imageUrl: c.imageUrl 
      }))
    }
  } catch (error: any) {
    console.error("Error updating course images:", error)
    return { 
      success: false, 
      message: error.message || "An error occurred" 
    }
  }
}

export async function GET(request: Request) {
  const result = await updateCourseImages()
  
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const result = await updateCourseImages()
  
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  
  return NextResponse.json(result)
} 