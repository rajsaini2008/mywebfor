import mongoose from "mongoose"

// Define the Subject schema directly
const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a subject name"],
  },
  code: {
    type: String,
    required: [true, "Please provide a subject code"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  totalPracticalMarks: {
    type: Number,
    default: 50,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Export the model
const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema)

export default Subject
