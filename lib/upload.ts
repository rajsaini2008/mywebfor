import { put } from "@vercel/blob"

export async function uploadFile(file: File, folder = "uploads") {
  try {
    if (!file) {
      console.log("No file provided for upload");
      return null;
    }

    // Sanitize folder name and ensure it has a trailing slash if provided
    const sanitizedFolder = folder.trim().replace(/\s+/g, "-");
    const folderPath = sanitizedFolder ? `${sanitizedFolder}/` : "";
    
    // Sanitize filename to ensure it's URL-safe
    const sanitizedFilename = file.name.replace(/\s+/g, "-").toLowerCase();
    
    // Create a unique filename with timestamp
    const uniqueFilename = `${folderPath}${Date.now()}-${sanitizedFilename}`;
    
    console.log(`Uploading file ${sanitizedFilename} to ${folderPath}`);

    // Upload to blob storage
    const blob = await put(uniqueFilename, file, {
      access: "public",
    });

    if (!blob || !blob.url) {
      throw new Error("Upload completed but no URL was returned");
    }

    console.log(`File uploaded successfully, URL: ${blob.url}`);
    return blob.url;
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
    }
    
    // Generic fallback
    return `/placeholder.svg?text=${encodeURIComponent(fileName)}&width=400&height=400&id=${fileId}`;
  }
}
