import mongoose from "mongoose"

const ActivitySchema = new mongoose.Schema({
  activity: {
    type: String,
    required: [true, "Please provide an activity description"],
  },
  type: {
    type: String,
    enum: ["student", "course", "payment", "certificate", "other"],
    default: "other",
  },
  // Optional reference to related entity
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "entityModel",
  },
  entityModel: {
    type: String,
    enum: ["Student", "Course", "User", "Certificate", "SubCenter"],
  },
  // Center ID to associate activity with specific subcenter
  centerId: {
    type: String,
    index: true,
  },
  // Additional metadata if needed
  metadata: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add index for faster queries on createdAt for recent activities
ActivitySchema.index({ createdAt: -1 })

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema) 