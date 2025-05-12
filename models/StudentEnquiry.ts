import mongoose from "mongoose"

// Define the schema for student enquiries
const StudentEnquirySchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  fatherName: {
    type: String,
    required: [true, "Please provide father's name"],
  },
  motherName: {
    type: String,
    required: [true, "Please provide mother's name"],
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
  address: {
    type: String,
    required: [true, "Please provide an address"],
  },
  gender: {
    type: String,
    required: [true, "Please provide gender"],
    enum: ["Male", "Female", "Other"],
  },
  dateOfBirth: {
    type: String,
    required: [true, "Please provide date of birth"],
  },
  education: {
    type: String,
    required: [true, "Please provide education qualification"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please select a course"],
  },
  message: {
    type: String,
  },
  preferredTime: {
    type: String,
    enum: ["Morning", "Afternoon", "Evening", "Weekend"],
  },
  status: {
    type: String,
    enum: ["New", "Contacted", "Enrolled", "Rejected"],
    default: "New",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if the model exists before creating it to prevent overwriting
export default mongoose.models.StudentEnquiry || mongoose.model("StudentEnquiry", StudentEnquirySchema) 