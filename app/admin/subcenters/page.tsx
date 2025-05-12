"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Search, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface SubCenter {
  _id: string
  centerId: string
  name: string
  email: string
  phone: string
  createdAt: string
  isActive: boolean
}

export default function SubCenters() {
  const [subCenters, setSubCenters] = useState<SubCenter[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  useEffect(() => {
    fetchSubCenters()
  }, [])

  const fetchSubCenters = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/subcenters', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSubCenters(data.data)
      } else {
        throw new Error(data.message || "Failed to load subcenters")
      }
    } catch (error) {
      console.error("Error fetching subcenters:", error)
      toast({
        title: "Error loading subcenters",
        description: "There was a problem loading the subcenter data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subcenter?")) {
      try {
        const response = await fetch(`/api/subcenters/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setSubCenters(subCenters.filter((center) => center._id !== id))
          toast({
            title: "Subcenter deleted",
            description: "The subcenter has been deleted successfully.",
          })
        } else {
          throw new Error("Failed to delete subcenter")
        }
      } catch (error) {
        console.error("Error deleting subcenter:", error)
        toast({
          title: "Error",
          description: "An error occurred while deleting the subcenter",
          variant: "destructive",
        })
      }
    }
  }

  const openSubcenterPortal = (center: SubCenter) => {
    // Open auto-login page which will handle automatic login with credentials and redirect to dashboard
    window.open(`/subcenter-auto-login/${encodeURIComponent(center.centerId)}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return format(date, "MM/dd/yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "text-green-600" : "text-red-600"
  }

  const filteredSubCenters = subCenters.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.phone.includes(searchTerm) ||
      center.centerId.includes(searchTerm)
  )

  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality will be implemented later.",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">All Sub Centers</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="bg-gray-100 hover:bg-gray-200"
              onClick={exportToPDF}
            >
              PDF
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Show per page:</span>
              <select 
                className="border rounded p-1 text-sm"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm">entries</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <Label htmlFor="search" className="mr-2">Search:</Label>
            <Input
              id="search"
              placeholder="Search..."
              className="max-w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredSubCenters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No subcenters found matching your search."
                : "No subcenters found. Add a new subcenter to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Sr.</TableHead>
                    <TableHead className="text-left">Center_ID</TableHead>
                    <TableHead className="text-left">Center_Name</TableHead>
                    <TableHead className="text-left">Mob._No.</TableHead>
                    <TableHead className="text-left">Email</TableHead>
                    <TableHead className="text-left">D.O.J.</TableHead>
                    <TableHead className="text-left">Status</TableHead>
                    <TableHead className="text-left">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubCenters.map((center, index) => (
                    <TableRow key={center._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{center.centerId}</TableCell>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{center.phone}</TableCell>
                      <TableCell>{center.email}</TableCell>
                      <TableCell>{formatDate(center.createdAt)}</TableCell>
                      <TableCell>
                        <span className={getStatusClass(center.isActive)}>
                          {center.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/subcenters/${center._id}/edit`}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(center._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openSubcenterPortal(center)}
                          >
                            <User className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredSubCenters.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                Showing 1 to {Math.min(filteredSubCenters.length, entriesPerPage)} of {filteredSubCenters.length} entries
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>First</Button>
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-blue-500 text-white">1</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
                <Button variant="outline" size="sm" disabled>Last</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
