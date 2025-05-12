import mongoose from "mongoose"

const SubCenterSchema = new mongoose.Schema({
  centerId: {
    type: String,
    required: [true, "Please provide a center ID"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  address: {
    type: String,
    required: [true, "Please provide an address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  ownerImage: {
    type: String,
    default: "",
  },
  photoIdImage: {
    type: String,
    default: "",
  },
  centerLogo: {
    type: String,
    default: "",
  },
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

export default mongoose.models.SubCenter || mongoose.model("SubCenter", SubCenterSchema)
