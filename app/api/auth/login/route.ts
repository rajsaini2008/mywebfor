import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Student from "@/models/Student"
import SubCenter from "@/models/SubCenter" 
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Parse the request body
    const body = await request.json()
    const { type, identifier, password } = body
    
    console.log(`Login attempt: type=${type}, identifier=${identifier}`);
    
    if (!type || !identifier || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 })
    }
    
    // Try to find user in the Users collection first
    try {
      console.log(`Searching for user with identifier: ${identifier}`)
      
      const user = await User.findOne({ 
        $or: [
          { username: identifier },
          { email: identifier }
        ]
      });
      
      console.log(`User search result: ${user ? 'Found user' : 'User not found'}`)
      
      if (user) {
        console.log(`User found with role: ${user.role}, id: ${user._id}`)
        
        // Verify if password matches (assuming it's hashed)
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match result: ${passwordMatch ? 'Password matches' : 'Password does not match'}`)
        
        if (passwordMatch) {
          // If this is the right role, return success
          if (
            (type === "student" && user.role === "student") ||
            (type === "subcenter" && user.role === "atc") ||
            (type === "admin" && user.role === "admin")
          ) {
            console.log(`Successful login for ${type} with identifier: ${identifier}`)
            
            // Don't return the password in the response
            const userObj = user.toObject();
            delete userObj.password;
            
            return NextResponse.json({ 
              success: true, 
              message: "Login successful",
              user: userObj
            })
          } else {
            console.log(`Role mismatch. Expected: ${type}, Actual: ${user.role}`)
          }
        }
      }
    } catch (userError) {
      console.log("Error searching Users collection:", userError);
    }
    
    // If not found in User collection or password didn't match, try specific collections
    if (type === "student") {
      const student = await Student.findOne({ studentId: identifier })
      
      if (!student) {
        return NextResponse.json({ 
          success: false, 
          message: "Student not found" 
        }, { status: 404 })
      }
      
      // Check if password matches
      if (student.password === password) {
        // Don't return the password in the response
        const studentObj = student.toObject();
        delete studentObj.password;
        
        return NextResponse.json({ 
          success: true,
          message: "Login successful",
          user: studentObj
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid password" 
        }, { status: 401 })
      }
    } else if (type === "subcenter") {
      const subcenter = await SubCenter.findOne({ 
        $or: [
          { centerId: identifier },
          { centerCode: identifier }
        ]
      })
      
      if (!subcenter) {
        return NextResponse.json({ 
          success: false, 
          message: "Sub center not found" 
        }, { status: 404 })
      }
      
      // Check if password matches
      if (subcenter.password === password) {
        // Don't return the password in the response
        const subcenterObj = subcenter.toObject();
        delete subcenterObj.password;
        
        return NextResponse.json({ 
          success: true,
          message: "Login successful",
          user: subcenterObj
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid password" 
        }, { status: 401 })
      }
    }
    
    // If we get here, authentication failed
    return NextResponse.json({ 
      success: false, 
      message: "Authentication failed" 
    }, { status: 401 })
    
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred during login"
    }, { status: 500 })
  }
} 