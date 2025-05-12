"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { 
  Search, Mail, Phone, Calendar, User, BookOpen, FileText, Clock, Eye, Check, X
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Simple status filter dropdown to avoid Select component issues
const StatusFilter = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  return (
    <select 
      className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Statuses</option>
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Enrolled">Enrolled</option>
      <option value="Rejected">Rejected</option>
    </select>
  )
}

export default function StudentEnquiriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [studentEnquiries, setStudentEnquiries] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchStudentEnquiries = async (page = 1, search = "", status = "") => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/enquiries/student?page=${page}&limit=${pagination.limit}&search=${search}&status=${status}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setStudentEnquiries(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || "Failed to fetch student enquiries")
      }
    } catch (error: any) {
      console.error("Error fetching student enquiries:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load student enquiries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentEnquiries(pagination.page, searchQuery, statusFilter)
  }, [pagination.page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudentEnquiries(1, searchQuery, statusFilter)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    fetchStudentEnquiries(1, searchQuery, status)
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage })
  }

  const updateEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/enquiries/student/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Status updated",
          description: `Enquiry has been marked as ${newStatus}`,
        })
        
        // Refresh the list
        fetchStudentEnquiries(pagination.page, searchQuery, statusFilter)
      } else {
        throw new Error(data.message || "Failed to update status")
      }
    } catch (error: any) {
      console.error("Error updating enquiry status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Enquiries</CardTitle>
          <CardDescription>
            View and manage student application form submissions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full md:w-auto">
              <Input
                placeholder="Search by name, email, phone or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <StatusFilter value={statusFilter} onChange={handleStatusChange} />
            </div>
          </div>

          {/* Student Enquiries Table */}
          {isLoading ? (
            <div className="w-full flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : studentEnquiries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Application ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentEnquiries.map((enquiry) => (
                    <TableRow key={enquiry._id}>
                      <TableCell className="font-medium">{enquiry.applicationId}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {enquiry.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                          {enquiry.course?.name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {enquiry.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {enquiry.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                          ${enquiry.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${enquiry.status === 'Enrolled' ? 'bg-green-100 text-green-800' : ''}
                          ${enquiry.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {enquiry.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedEnquiry(enquiry)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Student Enquiry Details</DialogTitle>
                                <DialogDescription>
                                  Application ID: {selectedEnquiry?.applicationId}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedEnquiry && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
                                      <div className="mt-2 space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedEnquiry.name}</p>
                                        <p><span className="font-medium">Father's Name:</span> {selectedEnquiry.fatherName}</p>
                                        <p><span className="font-medium">Mother's Name:</span> {selectedEnquiry.motherName}</p>
                                        <p><span className="font-medium">Gender:</span> {selectedEnquiry.gender}</p>
                                        <p><span className="font-medium">Date of Birth:</span> {selectedEnquiry.dateOfBirth}</p>
                                        <p><span className="font-medium">Education:</span> {selectedEnquiry.education}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                                      <div className="mt-2 space-y-2">
                                        <p className="flex items-center">
                                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                          {selectedEnquiry.email}
                                        </p>
                                        <p className="flex items-center">
                                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                          {selectedEnquiry.phone}
                                        </p>
                                        <p className="flex items-start">
                                          <FileText className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                                          {selectedEnquiry.address}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Course Information</h3>
                                      <div className="mt-2 space-y-2">
                                        <p><span className="font-medium">Course:</span> {selectedEnquiry.course?.name || "N/A"}</p>
                                        <p><span className="font-medium">Course Code:</span> {selectedEnquiry.course?.code || "N/A"}</p>
                                        <p className="flex items-center">
                                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                          <span className="font-medium">Preferred Timing:</span> {selectedEnquiry.preferredTime}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {selectedEnquiry.message && (
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-500">Additional Message</h3>
                                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">Enquiry Status</h3>
                                      <div className="mt-2">
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                          ${selectedEnquiry.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                                          ${selectedEnquiry.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                                          ${selectedEnquiry.status === 'Enrolled' ? 'bg-green-100 text-green-800' : ''}
                                          ${selectedEnquiry.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                                        `}>
                                          {selectedEnquiry.status}
                                        </div>
                                        
                                        <div className="mt-4 flex space-x-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
                                            onClick={() => updateEnquiryStatus(selectedEnquiry._id, "Contacted")}
                                          >
                                            Mark as Contacted
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                            onClick={() => updateEnquiryStatus(selectedEnquiry._id, "Enrolled")}
                                          >
                                            Mark as Enrolled
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                                            onClick={() => updateEnquiryStatus(selectedEnquiry._id, "Rejected")}
                                          >
                                            Mark as Rejected
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-500 mt-4">
                                      <p className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Submitted {formatDistanceToNow(new Date(selectedEnquiry.createdAt), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                            onClick={() => updateEnquiryStatus(enquiry._id, "Enrolled")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                            onClick={() => updateEnquiryStatus(enquiry._id, "Rejected")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No student enquiries found
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {pagination.page > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(pagination.page - 1)}>
                      Previous
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.totalPages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  )
                  .map((page, i, array) => (
                    <PaginationItem key={page}>
                      {i > 0 && array[i - 1] !== page - 1 && (
                        <PaginationItem>
                          <span className="px-4">...</span>
                        </PaginationItem>
                      )}
                      <PaginationLink
                        isActive={page === pagination.page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                }
                
                {pagination.page < pagination.totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(pagination.page + 1)}>
                      Next
                    </PaginationLink>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 