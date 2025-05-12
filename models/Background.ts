import mongoose from "mongoose"

const BackgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for the template"],
  },
  type: {
    type: String,
    enum: ["certificate", "marksheet", "subcenter"],
    required: [true, "Please provide a template type"],
  },
  imageUrl: {
    type: String,
    required: [true, "Please provide an image URL"],
  },
  isActive: {
    type: Boolean,
    default: false,
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

// Update updatedAt on save
BackgroundSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Create or get the model
const Background = mongoose.models.Background || mongoose.model("Background", BackgroundSchema)

export default Background
