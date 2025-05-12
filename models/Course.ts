import mongoose from "mongoose"

// Define the schema directly
const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a course name"],
  },
  code: {
    type: String,
    required: [true, "Please provide a course code"],
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a course description"],
  },
  duration: {
    type: String,
    required: [true, "Please provide a course duration"],
  },
  fee: {
    type: Number,
    required: [true, "Please provide a course fee"],
  },
  imageUrl: {
    type: String,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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

// Check if the model exists already
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema)

export default Course
