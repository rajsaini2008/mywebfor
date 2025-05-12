import mongoose from "mongoose"

// Define interfaces for TypeScript
export interface ISubjectDetails {
  subjectId: string;
  subjectName: string;
  numberOfQuestions: number;
  isIndividual: boolean;
  passingMarks: number;
  theoreticalMarks: number;
  practicalMarks: number;
}

export interface IExamPaper {
  _id: string;
  paperId: string;
  paperType: string;
  examType: string;
  paperName: string;
  totalQuestions: number;
  correctMarksPerQuestion: number;
  passingMarks: number;
  time: number;
  startDate: Date;
  endDate: Date;
  reAttempt: number;
  reAttemptTime: number;
  isNegativeMark: boolean;
  negativeMarks: number;
  positiveMarks: number;
  courseType: string;
  course: mongoose.Types.ObjectId;
  subjects: ISubjectDetails[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SubjectDetailsSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  numberOfQuestions: {
    type: Number,
    default: 0
  },
  isIndividual: {
    type: Boolean,
    default: false
  },
  passingMarks: {
    type: Number,
    default: 0
  },
  theoreticalMarks: {
    type: Number,
    default: 0
  },
  practicalMarks: {
    type: Number,
    default: 0
  }
})

const ExamPaperSchema = new mongoose.Schema({
  paperId: {
    type: String,
    required: true,
    unique: true
  },
  paperType: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    required: true,
    default: "Main"
  },
  paperName: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctMarksPerQuestion: {
    type: Number,
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reAttempt: {
    type: Number,
    default: 0,
  },
  reAttemptTime: {
    type: Number,
    default: 0,
  },
  isNegativeMark: {
    type: Boolean,
    default: false,
  },
  negativeMarks: {
    type: Number,
    default: 0,
  },
  positiveMarks: {
    type: Number,
    default: 0,
  },
  courseType: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  subjects: {
    type: [SubjectDetailsSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
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

// Handle model compilation
let ExamPaper;
try {
  // Try to get the existing model
  ExamPaper = mongoose.model('ExamPaper');
} catch (error) {
  // Model doesn't exist, compile it
  ExamPaper = mongoose.model('ExamPaper', ExamPaperSchema);
}

export default ExamPaper 