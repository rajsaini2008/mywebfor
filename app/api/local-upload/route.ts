import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for file uploads - now redirects to Cloudinary-based upload
 * Takes the same params but forwards to Cloudinary upload
 */
export async function POST(request: NextRequest) {
  try {
    // Simply forward to the new Cloudinary API endpoint
    const response = await fetch(new URL('/api/upload', request.url).toString(), {
      method: 'POST',
      body: await request.formData(),
      headers: {
        // Forward relevant headers
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'user-agent': request.headers.get('user-agent') || '',
      },
    });

    // Return the response from the new API
    const result = await response.json();
    
    // Format the response to match what client code expects
    if (result.success && result.urls && result.urls.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        url: result.urls[0],
        fileName: result.originalName || 'unknown',
        size: result.size || 0,
        type: result.type || 'unknown'
      });
    }

    // Pass through error response
    return NextResponse.json(
      { success: false, message: result.message || 'Upload failed' },
      { status: response.status }
    );
  } catch (error: any) {
    console.error('Upload redirection error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
} 