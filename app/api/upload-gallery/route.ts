import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with direct values since env variables aren't available
cloudinary.config({
  cloud_name: "dhsebufhc",
  api_key: "282789619175981",
  api_secret: "LONu1tS8eqp240QL0GdkuU2pYIk",
});

export async function POST(req: NextRequest) {
  try {
    console.log("Upload gallery API route called");
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "gallery";
    const category = formData.get("category") as string || "general";
    
    console.log("File received:", file?.name, "Size:", file?.size);
    console.log("Folder:", folder);
    console.log("Category:", category);
    
    if (!file) {
      console.error("No file received in request");
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }
    
    if (file.size === 0) {
      console.error("File has zero size");
      return NextResponse.json(
        { success: false, message: "File has zero size" },
        { status: 400 }
      );
    }
    
    // Convert file to arrayBuffer first
    let arrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log("File converted to arrayBuffer, size:", arrayBuffer.byteLength);
    } catch (arrayBufferError) {
      console.error("Error converting file to arrayBuffer:", arrayBufferError);
      return NextResponse.json(
        { success: false, message: `Error converting file to arrayBuffer: ${arrayBufferError instanceof Error ? arrayBufferError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    
    // Convert arrayBuffer to Buffer
    let buffer;
    try {
      buffer = Buffer.from(arrayBuffer);
      console.log("ArrayBuffer converted to Buffer, size:", buffer.length);
    } catch (bufferError) {
      console.error("Error converting arrayBuffer to Buffer:", bufferError);
      return NextResponse.json(
        { success: false, message: `Error converting to Buffer: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    
    // Upload to Cloudinary
    try {
      console.log("Starting Cloudinary upload...");
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/${category}`,
            resource_type: "auto",
            public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success:", result?.secure_url);
              resolve(result);
            }
          }
        );
        
        // Handle possible upload stream errors
        uploadStream.on('error', (error) => {
          console.error("Upload stream error:", error);
          reject(error);
        });
        
        uploadStream.end(buffer);
      }) as any;
      
      console.log("Upload complete, returning URL:", uploadResult.secure_url);
      
      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    } catch (uploadError) {
      console.error("Error during Cloudinary upload:", uploadError);
      return NextResponse.json(
        { success: false, message: `Error during upload: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { success: false, message: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Remove the config export as it's no longer needed in Next.js 13+
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }; 