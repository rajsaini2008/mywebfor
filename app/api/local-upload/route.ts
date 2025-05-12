import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';

/**
 * API route for local file uploads
 * Follows the 4-step approach from the screenshot:
 * 1. Accept uploaded file from form
 * 2. Save file to local /uploads directory
 * 3. Generate a public URL for the file
 * 4. Return URL to be saved in database
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Extract file information
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Create folder path
    const sanitizedFolder = folder.replace(/\s+/g, '-').toLowerCase();
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedFolder);
    
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
    
    // Generate public URL
    const publicUrl = `/uploads/${sanitizedFolder}/${uniqueFileName}`;
    
    console.log(`File saved: ${filePath}`);
    console.log(`Public URL: ${publicUrl}`);

    // Return success response with URL
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
} 