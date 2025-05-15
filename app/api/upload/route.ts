import { NextResponse } from 'next/server';
import { cloudinaryUpload } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadedFiles: string[] = [];
    const fileMap: {[key: string]: string} = {};
    
    // Extract folder value - use last folder value if multiple exist
    let folderValue = 'uploads';
    const folderValues = formData.getAll('folder');
    if (folderValues.length > 0) {
      // Use the last folder value (most specific to each file)
      folderValue = String(folderValues[folderValues.length - 1]);
      // Remove all folder entries from formData to avoid processing them as files
      for (const entry of formData.entries()) {
        if (entry[0] === 'folder') {
          formData.delete('folder');
        }
      }
    }
    
    console.log(`Processing uploads with folder: ${folderValue}`);
    
    // Check if this is a single file upload (common case)
    const isSingleFileUpload = formData.has('file');
    let singleFileUrl = '';
    
    for (const [key, file] of formData.entries()) {
      if (file instanceof File) {
        console.log(`Processing file ${file.name}, size: ${file.size} bytes, key: ${key}`);
        
        // Convert the file to a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Use the specified folder or determine based on key and file
        let folder = folderValue;
        
        // If no specific student folder is provided, create a more organized structure
        if (!folder.includes('/')) {
          if (key.includes('photo') || file.name.includes('photo')) {
            folder = 'students/photos';
          } else if (key.includes('idcard') || file.name.includes('idcard')) {
            folder = 'students/idcards';
          } else if (key.includes('signature') || file.name.includes('sign')) {
            folder = 'students/signatures';
          } else if (key.includes('course') || file.name.includes('course')) {
            folder = 'courses';
          } else if (key.includes('banner') || file.name.includes('banner')) {
            folder = 'banners';
          } else if (key.includes('background') || file.name.includes('background')) {
            folder = 'backgrounds';
          } else if (file.type.includes('image')) {
            folder = 'images';
          }
        }
        
        // Add timestamp to filename to ensure uniqueness
        const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        // Upload to Cloudinary with public_id for better organization
        const result: any = await cloudinaryUpload(
          buffer, 
          folder,
          uniqueFileName
        );
        
        // Store the Cloudinary URL
        const secureUrl = result.secure_url;
        uploadedFiles.push(secureUrl);
        
        // Also store in a key-value map for named access
        fileMap[key] = secureUrl;
        
        // For single-file uploads, store URL specifically
        if (isSingleFileUpload && key === 'file') {
          singleFileUrl = secureUrl;
        }
        
        console.log(`Uploaded to Cloudinary, folder: ${folder}, URL: ${secureUrl}`);
      }
    }

    // For single file uploads, ensure we have a consistent response format
    // that works with existing code
    if (isSingleFileUpload && singleFileUrl) {
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        urls: [singleFileUrl],
        fileMap: { file: singleFileUrl }
      });
    }

    // For multiple files
    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      urls: uploadedFiles,
      fileMap: fileMap
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