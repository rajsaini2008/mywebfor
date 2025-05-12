"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface Template {
  _id: string
  type: "certificate" | "marksheet" | "subcenter"
  name: string
  imageUrl: string
  isActive: boolean
  createdAt?: string
}

export default function Backgrounds() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [uploadingMarksheet, setUploadingMarksheet] = useState(false)
  const [uploadingSubcenter, setUploadingSubcenter] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/backgrounds')
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data)
      } else {
        throw new Error(data.message || 'Error fetching templates')
      }
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error loading templates",
        description: "There was a problem loading the template data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadTemplate = async (file: File, type: "certificate" | "marksheet" | "subcenter") => {
    if (!file) return
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('name', `${type.charAt(0).toUpperCase() + type.slice(1)} Template ${new Date().toISOString().slice(0, 10)}`)
      
      // Set the appropriate loading state
      if (type === 'certificate') setUploadingCertificate(true)
      else if (type === 'marksheet') setUploadingMarksheet(true)
      else if (type === 'subcenter') setUploadingSubcenter(true)
      
      // Upload the file
      const response = await fetch('/api/backgrounds/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type} template`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh templates
        fetchTemplates()
        
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} template uploaded`,
          description: `The ${type} template has been uploaded successfully.`,
        })
      } else {
        throw new Error(result.message || `Error uploading ${type} template`)
      }
    } catch (error) {
      console.error(`Error uploading ${type} template:`, error)
      toast({
        title: "Upload failed",
        description: `There was a problem uploading the ${type} template.`,
        variant: "destructive",
      })
    } finally {
      // Reset the appropriate loading state
      if (type === 'certificate') setUploadingCertificate(false)
      else if (type === 'marksheet') setUploadingMarksheet(false)
      else if (type === 'subcenter') setUploadingSubcenter(false)
    }
  }

  const handleUploadCertificate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadTemplate(file, "certificate")
  }

  const handleUploadMarksheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadTemplate(file, "marksheet")
  }

  const handleUploadSubcenter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadTemplate(file, "subcenter")
  }

  const setActiveTemplate = async (id: string, type: "certificate" | "marksheet" | "subcenter") => {
    try {
      const response = await fetch(`/api/backgrounds/${id}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to set ${type} template as active`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state to reflect changes
        setTemplates(templates.map(template => {
          if (template.type === type) {
            return {
              ...template,
              isActive: template._id === id
            }
          }
          return template
        }))
        
        toast({
          title: "Template activated",
          description: `The ${type} template has been set as active.`,
        })
      } else {
        throw new Error(result.message || `Error activating ${type} template`)
      }
    } catch (error) {
      console.error(`Error setting ${type} template as active:`, error)
      toast({
        title: "Error",
        description: `Could not set the ${type} template as active.`,
        variant: "destructive"
      })
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const template = templates.find(t => t._id === id)
      
      if (!template) {
        toast({
          title: "Error",
          description: "Template not found",
          variant: "destructive"
        })
        return
      }
      
      if (template.isActive) {
        toast({
          title: "Cannot delete active template",
          description: "Please set another template as active before deleting this one.",
          variant: "destructive",
        })
        return
      }
      
      if (!confirm("Are you sure you want to delete this template?")) {
        return
      }
      
      const response = await fetch(`/api/backgrounds/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete template')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        setTemplates(templates.filter(template => template._id !== id))
        
        toast({
          title: "Template deleted",
          description: "The template has been deleted successfully.",
        })
      } else {
        throw new Error(result.message || 'Error deleting template')
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the template.",
        variant: "destructive"
      })
    }
  }

  const certificateTemplates = templates.filter((template) => template.type === "certificate")
  const marksheetTemplates = templates.filter((template) => template.type === "marksheet")
  const subcenterTemplates = templates.filter((template) => template.type === "subcenter")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Background Templates</h1>
      </div>

      <Tabs defaultValue="certificate" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="certificate">Certificate</TabsTrigger>
          <TabsTrigger value="marksheet">Marksheet</TabsTrigger>
          <TabsTrigger value="subcenter">Sub Center</TabsTrigger>
        </TabsList>

        <TabsContent value="certificate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="upload-certificate" className="block mb-2">
                  Upload New Certificate Template
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="upload-certificate"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCertificate}
                    disabled={uploadingCertificate}
                  />
                  <Button disabled={uploadingCertificate}>{uploadingCertificate ? "Uploading..." : "Upload"}</Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
                </div>
              ) : certificateTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No certificate templates found. Upload a template to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificateTemplates.map((template) => (
                    <Card key={template._id} className={template.isActive ? "border-2 border-blue-500" : ""}>
                      <CardContent className="p-4">
                        <div className="aspect-[16/11] relative mb-4 overflow-hidden rounded-md">
                          <Image
                            src={template.imageUrl || "/placeholder.svg"}
                            alt={template.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isActive && (
                              <span className="text-xs text-blue-600 font-medium">Active Template</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!template.isActive && (
                              <Button 
                                className="h-9 rounded-md px-3"
                                onClick={() => setActiveTemplate(template._id, "certificate")}
                              >
                                Set Active
                              </Button>
                            )}
                            {!template.isActive && (
                              <Button
                                className="h-9 rounded-md px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteTemplate(template._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marksheet" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Marksheet Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="upload-marksheet" className="block mb-2">
                  Upload New Marksheet Template
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="upload-marksheet"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadMarksheet}
                    disabled={uploadingMarksheet}
                  />
                  <Button disabled={uploadingMarksheet}>{uploadingMarksheet ? "Uploading..." : "Upload"}</Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
                </div>
              ) : marksheetTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No marksheet templates found. Upload a template to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {marksheetTemplates.map((template) => (
                    <Card key={template._id} className={template.isActive ? "border-2 border-blue-500" : ""}>
                      <CardContent className="p-4">
                        <div className="aspect-[16/11] relative mb-4 overflow-hidden rounded-md">
                          <Image
                            src={template.imageUrl || "/placeholder.svg"}
                            alt={template.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isActive && (
                              <span className="text-xs text-blue-600 font-medium">Active Template</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!template.isActive && (
                              <Button 
                                className="h-9 rounded-md px-3"
                                onClick={() => setActiveTemplate(template._id, "marksheet")}
                              >
                                Set Active
                              </Button>
                            )}
                            {!template.isActive && (
                              <Button
                                className="h-9 rounded-md px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteTemplate(template._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcenter" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sub Center Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="upload-subcenter" className="block mb-2">
                  Upload New Sub Center Template
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="upload-subcenter"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadSubcenter}
                    disabled={uploadingSubcenter}
                  />
                  <Button disabled={uploadingSubcenter}>{uploadingSubcenter ? "Uploading..." : "Upload"}</Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
                </div>
              ) : subcenterTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sub center templates found. Upload a template to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subcenterTemplates.map((template) => (
                    <Card key={template._id} className={template.isActive ? "border-2 border-blue-500" : ""}>
                      <CardContent className="p-4">
                        <div className="aspect-[16/11] relative mb-4 overflow-hidden rounded-md">
                          <Image
                            src={template.imageUrl || "/placeholder.svg"}
                            alt={template.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isActive && (
                              <span className="text-xs text-blue-600 font-medium">Active Template</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!template.isActive && (
                              <Button 
                                className="h-9 rounded-md px-3"
                                onClick={() => setActiveTemplate(template._id, "subcenter")}
                              >
                                Set Active
                              </Button>
                            )}
                            {!template.isActive && (
                              <Button
                                className="h-9 rounded-md px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteTemplate(template._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
