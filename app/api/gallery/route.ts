import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import GalleryItem from "@/models/Gallery";

// GET all gallery items
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "";
    const itemType = url.searchParams.get("itemType") || "";
    
    await connectToDB();
    
    let query: any = { isActive: true };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (itemType) {
      query.itemType = itemType;
    }
    
    const galleryItems = await GalleryItem.find(query).sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: galleryItems });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// POST - create a new gallery item
export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/gallery called");
    
    const data = await req.json();
    console.log("Received data:", data);
    
    try {
      console.log("Connecting to MongoDB...");
      await connectToDB();
      console.log("MongoDB connected successfully");
    } catch (dbError) {
      console.error("MongoDB connection error:", dbError);
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }
    
    // Validate data
    if (!data.title || !data.category) {
      console.error("Missing required fields: title or category");
      return NextResponse.json(
        { success: false, message: "Title and category are required" },
        { status: 400 }
      );
    }
    
    if (data.itemType === "image" && !data.imageUrl) {
      console.error("Missing required field: imageUrl for image type");
      return NextResponse.json(
        { success: false, message: "Image URL is required for image items" },
        { status: 400 }
      );
    }
    
    if (data.itemType === "video" && !data.videoUrl) {
      console.error("Missing required field: videoUrl for video type");
      return NextResponse.json(
        { success: false, message: "Video URL is required for video items" },
        { status: 400 }
      );
    }
    
    // Create new item
    console.log("Creating new gallery item...");
    const newItem = await GalleryItem.create(data);
    console.log("Gallery item created:", newItem);
    
    return NextResponse.json(
      { success: true, message: "Gallery item created successfully", data: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating gallery item:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { success: false, message: `Failed to create gallery item: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 