import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import StudentModel from "@/models/Student"

// Function to create a reliable SVG placeholder URL for student images
function generateStudentPlaceholder(type: string, id: string) {
  const studentId = id || "ID";
  
  // Generate different placeholders based on the type
  if (type === 'photo') {
    return `/placeholder.svg?text=PHOTO-${studentId}&width=400&height=400`;
  } else if (type === 'idCard') {
    return `/placeholder.svg?text=ID-${studentId}&width=400&height=300`;
  } else if (type === 'signature') {
    return `/placeholder.svg?text=SIGN-${studentId}&width=400&height=100`;
  }
  
  return `/placeholder.svg?text=${studentId}&width=400&height=400`;
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    console.log("Starting to fix student images...");
    
    // Get all students
    const students = await StudentModel.find({}).sort({ name: 1 });
    console.log(`Found ${students.length} students to process`);
    
    // Track the students that were updated
    const updatedStudents = [];
    let updatedCount = 0;
    
    // Process each student
    for (const student of students) {
      let updated = false;
      const updates: any = {};
      
      // Check and fix photo URL
      if (!student.photoUrl || 
          typeof student.photoUrl !== 'string' || 
          !(student.photoUrl.startsWith('/') || student.photoUrl.startsWith('http'))) {
        updates.photoUrl = generateStudentPlaceholder('photo', student.studentId);
        updated = true;
      }
      
      // Check and fix ID card URL
      if (!student.idCardUrl || 
          typeof student.idCardUrl !== 'string' || 
          !(student.idCardUrl.startsWith('/') || student.idCardUrl.startsWith('http'))) {
        updates.idCardUrl = generateStudentPlaceholder('idCard', student.studentId);
        updated = true;
      }
      
      // Check and fix signature URL
      if (!student.signatureUrl || 
          typeof student.signatureUrl !== 'string' || 
          !(student.signatureUrl.startsWith('/') || student.signatureUrl.startsWith('http'))) {
        updates.signatureUrl = generateStudentPlaceholder('signature', student.studentId);
        updated = true;
      }
      
      // Update the student if needed
      if (updated) {
        console.log(`Updating student "${student.name}" (${student.studentId}) with new image URLs`);
        
        const updatedStudent = await StudentModel.findByIdAndUpdate(
          student._id,
          updates,
          { new: true }
        );
        
        updatedStudents.push({
          id: updatedStudent._id,
          name: updatedStudent.name,
          studentId: updatedStudent.studentId,
          updates
        });
        
        updatedCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} student images`,
      updatedStudents
    });
  } catch (error: any) {
    console.error("Error fixing student images:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred while fixing student images"
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
} 