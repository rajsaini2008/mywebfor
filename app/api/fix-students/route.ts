import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Student from "@/models/Student"
import CourseModel from "@/models/Course"

interface UpdateFields {
  status?: string
  course?: any
  [key: string]: any
}

async function fixStudentData() {
  try {
    await connectToDatabase()
    
    console.log("Starting to fix student data...")
    
    // Get all students
    const students = await Student.find({})
    console.log(`Found ${students.length} students to check`)
    
    // Get all courses for reference
    const courses = await CourseModel.find({})
    console.log(`Found ${courses.length} courses for reference`)
    
    const defaultCourse = courses.length > 0 ? courses[0]._id : null
    
    // Statistics for reporting
    const stats = {
      total: students.length,
      fixed: 0,
      noChangesNeeded: 0,
      errors: 0
    }
    
    // Fixes applied to each student
    const fixedStudents = []
    
    // Process each student
    for (const student of students) {
      try {
        let wasUpdated = false
        const updates: UpdateFields = {}
        
        // Fix: Ensure status field is set
        if (!student.status) {
          updates.status = "Active"
          wasUpdated = true
        }
        
        // Fix: Ensure course reference exists
        if (!student.course || typeof student.course !== 'object') {
          if (defaultCourse) {
            updates.course = defaultCourse
            wasUpdated = true
          }
        }
        
        // Apply updates if needed
        if (wasUpdated) {
          const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            updates,
            { new: true }
          )
          
          fixedStudents.push({
            id: updatedStudent._id,
            name: updatedStudent.name,
            updates: Object.keys(updates)
          })
          
          stats.fixed++
        } else {
          stats.noChangesNeeded++
        }
      } catch (err) {
        console.error(`Error fixing student ${student._id}:`, err)
        stats.errors++
      }
    }
    
    return {
      success: true,
      message: `Fixed ${stats.fixed} out of ${stats.total} students`,
      stats,
      fixedStudents
    }
  } catch (error: any) {
    console.error("Error fixing student data:", error)
    return {
      success: false,
      message: error.message || "An unknown error occurred",
      error: error.toString()
    }
  }
}

export async function GET() {
  const result = await fixStudentData()
  
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  
  return NextResponse.json(result)
}

export async function POST() {
  const result = await fixStudentData()
  
  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }
  
  return NextResponse.json(result)
} 