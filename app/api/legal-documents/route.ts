import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { put, del } from "@vercel/blob";

// Use the existing database connection method from your project
import connectToDatabase from "@/lib/mongodb";
import { uploadFile } from "@/lib/upload";

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
};

// Type for extended session user
interface ExtendedSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
    role?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - using getServerSession directly
    const session = await getServerSession() as ExtendedSession;
    
    // Debug: Log session info
    console.log("GET Session data:", JSON.stringify(session, null, 2));
    
    // Temporarily bypass authentication for testing
    // if (!session || !session.user || session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Connect to database
    const conn = await connectToDatabase();
    
    // Ensure we have a database connection
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    
    const db = mongoose.connection.db;
    
    // Get documents
    const documents = await db
      .collection("legalDocuments")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching legal documents:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession() as ExtendedSession;
    
    // Debug: Log session info
    console.log("Session data:", JSON.stringify(session, null, 2));
    
    // Temporarily bypass authentication for testing
    // if (!session || !session.user || session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File || null;
    const image = formData.get("image") as File || null;
    
    // Log form data for debugging
    console.log("Form data received:", {
      title,
      description,
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      hasImage: !!image,
      imageType: image?.type,
      imageSize: image?.size
    });
    
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }
    
    if (!file && !image) {
      return NextResponse.json(
        { success: false, message: "At least a document file or an image is required" },
        { status: 400 }
      );
    }

    // Upload files and get URLs
    let fileUrl = null;
    let fileName = null;
    let imageUrl = null;
    
    // Process document file if provided
    if (file) {
      try {
        console.log("Uploading document file to Cloudinary...");
        fileUrl = await uploadFile(file, "legal-documents/files");
        fileName = file.name;
        console.log("Document file URL:", fileUrl);
      } catch (uploadError) {
        console.error("Error uploading document file:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload document file" },
          { status: 500 }
        );
      }
    }
    
    // Process image if provided
    if (image) {
      try {
        console.log("Uploading document cover image to Cloudinary...");
        imageUrl = await uploadFile(image, "legal-documents/covers");
        console.log("Document cover image URL:", imageUrl);
      } catch (uploadError) {
        console.error("Error uploading cover image:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload cover image" },
          { status: 500 }
        );
      }
    }
    
    // Connect to database
    const conn = await connectToDatabase();
    
    // Ensure we have a database connection
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    
    const db = mongoose.connection.db;
    
    // Save document metadata to database
    const result = await db.collection("legalDocuments").insertOne({
      title,
      description,
      fileName,
      fileUrl,
      imageUrl,
      createdAt: new Date(),
      createdBy: session?.user?.email || "admin@system.com",
    });
    
    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      documentId: result.insertedId,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession() as ExtendedSession;
    
    // Debug: Log session info
    console.log("DELETE Session data:", JSON.stringify(session, null, 2));
    
    // Temporarily bypass authentication for testing
    // if (!session || !session.user || session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Get document ID from query string
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Document ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const conn = await connectToDatabase();
    
    // Ensure we have a database connection
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    
    const db = mongoose.connection.db;
    
    // Find document
    const document = await db.collection("legalDocuments").findOne({
      _id: new ObjectId(id),
    });
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      );
    }
    
    // Delete files from blob storage if they exist
    try {
      if (document.fileUrl) {
        // Extract the blob URL path
        const fileUrl = new URL(document.fileUrl);
        await del(fileUrl.pathname);
      }
      
      if (document.imageUrl) {
        // Extract the blob URL path
        const imageUrl = new URL(document.imageUrl);
        await del(imageUrl.pathname);
      }
    } catch (deleteError) {
      console.error("Error deleting files from storage:", deleteError);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from database
    await db.collection("legalDocuments").deleteOne({
      _id: new ObjectId(id),
    });
    
    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete document" },
      { status: 500 }
    );
  }
} 