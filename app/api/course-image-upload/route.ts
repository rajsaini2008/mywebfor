import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';

/**
 * API endpoint for handling course image uploads
 * Uses local file storage approach as shown in the screenshot
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const courseId = formData.get('courseId') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Step 1: Process uploaded file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Step 2: Save to server
    // Create folder path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
    
    // Define full file path
    const filePath = path.join(uploadDir, uniqueFileName);
    
    // Save the file
    await writeFile(filePath, fileBuffer);
    
    // Step 3: Generate public URL
    const publicUrl = `/uploads/courses/${uniqueFileName}`;
    console.log(`File saved: ${filePath}`);
    console.log(`Public URL: ${publicUrl}`);
    
    // Step 4: Save URL in database
    // Connect to database
    await connectToDatabase();
    
    // Update course with new image URL
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      courseId,
      { imageUrl: publicUrl },
      { new: true }
    );
    
    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Return success response with URL and updated course
    return NextResponse.json({
      success: true,
      message: 'Course image uploaded successfully',
      url: publicUrl,
      course: {
        id: updatedCourse._id,
        name: updatedCourse.name,
        code: updatedCourse.code,
        imageUrl: updatedCourse.imageUrl
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload course image' },
      { status: 500 }
    );
  }
} 