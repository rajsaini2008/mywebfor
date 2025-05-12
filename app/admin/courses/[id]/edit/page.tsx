"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadLocalFile } from "@/lib/fileUtils"
import SafeImage from "@/components/ui/SafeImage"

export default function EditCourse() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    fee: "",
    description: "",
    status: "active",
    image: null,
    imageUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")

  // Fetch existing course data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/courses/${id}?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course data. Status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          const course = data.data
          setFormData({
            name: course.name || "",
            code: course.code || "",
            duration: course.duration || "",
            fee: course.fee ? course.fee.toString() : "",
            description: course.description || "",
            status: course.isActive ? "active" : "inactive",
            image: null,
            imageUrl: course.imageUrl || "",
          })
          
          if (course.imageUrl) {
            setImagePreview(course.imageUrl)
          }
        } else {
          throw new Error(data.message || "Failed to fetch course data")
        }
      } catch (error: any) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchCourse()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null
      setFormData((prev) => ({ ...prev, [name]: file }))
      
      // Create image preview for file uploads
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
      } else {
        // If no file selected, go back to original image if available
        setImagePreview(formData.imageUrl || "")
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Only upload a new image if provided
      let imageUrl = formData.imageUrl
      
      if (formData.image) {
        const uploadedUrl = await uploadLocalFile(formData.image as File, "courses")
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }
      
      // Format course data to match the Course model schema
      const courseData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        duration: formData.duration,
        fee: parseFloat(formData.fee.replace(/[^0-9.]/g, '')), // Convert to number
        imageUrl: imageUrl,
        isActive: formData.status === 'active',
      }

      console.log("Updating course data:", courseData);

      // Update the course - add timestamp to bypass cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/courses/${id}?t=${timestamp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Course updated successfully",
          description: `${formData.name} has been updated.`,
        });
        
        // Redirect after successful update
        setTimeout(() => {
          router.push("/admin/courses");
        }, 1000);
      } else {
        // Handle specific error messages
        let errorMessage = result.message || "Failed to update course";
        
        // Display validation errors if they exist
        if (result.errors && Array.isArray(result.errors)) {
          errorMessage = result.errors.join(', ');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.startsWith('/')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
        <Button 
          variant="outline"
          onClick={() => router.push("/admin/courses")}
        >
          Back to Courses
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter course name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Enter course code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="e.g., 6 months"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Course Fee</Label>
                <Input
                  id="fee"
                  name="fee"
                  placeholder="e.g., ₹12,000"
                  value={formData.fee}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Course Image</Label>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:flex-1">
                  <Input id="image" name="image" type="file" accept="image/*" onChange={handleChange} />
                  <p className="text-sm text-gray-500 mt-1">Upload a new image for the course (optional)</p>
                </div>
                <div className="mt-2 md:mt-0 md:w-1/3">
                  <div className="border rounded p-2">
                    <SafeImage 
                      src={imagePreview || `/placeholder.svg?text=${encodeURIComponent(formData.code)}&width=600&height=400`}
                      alt="Course Preview" 
                      width={300} 
                      height={200}
                      type="course" 
                      className="object-contain w-full h-auto" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: string) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/admin/courses")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 