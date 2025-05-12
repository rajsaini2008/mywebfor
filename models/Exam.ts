import mongoose from "mongoose"

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, "Please provide a question"],
  },
  optionA: {
    type: String,
    required: [true, "Please provide option A"],
  },
  optionB: {
    type: String,
    required: [true, "Please provide option B"],
  },
  optionC: {
    type: String,
    required: [true, "Please provide option C"],
  },
  optionD: {
    type: String,
    required: [true, "Please provide option D"],
  },
  correctOption: {
    type: String,
    required: [true, "Please provide the correct option"],
    enum: ["A", "B", "C", "D"],
  },
})

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide an exam name"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Please provide a subject"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please provide a course"],
  },
  duration: {
    type: Number, // in minutes
    required: [true, "Please provide a duration"],
  },
  passingMarks: {
    type: Number,
    required: [true, "Please provide passing marks"],
  },
  totalMarks: {
    type: Number,
    required: [true, "Please provide total marks"],
  },
  questions: [QuestionSchema],
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

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema)
