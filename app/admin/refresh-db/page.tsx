"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function RefreshDB() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Function to test database connection directly
  const testConnection = async () => {
    try {
      console.log("Testing direct MongoDB connection...");
      // Make a direct connection test call
      const response = await fetch('/api/test-db-connection', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error testing database connection:", error);
      throw error;
    }
  };

  const refreshDatabase = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      // First, refresh the database connection
      const refreshResponse = await fetch('/api/refresh-db', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const refreshData = await refreshResponse.json()
      
      if (refreshResponse.ok && refreshData.success) {
        // Test a direct connection to MongoDB
        try {
          const testResult = await testConnection();
          // Update the result with test connection results
          setResult({
            ...refreshData,
            connectionTest: testResult
          });
          
          toast({
            title: "Database connection refreshed",
            description: "Connection to MongoDB was successfully refreshed.",
          });
          
          // Now try fetching courses to verify
          try {
            const timestamp = new Date().getTime();
            const coursesResponse = await fetch(`/api/courses?refresh=true&t=${timestamp}`, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            if (!coursesResponse.ok) {
              throw new Error(`HTTP error! Status: ${coursesResponse.status}`);
            }
            
            const coursesData = await coursesResponse.json();
            
            if (coursesData.success) {
              toast({
                title: "Courses fetched successfully",
                description: `Found ${coursesData.data.length} courses in the database.`,
              });
              
              // Add courses data to result
              setResult(prevResult => ({
                ...prevResult,
                coursesTest: {
                  success: true,
                  count: coursesData.data.length,
                  courses: coursesData.data.map(c => ({ _id: c._id, name: c.name, code: c.code }))
                }
              }));
            } else {
              throw new Error(coursesData.message || "Unknown error fetching courses");
            }
          } catch (coursesError) {
            console.error("Error fetching courses:", coursesError);
            setResult(prevResult => ({
              ...prevResult,
              coursesTest: {
                success: false,
                error: coursesError instanceof Error ? coursesError.message : "Unknown error"
              }
            }));
            
            toast({
              title: "Error fetching courses",
              description: coursesError instanceof Error ? coursesError.message : "Failed to fetch courses",
              variant: "destructive",
            });
          }
        } catch (testError) {
          console.error("Connection test failed:", testError);
          setResult({
            ...refreshData,
            connectionTest: {
              success: false,
              error: testError instanceof Error ? testError.message : "Unknown error"
            }
          });
          
          toast({
            title: "Connection test failed",
            description: testError instanceof Error ? testError.message : "Failed to test connection",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(refreshData.message || "Database refresh failed")
      }
    } catch (error) {
      console.error("Error refreshing database:", error)
      setResult({ 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Database Refresh Utility</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refresh MongoDB Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Use this utility to refresh the database connection when you're experiencing issues with 
            courses or other data not displaying correctly.
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={refreshDatabase}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Refreshing..." : "Refresh Database Connection"}
            </Button>
          </div>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">After refreshing:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to <a href="/admin/courses" className="text-blue-600 underline">Courses page</a> and click Refresh</li>
              <li>Go to <a href="/" className="text-blue-600 underline">Homepage</a> and refresh the page</li>
              <li>Try adding a new course from <a href="/admin/courses/new" className="text-blue-600 underline">New Course page</a></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 