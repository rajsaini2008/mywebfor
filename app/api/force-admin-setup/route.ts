import { NextResponse } from "next/server";
import { ensureAdminExists } from "@/lib/seed-db";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Force create admin user with known credentials
    const adminEmail = "admin@krishnacomputers.com";
    const adminPassword = "admin123";
    
    // First check if admin exists
    const existingAdmin = await User.findOne({ role: "admin" });
    
    if (existingAdmin) {
      // Update existing admin's password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Admin password has been reset to default" 
      });
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Admin user created successfully" 
      });
    }
  } catch (error) {
    console.error("Error setting up admin:", error);
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to setup admin user", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 