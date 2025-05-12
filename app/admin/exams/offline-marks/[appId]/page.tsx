"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

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

  useEffect(() => {
    fetchApplicationData()
  }, [params.appId])

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
      setIsLoading(true)

      // Add random query parameter to prevent caching
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/exam-applications/${params.appId}?t=${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.success) {
        console.log("Application data:", data.data);
        
        // Debug log for percentage
        console.log("Percentage from API:", data.data.percentage, typeof data.data.percentage);
        
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
        if (data.data.subjects) {
          setSubjects(data.data.subjects);
        }
        
        // If percentage exists in data, show it
        if (data.data.percentage !== undefined) {
          console.log("Setting percentage state to:", data.data.percentage);
          // Convert to number to ensure proper handling
          const percentageValue = typeof data.data.percentage === 'string' 
            ? parseFloat(data.data.percentage) 
            : Number(data.data.percentage);
            
          setPercentage(percentageValue);
          
          // If status is approved, set as verified
          if (data.data.status === 'approved') {
            setIsVerified(true);
          }
        } else {
          console.log("No percentage found in API response");
        }
      } else {
        throw new Error(data.message || "Failed to fetch application data")
      }
    } catch (error) {
      console.error("Error fetching application data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch application data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    const totalObtained = calculateGrandTotalObtained();
    const totalMarks = calculateGrandTotalMarks();
    if (totalMarks === 0) return 0;
    const calculatedPercentage = Number(((totalObtained / totalMarks) * 100).toFixed(2));
    console.log("Calculated percentage:", calculatedPercentage);
    return calculatedPercentage;
  }

  const handleVerify = () => {
    // Always recalculate percentage based on current marks
    const calculatedPercentage = calculatePercentage();
    console.log("Verify button clicked, calculated percentage:", calculatedPercentage);
    
    // Update the state with new percentage
    setPercentage(calculatedPercentage);
    setIsVerified(true);
    
    toast({
      title: "Verified",
      description: `Marks have been verified. Overall percentage: ${calculatedPercentage}%`
    });
  }

  const saveResults = async () => {
    try {
      // Get the values we need to save
      const obtainedTotal = calculateGrandTotalObtained();
      const maxTotal = calculateGrandTotalMarks();
      
      // Calculate percentage directly
      const calculatedPercentage = Number(((obtainedTotal / maxTotal) * 100).toFixed(2));
      
      console.log("Saving marks with percentage:", calculatedPercentage, "type:", typeof calculatedPercentage);
      
      // Generate a certificate number
      const certificateNo = generateCertificateNumber();
      
      // Get student information
      const studentName = application?.student?.name || "";
      const studentIdNumber = application?.student?.studentId || "";
      
      // Create a direct data object for saving
      const updateData = {
        // Overall results
        score: obtainedTotal,
        percentage: calculatedPercentage,
        
        // Certificate and student details
        certificateNo,
        studentName,
        studentIdNumber,
        
        // Subject-specific marks
        subjectMarks: subjectMarks,
        
        // Set status to approved
        status: 'approved'
      };
      
      console.log("Sending data to server:", JSON.stringify(updateData));
      
      // POST with more explicit headers to ensure data is sent correctly
      const response = await fetch(`/api/exam-applications/${params.appId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, ${await response.text()}`);
      }

      const data = await response.json();
      console.log("Server response:", data);
      
      if (data.success) {
        // Check if percentage was saved correctly
        if (data.data && data.data.percentage !== undefined) {
          console.log("Percentage saved successfully:", data.data.percentage);
          console.log("Certificate number saved:", data.data.certificateNo);
          console.log("Student name saved:", data.data.studentName);
          console.log("Student ID saved:", data.data.studentIdNumber);
        } else {
          console.warn("Percentage may not have been saved correctly");
        }
        
        // Show success message
        toast({
          title: "Success!",
          description: `Marks approved with ${calculatedPercentage}% percentage and certificate generated`
        });
        
        // Navigate back with a small delay
        setTimeout(() => {
          router.push('/admin/exams/offline-marks');
        }, 1000);
      } else {
        throw new Error(data.message || "Failed to save results");
      }
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save results",
        variant: "destructive",
      });
    }
  };

  // Generate a unique certificate number
  const generateCertificateNumber = () => {
    // Generate exactly 8-digit number
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!application || !application.student) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/exams/offline-marks')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offline Marks
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold text-gray-700">
                Student or application not found
              </h2>
              <p className="text-gray-500 mt-2">
                The requested exam application could not be found or is missing required data.
              </p>
              <Button
                onClick={() => router.push('/admin/exams/offline-marks')}
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { student } = application

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/exams/offline-marks')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offline Marks
        </Button>
        
        {application?.status === 'approved' && application?.percentage && (
          <div className="p-2 bg-green-100 border border-green-300 rounded-md">
            <span className="font-semibold mr-2">Approved with percentage:</span>
            <span className="font-bold text-green-800">{application.percentage.toFixed(2)}%</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          {student.photo ? (
            <div className="h-24 w-24 rounded overflow-hidden bg-gray-100 border">
              <img
                src={student.photo}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded bg-gray-100 border flex items-center justify-center text-gray-400">
              No Photo
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
            {subjects.length > 0 && (
              <tr className="bg-gray-100 font-semibold">
                <td className="border p-2">
                  Grand Total
                </td>
                <td className="border p-2" colSpan={4}></td>
                <td className="border p-2 text-center">
                  {calculateGrandTotalMarks()}
                </td>
                <td className="border p-2 text-center">
                  {calculateGrandTotalObtained()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-center gap-4 items-center">
        <Button
          variant="outline"
          className="border-gray-300"
          onClick={() => router.push('/admin/exams/offline-marks')}
        >
          Cancel
        </Button>
        <Button 
          onClick={saveResults} 
          disabled={subjects.length === 0 || !isVerified}
          className={`${isVerified 
            ? "bg-orange-500 hover:bg-orange-600 text-white" 
            : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
        >
          Approve Marks
        </Button>
        <Button 
          onClick={handleVerify}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Verify
        </Button>
        {percentage !== null && (
          <div className="ml-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <span className="font-semibold">Percentage: </span> 
            <span className="text-lg">{percentage.toFixed(2)}%</span>
          </div>
        )}
      </div>
      
      {isVerified && percentage !== null && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Verification Complete
          </h3>
          <div className="text-center">
            <span className="font-bold text-2xl text-green-700">
              {percentage.toFixed(2)}%
            </span>
            <span className="ml-2 text-gray-700">Overall Percentage</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            The marks have been verified. Click "Approve Marks" to save them in the database.
          </p>
        </div>
      )}
    </div>
  )
} 