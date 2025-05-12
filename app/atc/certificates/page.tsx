"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "../../../components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "@/components/ui/use-toast"
import { Search, Download, FileText, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"

interface Certificate {
  _id: string
  certificateNo: string
  certificateName: string
  studentId: string
  studentName: string
  courseName: string
  examPaperName: string
  score: number
  percentage: number
  issueDate: string
  atcId?: string
  examApplicationId: string
}

export default function ATCCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    filterCertificates()
  }, [certificates, searchTerm])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      // Add atcId parameter to only get certificates for this ATC's students
      const response = await fetch(`/api/certificates?atcId=${user?._id}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Sort certificates by issue date, most recent first
        const sortedCertificates = data.data.sort((a: Certificate, b: Certificate) => {
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
        })
        
        setCertificates(sortedCertificates)
        console.log(`Loaded ${data.data.length} certificates from database`)
      } else {
        throw new Error(data.message || "Failed to load certificates")
      }
    } catch (error) {
      console.error("Error loading certificates:", error)
      toast({
        title: "Error loading certificates",
        description: "There was a problem loading the certificate data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCertificates = () => {
    if (!searchTerm) {
      setFilteredCertificates(certificates)
      return
    }

    const term = searchTerm.toLowerCase()
    
    const filtered = certificates.filter(
      certificate =>
        certificate.certificateNo.toLowerCase().includes(term) ||
        certificate.certificateName.toLowerCase().includes(term) ||
        certificate.studentName.toLowerCase().includes(term) ||
        certificate.studentId.toLowerCase().includes(term) ||
        certificate.courseName.toLowerCase().includes(term) ||
        certificate.examPaperName.toLowerCase().includes(term)
    )
    
    setFilteredCertificates(filtered)
  }

  const refreshData = () => {
    fetchCertificates()
    toast({
      title: "Refreshed",
      description: "Certificate data has been refreshed",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  const downloadCertificate = (certificateId: string) => {
    // This would be implemented to download the certificate
    toast({
      title: "Download Certificate",
      description: "Certificate download functionality will be implemented in a future update.",
    })
  }

  const viewCertificate = (certificateId: string) => {
    // This would be implemented to view the certificate
    toast({
      title: "View Certificate",
      description: "Certificate view functionality will be implemented in a future update.",
    })
  }

  const columns: ColumnDef<Certificate>[] = [
    {
      accessorKey: "index",
      header: "SR.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "certificateNo",
      header: "CERTIFICATE NO.",
      cell: ({ row }) => row.original.certificateNo,
    },
    {
      accessorKey: "studentName",
      header: "STUDENT",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-sm text-gray-500">{row.original.studentId}</div>
        </div>
      ),
    },
    {
      accessorKey: "courseName",
      header: "COURSE",
      cell: ({ row }) => row.original.courseName,
    },
    {
      accessorKey: "examPaperName",
      header: "EXAM",
      cell: ({ row }) => row.original.examPaperName,
    },
    {
      accessorKey: "percentage",
      header: "SCORE",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.percentage.toFixed(2)}%
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "ISSUE DATE",
      cell: ({ row }) => formatDate(row.original.issueDate),
    },
    {
      accessorKey: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => viewCertificate(row.original._id)}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => downloadCertificate(row.original._id)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Certificates</h1>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Student Certificates</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search certificates..."
                  className="w-[250px] pl-8 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm
                ? "No certificates found matching your search."
                : "No certificates available."}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCertificates}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 