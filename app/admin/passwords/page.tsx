"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, EyeOff, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ResponsiveTable } from "@/components/ui/responsive-table"

interface Password {
  id: string
  type: "student" | "subcenter"
  userId: string
  password: string
  name: string
  email: string
}

export default function Passwords() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState(false)

  const fetchPasswordData = async () => {
    setIsLoading(true)
    try {
      // Fetch students
      const timestamp = new Date().getTime();
      const studentsResponse = await fetch(`/api/students?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!studentsResponse.ok) {
        throw new Error(`HTTP error fetching students! Status: ${studentsResponse.status}`);
      }
      
      const studentsData = await studentsResponse.json();
      
      // Fetch subcenters
      const subcentersResponse = await fetch(`/api/subcenters?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!subcentersResponse.ok) {
        throw new Error(`HTTP error fetching subcenters! Status: ${subcentersResponse.status}`);
      }
      
      const subcentersData = await subcentersResponse.json();
      
      // Format students data
      const studentPasswords = studentsData.success && studentsData.data ? 
        studentsData.data.map((student: any) => ({
          id: student._id,
          type: "student",
          userId: student.studentId,
          password: student.password,
          name: student.name,
          email: student.email
        })) : [];
      
      // Format subcenters data
      const subcenterPasswords = subcentersData.success && subcentersData.data ?
        subcentersData.data.map((subcenter: any) => ({
          id: subcenter._id,
          type: "subcenter",
          userId: subcenter.centerId,
          password: subcenter.password,
          name: subcenter.name,
          email: subcenter.email
        })) : [];
      
      // Combine the data
      const allPasswords = [...studentPasswords, ...subcenterPasswords];
      
      // Save to state
      setPasswords(allPasswords);
      
      // Also save to localStorage as a backup
      localStorage.setItem("passwords", JSON.stringify(allPasswords));
      
      console.log(`Loaded ${studentPasswords.length} students and ${subcenterPasswords.length} subcenters`);
    } catch (error) {
      console.error("Error loading passwords:", error);
      
      // Try to load from localStorage as fallback
      const storedPasswords = localStorage.getItem("passwords");
      if (storedPasswords) {
        setPasswords(JSON.parse(storedPasswords));
        toast({
          title: "Using cached password data",
          description: "Couldn't connect to the server. Using previously stored data.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading passwords",
          description: "There was a problem loading the password data and no cached data available.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswordData();
  }, []);

  const toggleShowPasswords = () => {
    setShowPasswords(!showPasswords)
  }

  const filteredPasswords = passwords.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const studentPasswords = filteredPasswords.filter((item) => item.type === "student")
  const subcenterPasswords = filteredPasswords.filter((item) => item.type === "subcenter")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">All Passwords</h1>
        <div className="flex gap-2">
          <Button 
            onClick={fetchPasswordData} 
            className="bg-transparent border border-gray-300 hover:bg-gray-100"
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button onClick={toggleShowPasswords} disabled={isLoading}>
            {showPasswords ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPasswords ? "Hide Passwords" : "Show Passwords"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>User Credentials</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="subcenters">Sub Centers</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {filteredPasswords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No users found matching your search." : "No users found."}
                  </div>
                ) : (
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Type</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead className="hidden sm:table-cell">Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPasswords.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="capitalize">{item.type}</TableCell>
                            <TableCell className="font-medium">{item.userId}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                            <TableCell>{showPasswords ? item.password : "••••••••"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                )}
              </TabsContent>

              <TabsContent value="students" className="mt-0">
                {studentPasswords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No students found matching your search." : "No students found."}
                  </div>
                ) : (
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead className="hidden sm:table-cell">Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentPasswords.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.userId}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                            <TableCell>{showPasswords ? item.password : "••••••••"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                )}
              </TabsContent>

              <TabsContent value="subcenters" className="mt-0">
                {subcenterPasswords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No sub centers found matching your search." : "No sub centers found."}
                  </div>
                ) : (
                  <ResponsiveTable>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ATC ID</TableHead>
                          <TableHead className="hidden sm:table-cell">Center Name</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead>Password</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subcenterPasswords.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.userId}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                            <TableCell>{showPasswords ? item.password : "••••••••"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ResponsiveTable>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
