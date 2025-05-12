import mongoose from "mongoose"

// Define the schema if it doesn't exist
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    maxlength: [100, "Email cannot be more than 100 characters"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    maxlength: [15, "Phone number cannot be more than 15 characters"],
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject"],
    maxlength: [100, "Subject cannot be more than 100 characters"],
  },
  message: {
    type: String,
    required: [true, "Please provide a message"],
    maxlength: [1000, "Message cannot be more than 1000 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if the model exists before creating it to prevent overwriting
export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema)
