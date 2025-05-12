/**
 * Course utility functions
 * Follows the 4-step approach shown in the screenshot:
 * 1. Upload image from form
 * 2. Save to server
 * 3. Generate URL
 * 4. Save URL in database
 */

/**
 * Upload a course image and associate it with a course
 * @param file The image file to upload
 * @param courseId The ID of the course to associate the image with
 * @returns The URL of the uploaded image, or empty string if upload fails
 */
export async function uploadCourseImage(file: File, courseId: string): Promise<string> {
  try {
    if (!file) {
      console.log('No file provided for course image upload');
      return '';
    }

    if (!courseId) {
      console.log('No course ID provided for image upload');
      return '';
    }

    // Step 1: Prepare file for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    console.log(`Uploading image for course ${courseId}: ${file.name} (${file.size} bytes)`);

    // Steps 2, 3, and 4 happen in the API
    const response = await fetch('/api/course-image-upload', {
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

    console.log(`Course image uploaded successfully, URL: ${result.url}`);
    
    // Return the URL of the uploaded image
    return result.url;
  } catch (error) {
    console.error('Error uploading course image:', error);
    return '';
  }
}

/**
 * Generate a placeholder image URL for a course
 * @param courseCode The code of the course
 * @param courseName The name of the course (optional)
 * @returns A URL for a placeholder image
 */
export function generateCoursePlaceholder(courseCode: string, courseName?: string): string {
  // Generate a consistent color based on the course code
  const colors = [
    'blue', 'green', 'red', 'orange', 'purple', 
    'pink', 'teal', 'indigo', 'yellow', 'cyan'
  ];
  const colorIndex = courseCode.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Use the course code as the text for the placeholder
  const text = encodeURIComponent(courseCode);
  
  // Return the placeholder URL
  return `/placeholder.svg?text=${text}&width=600&height=400&bg=${bgColor}`;
} 