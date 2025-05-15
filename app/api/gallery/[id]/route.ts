import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import GalleryItem from "@/models/Gallery";
import mongoose from "mongoose";

// GET a single gallery item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid gallery item ID" },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    const galleryItem = await GalleryItem.findById(id);
    
    if (!galleryItem) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: galleryItem });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}

// PUT - update a gallery item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid gallery item ID" },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    // Find and update the item
    const updatedItem = await GalleryItem.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Gallery item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE - remove a gallery item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid gallery item ID" },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    const deletedItem = await GalleryItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
} 