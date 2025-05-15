import mongoose from "mongoose"

const GalleryItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ["image", "video"],
    required: [true, "Please specify the item type"],
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: ["campus", "classrooms", "events", "students"],
    required: [true, "Please select a category"],
  },
  imageUrl: {
    type: String,
    required: function() { return this.itemType === "image"; },
  },
  videoUrl: {
    type: String,
    required: function() { return this.itemType === "video"; },
  },
  thumbnailUrl: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
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

// Create indexes for faster querying
GalleryItemSchema.index({ category: 1, isActive: 1 });
GalleryItemSchema.index({ itemType: 1, isActive: 1 });

// Update timestamps on save
GalleryItemSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.GalleryItem || mongoose.model("GalleryItem", GalleryItemSchema) 