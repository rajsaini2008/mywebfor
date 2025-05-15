import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching public legal documents");
    
    // Connect to database
    const conn = await connectToDatabase();
    
    // Ensure we have a database connection
    if (!mongoose.connection.db) {
      console.error("Database connection not established");
      throw new Error("Database connection not established");
    }
    
    const db = mongoose.connection.db;
    
    // Get documents
    const documents = await db
      .collection("legalDocuments")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${documents.length} legal documents`);
    
    // Log the first document (if exists) for debugging
    if (documents.length > 0) {
      console.log("Sample document:", {
        _id: documents[0]._id,
        title: documents[0].title,
        hasImage: !!documents[0].imageUrl,
        imageUrl: documents[0].imageUrl,
        hasFile: !!documents[0].fileUrl
      });
    }
    
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