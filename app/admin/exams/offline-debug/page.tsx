"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function OfflineExamDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [offlineCount, setOfflineCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [offlineApprovedCount, setOfflineApprovedCount] = useState(0)
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    checkOfflineExams()
  }, [])

  const addLog = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const checkOfflineExams = async () => {
    try {
      setIsLoading(true)
      addLog("Checking for offline exams...")
      
      // Use HEAD request to get counts
      const headResponse = await fetch('/api/exam-applications', {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (headResponse.ok) {
        const offlineCount = parseInt(headResponse.headers.get('X-Offline-Count') || '0')
        const approvedCount = parseInt(headResponse.headers.get('X-Approved-Count') || '0')
        const offlineApprovedCount = parseInt(headResponse.headers.get('X-Offline-Approved-Count') || '0')
        
        setOfflineCount(offlineCount)
        setApprovedCount(approvedCount)
        setOfflineApprovedCount(offlineApprovedCount)
        
        addLog(`Found ${offlineCount} offline applications`)
        addLog(`Found ${approvedCount} approved applications`)
        addLog(`Found ${offlineApprovedCount} offline AND approved applications`)
      } else {
        addLog(`HEAD request failed: ${headResponse.status}`)
      }
      
      // Now try to fetch actual applications
      const timestamp = new Date().getTime()
      const getResponse = await fetch(`/api/exam-applications?paperType=offline&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (getResponse.ok) {
        const data = await getResponse.json()
        
        if (data.success) {
          addLog(`API returned ${data.data.length} applications`)
          setApplications(data.data)
          
          // Check if applications have paperType field
          if (data.data.length > 0) {
            const hasPaperType = data.data.some((app: any) => app.paperType === 'offline')
            addLog(`Applications with paperType=offline: ${hasPaperType ? 'Yes' : 'No'}`)
            
            // Sample the first application
            const sample = data.data[0]
            addLog(`Sample application: ID=${sample._id}, paperType=${sample.paperType}, status=${sample.status}`)
          } else {
            addLog("No applications returned")
          }
        } else {
          addLog(`API error: ${data.message}`)
        }
      } else {
        const errorText = await getResponse.text()
        addLog(`GET request failed: ${getResponse.status}, ${errorText}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`Error: ${errorMessage}`)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fixPaperTypeField = async () => {
    try {
      addLog("Attempting to fix paperType field on applications...")
      
      const response = await fetch('/api/exam-applications/fix-paper-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultPaperType: 'offline'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        addLog(`Fixed ${data.updatedCount} applications`)
        toast({
          title: "Success",
          description: `Fixed ${data.updatedCount} applications`,
        })
        
        // Refresh the data
        await checkOfflineExams()
      } else {
        addLog(`Fix failed: ${data.message}`)
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`Error fixing paperType: ${errorMessage}`)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Offline Exam Debug</h1>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={checkOfflineExams}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Checking..." : "Check Offline Exams"}
        </Button>
        
        <Button
          onClick={fixPaperTypeField}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Fix paperType Field
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Offline Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{offlineCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Offline & Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{offlineApprovedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Debug Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-y-auto font-mono text-sm">
            {debugInfo.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {debugInfo.length === 0 && <div className="text-gray-500">No logs yet</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">PAPER TYPE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">STATUS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">STUDENT</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{app._id}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          app.paperType === 'offline' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {app.paperType || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          app.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {app.student ? (
                          <div>
                            <div className="font-medium">{app.student.name || 'Unknown Name'}</div>
                            <div className="text-xs text-gray-500">{app.student.studentId || 'Unknown ID'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No student data</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      {isLoading ? "Loading..." : "No applications found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 