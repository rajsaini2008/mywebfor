"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowLeft } from "lucide-react"
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

export default function LegalDocuments() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroTitle, setHeroTitle] = useState("Legal Documents")
  const [heroSubtitle, setHeroSubtitle] = useState("Important legal documents and forms for Krishna Computers students, partners, and stakeholders")

  // Fetch documents and hero content
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch documents
        const response = await fetch('/api/legal-documents/public')
        const data = await response.json()
        
        if (data.success && Array.isArray(data.documents)) {
          console.log("Documents fetched:", data.documents);
          setDocuments(data.documents)
        }
        
        // Fetch hero content
        const cmsResponse = await fetch('/api/cms?section=legal')
        const cmsData = await cmsResponse.json()
        
        if (cmsData.success && Array.isArray(cmsData.data)) {
          const contentMap: Record<string, string> = {}
          cmsData.data.forEach((item: any) => {
            contentMap[item.key] = item.value
          })
          
          if (contentMap.documentsHeroTitle) {
            setHeroTitle(contentMap.documentsHeroTitle)
          }
          
          if (contentMap.documentsHeroSubtitle) {
            setHeroSubtitle(contentMap.documentsHeroSubtitle)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/legal" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legal Information
            </Link>
          </div>
          
          {isLoading ? (
            // Skeleton loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="shadow-md border border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Card key={doc._id} className="shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <Link href={`/legal/documents/${doc._id}`} className="block h-full">
                    {doc.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={doc.imageUrl} 
                          alt={doc.title} 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log("Image loaded successfully:", doc.imageUrl)}
                          onError={(e) => {
                            console.error("Image failed to load:", doc.imageUrl);
                            e.currentTarget.src = "/placeholder.svg?text=Document&width=400&height=300";
                            
                            // Try to fix Cloudinary URL if needed
                            if (doc.imageUrl && doc.imageUrl.includes('cloudinary')) {
                              try {
                                const fixedUrl = doc.imageUrl
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
                      <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                        <FileText className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="mr-4">
                          <CardTitle className="text-xl font-bold">{doc.title}</CardTitle>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-md">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-gray-600">
                        {doc.description && doc.description.length > 120 
                          ? `${doc.description.substring(0, 120)}...` 
                          : doc.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Documents Available</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                There are currently no legal documents available. Please check back later or contact support if you need specific documents.
              </p>
            </div>
          )}
          
          <div className="mt-12 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Assistance?</h2>
            <p className="text-gray-600 mb-6">
              If you need help understanding any of our legal documents or have questions, 
              please don't hesitate to contact our support team.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/contact-us">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 