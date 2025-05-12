import mongoose from 'mongoose'

const examApplicationSchema = new mongoose.Schema({
  examPaperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamPaper',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    default: ''
  },
  studentIdNumber: {
    type: String,
    default: ''
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  paperType: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'approved'],
    default: 'scheduled'
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  certificateNo: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values (only enforces uniqueness for non-null values)
  },
  subjectMarks: {
    type: Map,
    of: {
      theoryMarks: {
        type: Number,
        default: 0
      },
      practicalMarks: {
        type: Number,
        default: 0
      }
    },
    default: {}
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Create a compound index to prevent duplicate applications
examApplicationSchema.index({ examPaperId: 1, studentId: 1 }, { unique: true })

// Update the updatedAt field on save
examApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const ExamApplication = mongoose.models.ExamApplication || mongoose.model('ExamApplication', examApplicationSchema)

export default ExamApplication 