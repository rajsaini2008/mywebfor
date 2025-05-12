import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import CourseModel from "@/models/Course"

// Function to create a reliable SVG placeholder URL for courses
function generateCoursePlaceholder(course: { code: string; name: string }) {
  const code = course.code || "N/A";
  const name = course.name || "Course";
  
  // Generate a consistent color based on the course code
  const colors = [
    "#4299e1", // blue
    "#48bb78", // green
    "#f56565", // red
    "#ed8936", // orange
    "#9f7aea", // purple
    "#ed64a6", // pink
    "#38b2ac", // teal
    "#667eea", // indigo
    "#ecc94b", // yellow
    "#81e6d9"  // cyan
  ];
  
  const colorIndex = code.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create parameters for a placeholder image
  const params = new URLSearchParams({
    text: code,
    width: "600",
    height: "400",
    bg: bgColor
  });
  
  return `/placeholder.svg?${params.toString()}`;
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    console.log("Starting to fix course images...");
    
    // Get all courses
    const courses = await CourseModel.find({}).sort({ code: 1 });
    console.log(`Found ${courses.length} courses to process`);
    
    // Track the courses that were updated
    const updatedCourses = [];
    let updatedCount = 0;
    
    // Process each course
    for (const course of courses) {
      // Check if the course already has a valid image URL
      const hasValidImage = course.imageUrl && 
        (course.imageUrl.startsWith('/') || course.imageUrl.startsWith('http'));
      
      if (hasValidImage) {
        console.log(`Course "${course.name}" already has a valid image: ${course.imageUrl}`);
        continue;
      }
      
      // Generate a new placeholder URL
      const placeholderUrl = generateCoursePlaceholder(course);
      console.log(`Updating course "${course.name}" with new placeholder: ${placeholderUrl}`);
      
      // Update the course with the new image URL
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        course._id,
        { imageUrl: placeholderUrl },
        { new: true }
      );
      
      updatedCourses.push({
        id: updatedCourse._id,
        name: updatedCourse.name,
        code: updatedCourse.code,
        imageUrl: updatedCourse.imageUrl
      });
      
      updatedCount++;
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} course images with local placeholders`,
      updatedCourses
    });
  } catch (error: any) {
    console.error("Error fixing course images:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred while fixing course images"
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
} 