import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import TeamMember from "@/models/TeamMember"

// GET all team members
export async function GET(request: Request) {
  try {
    await connectToDatabase()
    
    // Get query params (for filtering if needed)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    // If id is provided, fetch a specific team member
    if (id) {
      const teamMember = await TeamMember.findById(id)
      
      if (!teamMember) {
        return NextResponse.json(
          { success: false, message: "Team member not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: teamMember })
    }
    
    // Fetch all team members sorted by order
    const teamMembers = await TeamMember.find().sort({ order: 1 })
    
    return NextResponse.json({ success: true, data: teamMembers })
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

// POST a new team member
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.position || !data.description || !data.imageUrl) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Find the highest order value to position the new member at the end
    const lastMember = await TeamMember.findOne().sort({ order: -1 })
    const newOrder = lastMember ? lastMember.order + 1 : 1
    
    // Create the new team member
    const newTeamMember = await TeamMember.create({
      ...data,
      order: newOrder
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Team member added successfully",
      data: newTeamMember
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add team member" },
      { status: 500 }
    )
  }
}

// PUT (update) a team member
export async function PUT(request: Request) {
  try {
    await connectToDatabase()
    
    const data = await request.json()
    
    // Validate ID
    if (!data._id) {
      return NextResponse.json(
        { success: false, message: "Missing team member ID" },
        { status: 400 }
      )
    }
    
    // Update the team member
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      data._id,
      { $set: data },
      { new: true, runValidators: true }
    )
    
    if (!updatedTeamMember) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Team member updated successfully",
      data: updatedTeamMember
    })
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update team member" },
      { status: 500 }
    )
  }
}

// DELETE a team member
export async function DELETE(request: Request) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing team member ID" },
        { status: 400 }
      )
    }
    
    const deletedTeamMember = await TeamMember.findByIdAndDelete(id)
    
    if (!deletedTeamMember) {
      return NextResponse.json(
        { success: false, message: "Team member not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Team member deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete team member" },
      { status: 500 }
    )
  }
} 