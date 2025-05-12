"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadLocalFile, generateFallbackImageUrl } from "@/lib/fileUtils"
import { useAuth } from "@/lib/auth"

// Add custom styles for dropdowns to fix transparency issues
const customSelectStyles = {
  backgroundColor: "#f9fafb", // Light gray background
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid #e5e7eb",
  borderRadius: "0.375rem"
}

export default function NewStudent() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    motherName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    education: "",
    course: "",
    joiningDate: "",
    feeStatus: "",
    photo: null,
    idCard: null,
    signature: null,
  })
  const [courses, setCourses] = useState<any[]>([])
  
  // State for image previews
  const [photoPreviews, setPhotoPreviews] = useState({
    photo: "",
    idCard: "",
    signature: "",
  })

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses for student form...");
      const timestamp = new Date().getTime();
      // Add refresh flag to force a fresh fetch
      const response = await fetch(`/api/courses?refresh=true&t=${timestamp}`, {
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
      console.log('Student form received data:', data);
      
      if (data.success) {
        console.log(`Student form received ${data.data.length} courses`);
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error loading courses",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      setFormData((prev) => ({ ...prev, [name]: file }))
      
      // Create and set image preview URL
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        console.log(`Creating preview for ${name}:`, previewUrl);
        
        // Create a copy of the current state outside the setState call
        // to ensure React batching doesn't cause issues
        const updatedPreviews = {
          ...photoPreviews,
          [name]: previewUrl
        };
        console.log(`Setting previews state:`, updatedPreviews);
        setPhotoPreviews(updatedPreviews);
      } else {
        // Clear preview if no file is selected
        console.log(`Clearing preview for ${name}`);
        const updatedPreviews = {
          ...photoPreviews,
          [name]: ""
        };
        setPhotoPreviews(updatedPreviews);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2)
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `STU${year}${randomNum}`
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate student ID and password
      const studentId = generateStudentId()
      const password = generatePassword()
      
      // Upload files and get URLs
      let photoUrl = ""
      let idCardUrl = ""
      let signatureUrl = ""
      
      if (formData.photo) {
        photoUrl = await uploadLocalFile(formData.photo as File, "students/photos") || ""
        if (!photoUrl) {
          photoUrl = generateFallbackImageUrl('photo', studentId);
          console.log("Using fallback photo URL:", photoUrl);
        }
      }
      
      if (formData.idCard) {
        idCardUrl = await uploadLocalFile(formData.idCard as File, "students/idcards") || ""
        if (!idCardUrl) {
          idCardUrl = generateFallbackImageUrl('idCard', studentId);
          console.log("Using fallback ID card URL:", idCardUrl);
        }
      }
      
      if (formData.signature) {
        signatureUrl = await uploadLocalFile(formData.signature as File, "students/signatures") || ""
        if (!signatureUrl) {
          signatureUrl = generateFallbackImageUrl('signature', studentId);
          console.log("Using fallback signature URL:", signatureUrl);
        }
      }

      // Format student data to match the Student model schema
      const studentData = {
        studentId,
        password,  // Store plain password in Student model so it can be displayed on the passwords page
        name: formData.firstName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        course: formData.course,
        enrollmentDate: formData.joiningDate,
        photoUrl,
        idCardUrl,
        signatureUrl,
        status: "Active",
        atcId: user?._id  // Set the ATC ID to associate with this ATC
      }

      // Save the student to the database
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Also create user login credentials with hashed password
          const userData = {
            username: studentId,
            email: formData.email,
            password: password,  // This will be hashed by the API
            role: 'student',
          };

          // Save user credentials
          await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          // Display success message and credentials
          toast({
            title: "Student registered successfully",
            description: `Student ID: ${studentId}, Password: ${password}`,
            duration: 10000,  // Extended duration to ensure they can note the credentials
          });

          // Redirect to the students page
          router.push("/atc/students");
        } else {
          throw new Error(result.message || "Failed to register student");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register student");
      }
    } catch (error) {
      console.error("Error registering student:", error);
      toast({
        title: "Error registering student",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Register New Student</h1>

      <Card>
        <CardHeader>
          <CardTitle>Student Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Personal Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                  >
                    <SelectTrigger style={customSelectStyles}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
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
                    placeholder="Select date of birth"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Contact Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Education Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Education Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Qualification</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Enter highest qualification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                  <Select
                    name="course"
                    value={formData.course}
                    onValueChange={(value) => handleSelectChange("course", value)}
                    required
                  >
                    <SelectTrigger style={customSelectStyles}>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading courses...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="joiningDate"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    placeholder="Select joining date"
                    required
                  />
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Document Uploads</h2>

                <div className="space-y-2">
                  <Label htmlFor="photo">Student Photo</Label>
                  <Input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {photoPreviews.photo && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                      <div className="h-32 w-32 relative">
                        <Image
                          src={photoPreviews.photo}
                          alt="Student photo preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idCard">ID Card (Optional)</Label>
                  <Input
                    id="idCard"
                    name="idCard"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {photoPreviews.idCard && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                      <div className="h-32 w-32 relative">
                        <Image
                          src={photoPreviews.idCard}
                          alt="ID card preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Signature (Optional)</Label>
                  <Input
                    id="signature"
                    name="signature"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {photoPreviews.signature && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Preview:</p>
                      <div className="h-32 w-32 relative">
                        <Image
                          src={photoPreviews.signature}
                          alt="Signature preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/atc/students")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Registering...
                  </>
                ) : (
                  "Register Student"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 