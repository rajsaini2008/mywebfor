import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()

    // Hash the password
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10)
    }

    // Create a new user
    const user = await User.create(body)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "An error occurred while creating the user" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const role = searchParams.get("role")

    if (id) {
      // Get a specific user
      const user = await User.findById(id)

      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
      }

      // Remove password from response
      const userResponse = user.toObject()
      delete userResponse.password

      return NextResponse.json({ success: true, data: userResponse })
    }

    // Get users by role if specified
    if (role) {
      const users = await User.find({ role }).sort({ createdAt: -1 })

      // Remove passwords from response
      const usersResponse = users.map((user) => {
        const userObj = user.toObject()
        delete userObj.password
        return userObj
      })

      return NextResponse.json({ success: true, data: usersResponse })
    }

    // Get all users
    const users = await User.find({}).sort({ createdAt: -1 })

    // Remove passwords from response
    const usersResponse = users.map((user) => {
      const userObj = user.toObject()
      delete userObj.password
      return userObj
    })

    return NextResponse.json({ success: true, data: usersResponse })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching users" }, { status: 500 })
  }
}
