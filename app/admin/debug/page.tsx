"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState("Unknown")
  const [collections, setCollections] = useState<any[]>([])
  const [examPapers, setExamPapers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testDbConnection = async () => {
    try {
      setIsLoading(true)
      setDbStatus("Testing...")
      
      const response = await fetch("/api/debug/db-test")
      const data = await response.json()
      
      if (data.success) {
        setDbStatus("Connected")
        setCollections(data.collections || [])
        toast({
          title: "Success",
          description: "Database connection successful",
        })
      } else {
        setDbStatus("Failed")
        toast({
          title: "Error",
          description: data.message || "Database connection failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing DB connection:", error)
      setDbStatus("Error")
      toast({
        title: "Error",
        description: "Error testing database connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExamPapers = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/exam-papers")
      const data = await response.json()
      
      if (data.success) {
        setExamPapers(data.data || [])
        toast({
          title: "Success",
          description: `Fetched ${data.data.length} exam papers`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch exam papers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching exam papers:", error)
      toast({
        title: "Error",
        description: "Error fetching exam papers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTestExamPaper = async () => {
    try {
      setIsLoading(true)
      
      // Generate a test exam paper
      const paperId = `TEST${Math.floor(1000 + Math.random() * 9000)}`
      const testPaper = {
        paperId,
        paperType: "Main",
        paperName: "Test Paper",
        totalQuestions: 60,
        correctMarksPerQuestion: 1,
        passingMarks: 40,
        time: 60, // minutes
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        reAttempt: 3,
        reAttemptTime: 60,
        isNegativeMark: false,
        courseType: "with_subject",
        course: "6457293a8fbbc22d1c5e8b1d", // Replace with a valid course ID
        subjects: []
      }
      
      const response = await fetch("/api/exam-papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPaper),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Created test exam paper with ID: ${paperId}`,
        })
        
        // Refresh the exam papers list
        fetchExamPapers()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create test exam paper",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating test exam paper:", error)
      toast({
        title: "Error",
        description: "Error creating test exam paper",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>Status: <span className="font-medium">{dbStatus}</span></div>
          
          <Button 
            onClick={testDbConnection} 
            disabled={isLoading}
          >
            Test Connection
          </Button>
          
          {collections.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Collections:</h3>
              <ul className="list-disc pl-5">
                {collections.map((collection, index) => (
                  <li key={index}>{collection}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Exam Papers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={fetchExamPapers} 
              disabled={isLoading}
            >
              Fetch Exam Papers
            </Button>
            
            <Button 
              onClick={createTestExamPaper} 
              disabled={isLoading}
              variant="outline"
            >
              Create Test Exam Paper
            </Button>
          </div>
          
          {examPapers.length > 0 ? (
            <div>
              <h3 className="font-medium mb-2">Found {examPapers.length} exam papers:</h3>
              <div className="border rounded overflow-auto max-h-96 text-sm">
                <pre className="p-4">{JSON.stringify(examPapers, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div>No exam papers found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 