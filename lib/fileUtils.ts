/**
 * File utility functions
 * Implements the 4-step approach shown in the screenshot:
 * 1. Upload image from form
 * 2. Save to server/uploads folder
 * 3. Generate URL
 * 4. Save URL in database field
 */

/**
 * Upload a file to the server using the local-upload API endpoint
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

    console.log(`Uploading file ${file.name} (${file.size} bytes) to folder ${folder}`);

    // Step 2 & 3: Send to API that handles saving and URL generation
    const response = await fetch('/api/local-upload', {
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

    console.log(`File uploaded successfully, URL: ${result.url}`);
    
    // Step 4: Return URL to be saved in the database (handled by the calling component)
    return result.url;
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