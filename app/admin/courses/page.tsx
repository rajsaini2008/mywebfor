"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { useRouter } from "next/navigation"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  fee: number
  description: string
  isActive: boolean
  imageUrl?: string
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to fetch courses
  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching courses for admin page...");
      const timestamp = new Date().getTime();
      // Add refresh flag to force a fresh fetch
      const response = await fetch(`/api/courses?refresh=true&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Admin received data:', data);
      
      if (data.success) {
        console.log(`Admin page received ${data.data.length} courses`);
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error loading courses",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(`/api/courses/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setCourses(courses.filter((course) => course._id !== id));
          toast({
            title: "Course deleted",
            description: "The course has been deleted successfully.",
          });
        } else {
          throw new Error("Failed to delete course");
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        toast({
          title: "Error",
          description: "An error occurred while deleting the course",
          variant: "destructive",
        });
      }
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <div className="flex gap-2">
          <Button onClick={fetchCourses} variant="outline" disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Link href="/admin/courses/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>All Courses</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
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
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No courses found matching your search."
                : "No courses found. Add a new course to get started."}
            </div>
          ) : (
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Code</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead className="hidden lg:table-cell">Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="relative h-10 w-16">
                          <Image
                            src={course.imageUrl || "/placeholder.svg?height=40&width=60"}
                            alt={course.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{course.code}</TableCell>
                      <TableCell className="hidden md:table-cell">{course.duration}</TableCell>
                      <TableCell className="hidden lg:table-cell">₹{course.fee.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeClass(course.isActive)}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/courses/${course._id}`)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/courses/${course._id}/edit`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(course._id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
