import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import ExamApplication from "@/models/ExamApplication"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { examPaperId, studentIds, scheduledTime, paperType } = body

    console.log("Creating exam applications with data:", {
      examPaperId,
      studentCount: studentIds?.length,
      scheduledTime,
      paperType
    })

    // Validate required fields
    if (!examPaperId || !studentIds || !scheduledTime || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 })
    }

    // Validate paperType is either 'online' or 'offline'
    const validPaperType = paperType === 'offline' ? 'offline' : 'online'
    console.log("Using paper type:", validPaperType)

    // Get exam paper details
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({
        success: false,
        message: "Database connection not established"
      }, { status: 500 });
    }
    
    const examPaper = await db.collection('exampapers').findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(examPaperId) },
        { paperId: examPaperId }
      ]
    })

    if (!examPaper) {
      return NextResponse.json({
        success: false,
        message: "Exam paper not found"
      }, { status: 404 })
    }

    console.log("Found exam paper:", {
      id: examPaper._id,
      paperId: examPaper.paperId,
      name: examPaper.paperName
    })

    // Create exam applications for each student
    const applications = studentIds.map(studentId => ({
      examPaperId: examPaper._id,
      studentId: new mongoose.Types.ObjectId(studentId),
      scheduledTime: new Date(scheduledTime),
      paperType: validPaperType, // Explicitly set paperType
      status: "scheduled"
    }))

    // Log first application to verify data structure
    console.log("Sample application to be created:", JSON.stringify(applications[0]))
    console.log("paperType explicitly set to:", validPaperType)

    // Directly insert into MongoDB collection to ensure all fields are saved
    try {
      // First try using the mongoose model
      const result = await ExamApplication.insertMany(applications, { ordered: false })
      console.log(`Created ${result.length} exam applications successfully using model`)
      
      // Just to be safe, verify the paperType field was saved by directly checking one document
      if (result.length > 0) {
        const firstId = result[0]._id
        const db = mongoose.connection.db;
        if (db) {
          const checkDoc = await db.collection('examapplications').findOne({ _id: firstId })
          console.log("Verification - paperType in saved document:", checkDoc?.paperType)
          
          // If paperType is missing, force update it
          if (!checkDoc?.paperType) {
            console.log("paperType missing, updating directly...")
            await db.collection('examapplications').updateMany(
              { _id: { $in: result.map(r => r._id) } },
              { $set: { paperType: validPaperType } }
            )
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: "Exam applications created successfully",
        count: result.length
      })
    } catch (error) {
      // If insert fails, log the error and try direct insert
      console.error("Error using model insert:", error)
      
      // Try direct insert into collection as backup
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not established");
      }
      const collection = db.collection('examapplications')
      const directResult = await collection.insertMany(applications)
      console.log(`Created ${directResult.insertedCount} exam applications through direct insert`)
      
      return NextResponse.json({
        success: true,
        message: "Exam applications created successfully (direct method)",
        count: directResult.insertedCount
      })
    }
  } catch (error) {
    console.error("Error creating exam applications:", error)
    // Handle duplicate application error
    const typedError = error as any;
    if (typedError.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "Some students are already registered for this exam"
      }, { status: 400 })
    }
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating exam applications"
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase()
    console.log("Connected to database for GET exam-applications")

    // Log collection info
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collectionInfo = await db.listCollections({ name: 'examapplications' }).toArray();
        console.log('Collection info for examapplications:', collectionInfo);
        
        // Count total documents
        const totalCount = await db.collection('examapplications').countDocuments();
        console.log(`Total documents in examapplications collection: ${totalCount}`);
      }
    } catch (err) {
      console.error("Error checking collections:", err);
    }

    // Get the URL parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const studentId = searchParams.get("studentId")
    const studentEmail = searchParams.get("studentEmail")
    const examId = searchParams.get("examId")
    const centerId = searchParams.get("centerId")
    const atcId = searchParams.get("atcId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const paperType = searchParams.get("paperType")
    const nocache = searchParams.get("nocache") === "true"
    
    console.log("GET exam-applications request params:", { 
      id, studentId, studentEmail, examId, centerId, atcId, status, type, paperType, nocache,
      url: request.url
    })

    if (id) {
      // Get a specific exam application
      try {
        const db = mongoose.connection.db;
        if (!db) {
          throw new Error("Database connection not established");
        }
        
        // Verify valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          console.error(`Invalid application ID format: ${id}`)
          return NextResponse.json(
            { success: false, message: "Invalid application ID format" },
            { status: 400 }
          )
        }
        
        const application = await db.collection('examapplications').findOne({
          _id: new mongoose.Types.ObjectId(id)
        });
        
        if (!application) {
          return NextResponse.json(
            { success: false, message: "Exam application not found" },
            { status: 404 }
          )
        }
        
        console.log("Found application, fetching related data:", application._id.toString());
        
        // Manually fetch the student data
        if (application.studentId) {
          const student = await db.collection('students').findOne({
            _id: application.studentId
          });
          if (student) {
            application.student = student;
            console.log(`Populated student: ${student.name || 'Unknown'}`);
            
            // Also fetch the course data
            if (student.course) {
              const course = await db.collection('courses').findOne({
                _id: student.course
              });
              if (course) {
                student.course = course;
                console.log(`Populated course: ${course.name || 'Unknown'}`);
                
                // Fetch subject details for the course
                if (course.subjects && Array.isArray(course.subjects)) {
                  const subjectIds = course.subjects.map(id => 
                    mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
                  ).filter(Boolean);
                  
                  if (subjectIds.length > 0) {
                    // Filter out null values before passing to $in
                    const validSubjectIds = subjectIds.filter(id => id !== null);
                    const subjects = await db.collection('subjects').find({
                      _id: { $in: validSubjectIds }
                    }).toArray();
                    
                    if (subjects && subjects.length > 0) {
                      application.subjects = subjects;
                      console.log(`Populated ${subjects.length} subjects`);
                    }
                  }
                }
              }
            }
          } else {
            console.log("Student not found for application");
          }
        }
        
        // Manually fetch the exam paper data
        if (application.examPaperId) {
          const examPaper = await db.collection('exampapers').findOne({
            _id: application.examPaperId
          });
          if (examPaper) {
            application.examPaper = examPaper;
            console.log(`Populated exam paper: ${examPaper.paperName || 'Unknown'}`);
          } else {
            console.log("Exam paper not found for application");
          }
        }
        
        // Ensure subjectMarks is available
        if (!application.subjectMarks) {
          application.subjectMarks = {};
          console.log("Initialized empty subject marks");
        }
        
        // Ensure percentage is a number
        if (application.percentage !== undefined) {
          application.percentage = typeof application.percentage === 'string' 
            ? parseFloat(application.percentage) 
            : Number(application.percentage);
          console.log(`Normalized percentage: ${application.percentage}`);
        }
        
        return NextResponse.json({ 
          success: true, 
          data: application,
          cache: false
        }, {
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      } catch (error) {
        console.error("Error fetching exam application by id:", error);
        return NextResponse.json(
          { success: false, message: "Error fetching exam application: " + (error instanceof Error ? error.message : String(error)) },
          { status: 500 }
        )
      }
    }

    // Build query based on parameters
    const query: any = {}
    let foundStudentByEmail = false;
    let studentIdObj = null;
    
    // Filter by studentId if provided - ensure it's a valid MongoDB ObjectId
    if (studentId) {
      try {
        studentIdObj = new mongoose.Types.ObjectId(studentId);
        query.studentId = studentIdObj;
        console.log("Added studentId filter:", studentId);
      } catch (err) {
        console.error("Invalid studentId format:", studentId, err);
        // If not a valid ObjectId, try to find by studentId as a string field
        query.studentIdNumber = studentId;
        console.log("Added studentIdNumber filter instead:", studentId);
      }
    }
    
    // Filter by studentEmail if provided - look up the student first
    if (studentEmail) {
      try {
        const db = mongoose.connection.db;
        if (!db) {
          throw new Error("Database connection not established");
        }

        console.log("Looking up student by email:", studentEmail);
        const student = await db.collection('students').findOne({ email: studentEmail });
        
        if (student) {
          console.log("Found student by email:", student._id);
          foundStudentByEmail = true;
          
          // If we already have a studentId filter, use $or to match either
          if (query.studentId) {
            query.$or = [
              { studentId: query.studentId },
              { studentId: student._id }
            ];
            delete query.studentId; // Remove the original studentId filter
          } else {
            query.studentId = student._id;
            studentIdObj = student._id;
          }
        } else {
          console.log("No student found with email:", studentEmail);
          // If no student found with this email, return empty results
          if (!studentId) {
            console.log("No valid student identified - returning empty results");
            return NextResponse.json(
              { success: true, data: [] },
              { status: 200 }
            );
          }
        }
      } catch (err) {
        console.error("Error looking up student by email:", studentEmail, err);
      }
    }
    
    // If neither studentId nor email found a valid student, return empty results
    if (!studentId && !foundStudentByEmail && !examId && !atcId && !centerId) {
      console.log("No specific filters provided - returning ALL applications");
      // Instead of returning empty results, we'll continue with an empty query to get all apps
      // This ensures the admin page can see all exam applications
    }
    
    // Filter by examId if provided
    if (examId) {
      try {
        query.examPaperId = new mongoose.Types.ObjectId(examId)
        console.log("Added examId filter:", examId)
      } catch (err) {
        console.error("Invalid examId format:", examId, err)
      }
    }
    
    // Filter by centerId if provided
    if (centerId) {
      try {
        query.centerId = new mongoose.Types.ObjectId(centerId)
        console.log("Added centerId filter:", centerId)
      } catch (err) {
        console.error("Invalid centerId format:", centerId, err)
      }
    }
    
    // Map atcId to centerId if provided
    if (atcId && !centerId) {
      try {
        query.centerId = new mongoose.Types.ObjectId(atcId)
        console.log("Added atcId as centerId filter:", atcId)
      } catch (err) {
        console.error("Invalid atcId format:", atcId, err)
      }
    }
    
    // Filter by status if provided - Make sure this works reliably
    if (status) {
      // Check if this is an $in query (status[$in]=approved,scheduled)
      if (status.includes(',') && searchParams.get("status[$in]")) {
        const statusValues = status.split(',').filter(s => s.trim());
        query.status = { $in: statusValues };
        console.log("Added status $in filter:", statusValues);
      } else {
        // Ensure exact string matching for status
        query.status = status;
        console.log("Added status filter:", status);
      }
    }
    
    // Filter by type if provided
    if (type) {
      query.examType = type
      console.log("Added examType filter:", type)
    }
    
    // Filter by paperType if provided - Make sure this works reliably
    if (paperType) {
      // Use exact string comparison for paperType
      query.paperType = paperType;
      console.log(`Filtering applications by paperType: ${paperType} (strict comparison)`);
    }

    console.log("Final query for exam applications:", JSON.stringify(query))

    try {
      // Get exam applications using direct MongoDB access
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection not established");
      }
      
      // Handle case when we want all applications for a specific ATC
      if (atcId && !studentId && !studentEmail) {
        console.log(`Fetching all applications for ATC: ${atcId}`);
        
        // First get all students for this ATC
        const students = await db.collection('students').find({ 
          $or: [
            { centerId: new mongoose.Types.ObjectId(atcId) },
            { atcId: new mongoose.Types.ObjectId(atcId) }
          ]
        }).toArray();
        
        if (!students || students.length === 0) {
          console.log(`No students found for ATC: ${atcId}`);
          return NextResponse.json({ success: true, data: [] });
        }
        
        console.log(`Found ${students.length} students for ATC: ${atcId}`);
        
        // Get student IDs to use in query
        const studentIds = students.map(s => s._id);
        
        // Update query to match applications for these students
        query.studentId = { $in: studentIds };
        delete query.centerId; // Remove the centerId/atcId filter
        
        console.log(`Updated query to search for ${studentIds.length} students:`, JSON.stringify(query));
      }
      
      // Use an aggregation pipeline to join with students and ensure proper filtering
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "students",
            localField: "studentId",
            foreignField: "_id",
            as: "studentData"
          }
        },
        {
          $lookup: {
            from: "exampapers",
            localField: "examPaperId",
            foreignField: "_id",
            as: "examPaperData"
          }
        },
        {
          $addFields: {
            student: { $arrayElemAt: ["$studentData", 0] },
            examPaper: { $arrayElemAt: ["$examPaperData", 0] }
          }
        },
        {
          $project: {
            studentData: 0,
            examPaperData: 0
          }
        }
      ];
      
      const applications = await db.collection('examapplications').aggregate(pipeline).toArray();
      console.log(`Found ${applications.length} applications matching query`);
      
      // If no applications were found, try a simpler query to verify collection access
      if (applications.length === 0) {
        console.log("No applications found with pipeline, trying direct query");
        
        // Direct simple query
        const directQuery = await db.collection('examapplications').find({}).limit(10).toArray();
        console.log(`Direct query found ${directQuery.length} applications`);
        
        if (directQuery.length > 0) {
          console.log("Sample direct application:", directQuery[0]);
          
          // Use the direct query results instead
          return NextResponse.json(
            { 
              success: true, 
              data: directQuery,
              note: "Using direct query instead of pipeline due to empty results"
            },
            {
              headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );
        }
      }
      
      // Debug the first few applications
      if (applications.length > 0) {
        const sampleApp = applications[0];
        console.log("Sample application data:", {
          id: sampleApp._id,
          paperType: sampleApp.paperType,
          status: sampleApp.status,
          studentId: sampleApp.studentId,
          hasStudentData: !!sampleApp.student,
          hasExamPaperData: !!sampleApp.examPaper
        });
        
        // Double-check this app is for the requested student
        if (studentIdObj) {
          const appStudentId = sampleApp.studentId ? sampleApp.studentId.toString() : null;
          const requestedStudentId = studentIdObj ? studentIdObj.toString() : null;
          console.log("Student ID verification:", {
            appStudentId,
            requestedStudentId,
            matches: appStudentId === requestedStudentId
          });
        }
        
        // For each application, ensure it has the subjects array if needed for offline marks
        if (paperType === 'offline') {
          console.log("Enriching offline applications with subject data");
          
          for (const app of applications) {
            // Skip if already has subjects or no student data
            if (app.subjects || !app.student || !app.student.course) continue;
            
            try {
              // Get the course ID
              const courseId = app.student.course;
              if (!courseId) continue;
              
              // Get the course data to find subject IDs
              const course = await db.collection('courses').findOne({
                _id: typeof courseId === 'object' ? courseId : new mongoose.Types.ObjectId(courseId)
              });
              
              if (!course || !course.subjects || !Array.isArray(course.subjects)) continue;
              
              // Get subject details
              const subjectIds = course.subjects.map(id => 
                mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
              ).filter(Boolean);
              
              if (subjectIds.length > 0) {
                // Filter out null values before passing to $in
                const validSubjectIds = subjectIds.filter(id => id !== null);
                const subjects = await db.collection('subjects').find({
                  _id: { $in: validSubjectIds }
                }).toArray();
                
                if (subjects && subjects.length > 0) {
                  app.subjects = subjects;
                }
              }
            } catch (err) {
              console.error("Error enriching application with subjects:", err);
            }
          }
        }
      } else {
        console.log("No applications found for the specified query");
      }

      // When returning applications, ensure they include studentId information consistently
      const formattedApplications = applications.map((app: any) => {
        // Create a more consistent format for the frontend
        const formatted = { ...app };
        
        // Make sure studentId is available as both a string and an object
        if (app.student && app.student._id) {
          // If we have a student object but no studentId, add it
          if (!app.studentId) {
            formatted.studentId = app.student._id;
          }
          // If studentId exists but is a string, preserve it but also keep the object
          else if (typeof app.studentId === 'string') {
            // Keep it as is, but ensure student._id is also set
            formatted.student = formatted.student || {};
            formatted.student._id = app.studentId;
          }
        }
        // If studentId exists as an object but student doesn't, create it
        else if (app.studentId && typeof app.studentId === 'object' && app.studentId._id) {
          formatted.student = formatted.student || {};
          formatted.student._id = app.studentId._id;
        }
        
        // Always include paperType - default to 'online' if missing
        if (!formatted.paperType) {
          console.log(`Adding missing paperType (default 'online') to application ${app._id}`);
          formatted.paperType = 'online';
        } else {
          console.log(`Application ${app._id} has paperType: ${formatted.paperType}`);
        }
        
        return formatted;
      });

      console.log(`Returning ${formattedApplications.length} formatted applications to client`);
      return NextResponse.json(
        { success: true, data: formattedApplications },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    } catch (findError) {
      console.error("Error during find operation:", findError);
      return NextResponse.json(
        { success: false, message: "Error during database query: " + (findError instanceof Error ? findError.message : String(findError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching exam applications:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching exam applications: " + errorMessage },
      { status: 500 }
    );
  }
}

// Debug endpoint to check if there are any offline exam applications
export async function HEAD(request: Request) {
  try {
    await connectToDatabase()
    console.log("Connected to database for HEAD exam-applications debug check")
    
    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not established");
      return new Response(null, { status: 500 });
    }
    
    // Check for offline applications
    const offlineCount = await db.collection('examapplications').countDocuments({ paperType: 'offline' });
    console.log(`Found ${offlineCount} offline exam applications in database`);
    
    // Check for approved applications
    const approvedCount = await db.collection('examapplications').countDocuments({ status: 'approved' });
    console.log(`Found ${approvedCount} approved exam applications in database`);
    
    // Check for offline AND approved applications
    const offlineApprovedCount = await db.collection('examapplications').countDocuments({ 
      paperType: 'offline',
      status: 'approved'
    });
    console.log(`Found ${offlineApprovedCount} offline AND approved exam applications in database`);
    
    // Return counts in headers
    return new Response(null, { 
      status: 200,
      headers: {
        'X-Offline-Count': offlineCount.toString(),
        'X-Approved-Count': approvedCount.toString(),
        'X-Offline-Approved-Count': offlineApprovedCount.toString()
      }
    });
  } catch (error) {
    console.error("Error in HEAD debug check:", error);
    return new Response(null, { status: 500 });
  }
} 