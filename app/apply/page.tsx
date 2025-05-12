"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadLocalFile } from "@/lib/fileUtils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Add custom styles for dropdowns to fix transparency issues
const customSelectStyles = {
  backgroundColor: "#f9fafb", // Light gray background
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid #e5e7eb",
  borderRadius: "0.375rem"
}

export default function StudentEnquiry() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    education: "",
    course: courseId || "",
    message: "",
    preferredTime: "",
  })
  const [courses, setCourses] = useState<any[]>([])
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState("")

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses for enquiry form...");
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/courses?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Enquiry form received ${data.data.length} courses`);
        setCourses(data.data || []);
        
        // If we have a course ID from params and courses are loaded, validate it
        if (courseId && data.data.length > 0) {
          const foundCourse = data.data.find((course: any) => course._id === courseId);
          if (foundCourse) {
            setFormData(prev => ({ ...prev, course: courseId }));
          }
        }
      } else {
        throw new Error(data.message || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error loading courses",
        description: "Failed to load courses. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateApplicationId = () => {
    const year = new Date().getFullYear().toString().slice(-2)
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `APP${year}${randomNum}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate application ID
      const appId = generateApplicationId()
      setApplicationId(appId)
      
      // Format enquiry data
      const enquiryData = {
        applicationId: appId,
        name: `${formData.firstName} ${formData.lastName}`,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        education: formData.education,
        course: formData.course,
        message: formData.message,
        preferredTime: formData.preferredTime,
        status: "New",
        createdAt: new Date(),
      }

      console.log("Submitting enquiry:", enquiryData);

      // Submit data to the API endpoint
      const response = await fetch("/api/enquiries/student", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to submit enquiry. Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to submit enquiry");
      }
      
      console.log("Enquiry submitted successfully:", result);
      
      // Show success message
      toast({
        title: "Enquiry submitted successfully",
        description: "We'll contact you soon. Your application ID is: " + appId,
      });
      
      // Update state to show success message
      setFormSubmitted(true);

    } catch (error: any) {
      console.error("Error submitting enquiry:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while submitting your enquiry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (formSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 bg-white">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="bg-green-100 text-green-700 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium">Thank you for your application!</h3>
              <p className="text-gray-600">We have received your enquiry and will contact you soon.</p>
              <div className="bg-blue-50 p-4 rounded-lg inline-block">
                <p className="text-gray-700">Your Application ID:</p>
                <p className="text-xl font-bold text-blue-700">{applicationId}</p>
                <p className="text-sm text-gray-500 mt-2">Please save this ID for future reference</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="mt-2"
            >
              Return to Home
            </Button>
            <Button 
              onClick={() => router.push("/courses")}
              className="mt-2"
            >
              Browse More Courses
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-12 bg-white">
      {/* Full-width blue header */}
      <div className="bg-blue-800 text-white py-8 mb-12 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Student Application Form</h1>
            <p className="text-gray-100">Fill out the form below to apply for admission</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Please provide your personal details for our records
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      name="fatherName"
                      placeholder="Enter father's name"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      name="motherName"
                      placeholder="Enter mother's name"
                      value={formData.motherName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent style={customSelectStyles}>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Qualification</Label>
                    <Input
                      id="education"
                      name="education"
                      placeholder="Highest qualification"
                      value={formData.education}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                  />
                </div>

                {/* Course Information */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Course Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Select 
                        value={formData.course} 
                        onValueChange={(value) => handleSelectChange("course", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent style={customSelectStyles} className="max-h-60 overflow-y-auto">
                          {courses.length > 0 ? (
                            courses.map((course) => (
                              <SelectItem key={course._id} value={course._id}>
                                {course.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-courses" disabled>
                              No courses available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Select 
                        value={formData.preferredTime} 
                        onValueChange={(value) => handleSelectChange("preferredTime", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent style={customSelectStyles}>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                          <SelectItem value="Weekend">Weekend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Any specific queries or requirements?"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                    <p className="font-medium">Important Information:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>This is an initial application for enquiry only.</li>
                      <li>Our team will contact you within 24-48 hours.</li>
                      <li>You will need to visit our institute with original documents for final admission.</li>
                      <li>Course fees and timing details will be provided during the counseling session.</li>
                    </ul>
                  </div>
                
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="rounded" 
                      required 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the <Link href="/terms" className="text-blue-600 hover:underline">terms and conditions</Link> and consent to the processing of my personal information.
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-700 hover:bg-blue-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 