"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"
import { uploadLocalFile } from "@/lib/fileUtils"

interface SubCenter {
  _id: string
  centerId: string
  name: string
  email: string
  phone: string
  address: string
  ownerImage: string
  photoIdImage: string
  centerLogo: string
  createdAt: string
  isActive: boolean
}

export default function ATCProfile() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subcenterData, setSubcenterData] = useState<SubCenter | null>(null)
  
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

  const fetchSubcenterData = async () => {
    try {
      setIsLoading(true)
      
      if (!user?.userId) {
        throw new Error("No user ID found")
      }
      
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/subcenters?centerId=${user.userId}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        const subcenter = data.data[0]
        setSubcenterData(subcenter)
        
        // Set existing images
        if (subcenter.ownerImage) {
          setOwnerImagePreview(subcenter.ownerImage)
        }
        
        if (subcenter.photoIdImage) {
          setPhotoIdPreview(subcenter.photoIdImage)
        }
        
        if (subcenter.centerLogo) {
          setCenterLogoPreview(subcenter.centerLogo)
        }
      } else {
        throw new Error(data.message || "Unknown error from API")
      }
    } catch (error) {
      console.error("Error fetching subcenter:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error loading subcenter data",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubcenterData()
  }, [user])
  
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

  const handleUpdateImages = async () => {
    if (!subcenterData) return
    
    setIsSubmitting(true)
    
    try {
      // Upload new images if selected
      let ownerImageUrl = subcenterData.ownerImage
      let photoIdUrl = subcenterData.photoIdImage
      let centerLogoUrl = subcenterData.centerLogo
      
      if (ownerImageFile) {
        ownerImageUrl = await uploadLocalFile(ownerImageFile, 'subcenters')
      }
      
      if (photoIdFile) {
        photoIdUrl = await uploadLocalFile(photoIdFile, 'subcenters')
      }
      
      if (centerLogoFile) {
        centerLogoUrl = await uploadLocalFile(centerLogoFile, 'subcenters')
      }
      
      // Update in database
      const response = await fetch(`/api/subcenters/${subcenterData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerImage: ownerImageUrl,
          photoIdImage: photoIdUrl,
          centerLogo: centerLogoUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Profile updated successfully",
          description: "Your profile images have been updated.",
        })
        
        // Refresh data
        fetchSubcenterData()
      } else {
        throw new Error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <h1 className="text-2xl font-bold tracking-tight">Subcenter Profile</h1>
      </div>
      
      {subcenterData && (
        <>
          <Card className="overflow-hidden mb-6">
            <CardHeader className="bg-blue-50">
              <CardTitle>Center Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Center ID</p>
                    <p className="text-lg font-medium">{subcenterData.centerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Center Name</p>
                    <p className="text-lg font-medium">{subcenterData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-lg">{subcenterData.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-lg">{subcenterData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-lg">{subcenterData.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined On</p>
                    <p className="text-lg">
                      {subcenterData.createdAt ? new Date(subcenterData.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Profile Images</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Owner Image Upload */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Owner Image</p>
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
                  <p className="text-sm font-medium text-gray-500">Photo ID Proof</p>
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
                  <p className="text-sm font-medium text-gray-500">Center Logo</p>
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
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleUpdateImages}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 