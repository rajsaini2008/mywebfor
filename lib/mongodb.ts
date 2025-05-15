import mongoose from "mongoose"

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 
  "mongodb+srv://rajindoriyaofficial5:raj123@cluster0.b6ybqao.mongodb.net/krishnakaman"

// Track connection status
let isConnected = false

// Simple direct connection function
async function connectToDatabase() {
  try {
    // Check if already connected
    if (isConnected) {
      console.log("Using existing MongoDB connection")
      return mongoose.connection
    }
    
    // Check if there's a pending connection
    if (mongoose.connection.readyState === 2) {
      console.log("MongoDB connection is pending, waiting...")
      await new Promise(resolve => setTimeout(resolve, 1000))
      return connectToDatabase()
    }
    
    // If there's a connection in disconnecting state, wait for it
    if (mongoose.connection.readyState === 3) {
      console.log("MongoDB is disconnecting, waiting...")
      await new Promise(resolve => setTimeout(resolve, 1000))
      return connectToDatabase()
    }
    
    // If we have a connection but it's disconnected, clean it up
    if (mongoose.connection.readyState === 0 && Object.keys(mongoose.connections).length > 0) {
      console.log("Cleaning up disconnected MongoDB connection...")
      await mongoose.disconnect()
    }
    
    console.log("Connecting to MongoDB:", MONGODB_URI)
    
    // Connect with explicit options for reliability
    const conn = await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      maxPoolSize: 10,         // Maximum number of connections
      serverSelectionTimeoutMS: 30000, // Server selection timeout
    })
    
    isConnected = true
    console.log("MongoDB connected successfully")
    
    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
      isConnected = false
    })
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
      isConnected = false
    })
    
    return conn.connection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    isConnected = false
    
    // Additional debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    // Attempt reconnection after error
    console.log("Will retry connection in 5 seconds...")
    await new Promise(resolve => setTimeout(resolve, 5000))
    return connectToDatabase()
  }
}

// Add named export for compatibility with existing code
export const connectToDB = connectToDatabase

export default connectToDatabase
