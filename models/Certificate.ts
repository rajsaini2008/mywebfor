import mongoose from "mongoose"

const CertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: [true, "Please provide a certificate ID"],
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Please provide a student"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please provide a course"],
  },
  centerId: {
    type: String,
    required: [true, "Please provide a center ID"],
    index: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  backgroundTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Background",
  },
  certificateUrl: {
    type: String,
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

export default mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema)
