import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Student from "@/models/Student"
import mongoose from "mongoose"

// Define an interface for the student data
interface StudentData {
  [key: string]: any; // This allows additional properties
  studentId: string;
  name: string;
  email: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  dateOfJoining: Date;
  enrollmentDate: Date;
  gender: string;
  aadharNo: string;
  course: string;
  state: string;
  district: string;
  city: string;
  address: string;
  landmark: string;
  pincode: string;
  phone: string;
  mobile: string;
  photoUrl: string;
  signatureUrl: string;
  aadharCardUrl: string;
  previousMarksheetUrl: string;
  photoIdProofUrl: string;
  certificateProofUrl: string;
  rollNo: string;
  photoIdType: string;
  photoIdNumber: string;
  qualificationType: string;
  certificateNumber: string;
  courseFee: number;
  admissionFee: number;
  examFee: number;
  discount: number;
  totalFee: number;
  payableAmount: number;
  installmentCount: number;
  intervalInMonths: number;
  admissionRemark: string;
  courseName: string;
  courseDuration: number | string; // Allow both number and string
  centerId: string;
  password: string;
  status: string;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the student data from the request body
    const data = await request.json()
    
    console.log("Received student data:", data)

    // Validate required fields with detailed error message
    const requiredFields = {
      name: data.name,
      course: data.course, 
      fatherName: data.fatherName,
      motherName: data.motherName,
      dateOfBirth: data.dateOfBirth,
      dateOfJoining: data.dateOfJoining,
      gender: data.gender,
      aadharNo: data.aadharNo,
      state: data.state,
      district: data.district,
      city: data.city,
      address: data.address,
      pincode: data.pincode,
      phone: data.phone || data.aadharNo,
      email: data.email || `${data.name?.toLowerCase().replace(/\s+/g, '.')}@student.krishnacomputers.com`
    }
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)
    
    if (missingFields.length > 0) {
      console.error("Missing fields in student submission:", missingFields)
      return NextResponse.json(
        { 
          success: false, 
          message: `Please provide all required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Generate a unique student ID
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    const studentId = `${year}${month}${day}${randomDigits}`

    // Prepare student data with all fields
    const studentData: StudentData = {
      studentId,
      // Basic Details
      name: data.name?.trim(),
      email: data.email?.trim() || `${data.name?.toLowerCase().replace(/\s+/g, '.')}@student.krishnacomputers.com`,
      fatherName: data.fatherName?.trim(),
      motherName: data.motherName?.trim(),
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfJoining: new Date(data.dateOfJoining),
      enrollmentDate: new Date(data.dateOfJoining),
      gender: data.gender?.charAt(0).toUpperCase() + data.gender?.slice(1)?.toLowerCase(),
      aadharNo: data.aadharNo?.trim(),
      course: data.course,
      state: data.state?.trim(),
      district: data.district?.trim(),
      city: data.city?.trim(),
      address: data.address?.trim(),
      landmark: data.landmark?.trim() || '',
      pincode: data.pincode?.trim(),
      phone: (data.phone || data.aadharNo)?.trim(),
      mobile: (data.mobile || data.phone || data.aadharNo)?.trim(),

      // Document URLs
      photoUrl: data.photoUrl?.trim() || '',
      signatureUrl: data.signatureUrl?.trim() || '',
      aadharCardUrl: data.aadharCardUrl?.trim() || '',
      previousMarksheetUrl: data.previousMarksheetUrl?.trim() || '',
      photoIdProofUrl: data.photoIdProofUrl?.trim() || '',
      certificateProofUrl: data.certificateProofUrl?.trim() || '',
      idCardUrl: data.idCardUrl?.trim() || '',

      // Additional Details
      rollNo: data.rollNo?.trim() || '',
      photoIdType: data.photoIdType?.trim() || '',
      photoIdNumber: data.photoIdNumber?.trim() || '',
      qualificationType: data.qualificationType?.trim() || '',
      certificateNumber: data.certificateNumber?.trim() || '',

      // Payment Details
      courseFee: Number(data.courseFee) || 0,
      admissionFee: Number(data.admissionFee) || 0,
      examFee: Number(data.examFee) || 0,
      discount: Number(data.discount) || 0,
      totalFee: Number(data.totalFee) || 0,
      payableAmount: Number(data.payableAmount) || 0,
      installmentCount: Number(data.installmentCount) || 1,
      intervalInMonths: Number(data.intervalInMonths) || 0,
      admissionRemark: data.admissionRemark?.trim() || '',

      // Course Details
      courseName: data.courseName?.trim() || '',
      courseDuration: data.courseDuration || 0,

      // System Fields
      centerId: data.centerId?.trim() || 'MAIN',
      password: data.password?.trim() || data.dateOfBirth?.replace(/-/g, ''),
      status: data.status?.trim() || 'Active',
      registrationDate: data.registrationDate ? new Date(data.registrationDate) : now,
      createdAt: now,
      updatedAt: now,
      __v: 0
    }

    // Add any additional fields that might be in the data but not explicitly defined above
    const knownKeys = Object.keys(studentData)
    for (const [key, value] of Object.entries(data)) {
      if (!knownKeys.includes(key) && key !== 'dateOfJoining') { // Skip dateOfJoining as it's already processed
        studentData[key] = typeof value === 'string' ? value.trim() : value
      }
    }

    console.log("Creating student with data:", JSON.stringify(studentData, null, 2))

    try {
      // Create the student with schema validation disabled
      const studentDoc = new Student(studentData)
      const student = await studentDoc.save({ validateBeforeSave: false })
      
      console.log("Student created successfully:", student._id)

      // Log activity for new student
      const Activity = mongoose.models.Activity
      if (Activity) {
        await Activity.create({
          activity: `New student ${data.name} enrolled in a course`,
          type: "student",
          entityId: student._id,
          entityModel: "Student",
          metadata: { 
            studentId: studentId,
            courseName: data.courseName,
            courseDuration: data.courseDuration,
            totalFee: data.totalFee,
            payableAmount: data.payableAmount
          }
        })
      }

      // Return the created student
      return NextResponse.json({ success: true, data: student }, { status: 201 })
    } catch (dbError: any) {
      console.error("Database error creating student:", dbError)
      
      // If it's a validation error, provide more details
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.keys(dbError.errors).map(field => {
          return `${field}: ${dbError.errors[field].message}`
        })
        
        return NextResponse.json(
          { 
            success: false, 
            message: "Validation error", 
            errors: validationErrors 
          },
          { status: 400 }
        )
      }
      
      // If it's a duplicate key error
      if (dbError.code === 11000) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Duplicate key error. A student with this ID already exists." 
          },
          { status: 409 }
        )
      }
      
      throw dbError // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the student" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const centerId = searchParams.get("centerId")
    const atcId = searchParams.get("atcId") // Check for atcId as well
    
    console.log("GET /api/students - Starting request")

    if (id) {
      // Get a specific student
      console.log(`Fetching specific student with ID: ${id}`)
      const student = await Student.findById(id).populate("course")

      if (!student) {
        console.log(`Student with ID ${id} not found`)
        return NextResponse.json(
          { success: false, message: "Student not found" }, 
          { status: 404 }
        )
      }

      console.log(`Found student: ${student.name}`)
      return NextResponse.json(
        { success: true, data: student },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }

    // Build query object
    const query: any = {};
    
    // Filter by centerId if provided
    if (centerId) {
      console.log(`Filtering students by centerId: ${centerId}`);
      query.centerId = centerId;
    }
    
    // Filter by atcId if provided (map to centerId)
    if (atcId) {
      console.log(`Filtering students by atcId: ${atcId}`);
      query.centerId = atcId;
    }

    // Get students with filters
    console.log(`Fetching students with query:`, query);
    const students = await Student.find(query).populate("course").sort({ createdAt: -1 })
    console.log(`Found ${students.length} students in database`)

    // Format student data before sending
    const formattedStudents = students.map(student => {
      const data = student.toObject();
      return {
        ...data,
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        mobile: data.phone || data.mobile || '',
        photo: data.photoUrl || data.photo || null,
      };
    });

    return NextResponse.json(
      { success: true, data: formattedStudents },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching students" }, 
      { status: 500 }
    )
  }
}
