import connectToDatabase from "./mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  try {
    await connectToDatabase()

    // Check if admin user exists
    const adminExists = await User.findOne({ role: "admin" })

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10)
      await User.create({
        username: "admin",
        email: "admin@krishnacomputers.com",
        password: hashedPassword,
        role: "admin",
      })
      console.log("Admin user created successfully")
    }

    console.log("Database seeding completed")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}
