import mongoose, { Document, Schema } from "mongoose"

// Define the interface for the CMS content document
export interface ICmsContent extends Document {
  section: string
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}

// Define the schema for the CMS content
const CmsContentSchema = new Schema<ICmsContent>(
  {
    section: {
      type: String,
      required: [true, "Section is required"],
      index: true
    },
    key: {
      type: String,
      required: [true, "Key is required"],
      index: true
    },
    value: {
      type: String,
      required: [true, "Value is required"]
    }
  },
  {
    timestamps: true
  }
)

// Create a compound index for section and key
CmsContentSchema.index({ section: 1, key: 1 }, { unique: true })

const CmsContent = mongoose.models.CmsContent || mongoose.model<ICmsContent>("CmsContent", CmsContentSchema)

export default CmsContent 