import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryUpload } from '@/lib/cloudinary';

/**
 * API endpoint for handling favicon image uploads
 * Uses Cloudinary for storage instead of local file system
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Add timestamp to filename to ensure uniqueness
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `favicon-${Date.now()}-${fileName}`;
    
    // Upload to Cloudinary with the "cms" folder
    const result = await cloudinaryUpload(buffer, 'cms', uniqueFileName);
    
    // Return success response with Cloudinary URL
    return NextResponse.json({
      success: true,
      message: 'Favicon image uploaded successfully',
      url: result.secure_url
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload favicon image' },
      { status: 500 }
    );
  }
} 