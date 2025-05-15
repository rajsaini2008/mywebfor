import { put } from "@vercel/blob"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dhsebufhc",
  api_key: "282789619175981",
  api_secret: "LONu1tS8eqp240QL0GdkuU2pYIk",
});

export async function uploadFile(file: File, folder = "uploads") {
  try {
    if (!file) {
      console.log("No file provided for upload");
      return null;
    }

    console.log(`Uploading file ${file.name} to ${folder} using Cloudinary`);
    
    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Add timestamp to filename to ensure uniqueness
    const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Use Cloudinary for uploads
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: uniqueFileName.replace(/\.[^/.]+$/, ""), // Remove extension from public_id
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("File uploaded successfully to Cloudinary, URL:", result?.secure_url);
            resolve(result?.secure_url);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // Create a fallback URL based on the file type
    const fileType = file?.type || "";
    const fileName = file?.name || "file";
    const fileId = Date.now().toString();
    
    // Generate different placeholders based on the folder/context
    if (folder.includes("photos")) {
      return `/placeholder.svg?text=Photo&width=400&height=400&id=${fileId}`;
    } else if (folder.includes("idcards")) {
      return `/placeholder.svg?text=ID-Card&width=400&height=300&id=${fileId}`;
    } else if (folder.includes("signatures")) {
      return `/placeholder.svg?text=Signature&width=400&height=100&id=${fileId}`;
    } else if (folder.includes("courses")) {
      return `/placeholder.svg?text=Course&width=600&height=400&id=${fileId}`;
    } else if (folder.includes("legal-documents")) {
      return `/placeholder.svg?text=Legal-Document&width=600&height=400&id=${fileId}`;
    }
    
    // Generic fallback
    return `/placeholder.svg?text=${encodeURIComponent(fileName)}&width=400&height=400&id=${fileId}`;
  }
}
