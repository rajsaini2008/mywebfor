import mongoose from "mongoose"

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, "Please provide a student ID"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  fatherName: {
    type: String,
    required: [true, "Please provide father's name"],
  },
  motherName: {
    type: String,
    required: [true, "Please provide mother's name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: [true, "Please provide an address"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Please provide a date of birth"],
  },
  dateOfJoining: {
    type: Date,
  },
  gender: {
    type: String,
    required: [true, "Please provide a gender"],
  },
  aadharNo: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  city: {
    type: String,
  },
  landmark: {
    type: String,
  },
  pincode: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please provide a course"],
  },
  courseName: {
    type: String,
  },
  courseDuration: {
    type: mongoose.Schema.Types.Mixed,
  },
  courseFee: {
    type: Number,
    default: 0
  },
  admissionFee: {
    type: Number,
    default: 0
  },
  examFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalFee: {
    type: Number,
    default: 0
  },
  payableAmount: {
    type: Number,
    default: 0
  },
  installmentCount: {
    type: Number,
    default: 1
  },
  intervalInMonths: {
    type: Number,
    default: 0
  },
  admissionRemark: {
    type: String,
  },
  centerId: {
    type: String,
    required: [true, "Please provide a center ID"],
    index: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  photoUrl: {
    type: String,
    default: ''
  },
  signatureUrl: {
    type: String,
    default: ''
  },
  aadharCardUrl: {
    type: String,
    default: ''
  },
  previousMarksheetUrl: {
    type: String,
    default: ''
  },
  photoIdProofUrl: {
    type: String,
    default: ''
  },
  certificateProofUrl: {
    type: String,
    default: ''
  },
  idCardUrl: {
    type: String,
    default: ''
  },
  rollNo: {
    type: String,
    default: ''
  },
  photoIdType: {
    type: String,
    default: ''
  },
  photoIdNumber: {
    type: String,
    default: ''
  },
  qualificationType: {
    type: String,
    default: ''
  },
  certificateNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Completed", "Dropped"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // This will automatically handle createdAt and updatedAt
  strict: false // Change back to false to allow additional fields
})

export default mongoose.models.Student || mongoose.model("Student", StudentSchema)
