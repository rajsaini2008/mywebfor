"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<LegalDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch document
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true)
      try {
        // Fetch documents from public endpoint
        const response = await fetch('/api/legal-documents/public')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.documents)) {
          // Find the document with matching ID
          const foundDoc = data.documents.find(
            (doc: LegalDocument) => doc._id === params.id
          )
          
          if (foundDoc) {
            console.log("Document found:", foundDoc)
            setDocument(foundDoc)
          } else {
            setError("Document not found")
          }
        } else {
          setError("Failed to fetch document")
        }
      } catch (error) {
        console.error("Error fetching document:", error)
        setError("An error occurred while fetching document")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDocument()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/legal/documents" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="rounded-lg h-80 w-full md:w-1/3" />
          <div className="w-full md:w-2/3">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/legal/documents" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </div>
        
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <AlertTriangle className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {error || "The document you are looking for is not available."}
          </p>
          <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700">
            <Link href="/legal/documents">Browse All Documents</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <Link href="/legal/documents" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {document.imageUrl ? (
          <div className="w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-100">
            <img 
              src={document.imageUrl} 
              alt={document.title} 
              className="w-full h-full object-contain"
              onLoad={() => console.log("Image loaded successfully:", document.imageUrl)}
              onError={(e) => {
                console.error("Image failed to load:", document.imageUrl);
                e.currentTarget.src = "/placeholder.svg?text=Document&width=600&height=400";
                
                // Try to fix Cloudinary URL if needed
                if (document.imageUrl && document.imageUrl.includes('cloudinary')) {
                  try {
                    const fixedUrl = document.imageUrl
                      .replace('http://', 'https://')
                      .replace(/\/v\d+\//, '/'); // Sometimes version numbers cause issues
                    
                    console.log("Trying fixed Cloudinary URL:", fixedUrl);
                    e.currentTarget.src = fixedUrl;
                  } catch (err) {
                    console.error("Error trying to fix URL:", err);
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-gray-100">
            <FileText className="h-24 w-24 text-gray-400" />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>
          <p className="text-lg text-gray-600 mb-6 whitespace-pre-wrap">{document.description}</p>
          
          {/* Document file viewer could be added here if needed later */}
          
          <div className="bg-blue-50 p-4 rounded-lg mt-8">
            <p className="text-sm text-blue-600">
              For more information or assistance with this document, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 