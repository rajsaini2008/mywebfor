import mongoose from "mongoose"

const styleSchema = new mongoose.Schema({
  fontSize: { type: String, required: true },
  fontWeight: { type: String, required: true },
  fontStyle: { type: String, required: true },
  color: { type: String, required: true }
}, { _id: false })

const positionSchema = new mongoose.Schema({
  top: { type: Number, required: true },
  left: { type: Number, required: true }
}, { _id: false })

const sizeSchema = new mongoose.Schema({
  width: { type: Number, required: true },
  height: { type: Number, required: true }
}, { _id: false })

const templateConfigSchema = new mongoose.Schema({
  templateId: { type: String, required: true },
  type: { type: String, required: true, enum: ['certificate', 'marksheet'] },
  
  // Positions
  studentNamePosition: { type: positionSchema, required: true },
  courseNamePosition: { type: positionSchema, required: true },
  percentagePosition: { type: positionSchema, required: true },
  gradePosition: { type: positionSchema, required: true },
  durationPosition: { type: positionSchema, required: true },
  datePosition: { type: positionSchema, required: true },
  photoPosition: { type: positionSchema, required: true },
  certificateNumberPosition: { type: positionSchema, required: true },
  subjectsPosition: { type: positionSchema },
  
  // Sizes
  photoSize: { type: sizeSchema, required: true },
  
  // Styles
  studentNameStyle: { type: styleSchema, required: true },
  courseNameStyle: { type: styleSchema, required: true },
  percentageStyle: { type: styleSchema, required: true },
  gradeStyle: { type: styleSchema, required: true },
  durationStyle: { type: styleSchema, required: true },
  dateStyle: { type: styleSchema, required: true },
  certificateNumberStyle: { type: styleSchema, required: true },
  subjectsStyle: { type: styleSchema }
}, {
  timestamps: true
})

// Create a compound unique index on templateId and type
templateConfigSchema.index({ templateId: 1, type: 1 }, { unique: true })

const TemplateConfig = mongoose.models.TemplateConfig || mongoose.model('TemplateConfig', templateConfigSchema)

export default TemplateConfig 