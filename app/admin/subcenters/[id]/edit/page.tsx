"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Upload } from "lucide-react"
import { uploadLocalFile } from "@/lib/fileUtils"

export default function EditSubCenter({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    centerName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  
  // Refs for file inputs
  const ownerImageRef = useRef<HTMLInputElement>(null)
  const photoIdRef = useRef<HTMLInputElement>(null)
  const centerLogoRef = useRef<HTMLInputElement>(null)
  
  // State for file previews
  const [ownerImagePreview, setOwnerImagePreview] = useState<string>("")
  const [photoIdPreview, setPhotoIdPreview] = useState<string>("")
  const [centerLogoPreview, setCenterLogoPreview] = useState<string>("")
  
  // State for selected files
  const [ownerImageFile, setOwnerImageFile] = useState<File | null>(null)
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null)
  const [centerLogoFile, setCenterLogoFile] = useState<File | null>(null)
  
  // State for existing images
  const [existingOwnerImage, setExistingOwnerImage] = useState<string>("")
  const [existingPhotoId, setExistingPhotoId] = useState<string>("")
  const [existingCenterLogo, setExistingCenterLogo] = useState<string>("")

  // Load subcenter data
  const fetchSubCenterData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/subcenters/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const subcenter = data.data;
        
        // Split the address if it has components
        const addressParts = subcenter.address ? subcenter.address.split(',').map((part: string) => part.trim()) : ['', '', '', ''];
        const address = addressParts[0] || '';
        const city = addressParts[1] || '';
        const state = addressParts[2] || '';
        const pincode = addressParts[3] || '';
        
        setFormData({
          centerName: subcenter.name || '',
          ownerName: subcenter.ownerName || '',
          email: subcenter.email || '',
          phone: subcenter.phone || '',
          address,
          city,
          state,
          pincode,
        });
        
        // Set existing images
        if (subcenter.ownerImage) {
          setExistingOwnerImage(subcenter.ownerImage);
          setOwnerImagePreview(subcenter.ownerImage);
        }
        
        if (subcenter.photoIdImage) {
          setExistingPhotoId(subcenter.photoIdImage);
          setPhotoIdPreview(subcenter.photoIdImage);
        }
        
        if (subcenter.centerLogo) {
          setExistingCenterLogo(subcenter.centerLogo);
          setCenterLogoPreview(subcenter.centerLogo);
        }
      } else {
        throw new Error(data.message || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error fetching subcenter:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error loading subcenter",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCenterData();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  // Handle file selection for owner image
  const handleOwnerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOwnerImageFile(file)
      const imageUrl = URL.createObjectURL(file)
      setOwnerImagePreview(imageUrl)
    }
  }
  
  // Handle file selection for photo ID
  const handlePhotoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoIdFile(file)
      const imageUrl = URL.createObjectURL(file)
      setPhotoIdPreview(imageUrl)
    }
  }
  
  // Handle file selection for center logo
  const handleCenterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCenterLogoFile(file)
      const imageUrl = URL.createObjectURL(file)
      setCenterLogoPreview(imageUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload new images if selected
      let ownerImageUrl = existingOwnerImage
      let photoIdUrl = existingPhotoId
      let centerLogoUrl = existingCenterLogo
      
      if (ownerImageFile) {
        ownerImageUrl = await uploadLocalFile(ownerImageFile, 'subcenters')
      }
      
      if (photoIdFile) {
        photoIdUrl = await uploadLocalFile(photoIdFile, 'subcenters')
      }
      
      if (centerLogoFile) {
        centerLogoUrl = await uploadLocalFile(centerLogoFile, 'subcenters')
      }
      
      // Format data to match the SubCenter model schema
      const subCenterData = {
        name: formData.centerName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
        ownerImage: ownerImageUrl,
        photoIdImage: photoIdUrl,
        centerLogo: centerLogoUrl,
        isActive: true
      }

      // Update in database
      const response = await fetch(`/api/subcenters/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subCenterData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Sub Center updated successfully",
          description: `${formData.centerName} has been updated.`,
        });
        
        router.push("/admin/subcenters");
      } else {
        throw new Error(result.message || "Failed to update sub center");
      }
    } catch (error: any) {
      console.error("Error updating sub center:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the sub center",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Sub Center</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sub Center Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="centerName">Center Name</Label>
                <Input
                  id="centerName"
                  name="centerName"
                  placeholder="Enter center name"
                  value={formData.centerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="Enter owner name"
                  value={formData.ownerName}
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
                  placeholder="Enter email address"
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
                  placeholder="Enter phone number"
                  value={formData.phone}
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
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Image Upload Section */}
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-4">Images</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Owner Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="ownerImage">Owner Image</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer" 
                       onClick={() => ownerImageRef.current?.click()}>
                    {ownerImagePreview ? (
                      <div className="relative h-40 w-full">
                        <img 
                          src={ownerImagePreview} 
                          alt="Owner preview" 
                          className="h-full w-full object-contain" 
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOwnerImagePreview("");
                            setOwnerImageFile(null);
                            setExistingOwnerImage("");
                            if (ownerImageRef.current) ownerImageRef.current.value = "";
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload owner photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG or JPEG (max 2MB)</p>
                      </div>
                    )}
                    <input
                      ref={ownerImageRef}
                      type="file"
                      id="ownerImage"
                      name="ownerImage"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOwnerImageChange}
                    />
                  </div>
                </div>
                
                {/* Photo ID Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photoId">Photo ID Proof</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer" 
                       onClick={() => photoIdRef.current?.click()}>
                    {photoIdPreview ? (
                      <div className="relative h-40 w-full">
                        <img 
                          src={photoIdPreview} 
                          alt="ID proof preview" 
                          className="h-full w-full object-contain" 
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoIdPreview("");
                            setPhotoIdFile(null);
                            setExistingPhotoId("");
                            if (photoIdRef.current) photoIdRef.current.value = "";
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload ID proof</p>
                        <p className="text-xs text-gray-400">Aadhar, PAN, etc. (max 2MB)</p>
                      </div>
                    )}
                    <input
                      ref={photoIdRef}
                      type="file"
                      id="photoId"
                      name="photoId"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoIdChange}
                    />
                  </div>
                </div>
                
                {/* Center Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="centerLogo">Center Logo</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer" 
                       onClick={() => centerLogoRef.current?.click()}>
                    {centerLogoPreview ? (
                      <div className="relative h-40 w-full">
                        <img 
                          src={centerLogoPreview} 
                          alt="Center logo preview" 
                          className="h-full w-full object-contain" 
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCenterLogoPreview("");
                            setCenterLogoFile(null);
                            setExistingCenterLogo("");
                            if (centerLogoRef.current) centerLogoRef.current.value = "";
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Click to upload center logo</p>
                        <p className="text-xs text-gray-400">JPG, PNG or JPEG (max 2MB)</p>
                      </div>
                    )}
                    <input
                      ref={centerLogoRef}
                      type="file"
                      id="centerLogo"
                      name="centerLogo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCenterLogoChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>All images are optional but recommended for verification purposes.</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Update Sub Center"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 