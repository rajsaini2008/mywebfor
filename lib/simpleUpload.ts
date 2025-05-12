/**
 * Simple file upload service that follows the 4-step approach:
 * 1. Image Upload from form
 * 2. Save image to server/uploads folder
 * 3. Generate URL for the image
 * 4. Save URL in database field
 */

// Base URL for the domain - replace with your actual domain in production
const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || 'http://localhost:3000';

/**
 * Upload file to local uploads directory
 * @param file The file to upload
 * @param folder The subfolder to place the file in
 * @returns The URL of the uploaded file
 */
export async function simpleUploadFile(file: File, folder = 'uploads'): Promise<string> {
  try {
    if (!file) {
      console.log('No file provided for upload');
      return '';
    }

    // 1. Process the file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
    
    // Define the folder path
    const sanitizedFolder = folder.trim().replace(/\s+/g, '-');
    const folderPath = sanitizedFolder ? `${sanitizedFolder}/` : '';
    const uploadPath = `public/uploads/${folderPath}`;
    
    // 2. Create directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Save file to the uploads directory
    const filePath = path.join(uploadPath, uniqueFilename);
    fs.writeFileSync(filePath, buffer);
    console.log(`File saved to ${filePath}`);
    
    // 3. Generate the URL for accessing the file
    const publicUrl = `/uploads/${folderPath}${uniqueFilename}`;
    console.log(`Public URL: ${publicUrl}`);
    
    // 4. Return the URL to be saved in the database
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return '';
  }
}

/**
 * Generate a fallback image URL if upload fails
 * @param type Type of image (photo, id, signature, etc.)
 * @param id Identifier for the image
 * @returns Fallback URL for the image
 */
export function generateFallbackImageUrl(type: string, id: string): string {
  const baseUrl = `/placeholder.svg?width=400&height=400`;
  
  switch (type) {
    case 'photo':
      return `${baseUrl}&text=PHOTO-${id}`;
    case 'idCard':
      return `${baseUrl}&text=ID-${id}`;
    case 'signature':
      return `${baseUrl}&text=SIGN-${id}&height=100`;
    case 'course':
      return `${baseUrl}&text=COURSE-${id}&width=600`;
    default:
      return `${baseUrl}&text=${id}`;
  }
} 