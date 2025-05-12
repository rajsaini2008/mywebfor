"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  User, Mail, Phone, Calendar, BookOpen, 
  FileText, Check
} from "lucide-react"
import SafeImage from "@/components/ui/SafeImage"

// Get tab-specific storage key
const getStorageKey = (key: string) => {
  if (typeof window === "undefined") return key;
  
  const tabId = sessionStorage.getItem("tab_id");
  if (!tabId) return key; // Fallback to regular key if no tab ID found
  
  return `${tabId}_${key}`;
}

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch student and course data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get current student ID from sessionStorage with tab-specific key
        const currentUserId = sessionStorage.getItem(getStorageKey("current_user_id"))
        const authToken = sessionStorage.getItem(getStorageKey("auth_token"))
        
        console.log("Current user ID:", currentUserId);
        
        if (!currentUserId) {
          throw new Error("No user ID found in session storage")
        }
        
        // Fetch student data from API
        const timestamp = new Date().getTime();
        const studentResponse = await fetch(`/api/students/${currentUserId}?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!studentResponse.ok) {
          throw new Error(`Failed to fetch student data: ${studentResponse.status} ${studentResponse.statusText}`);
        }
        
        const studentData = await studentResponse.json();
        
        if (!studentData.success || !studentData.data) {
          throw new Error(studentData.message || "Failed to load student information");
        }
        
        setStudent(studentData.data);
        
        // Fetch course data for the student
        const courseResponse = await fetch(`/api/student-courses/${currentUserId}?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          if (courseData.success && courseData.data) {
            setCourse(courseData.data);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load student information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <p className="text-gray-600 mt-2">Unable to load student information.</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="mt-4">
          <p className="text-sm text-gray-500">Please try the following:</p>
          <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
            <li>Refresh the page</li>
            <li>Log out and log back in</li>
            <li>Contact administrator if the problem persists</li>
          </ul>
        </div>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper to check if a document URL exists
  const hasDocument = (url: string | undefined) => {
    return url && url !== "" && url !== "undefined";
  };
  
  // Helper to get proper document URL
  const getDocumentUrl = (url: string | undefined) => {
    if (!url) return '';
    
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    } else if (url.startsWith('/uploads/')) {
      return url;
    } else {
      return `/api/uploads/${url}`;
    }
  };

  // Get course name from the course object
  const getCourseName = () => {
    if (course && course.name) {
      return course.name;
    }
    
    if (student.course && typeof student.course === 'object' && student.course.name) {
      return student.course.name;
    }
    
    if (student.courseName) {
      return student.courseName;
    }
    
    return 'Not Available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">My Profile</h1>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              {student.photoUrl ? (
                <SafeImage
                  src={getDocumentUrl(student.photoUrl)}
                  alt={student.name || "Student Photo"}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                  type="student"
                />
              ) : (
                <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-500" />
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name || 'Student'}</h2>
            <p className="text-gray-600 mb-2">{student.studentId || 'ID not available'}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <User className="w-4 h-4 mr-1" /> {student.gender || 'Gender not specified'}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <BookOpen className="w-4 h-4 mr-1" /> {getCourseName()}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Joined {formatDate(student.dateOfJoining || student.enrollmentDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-blue-50 p-1 rounded-lg">
          <TabsTrigger 
            value="personal" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-md"
          >
            Personal Information
          </TabsTrigger>
          <TabsTrigger 
            value="academic" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-md"
          >
            Academic Details
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm rounded-md"
          >
            Documents
          </TabsTrigger>
        </TabsList>
        
        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <User className="mr-2 h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="mb-6 md:mb-0 md:w-1/4">
                  <div className="w-full mb-4 border-2 border-blue-100 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm h-56">
                    {student.photoUrl ? (
                      <SafeImage
                        src={getDocumentUrl(student.photoUrl)}
                        alt={student.name || "Student Photo"}
                        width={240}
                        height={320}
                        className="object-cover w-full h-full"
                        type="student"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <User className="w-16 h-16 text-blue-300" />
                        <p className="text-sm text-gray-500 mt-2">No photo available</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full h-24 border-2 border-blue-100 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm">
                    {student.signatureUrl ? (
                      <SafeImage
                        src={getDocumentUrl(student.signatureUrl)}
                        alt="Signature"
                        width={240}
                        height={96}
                        className="object-contain w-full h-full"
                        type="student"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="w-8 h-8 text-blue-300" />
                        <p className="text-sm text-gray-500 mt-1">No signature</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{student.name || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Student ID</p>
                    <p className="text-base font-medium text-gray-900">{student.studentId || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Father's Name</p>
                    <p className="text-base font-medium text-gray-900">{student.fatherName || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Mother's Name</p>
                    <p className="text-base font-medium text-gray-900">{student.motherName || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{student.gender || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(student.dateOfBirth)}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{student.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base font-medium text-gray-900">{student.phone || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Mobile</p>
                    <p className="text-base font-medium text-gray-900">{student.mobile || 'Not provided'}</p>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Aadhar Number</p>
                    <p className="text-base font-medium text-gray-900">{student.aadharNo || 'Not provided'}</p>
                  </div>
                  
                  <div className="md:col-span-2 border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-base font-medium text-gray-900">
                      {student.address ? student.address : 'Not provided'}
                      {student.landmark && `, ${student.landmark}`}
                      {student.city && `, ${student.city}`}
                      {student.district && `, ${student.district}`}
                      {student.state && `, ${student.state}`}
                      {student.pincode && ` - ${student.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Academic Details Tab */}
        <TabsContent value="academic">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="text-base font-medium text-gray-900">{getCourseName()}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Course Duration</p>
                  <p className="text-base font-medium text-gray-900">
                    {student.courseDuration 
                      ? typeof student.courseDuration === 'number' 
                        ? `${student.courseDuration} months` 
                        : student.courseDuration
                      : 'Not provided'}
                  </p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Roll Number</p>
                  <p className="text-base font-medium text-gray-900">{student.rollNo || 'Not provided'}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(student.enrollmentDate)}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(student.registrationDate)}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Date of Joining</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(student.dateOfJoining)}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-base">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        student.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        student.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'}`
                    }>
                      {student.status || 'Unknown'}
                    </span>
                  </p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Qualification Type</p>
                  <p className="text-base font-medium text-gray-900">{student.qualificationType || 'Not provided'}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Photo ID Type</p>
                  <p className="text-base font-medium text-gray-900">{student.photoIdType || 'Not provided'}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Photo ID Number</p>
                  <p className="text-base font-medium text-gray-900">{student.photoIdNumber || 'Not provided'}</p>
                </div>
                
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-sm font-medium text-gray-500">Certificate Number</p>
                  <p className="text-base font-medium text-gray-900">{student.certificateNumber || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Fee details section */}
              <div className="mt-10 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4 text-blue-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> Fee Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Course Fee</p>
                    <p className="text-2xl font-bold text-blue-800">₹{student.courseFee || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Admission Fee</p>
                    <p className="text-2xl font-bold text-blue-800">₹{student.admissionFee || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Exam Fee</p>
                    <p className="text-2xl font-bold text-blue-800">₹{student.examFee || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Discount</p>
                    <p className="text-2xl font-bold text-green-600">- ₹{student.discount || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Total Fee</p>
                    <p className="text-2xl font-bold text-gray-700">₹{student.totalFee || 0}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                    <p className="text-sm font-medium text-gray-500">Payable Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">₹{student.payableAmount || 0}</p>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Installment Count</p>
                    <p className="text-lg font-medium text-gray-900">{student.installmentCount || 1}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interval (months)</p>
                    <p className="text-lg font-medium text-gray-900">{student.intervalInMonths || 0}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Admission Remark</p>
                    <p className="text-lg font-medium text-gray-900">{student.admissionRemark || 'No remarks'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="text-xl text-blue-800 flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Photo</h3>
                        <p className="text-sm text-gray-500">Passport size photograph</p>
                      </div>
                      {hasDocument(student.photoUrl) && (
                        <a 
                          href={getDocumentUrl(student.photoUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-48 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.photoUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.photoUrl)}
                          alt="Photo"
                          width={180}
                          height={192}
                          className="object-cover w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No photo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Signature */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Signature</h3>
                        <p className="text-sm text-gray-500">Student signature</p>
                      </div>
                      {hasDocument(student.signatureUrl) && (
                        <a 
                          href={getDocumentUrl(student.signatureUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-24 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.signatureUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.signatureUrl)}
                          alt="Signature"
                          width={240}
                          height={96}
                          className="object-contain w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No signature uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Aadhar Card */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Aadhar Card</h3>
                        <p className="text-sm text-gray-500">Identity proof</p>
                      </div>
                      {hasDocument(student.aadharCardUrl) && (
                        <a 
                          href={getDocumentUrl(student.aadharCardUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-36 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.aadharCardUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.aadharCardUrl)}
                          alt="Aadhar Card"
                          width={240}
                          height={144}
                          className="object-contain w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No Aadhar card uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Previous Marksheet */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Previous Marksheet</h3>
                        <p className="text-sm text-gray-500">Academic qualification</p>
                      </div>
                      {hasDocument(student.previousMarksheetUrl) && (
                        <a 
                          href={getDocumentUrl(student.previousMarksheetUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-36 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.previousMarksheetUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.previousMarksheetUrl)}
                          alt="Previous Marksheet"
                          width={240}
                          height={144}
                          className="object-contain w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No marksheet uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Photo ID Proof */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Photo ID Proof</h3>
                        <p className="text-sm text-gray-500">
                          {student.photoIdType ? student.photoIdType : 'Identity document'}
                        </p>
                      </div>
                      {hasDocument(student.photoIdProofUrl) && (
                        <a 
                          href={getDocumentUrl(student.photoIdProofUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-36 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.photoIdProofUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.photoIdProofUrl)}
                          alt="Photo ID Proof"
                          width={240}
                          height={144}
                          className="object-contain w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No ID proof uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Certificate */}
                <div className="bg-white rounded-lg shadow-sm border border-blue-50 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-blue-800">Certificate</h3>
                        <p className="text-sm text-gray-500">
                          {student.certificateNumber ? `Certificate #${student.certificateNumber}` : 'Qualification certificate'}
                        </p>
                      </div>
                      {hasDocument(student.certificateProofUrl) && (
                        <a 
                          href={getDocumentUrl(student.certificateProofUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 bg-white p-2 rounded-full shadow-sm"
                        >
                          <FileText className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-36 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      {hasDocument(student.certificateProofUrl) ? (
                        <SafeImage
                          src={getDocumentUrl(student.certificateProofUrl)}
                          alt="Certificate"
                          width={240}
                          height={144}
                          className="object-contain w-full h-full"
                          type="student"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">No certificate uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 