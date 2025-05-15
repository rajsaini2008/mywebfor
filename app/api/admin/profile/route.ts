import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

// Get admin profile
export async function GET(request: NextRequest) {
  try {
    // In a real application, you should get the current user ID from the session
    // For now, we'll just get the admin user
    await connectToDatabase()
    
    const adminUser = await User.findOne({ role: "admin" })
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      )
    }
    
    // Return user data without sensitive information
    const profile = {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
    }
    
    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// Update admin profile
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { email, currentPassword, newPassword } = body
    
    // Find the admin user
    const adminUser = await User.findOne({ role: "admin" })
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      )
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, adminUser.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      )
    }
    
    // Update user data
    const updateData: any = {
      email,
    }
    
    // If new password provided, hash and update it
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }
    
    // Update the user
    await User.findByIdAndUpdate(adminUser._id, updateData)
    
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully" 
    })
  } catch (error) {
    console.error("Error updating admin profile:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    )
  }
} 