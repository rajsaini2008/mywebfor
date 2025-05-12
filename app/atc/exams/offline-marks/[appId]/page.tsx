"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface Subject {
  _id: string
  name: string
  totalMarks: number
  totalPracticalMarks: number
}

interface Course {
  _id: string
  name: string
  subjects: Subject[]
}

interface Student {
  _id: string
  studentId: string
  name: string
  photo?: string
  course?: Course
}

interface ExamApplication {
  _id: string
  examPaperId: string
  studentId: string
  scheduledTime: string
  paperType: string
  status: string
  score?: number
  subjectMarks?: {
    [subjectId: string]: {
      theoryMarks: number
      practicalMarks: number
    }
  }
  subjects?: Subject[]
  examPaper?: {
    _id?: string
    paperId?: string
    paperName: string
    time: number
    passingMarks?: number
  }
  student?: Student
  percentage?: number
}

export default function EditOfflineExamMarks({ params }: { params: { appId: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<ExamApplication | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subjectMarks, setSubjectMarks] = useState<{
    [subjectId: string]: {
      theoryMarks: number | null
      practicalMarks: number | null
    }
  }>({})
  const [totalMarks, setTotalMarks] = useState<{
    [subjectId: string]: {
      total: number | null
      practical: number | null
    }
  }>({})
  const [totalScore, setTotalScore] = useState<number>(0)
  const [percentage, setPercentage] = useState<number | null>(null)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const { user } = useAuth()

  useEffect(() => {
    // Only fetch when user is loaded and we have the appId
    if (user && params.appId) {
      fetchApplicationData();
    }
  }, [params.appId, user]);

  useEffect(() => {
    if (application) {
      console.log("Application in useEffect:", application);
      console.log("Application percentage value:", application.percentage, "type:", typeof application.percentage);
      
      // Set subjects if available
      if (application.subjects && application.subjects.length > 0) {
        setSubjects(application.subjects);
        initializeSubjectMarks(application.subjects);
      }
      
      // Set percentage if available in application data (always as number)
      if (application.percentage !== undefined && application.percentage !== null) {
        // Force convert to number
        const numPercentage = Number(application.percentage);
        console.log("Setting percentage to:", numPercentage);
        setPercentage(numPercentage);
        
        // If it's an approved application, set as verified
        if (application.status === 'approved') {
          setIsVerified(true);
        }
      }
    }
  }, [application]);

  const initializeSubjectMarks = (subjectsList: Subject[]) => {
    // Create initial marks object if not already set
    const initialMarks: {[key: string]: {theoryMarks: number | null, practicalMarks: number | null}} = {};
    const initialTotalMarks: {[key: string]: {total: number | null, practical: number | null}} = {};
    
    subjectsList.forEach((subject) => {
      if (subject._id) {
        initialMarks[subject._id] = {
          theoryMarks: null,
          practicalMarks: null
        };
        initialTotalMarks[subject._id] = {
          total: subject.totalMarks || 100,
          practical: subject.totalPracticalMarks || 50
        };
      }
    });
    
    // Merge with any existing marks from the application
    if (application?.subjectMarks) {
      setSubjectMarks({
        ...initialMarks,
        ...application.subjectMarks
      });
    } else {
      setSubjectMarks(initialMarks);
    }
    
    setTotalMarks(initialTotalMarks);
  };

  const fetchApplicationData = async () => {
    try {
      setIsLoading(true);

      // Add random query parameter to prevent caching
      const cacheBuster = new Date().getTime();
      console.log(`Fetching exam application with ID: ${params.appId}, ATC ID: ${user?._id}`);
      
      const response = await fetch(`/api/exam-applications/${params.appId}?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        console.log("Application data received:", data.data);
        
        // Debug log for percentage
        console.log("Percentage from API:", data.data.percentage, typeof data.data.percentage);
        
        // Ensure application exists and has required data
        if (!data.data || !data.data._id) {
          throw new Error("Application data is missing or invalid");
        }
        
        // Verify this application belongs to the current ATC
        // First check if atcId field exists - if not, use the centerId field for backward compatibility
        const appAtcId = data.data.atcId || data.data.centerId;
        
        if (user && user._id && appAtcId && appAtcId !== user._id) {
          console.error(`Application doesn't belong to this ATC. App ATC ID: ${appAtcId}, User ID: ${user._id}`);
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this application",
            variant: "destructive",
          });
          router.push('/atc/exams/offline-marks');
          return;
        }
        
        // Ensure percentage is a number
        if (data.data.percentage !== undefined) {
          data.data.percentage = Number(data.data.percentage);
        }
        
        setApplication(data.data);

        // Set initial scores from stored subject marks if available
        if (data.data.subjectMarks && Object.keys(data.data.subjectMarks).length > 0) {
          console.log("Setting subject marks from data:", data.data.subjectMarks);
          setSubjectMarks(data.data.subjectMarks);
        } else if (data.data.subjects) {
          // Otherwise, initialize empty scores for each subject
          const initialScores: {
            [key: string]: {
              theoryMarks: number | null;
              practicalMarks: number | null;
            }
          } = {};
          
          data.data.subjects.forEach((subject: any) => {
            if (subject._id) {
              initialScores[subject._id] = {
                theoryMarks: 0,
                practicalMarks: 0
              };
            }
          });
          setSubjectMarks(initialScores);
        }

        // Set subjects from the application data
        if (data.data.subjects && data.data.subjects.length > 0) {
          console.log(`Setting ${data.data.subjects.length} subjects from application data`);
          setSubjects(data.data.subjects);
        } else if (data.data.student?.course?._id) {
          // If no subjects in the application, try to fetch them from the course
          console.log(`No subjects in application, fetching from course ${data.data.student.course._id}`);
          fetchCourseSubjects(data.data.student.course._id);
        } else {
          console.error("No subjects found in application and no course ID available");
          toast({
            title: "Warning",
            description: "No subjects found for this exam application",
            variant: "destructive",
          });
        }
        
        // Check if the application already has a percentage (previously marked)
        if (data.data.percentage !== undefined && data.data.percentage !== null) {
          console.log("Setting percentage from application data:", data.data.percentage);
          setPercentage(Number(data.data.percentage));
          
          // If it's an approved application, set as verified
          if (data.data.status === 'approved') {
            setIsVerified(true);
          }
        }
      } else {
        console.error("API returned error:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to fetch exam application details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching application data:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching application data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseSubjects = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}?include=subjects`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data.subjects) {
        const fetchedSubjects = data.data.subjects;
        setSubjects(fetchedSubjects)
        initializeSubjectMarks(fetchedSubjects);
      }
    } catch (error) {
      console.error("Error fetching course subjects:", error)
      toast({
        title: "Warning",
        description: "Failed to fetch course subjects",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMarks = (
    subjectId: string, 
    field: 'theoryMarks' | 'practicalMarks', 
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value)
    
    setSubjectMarks(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: numValue
      }
    }))
  }

  const handleUpdateTotalMarks = (
    subjectId: string, 
    field: 'total' | 'practical', 
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value)
    
    setTotalMarks(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: numValue
      }
    }))
  }

  const calculateNetTotal = (subjectId: string): string => {
    const totalTheory = totalMarks[subjectId]?.total || 0;
    const totalPractical = totalMarks[subjectId]?.practical || 0;
    return (totalTheory + totalPractical).toString();
  }

  const calculateNetObtained = (subjectId: string): string => {
    const obtainedTheory = subjectMarks[subjectId]?.theoryMarks || 0;
    const obtainedPractical = subjectMarks[subjectId]?.practicalMarks || 0;
    return (obtainedTheory + obtainedPractical).toString();
  }

  const calculateTotalScore = () => {
    let total = 0
    let validSubjects = 0
    
    subjects.forEach(subject => {
      const marks = subjectMarks[subject._id]
      if (marks) {
        // Add theory marks if available
        if (marks.theoryMarks !== null) {
          total += marks.theoryMarks
          validSubjects++
        }
        
        // Add practical marks if available
        if (marks.practicalMarks !== null) {
          total += marks.practicalMarks
          validSubjects++
        }
      }
    })
    
    // Calculate average percentage
    // This is a simple calculation, adjust as needed
    const totalPossibleMarks = subjects.reduce((sum, subject) => 
      sum + subject.totalMarks + subject.totalPracticalMarks, 0)
    
    return Math.round((total / totalPossibleMarks) * 100)
  }

  const calculateGrandTotalMarks = (): number => {
    let grandTotal = 0;
    subjects.forEach(subject => {
      if (subject._id) {
        const totalTheory = totalMarks[subject._id]?.total || 0;
        const totalPractical = totalMarks[subject._id]?.practical || 0;
        grandTotal += totalTheory + totalPractical;
      }
    });
    return grandTotal;
  }

  const calculateGrandTotalObtained = (): number => {
    let grandTotal = 0;
    subjects.forEach(subject => {
      if (subject._id) {
        const obtainedTheory = subjectMarks[subject._id]?.theoryMarks || 0;
        const obtainedPractical = subjectMarks[subject._id]?.practicalMarks || 0;
        grandTotal += obtainedTheory + obtainedPractical;
      }
    });
    return grandTotal;
  }

  const calculatePercentage = (): number => {
    const totalMarks = calculateGrandTotalMarks();
    const obtainedMarks = calculateGrandTotalObtained();
    if (totalMarks === 0) return 0;
    const calculatedPercentage = (obtainedMarks / totalMarks) * 100;
    return Math.round(calculatedPercentage * 100) / 100; // Round to 2 decimal places
  }

  const handleVerify = () => {
    const newPercentage = calculatePercentage();
    setPercentage(newPercentage);
    setIsVerified(true);
    toast({
      title: "Marks Verified",
      description: `Total percentage calculated: ${newPercentage}%`,
    });
  }

  const saveResults = async () => {
    try {
      // Validate that all subjects have marks
      const incompleteSubjects = subjects.filter(subject => {
        const marks = subjectMarks[subject._id];
        return !marks || marks.theoryMarks === null || marks.practicalMarks === null;
      });

      if (incompleteSubjects.length > 0) {
        toast({
          title: "Incomplete Marks",
          description: "Please enter marks for all subjects",
          variant: "destructive",
        });
        return;
      }

      // Validate percentage is calculated
      if (!isVerified || percentage === null) {
        toast({
          title: "Verification Required",
          description: "Please verify the marks before saving",
          variant: "destructive",
        });
        return;
      }

      const payloadData = {
        subjectMarks,
        percentage,
        atcId: user?._id,
      };

      console.log("Saving marks with data:", {
        subjectCount: Object.keys(subjectMarks).length,
        percentage,
        atcId: user?._id
      });

      const response = await fetch(`/api/exam-applications/${params.appId}/marks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify(payloadData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Student marks updated successfully",
        });
        // Add a small delay before navigating to ensure toast is visible
        setTimeout(() => {
          router.push('/atc/exams/offline-marks');
        }, 800);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update marks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while saving marks",
        variant: "destructive",
      });
    }
  }

  if (isLoading || !application || !application.student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
        <span className="ml-2">Loading application details...</span>
      </div>
    );
  }

  const student = application.student;

  return (
    <div className="px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Offline Exam Marks Update</h1>
      </div>

      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardHeader className="pb-2 bg-gray-50 border-b">
          <CardTitle className="text-lg font-medium">Student Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  N/A
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">{student.name} ({student.studentId})</h2>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course Name :</label>
                  <Input 
                    value={student.course?.name || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paper Name :</label>
                  <Input 
                    value={application.examPaper?.paperName || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {application.status === 'approved' && application.percentage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Previously Approved Marks</h3>
              <p className="text-sm text-gray-600">You are editing a previously approved paper.</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-3xl text-blue-700">
                {application.percentage.toFixed(2)}%
              </div>
              <span className="text-gray-600">Current Percentage</span>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-sm border border-gray-200 mb-6">
        <CardHeader className="pb-2 bg-gray-50 border-b">
          <CardTitle className="text-lg font-medium">Subject Marks</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-100">
                  <th className="border p-2 text-left font-medium">Subject Name</th>
                  <th className="border p-2 text-left font-medium">Total Marks</th>
                  <th className="border p-2 text-left font-medium">Obtain Marks</th>
                  <th className="border p-2 text-left font-medium">Practical Marks</th>
                  <th className="border p-2 text-left font-medium">Obtain Practical Marks</th>
                  <th className="border p-2 text-left font-medium">Net Total Marks</th>
                  <th className="border p-2 text-left font-medium">Net Total Obtained Marks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-gray-50">
                      <td className="border p-2 bg-gray-50">
                        {subject.name}
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={totalMarks[subject._id]?.total?.toString() || ""}
                          onChange={(e) => subject._id && handleUpdateTotalMarks(subject._id, 'total', e.target.value)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={subjectMarks[subject._id]?.theoryMarks?.toString() || ""}
                          onChange={(e) => subject._id && handleUpdateMarks(subject._id, 'theoryMarks', e.target.value)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={totalMarks[subject._id]?.practical?.toString() || ""}
                          onChange={(e) => subject._id && handleUpdateTotalMarks(subject._id, 'practical', e.target.value)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={subjectMarks[subject._id]?.practicalMarks?.toString() || ""}
                          onChange={(e) => subject._id && handleUpdateMarks(subject._id, 'practicalMarks', e.target.value)}
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={subject._id ? calculateNetTotal(subject._id) : ""}
                          readOnly
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-full h-9"
                          value={subject._id ? calculateNetObtained(subject._id) : ""}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="border p-4 text-center text-gray-500">
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-800 mr-2"></div>
                          Loading subjects...
                        </div>
                      ) : (
                        "No subjects found for this course."
                      )}
                    </td>
                  </tr>
                )}
                
                {/* Total row */}
                {subjects.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border p-2">Total</td>
                    <td className="border p-2" colSpan={4}></td>
                    <td className="border p-2">{calculateGrandTotalMarks()}</td>
                    <td className="border p-2">{calculateGrandTotalObtained()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {subjects.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div>
                {isVerified ? (
                  <div className="bg-green-100 p-3 border border-green-200 rounded-md text-green-800">
                    <div className="font-semibold">Marks Verified</div>
                    <div>Total Percentage: {percentage !== null ? percentage.toFixed(2) : 0}%</div>
                  </div>
                ) : (
                  <Button
                    onClick={handleVerify}
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200"
                  >
                    Verify Marks
                  </Button>
                )}
              </div>

              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/atc/exams/offline-marks')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveResults}
                  disabled={!isVerified}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 