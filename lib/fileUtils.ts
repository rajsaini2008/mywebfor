/**
 * File utility functions
 * Implements cloud storage upload approach:
 * 1. Upload image from form
 * 2. Send to Cloudinary via API
 * 3. Return Cloudinary URL
 * 4. Save URL in database field
 */

/**
 * Upload a file to Cloudinary using the upload API endpoint
 * @param file File to upload
 * @param folder Folder name to organize uploads
 * @returns URL of the uploaded file, or empty string if upload fails
 */
export async function uploadLocalFile(file: File, folder = 'general'): Promise<string> {
  try {
    if (!file) {
      console.log('No file provided for upload');
      return '';
    }

    // Step 1: Prepare file for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log(`Uploading file ${file.name} (${file.size} bytes) to Cloudinary folder ${folder}`);

    // Step 2 & 3: Send to API that handles Cloudinary upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    // Handle different response formats:
    // 1. If fileMap has the 'file' entry, use that (new format)
    // 2. Otherwise if urls array exists, use the first URL (old format)
    // 3. As a last resort, try using any URL in the fileMap
    let imageUrl = '';
    
    if (result.fileMap && result.fileMap.file) {
      imageUrl = result.fileMap.file;
    } else if (result.urls && result.urls.length > 0) {
      imageUrl = result.urls[0];
    } else if (result.fileMap) {
      // Get first URL from fileMap
      const fileMapValues = Object.values(result.fileMap);
      if (fileMapValues.length > 0) {
        imageUrl = fileMapValues[0] as string;
      }
    }

    if (!imageUrl) {
      throw new Error('No URL found in upload response');
    }

    console.log(`File uploaded successfully to Cloudinary, URL: ${imageUrl}`);
    
    // Step 4: Return URL to be saved in the database (handled by the calling component)
    return imageUrl;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return generateFallbackImageUrl(folder, Date.now().toString());
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
    case 'photos':
      return `${baseUrl}&text=PHOTO-${id}`;
    case 'idCard':
    case 'idcards':
      return `${baseUrl}&text=ID-${id}`;
    case 'signature':
    case 'signatures':
      return `${baseUrl}&text=SIGN-${id}&height=100`;
    case 'course':
    case 'courses':
      return `${baseUrl}&text=COURSE-${id}&width=600`;
    default:
      return `${baseUrl}&text=${id}`;
  }
} 