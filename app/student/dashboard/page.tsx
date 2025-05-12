"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award, FileText, Clock, User, Calendar, Mail, Phone } from "lucide-react"
import SafeImage from "@/components/ui/SafeImage"

// Get tab-specific storage key
const getStorageKey = (key: string) => {
  if (typeof window === "undefined") return key;
  
  const tabId = sessionStorage.getItem("tab_id");
  if (!tabId) return key; // Fallback to regular key if no tab ID found
  
  return `${tabId}_${key}`;
}

export default function StudentDashboard() {
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
        console.log("Auth token:", authToken);
        
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

  // Extract first and last name from full name
  const nameParts = student.name ? student.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
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
    
    // Fallback mapping if course data isn't available
    const courseMap: Record<string, string> = {
      dca: "Diploma in Computer Applications",
      dcaa: "Diploma in Computer Applications & Accounting",
      adca: "Advanced Diploma in Computer Applications",
      pgdca: "Post Graduate Diploma in Computer Applications",
      ccc: "Course on Computer Concepts",
      tally: "Tally Prime with GST",
      "o-level": "NIELIT O Level",
      "web-design": "Web Design & Development",
    };
    
    // Try to get the course code
    const courseId = typeof student.course === 'string' 
      ? student.course 
      : student.course && student.course._id 
        ? student.course._id 
        : '';
    
    return courseMap[courseId.toLowerCase()] || courseId || 'Not Available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 flex-shrink-0">
            {student.photoUrl ? (
              <SafeImage
                src={student.photoUrl}
                alt={student.name || "Student"}
                width={128}
                height={128}
                className="object-cover w-full h-full"
                type="student"
              />
            ) : (
              <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2 text-center md:text-left">
              {student.name || `${firstName} ${lastName}`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium">{student.studentId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{getCourseName()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{student.email || "Not Available"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{student.phone || "Not Available"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">{formatDate(student.enrollmentDate || student.joiningDate || new Date().toISOString())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Current Course</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{getCourseName()}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <FileText className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">2</div>
            <p className="text-xs text-muted-foreground">Next exam in 3 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">0</div>
            <p className="text-xs text-muted-foreground">Complete your course to earn certificates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Course Duration</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{course?.duration || "6 months"}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { activity: "Logged in to student portal", time: "Today, 10:30 AM" },
                { activity: "Completed Module 3 Quiz", time: "Yesterday, 3:45 PM" },
                { activity: "Submitted Assignment 2", time: "3 days ago" },
                { activity: "Attended online class", time: "1 week ago" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600"></div>
                  <div className="space-y-1">
                    <p className="text-sm">{item.activity}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: "Module 4 Quiz", date: "May 10, 2023", time: "10:00 AM" },
                { event: "Assignment 3 Deadline", date: "May 15, 2023", time: "11:59 PM" },
                { event: "Mid-term Exam", date: "May 20, 2023", time: "9:00 AM" },
                { event: "Group Project Presentation", date: "May 25, 2023", time: "2:00 PM" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-600"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.date} at {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
