import { NextRequest, NextResponse } from "next/server"
import { ensureAdminExists } from "@/lib/seed-db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forceReset = searchParams.get('force') === 'true'
    
    const result = await ensureAdminExists(forceReset)
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: forceReset ? "Admin user reset successfully" : "Admin user created successfully" 
      })
    } else {
      return NextResponse.json({ 
        success: true, 
        message: "Admin user already exists" 
      })
    }
  } catch (error) {
    console.error("Error setting up admin:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to setup admin user",
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 