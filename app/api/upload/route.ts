import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFiles: { [key: string]: string } = {};
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'students');
    
    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      console.log(`Creating upload directory: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    }

    console.log(`Processing ${formData.entries.length} files for upload`);
    
    // Process each file in the form data
    for (const [fieldName, file] of formData.entries()) {
      if (file instanceof File) {
        console.log(`Processing file: ${fieldName}, filename: ${file.name}, size: ${file.size} bytes`);
        
        // Generate a unique filename
        const fileName = `${uuidv4()}-${file.name}`;
        const filePath = join(uploadDir, fileName);
        
        // Convert the file to a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save the file
        await writeFile(filePath, buffer);
        
        // Store the public URL
        const fileUrl = `/uploads/students/${fileName}`;
        uploadedFiles[fieldName] = fileUrl;
        
        console.log(`File saved: ${fieldName} -> ${fileUrl}`);
      }
    }

    console.log('Upload complete. Uploaded files:', uploadedFiles);
    
    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      urls: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload files',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 