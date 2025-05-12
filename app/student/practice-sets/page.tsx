"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, BookOpen, Clock, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Get tab-specific storage key
const getStorageKey = (key: string) => {
  if (typeof window === "undefined") return key;
  
  const tabId = sessionStorage.getItem("tab_id");
  if (!tabId) return key; // Fallback to regular key if no tab ID found
  
  return `${tabId}_${key}`;
}

export default function PracticeSets() {
  const [isLoading, setIsLoading] = useState(true)
  const [practiceSets, setPracticeSets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch practice sets data
  useEffect(() => {
    // Simulate loading for now
    const timeout = setTimeout(() => {
      // For now, we'll use dummy data until the API is ready
      setPracticeSets([
        {
          id: 1,
          title: "Basic Computer Operations",
          description: "Practice your knowledge of fundamental computer concepts and operations.",
          subjectName: "Computer Fundamentals",
          totalQuestions: 25,
          duration: 30,
          difficulty: "Easy"
        },
        {
          id: 2,
          title: "MS Office Essentials",
          description: "Test your MS Office skills including Word, Excel and PowerPoint.",
          subjectName: "Office Applications",
          totalQuestions: 40,
          duration: 45,
          difficulty: "Intermediate"
        },
        {
          id: 3,
          title: "Programming Logic",
          description: "Challenge yourself with basic programming logic and algorithms.",
          subjectName: "Programming Basics",
          totalQuestions: 30,
          duration: 40,
          difficulty: "Intermediate"
        }
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Error Loading Practice Sets</h2>
        <p className="text-gray-600 mt-2">Unable to load practice sets.</p>
        <p className="text-red-500 mt-4">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Practice Sets</h1>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Enhancement</h2>
            <p className="text-gray-700">
              Practice tests help you improve your skills and prepare for examinations. 
              Complete these practice sets to test your knowledge and track your progress.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceSets.length > 0 ? (
          practiceSets.map((practiceSet) => (
            <Card key={practiceSet.id} className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-blue-600"></div>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-lg text-blue-800">{practiceSet.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">{practiceSet.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-600">{practiceSet.subjectName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-600">{practiceSet.totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-600">{practiceSet.duration} Minutes</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${practiceSet.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      practiceSet.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'}`
                  }>
                    {practiceSet.difficulty}
                  </span>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      toast({
                        title: "Starting Practice Set",
                        description: `Preparing ${practiceSet.title}`,
                      })
                    }}
                  >
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No Practice Sets Available</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              There are no practice sets available for your course at this time. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 