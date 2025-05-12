import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-db"

export async function GET() {
  try {
    await seedDatabase()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while initializing the database" },
      { status: 500 },
    )
  }
}
