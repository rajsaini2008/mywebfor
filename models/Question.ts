import mongoose, { Model, Document } from "mongoose"

// Define the Question interface for TypeScript
export interface IQuestion extends Document {
  paperId: string;
  subjectId: string;
  subjectName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new mongoose.Schema({
  paperId: {
    type: String,
    required: [true, "Please provide paper ID"],
    index: true
  },
  subjectId: {
    type: String,
    required: [true, "Please provide subject ID"],
    index: true
  },
  subjectName: {
    type: String,
    required: [true, "Please provide subject name"]
  },
  questionText: {
    type: String,
    required: [true, "Please provide a question"]
  },
  optionA: {
    type: String,
    required: [true, "Please provide option A"]
  },
  optionB: {
    type: String,
    required: [true, "Please provide option B"]
  },
  optionC: {
    type: String,
    required: [true, "Please provide option C"]
  },
  optionD: {
    type: String,
    required: [true, "Please provide option D"]
  },
  correctOption: {
    type: String,
    required: [true, "Please provide the correct option"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Create compound index on paperId and subjectId for faster queries
QuestionSchema.index({ paperId: 1, subjectId: 1 });

// Create the Question model
let Question: Model<IQuestion>;
try {
  // Try to get the existing model
  Question = mongoose.model<IQuestion>('Question');
} catch (error) {
  // Model doesn't exist, compile it
  Question = mongoose.model<IQuestion>('Question', QuestionSchema);
}

export default Question 