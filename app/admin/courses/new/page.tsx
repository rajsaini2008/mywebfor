"use client"

import React, { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
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

export default function NewCourse() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    fee: "",
    description: "",
    status: "active",
    image: null,
  })
  const [imagePreview, setImagePreview] = useState<string>("")

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
        setImagePreview("")
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
      // Upload image if provided
      let imageUrl = `/placeholder.svg?text=${encodeURIComponent(formData.code)}&width=600&height=400`
      
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
        subjects: [] // Empty array for subjects, to be added later
      }

      console.log("Submitting course data:", courseData);

      // Save the course to the database - add timestamp to bypass cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/courses?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(courseData),
      });

      // Extra check to ensure response is valid
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Course added successfully",
          description: `${formData.name} has been added to the system.`,
        });
        
        // Redirect after successful save
        setTimeout(() => {
          router.push("/admin/courses");
        }, 1000);
      } else {
        // Handle specific error messages
        let errorMessage = result.message || "Failed to create course";
        
        // Display validation errors if they exist
        if (result.errors && Array.isArray(result.errors)) {
          errorMessage = result.errors.join(', ');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add New Course</h1>
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
                  <p className="text-sm text-gray-500 mt-1">Upload an image for the course (optional)</p>
                </div>
                {imagePreview ? (
                  <div className="mt-2 md:mt-0 md:w-1/3">
                    <div className="border rounded p-2">
                      <SafeImage 
                        src={imagePreview} 
                        alt="Course Preview" 
                        width={300} 
                        height={200}
                        type="course" 
                        className="object-contain w-full h-auto" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 md:mt-0 md:w-1/3">
                    <div className="border rounded p-2 flex items-center justify-center h-[200px] bg-gray-50">
                      <p className="text-gray-400">Image preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: string) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="bg-transparent border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
