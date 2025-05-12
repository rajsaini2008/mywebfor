"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

interface Course {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

// Update the styles for the SelectContent component
const customSelectStyles = {
  backgroundColor: "#f9fafb", // Light gray background
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid #e5e7eb",
  borderRadius: "0.375rem"
}

export default function AddExam() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [courseSubjects, setCourseSubjects] = useState<Subject[]>([])
  const [subjectRows, setSubjectRows] = useState<any[]>([])
  const [formData, setFormData] = useState({
    paperType: "online",
    examType: "Main",
    paperName: "",
    totalQuestions: "",
    correctMarksPerQuestion: "",
    passingMarks: "",
    time: "",
    startDate: "",
    endDate: "",
    reAttempt: "",
    reAttemptTime: "",
    isNegativeMark: "No",
    negativeMarks: "",
    positiveMarks: "",
    courseType: "",
    course: "",
    status: "inactive", // Default status is inactive
    subjects: [] as any[]
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const data = await response.json()
        
        if (data.success) {
          setCourses(data.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load courses",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "An error occurred while fetching courses",
          variant: "destructive",
        })
      }
    }

    fetchCourses()
  }, [])

  // Fetch subjects when course changes
  useEffect(() => {
    const fetchCourseSubjects = async () => {
      if (!formData.course) {
        setCourseSubjects([])
        setSubjectRows([])
        return
      }

      try {
        const response = await fetch(`/api/courses/${formData.course}?include=subjects`)
        const data = await response.json()
        
        if (data.success && data.data.subjects) {
          setCourseSubjects(data.data.subjects)
          
          // Initialize subject rows with default values
          const initialRows = data.data.subjects.map((subject: Subject) => ({
            subjectId: subject._id,
            subjectName: subject.name,
            numberOfQuestions: '',
            isIndividual: 'No',
            passingMarks: '',
            theoreticalMarks: '',
            practicalMarks: ''
          }))
          
          setSubjectRows(initialRows)
          setFormData(prev => ({ ...prev, subjects: initialRows }))
        } else {
          setCourseSubjects([])
          setSubjectRows([])
        }
      } catch (error) {
        console.error("Error fetching course subjects:", error)
        setCourseSubjects([])
        setSubjectRows([])
        toast({
          title: "Error",
          description: "Failed to load course subjects",
          variant: "destructive",
        })
      }
    }

    fetchCourseSubjects()
  }, [formData.course])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle change in subject rows
  const handleSubjectChange = (index: number, field: string, value: string) => {
    const newRows = [...subjectRows]
    newRows[index][field] = value
    
    // Calculate theoretical marks if number of questions changes
    if (field === 'numberOfQuestions' && formData.correctMarksPerQuestion) {
      const questions = parseInt(value) || 0
      const marksPerQuestion = parseFloat(formData.correctMarksPerQuestion) || 0
      newRows[index].theoreticalMarks = (questions * marksPerQuestion).toString()
    }
    
    setSubjectRows(newRows)
    setFormData(prev => ({ ...prev, subjects: newRows }))
  }

  // Recalculate all theoretical marks when correctMarksPerQuestion changes
  useEffect(() => {
    if (formData.correctMarksPerQuestion && subjectRows.length > 0) {
      const marksPerQuestion = parseFloat(formData.correctMarksPerQuestion) || 0
      
      const updatedRows = subjectRows.map(row => {
        const questions = parseInt(row.numberOfQuestions) || 0
        return {
          ...row,
          theoreticalMarks: (questions * marksPerQuestion).toString()
        }
      })
      
      setSubjectRows(updatedRows)
      setFormData(prev => ({ ...prev, subjects: updatedRows }))
    }
  }, [formData.correctMarksPerQuestion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log("Starting form submission...")

    try {
      // Basic form validation
      if (!formData.paperName || !formData.totalQuestions || !formData.correctMarksPerQuestion || 
          !formData.passingMarks || !formData.time || !formData.startDate || !formData.endDate ||
          !formData.course || !formData.courseType) {
        console.error("Form validation failed - missing required fields");
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate random 4-digit paper ID
      const paperId = `P${Math.floor(1000 + Math.random() * 9000)}`;
      console.log("Generated paper ID:", paperId);
      
      // Prepare data for API
      console.log("Preparing form data for submission...");
      const paperData = {
        paperId,
        ...formData,
        totalQuestions: parseInt(formData.totalQuestions),
        correctMarksPerQuestion: parseFloat(formData.correctMarksPerQuestion),
        passingMarks: parseFloat(formData.passingMarks),
        time: parseInt(formData.time),
        reAttempt: parseInt(formData.reAttempt) || 0,
        reAttemptTime: parseInt(formData.reAttemptTime) || 0,
        isNegativeMark: formData.isNegativeMark === "Yes",
        negativeMarks: formData.negativeMarks ? parseFloat(formData.negativeMarks) : 0,
        positiveMarks: formData.positiveMarks ? parseFloat(formData.positiveMarks) : 0,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        paperType: formData.paperType,
        examType: formData.examType,
        status: 'inactive', // Always set status to inactive when creating
        subjects: formData.subjects.map(subject => ({
          ...subject,
          numberOfQuestions: parseInt(subject.numberOfQuestions) || 0,
          passingMarks: parseFloat(subject.passingMarks) || 0,
          theoreticalMarks: parseFloat(subject.theoreticalMarks) || 0,
          practicalMarks: parseFloat(subject.practicalMarks) || 0,
          isIndividual: subject.isIndividual === 'Yes'
        }))
      }
      
      console.log("Sending data to API:", JSON.stringify(paperData, null, 2));
      
      // Call API to save exam paper
      const response = await fetch('/api/exam-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paperData),
      })
      
      console.log("API response status:", response.status);
      const result = await response.json()
      console.log("API response data:", result);
      
      if (result.success) {
        console.log("Exam paper saved successfully");
      toast({
          title: "Success",
          description: `Exam paper added successfully with ID: ${paperId}`,
      })
      
      // Reset form
      setFormData({
          paperType: "online",
          examType: "Main",
          paperName: "",
          totalQuestions: "",
          correctMarksPerQuestion: "",
          passingMarks: "",
          time: "",
          startDate: "",
          endDate: "",
          reAttempt: "",
          reAttemptTime: "",
          isNegativeMark: "No",
          negativeMarks: "",
          positiveMarks: "",
          courseType: "",
          course: "",
          status: "inactive",
          subjects: []
        })
        
        setCourseSubjects([])
        setSubjectRows([])
      } else {
        console.error("API returned error:", result.message);
        throw new Error(result.message || "Failed to add exam paper")
      }
    } catch (error) {
      console.error("Error adding exam paper:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while adding the exam paper",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-h-[calc(100vh-4rem)] admin-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Add New Exam</h1>
      </div>

      <Card className="h-full flex-1 admin-card">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle>Exam Paper Information</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 flex-1 admin-card-content">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type: *</Label>
                <Select 
                  value={formData.examType} 
                  onValueChange={(value) => handleSelectChange("examType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent style={customSelectStyles}>
                    <SelectItem value="Main">Main Exam</SelectItem>
                    <SelectItem value="Practice">Practice Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="paperName">Paper Name: *</Label>
                <Input
                  id="paperName"
                  name="paperName"
                  placeholder="Enter paper name"
                  value={formData.paperName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="totalQuestions">Total Questions: *</Label>
                <Input
                  id="totalQuestions"
                  name="totalQuestions"
                  type="number"
                  placeholder="Enter number"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="correctMarksPerQuestion">Correct number per Question: *</Label>
                <Input
                  id="correctMarksPerQuestion"
                  name="correctMarksPerQuestion"
                  type="number"
                  step="0.01"
                  placeholder="Enter marks"
                  value={formData.correctMarksPerQuestion}
                  onChange={handleChange}
                  required
                />
            </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="passingMarks">Passing Marks: *</Label>
                <Input
                  id="passingMarks"
                  name="passingMarks"
                  type="number"
                  step="0.01"
                  placeholder="Enter marks"
                  value={formData.passingMarks}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="time">Time (In Minutes): *</Label>
                <Input
                  id="time"
                  name="time"
                  type="number"
                  placeholder="Enter minutes"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="startDate">Start Date: *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="endDate">End Date: *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="reAttempt">Re-Attempt: *</Label>
                <Input
                  id="reAttempt"
                  name="reAttempt"
                  type="number"
                  placeholder="Enter number"
                  value={formData.reAttempt}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="reAttemptTime">Re-Attempt Time (In Minutes): *</Label>
                <Input
                  id="reAttemptTime"
                  name="reAttemptTime"
                  type="number"
                  placeholder="Enter minutes"
                  value={formData.reAttemptTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Fourth Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label>Is Negative Mark: *</Label>
                <RadioGroup 
                  value={formData.isNegativeMark}
                  onValueChange={(value) => handleRadioChange("isNegativeMark", value)}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2 md:col-span-1 flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="negativeMarks">Negative Mark / Positive Marks</Label>
                  <div className="flex items-center">
                    <Input
                      id="negativeMarks"
                      name="negativeMarks"
                      type="number"
                      step="0.01"
                      placeholder="Negative"
                      value={formData.negativeMarks}
                      onChange={handleChange}
                      disabled={formData.isNegativeMark !== "Yes"}
                    />
                    <span className="mx-2">/</span>
                    <Input
                      id="positiveMarks"
                      name="positiveMarks"
                      type="number"
                      step="0.01"
                      placeholder="Positive"
                      value={formData.positiveMarks}
                onChange={handleChange}
                      disabled={formData.isNegativeMark !== "Yes"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Course Type & Course Selection */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courseType">Course Type: *</Label>
                <Select 
                  value={formData.courseType} 
                  onValueChange={(value) => {
                    handleSelectChange("courseType", value);
                    // Reset course selection when course type changes
                    handleSelectChange("course", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent style={customSelectStyles}>
                    <SelectItem value="with_subject">With Subject</SelectItem>
                    <SelectItem value="without_subject">Without Subject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course: *</Label>
                <Select 
                  value={formData.course} 
                  onValueChange={(value) => handleSelectChange("course", value)}
                  disabled={!formData.courseType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent style={customSelectStyles}>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject Details */}
            {formData.course && (
              <>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold mb-3">Subject Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-green-500 text-white">
                        <th className="p-2 border">Subject Name</th>
                        <th className="p-2 border">Number Of Questions</th>
                        <th className="p-2 border">Is Individual</th>
                        <th className="p-2 border">Passing Marks</th>
                        <th className="p-2 border">Theoretical Marks</th>
                        <th className="p-2 border">Practical Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectRows.map((subject, index) => (
                        <tr key={subject.subjectId} className="border-b">
                          <td className="p-2 border">
                            <Input
                              value={subject.subjectName}
                              readOnly
                              className="w-full"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={subject.numberOfQuestions}
                              onChange={(e) => handleSubjectChange(index, 'numberOfQuestions', e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-2 border">
                            <RadioGroup 
                              value={subject.isIndividual}
                              onValueChange={(value) => handleSubjectChange(index, 'isIndividual', value)}
                              className="flex gap-4 justify-center"
                            >
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="Yes" id={`yes-${index}`} />
                                <Label htmlFor={`yes-${index}`} className="text-sm">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-1">
                                <RadioGroupItem value="No" id={`no-${index}`} />
                                <Label htmlFor={`no-${index}`} className="text-sm">No</Label>
                              </div>
                            </RadioGroup>
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={subject.passingMarks}
                              onChange={(e) => handleSubjectChange(index, 'passingMarks', e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={subject.theoreticalMarks}
                              readOnly={formData.correctMarksPerQuestion !== "" && subject.numberOfQuestions !== ""}
                              onChange={(e) => handleSubjectChange(index, 'theoreticalMarks', e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={subject.practicalMarks}
                              onChange={(e) => handleSubjectChange(index, 'practicalMarks', e.target.value)}
                              className="w-full"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting || !formData.course} 
                className="bg-blue-800 hover:bg-blue-900"
              >
                {isSubmitting ? "Adding..." : "Add Paper"}
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p className="text-blue-700">
                <strong>Note:</strong> The exam will be created as inactive by default. It will automatically be activated when you upload questions for all subjects.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 