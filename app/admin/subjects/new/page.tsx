"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Pencil, Trash2 } from "lucide-react"
import { ResponsiveTable } from "@/components/ui/responsive-table"

interface Subject {
  _id: string
  name: string
  code: string
  description: string
  isActive: boolean
}

export default function SubjectMaster() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [subject, setSubject] = useState("")
  
  // Generate a random code like "SUB001", "SUB002", etc.
  const generateRandomCode = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `SUB${randomNumber.toString().substring(0, 3)}`;
  };

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      
      // Fetch subjects from the API
      const response = await fetch('/api/subjects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subjects')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSubjects(data.data)
      } else {
        throw new Error(data.message || 'Error fetching subjects')
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
      toast({
        title: "Error loading subjects",
        description: "There was a problem loading the subject data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Subject name cannot be empty",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Create the subject data
      const subjectData = {
        name: subject,
        code: generateRandomCode(),
        description: `${subject} subject`,
        isActive: true
      }
      
      // Send POST request to create the subject
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create subject')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Reload subjects list
        loadSubjects()
        
        // Clear form
        setSubject("")
        
        toast({
          title: "Subject added",
          description: `${subject} has been added successfully.`
        })
      } else {
        throw new Error(result.message || 'Error creating subject')
      }
    } catch (error) {
      console.error("Error adding subject:", error)
      toast({
        title: "Error",
        description: "An error occurred while adding the subject",
        variant: "destructive"
      })
    }
  }
  
  const handleEdit = async (id: string, currentName: string) => {
    const newName = window.prompt("Edit subject name:", currentName)
    
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        // Find the current subject
        const currentSubject = subjects.find(s => s._id === id)
        
        if (!currentSubject) {
          throw new Error('Subject not found')
        }
        
        // Create updated subject data
        const updatedData = {
          name: newName,
          code: currentSubject.code,
          description: `${newName} subject`,
          isActive: currentSubject.isActive
        }
        
        // Send PUT request to update the subject
        const response = await fetch(`/api/subjects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update subject')
        }
        
        const result = await response.json()
        
        if (result.success) {
          // Update the local state
          setSubjects(subjects.map(subject => 
            subject._id === id ? { ...subject, name: newName } : subject
          ))
          
          toast({
            title: "Subject updated",
            description: "Subject name has been updated successfully."
          })
        } else {
          throw new Error(result.message || 'Error updating subject')
        }
      } catch (error) {
        console.error("Error updating subject:", error)
        toast({
          title: "Error",
          description: "An error occurred while updating the subject",
          variant: "destructive"
        })
      }
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        // Send DELETE request
        const response = await fetch(`/api/subjects/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete subject')
        }
        
        const result = await response.json()
        
        if (result.success) {
          // Update the local state
          setSubjects(subjects.filter(subject => subject._id !== id))
          
          toast({
            title: "Subject deleted",
            description: "The subject has been deleted successfully."
          })
        } else {
          throw new Error(result.message || 'Error deleting subject')
        }
      } catch (error) {
        console.error("Error deleting subject:", error)
        toast({
          title: "Error",
          description: "An error occurred while deleting the subject",
          variant: "destructive"
        })
      }
    }
  }
  
  const filteredSubjects = subjects.filter(
    (subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Subject Master</h1>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="subject" className="text-red-500">*</Label>
                <Input
                  id="subject"
                  placeholder="Enter Subject Name"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-orange-400 hover:bg-orange-500 w-full sm:w-auto">
                  Save
                </Button>
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  className="bg-transparent text-black border border-gray-300 hover:bg-gray-100 w-full sm:w-auto"
                  onClick={() => setSubject("")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="flex justify-between mb-4">
              <div className="flex gap-2">
                <Button className="bg-transparent border border-gray-300 hover:bg-gray-100">
                  Excel
                </Button>
                <Button className="bg-transparent border border-gray-300 hover:bg-gray-100">
                  PDF
                </Button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "No subjects found matching your search."
                  : "No subjects found. Add a new subject above."}
              </div>
            ) : (
              <ResponsiveTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sr.</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject, index) => (
                      <TableRow key={subject._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{subject.isActive ? 'Active' : 'Inactive'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              className="h-8 w-8 p-0 hover:bg-gray-100" 
                              onClick={() => handleEdit(subject._id, subject.name)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              className="h-8 w-8 p-0 hover:bg-gray-100" 
                              onClick={() => handleDelete(subject._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ResponsiveTable>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 