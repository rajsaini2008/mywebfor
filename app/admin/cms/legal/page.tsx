"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Trash2 } from "lucide-react"
import TinyMCEWrapper from "@/components/TinyMCEWrapper"

// Define interface for CMS content item
interface CmsContentItem {
  section: string;
  key: string;
  value: string;
  _id: string;
}

// Define interface for legal document
interface LegalDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  imageUrl?: string;
  createdAt: string;
}

export default function LegalPageEditor() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("terms")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [termsContent, setTermsContent] = useState("")
  const [privacyContent, setPrivacyContent] = useState("")
  const [refundContent, setRefundContent] = useState("")
  const [disclaimerContent, setDisclaimerContent] = useState("")
  
  // Hero section content
  const [heroTitle, setHeroTitle] = useState("Legal Information")
  const [heroSubtitle, setHeroSubtitle] = useState("Important legal documents and policies for Krishna Computers")

  // Legal document state
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cms?section=legal`)
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Create a map of keys to values
          const contentMap: Record<string, string> = {}
          data.data.forEach((item: CmsContentItem) => {
            contentMap[item.key] = item.value
          })
          
          // Set content
          setTermsContent(contentMap["termsContent"] || "")
          setPrivacyContent(contentMap["privacyContent"] || "")
          setRefundContent(contentMap["refundContent"] || "")
          setDisclaimerContent(contentMap["disclaimerContent"] || "")
          
          // Set hero content
          setHeroTitle(contentMap["heroTitle"] || "Legal Information")
          setHeroSubtitle(contentMap["heroSubtitle"] || "Important legal documents and policies for Krishna Computers")
        }
      } catch (error) {
        console.error("Error fetching legal content:", error)
        toast({
          title: "Error",
          description: "Failed to fetch legal content. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
    fetchDocuments()
  }, [])

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/legal-documents')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load legal documents. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  // Save content functions for each tab
  const saveTermsContent = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "termsContent",
          value: termsContent,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Terms and Conditions updated successfully!",
        })
      } else {
        throw new Error(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error updating terms and conditions:", error)
      toast({
        title: "Error",
        description: "Failed to update terms and conditions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const savePrivacyContent = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "privacyContent",
          value: privacyContent,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Privacy Policy updated successfully!",
        })
      } else {
        throw new Error(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error updating privacy policy:", error)
      toast({
        title: "Error",
        description: "Failed to update privacy policy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const saveRefundContent = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "refundContent",
          value: refundContent,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Refund Policy updated successfully!",
        })
      } else {
        throw new Error(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error updating refund policy:", error)
      toast({
        title: "Error",
        description: "Failed to update refund policy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const saveDisclaimerContent = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "disclaimerContent",
          value: disclaimerContent,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Disclaimer updated successfully!",
        })
      } else {
        throw new Error(data.message || "Something went wrong")
      }
    } catch (error) {
      console.error("Error updating disclaimer:", error)
      toast({
        title: "Error",
        description: "Failed to update disclaimer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear image selection
  const clearImageSelection = () => {
    setSelectedImage(null)
    setImagePreview(null)
    
    // Reset file input
    const imageInput = document.getElementById('document-image') as HTMLInputElement
    if (imageInput) imageInput.value = ''
  }

  // Upload document
  const uploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile && !selectedImage) {
      toast({
        title: "Error",
        description: "Please provide at least a document file or an image.",
        variant: "destructive",
      })
      return
    }
    
    if (!documentTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for the document.",
        variant: "destructive",
      })
      return
    }
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append('title', documentTitle)
    formData.append('description', documentDescription)
    
    // Add file if selected
    if (selectedFile) {
      formData.append('file', selectedFile)
    }
    
    // Add image if selected
    if (selectedImage) {
      formData.append('image', selectedImage)
    }
    
    try {
      const response = await fetch('/api/legal-documents', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Document uploaded successfully!",
        })
        
        // Reset form and refresh documents
        setDocumentTitle("")
        setDocumentDescription("")
        setSelectedFile(null)
        setSelectedImage(null)
        setImagePreview(null)
        
        // Reset file inputs
        const fileInput = document.getElementById('document-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        const imageInput = document.getElementById('document-image') as HTMLInputElement
        if (imageInput) imageInput.value = ''
        
        // Refresh document list
        fetchDocuments()
      } else {
        throw new Error(data.message || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document
  const deleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      return
    }
    
    try {
      const response = await fetch(`/api/legal-documents?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Document deleted successfully!",
        })
        
        // Refresh document list
        fetchDocuments()
      } else {
        throw new Error(data.message || "Delete failed")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  // Get save function based on active tab
  const getSaveFunction = () => {
    switch (activeTab) {
      case "terms":
        return saveTermsContent
      case "privacy":
        return savePrivacyContent
      case "refund":
        return saveRefundContent
      case "disclaimer":
        return saveDisclaimerContent
      default:
        return saveTermsContent
    }
  }
  
  // Handle saving content
  const handleSave = async () => {
    const saveFunction = getSaveFunction()
    await saveFunction()
  }
  
  // Handle saving hero section
  const saveHeroSection = async () => {
    setIsSubmitting(true)
    try {
      // Save title
      await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "heroTitle",
          value: heroTitle,
        }),
      })
      
      // Save subtitle
      await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "legal",
          key: "heroSubtitle",
          value: heroSubtitle,
        }),
      })
      
      toast({
        title: "Success",
        description: "Hero section updated successfully!",
      })
    } catch (error) {
      console.error("Error updating hero section:", error)
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4 p-0"
          onClick={() => router.push("/admin/cms")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Legal Information</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="heroTitle" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="heroTitle"
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="heroSubtitle" className="block text-sm font-medium mb-1">
              Subtitle
            </label>
            <input
              id="heroSubtitle"
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
        <Button
          onClick={saveHeroSection}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Saving..." : "Save Hero Section"}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <Tabs defaultValue="terms" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full border-b">
            <TabsTrigger value="terms" className="flex-1">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">Privacy Policy</TabsTrigger>
            <TabsTrigger value="refund" className="flex-1">Refund Policy</TabsTrigger>
            <TabsTrigger value="disclaimer" className="flex-1">Disclaimer</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">Legal Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="terms" className="mt-0 space-y-4">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Edit Terms & Conditions</h2>
              <div className="min-h-[500px] mb-4">
                <TinyMCEWrapper
                  value={termsContent}
                  onChange={setTermsContent}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code'
                  }}
                />
              </div>
              <Button
                onClick={saveTermsContent}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Terms & Conditions"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-0 space-y-4">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Edit Privacy Policy</h2>
              <div className="min-h-[500px] mb-4">
                <TinyMCEWrapper
                  value={privacyContent}
                  onChange={setPrivacyContent}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code'
                  }}
                />
              </div>
              <Button
                onClick={savePrivacyContent}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Privacy Policy"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="refund" className="mt-0 space-y-4">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Edit Refund Policy</h2>
              <div className="min-h-[500px] mb-4">
                <TinyMCEWrapper
                  value={refundContent}
                  onChange={setRefundContent}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code'
                  }}
                />
              </div>
              <Button
                onClick={saveRefundContent}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Refund Policy"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="disclaimer" className="mt-0 space-y-4">
            <div className="bg-white p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Edit Disclaimer</h2>
              <div className="min-h-[500px] mb-4">
                <TinyMCEWrapper
                  value={disclaimerContent}
                  onChange={setDisclaimerContent}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code'
                  }}
                />
              </div>
              <Button
                onClick={saveDisclaimerContent}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Disclaimer"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <div className="bg-white p-6 rounded-md">
              <h2 className="text-lg font-semibold mb-6">Manage Legal Documents</h2>
              
              {/* Upload form */}
              <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Upload New Document</h3>
                <form onSubmit={uploadDocument} className="space-y-4">
                  <div>
                    <label htmlFor="document-title" className="block text-sm font-medium mb-1">
                      Document Title*
                    </label>
                    <input
                      id="document-title"
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="document-description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="document-description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="document-file" className="block text-sm font-medium mb-1">
                      Document File (PDF, DOC, DOCX)
                    </label>
                    <input
                      id="document-file"
                      type="file"
                      onChange={handleFileChange}
                      className="w-full border rounded-md px-3 py-2"
                      accept=".pdf,.doc,.docx"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a document file or image (at least one is required)</p>
                  </div>
                  
                  <div>
                    <label htmlFor="document-image" className="block text-sm font-medium mb-1">
                      Document Cover Image (Optional)
                    </label>
                    <input
                      id="document-image"
                      type="file"
                      onChange={handleImageChange}
                      className="w-full border rounded-md px-3 py-2"
                      accept="image/*"
                    />
                    
                    {imagePreview && (
                      <div className="mt-2 relative">
                        <div className="rounded-lg overflow-hidden w-48 h-48 border border-gray-200">
                          <img 
                            src={imagePreview} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={clearImageSelection}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </div>
              
              {/* Document list */}
              <div>
                <h3 className="text-lg font-medium mb-4">Existing Documents</h3>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          {doc.imageUrl ? (
                            <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                              <img 
                                src={doc.imageUrl} 
                                alt={doc.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <FileText className="h-8 w-8 text-blue-500 mr-3" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-800">{doc.title}</h4>
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200"
                          >
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200"
                            onClick={() => deleteDocument(doc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 