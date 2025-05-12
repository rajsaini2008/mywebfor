"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Search, Mail, Phone, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function ContactEnquiriesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [contactEnquiries, setContactEnquiries] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchContactEnquiries = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/enquiries/contact?page=${page}&limit=${pagination.limit}&search=${search}`,
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
        setContactEnquiries(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || "Failed to fetch contact enquiries")
      }
    } catch (error: any) {
      console.error("Error fetching contact enquiries:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load contact enquiries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContactEnquiries(pagination.page, searchQuery)
  }, [pagination.page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContactEnquiries(1, searchQuery)
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage })
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Enquiries</CardTitle>
          <CardDescription>
            View and manage contact form submissions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-6">
            <Input
              placeholder="Search by name, email, phone or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Contact Enquiries Table */}
          {isLoading ? (
            <div className="w-full flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : contactEnquiries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact Info</TableHead>
                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                    <TableHead className="hidden lg:table-cell">Message</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactEnquiries.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {contact.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {contact.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.subject}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="max-w-xs truncate">{contact.message}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No contact enquiries found
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