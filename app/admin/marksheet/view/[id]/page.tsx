"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import Image from "next/image"
import FontCustomizer from '@/components/FontCustomizer'

interface Student {
  _id: string
  studentId: string
  name: string
  photo?: string
  course?: {
    _id: string
    name: string
  }
}

interface ExamApplication {
  _id: string
  examPaperId: string
  studentId: string
  scheduledTime: string
  paperType: string
  status: string
  score?: number
  percentage?: number
  certificateNo?: string
  studentName?: string
  studentIdNumber?: string
  examPaper?: {
    paperName: string
    time: number
  }
  student?: Student
  subjects?: Array<{
    name: string;
    marks: number;
    maxMarks: number;
  }>
}

interface Template {
  _id: string
  type: string
  name: string
  imageUrl: string
  isActive: boolean
}

interface Style {
  fontSize: string
  fontWeight: string
  fontStyle: string
  color: string
}

interface TemplateConfig {
  _id?: string
  templateId: string
  type: "certificate" | "marksheet"
  studentNamePosition?: { top: number, left: number }
  courseNamePosition?: { top: number, left: number }
  percentagePosition?: { top: number, left: number }
  gradePosition?: { top: number, left: number }
  durationPosition?: { top: number, left: number }
  datePosition?: { top: number, left: number }
  photoPosition?: { top: number, left: number }
  photoSize?: { width: number, height: number }
  certificateNumberPosition?: { top: number, left: number }
  subjectsPosition?: { top: number, left: number }
  studentNameStyle?: Style
  courseNameStyle?: Style
  percentageStyle?: Style
  gradeStyle?: Style
  durationStyle?: Style
  dateStyle?: Style
  certificateNumberStyle?: Style
  subjectsStyle?: Style
}

export default function ViewMarksheet({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<ExamApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [certificateNumber, setCertificateNumber] = useState<string>("")
  const [templateError, setTemplateError] = useState<boolean>(false)
  const [debugMode, setDebugMode] = useState<boolean>(false)
  const [marksheetTemplate, setMarksheetTemplate] = useState<Template | null>(null)
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null)
  const [showFontSettings, setShowFontSettings] = useState(false)
  const [localTemplateConfig, setLocalTemplateConfig] = useState<TemplateConfig | null>(null)
  const router = useRouter()
  const marksheetRef = useRef<HTMLDivElement>(null)

  // Add a keyboard shortcut to toggle debug mode (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        toast({
          title: `Debug Mode: ${!debugMode ? 'Enabled' : 'Disabled'}`,
          description: "Debug information will be displayed/hidden",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  // Format the current date as DD MMM YYYY (e.g., 27 APR 2025)
  const formatDate = () => {
    const now = new Date()
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  }

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C"
    return "D"
  }

  // Fetch the active marksheet template
  const fetchMarksheetTemplate = async () => {
    try {
      const response = await fetch('/api/backgrounds?type=marksheet&active=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch marksheet template')
      }
      
      const data = await response.json()
      
      if (data.success && data.data && data.data.length > 0) {
        setMarksheetTemplate(data.data[0])
        
        // Now fetch the template configuration
        await fetchTemplateConfig(data.data[0]._id)
      } else {
        throw new Error('No active marksheet template found')
      }
    } catch (error) {
      console.error("Error fetching marksheet template:", error)
      setTemplateError(true)
      toast({
        title: "Error",
        description: "Failed to load marksheet template",
        variant: "destructive",
      })
    }
  }
  
  // Fetch the template configuration
  const fetchTemplateConfig = async (templateId: string) => {
    try {
      const response = await fetch(`/api/template-config?templateId=${templateId}&type=marksheet`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch template configuration')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setTemplateConfig(data.data)
        setLocalTemplateConfig(data.data)
      } else {
        // Use default positions if no configuration is found
        setTemplateConfig({
          templateId,
          type: "marksheet",
          studentNamePosition: { top: 30, left: 0 },
          courseNamePosition: { top: 36, left: 0 },
          percentagePosition: { top: 70, left: 30 },
          gradePosition: { top: 70, left: 0 },
          durationPosition: { top: 42, left: 0 },
          datePosition: { top: 76, left: 0 },
          photoPosition: { top: 23, left: 11 },
          photoSize: { width: 90, height: 120 },
          certificateNumberPosition: { top: 24, left: 10 },
          subjectsPosition: { top: 50, left: 0 },
          studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
          courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
          percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          subjectsStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
        })
        setLocalTemplateConfig({
          templateId,
          type: "marksheet",
          studentNamePosition: { top: 30, left: 0 },
          courseNamePosition: { top: 36, left: 0 },
          percentagePosition: { top: 70, left: 30 },
          gradePosition: { top: 70, left: 0 },
          durationPosition: { top: 42, left: 0 },
          datePosition: { top: 76, left: 0 },
          photoPosition: { top: 23, left: 11 },
          photoSize: { width: 90, height: 120 },
          certificateNumberPosition: { top: 24, left: 10 },
          subjectsPosition: { top: 50, left: 0 },
          studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
          courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
          percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
          subjectsStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
        })
      }
    } catch (error) {
      console.error("Error fetching template configuration:", error)
      // Set default configuration
      setTemplateConfig({
        templateId,
        type: "marksheet",
        studentNamePosition: { top: 30, left: 0 },
        courseNamePosition: { top: 36, left: 0 },
        percentagePosition: { top: 70, left: 30 },
        gradePosition: { top: 70, left: 0 },
        durationPosition: { top: 42, left: 0 },
        datePosition: { top: 76, left: 0 },
        photoPosition: { top: 23, left: 11 },
        photoSize: { width: 90, height: 120 },
        certificateNumberPosition: { top: 24, left: 10 },
        subjectsPosition: { top: 50, left: 0 },
        studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
        courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
        percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        subjectsStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
      })
      setLocalTemplateConfig({
        templateId,
        type: "marksheet",
        studentNamePosition: { top: 30, left: 0 },
        courseNamePosition: { top: 36, left: 0 },
        percentagePosition: { top: 70, left: 30 },
        gradePosition: { top: 70, left: 0 },
        durationPosition: { top: 42, left: 0 },
        datePosition: { top: 76, left: 0 },
        photoPosition: { top: 23, left: 11 },
        photoSize: { width: 90, height: 120 },
        certificateNumberPosition: { top: 24, left: 10 },
        subjectsPosition: { top: 50, left: 0 },
        studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
        courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
        percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
        subjectsStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
      })
    }
  }

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching application data for ID:", params.id)
        
        // Fetch marksheet template
        await fetchMarksheetTemplate()
        
        const response = await fetch(`/api/exam-applications/${params.id}`)
        
        if (!response.ok) {
          console.error(`API returned status: ${response.status}`)
          setTemplateError(true)
          setIsLoading(false)
          return
        }
        
        const data = await response.json()
        console.log("Application data retrieved:", data)
        
        if (data.success) {
          setApplication(data.data)
          setCertificateNumber(data.data.certificateNo || "")
          setIsLoading(false)
        } else {
          setTemplateError(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching marksheet:", error)
        setTemplateError(true)
        setIsLoading(false)
        
        toast({
          title: "Error",
          description: "Failed to load marksheet data",
          variant: "destructive",
        })
      }
    }

    fetchApplication()
  }, [params.id])

  // Update local config when template config changes
  useEffect(() => {
    if (templateConfig) {
      setLocalTemplateConfig(templateConfig);
    }
  }, [templateConfig]);

  // Handle style changes
  const handleStyleChange = (styleKey: keyof TemplateConfig, newStyle: Style) => {
    if (!localTemplateConfig) return;
    
    setLocalTemplateConfig({
      ...localTemplateConfig,
      [styleKey]: newStyle
    });
  };

  // Save template configuration
  const saveTemplateConfig = async () => {
    if (!localTemplateConfig || !marksheetTemplate) return;
    
    try {
      const response = await fetch('/api/template-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localTemplateConfig),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save template configuration');
      }
      
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Font settings saved successfully",
        });
        setTemplateConfig(localTemplateConfig);
      }
    } catch (error) {
      console.error("Error saving template configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save font settings",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (marksheetRef.current) {
      try {
        // Capture the marksheet content
        const printContents = marksheetRef.current.innerHTML
        const originalContents = document.body.innerHTML
        
        // Add print styles
        const style = `
          <style>
            @media print {
              @page { 
                size: landscape; 
                margin: 0; 
              }
              body { 
                margin: 0; 
                padding: 0;
              }
              .marksheet-print-container {
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
              }
            }
          </style>
        `;
        
        // Replace the document content with the marksheet
        document.body.innerHTML = `
          ${style}
          <div class="marksheet-print-container">
            ${printContents}
          </div>
        `;
        
        // Trigger the print dialog
        window.print()
        
        // Restore the original content
        document.body.innerHTML = originalContents
        
        // Reload the page to restore all functionality
        window.location.reload()
      } catch (error) {
        console.error("Error during print:", error)
        // Show error and recover by reloading
        alert("Printing failed. The page will reload.")
        window.location.reload()
      }
    } else {
      toast({
        title: "Error",
        description: "Marksheet container not found",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (marksheetRef.current) {
      try {
        // Create a styled version for better printing
        const printContents = marksheetRef.current.innerHTML
        const originalContents = document.body.innerHTML
        
        // Add print-specific styling for proper PDF output
        const style = `
          <style>
            @media print {
              @page { 
                size: landscape; 
                margin: 0; 
              }
              body { 
                margin: 0; 
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .marksheet-print-container {
                max-width: 100%;
                max-height: 100vh;
              }
            }
          </style>
        `;
        
        // Set up a print-friendly version
        document.body.innerHTML = `
          ${style}
          <div class="marksheet-print-container">
            ${printContents}
          </div>
        `;
        
        // Notify the user with clearer instructions
        setTimeout(() => {
          // Show instructions for PDF saving
          alert('To save as PDF: Select "Save as PDF" in the printer options.');
          
          // Trigger the print dialog
          window.print();
          
          // Restore the original content
          document.body.innerHTML = originalContents;
          
          // Reload the page to restore all functionality
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error("Error during download:", error)
        // Show error and recover by reloading
        alert("Download failed. The page will reload.")
        window.location.reload()
      }
    } else {
      toast({
        title: "Error",
        description: "Marksheet container not found",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/certificates')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
        </Button>
        
        <Card className="p-8 text-center">
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
            <span className="ml-2">Loading marksheet...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/certificates')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
        </Button>
        
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Application Not Found</h2>
          <p>The requested marksheet could not be found or has been deleted.</p>
        </Card>
      </div>
    )
  }

  // Get student information from the application
  const studentName = application.studentName || application.student?.name || ""
  const courseName = application.student?.course?.name || ""
  const percentage = application.percentage || 0
  const grade = calculateGrade(percentage)
  const certificateNo = application.certificateNo || certificateNumber || ""
  const issueDate = formatDate()
  const studentPhoto = application.student?.photo || null
  const courseDuration = "12 (MONTHS)" // This should come from the course data if available
  const subjects = application.subjects || []
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/certificates')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFontSettings(!showFontSettings)}
          >
            {showFontSettings ? 'Hide Font Settings' : 'Customize Fonts'}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" /> Print Marksheet
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" /> Download Marksheet
          </Button>
        </div>
      </div>
      
      {showFontSettings && localTemplateConfig && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FontCustomizer
              label="Student Name"
              style={localTemplateConfig.studentNameStyle || {
                fontSize: '20px',
                fontWeight: 'bold',
                fontStyle: 'normal',
                color: '#000000'
              }}
              onStyleChange={(newStyle) => handleStyleChange('studentNameStyle', newStyle)}
            />
            <FontCustomizer
              label="Course Name"
              style={localTemplateConfig.courseNameStyle || {
                fontSize: '18px',
                fontWeight: 'bold',
                fontStyle: 'normal',
                color: '#000000'
              }}
              onStyleChange={(newStyle) => handleStyleChange('courseNameStyle', newStyle)}
            />
            <FontCustomizer
              label="Subject Marks"
              style={localTemplateConfig.percentageStyle || {
                fontSize: '16px',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#000000'
              }}
              onStyleChange={(newStyle) => handleStyleChange('percentageStyle', newStyle)}
            />
            <FontCustomizer
              label="Total Marks"
              style={localTemplateConfig.gradeStyle || {
                fontSize: '16px',
                fontWeight: 'bold',
                fontStyle: 'normal',
                color: '#000000'
              }}
              onStyleChange={(newStyle) => handleStyleChange('gradeStyle', newStyle)}
            />
          </div>
          <Button
            className="mt-4"
            onClick={saveTemplateConfig}
          >
            Save Font Settings
          </Button>
        </div>
      )}
      
      {/* Debug info */}
      {debugMode && (
        <div className="bg-yellow-100 p-4 mb-4 rounded-md">
          <h3 className="text-lg font-bold">Debug Info:</h3>
          <p>Application ID: {params.id}</p>
          <p>Application loaded: {application ? 'Yes' : 'No'}</p>
          <p>Template Error: {templateError ? 'Yes' : 'No'}</p>
          <p>Template: {marksheetTemplate ? marksheetTemplate.name : 'Not loaded'}</p>
          <p>Template URL: {marksheetTemplate ? marksheetTemplate.imageUrl : 'None'}</p>
          <p>Config: {templateConfig ? 'Loaded' : 'Not loaded'}</p>
          <p>Student Name: {studentName || 'Not available'}</p>
          <p>Course Name: {courseName || 'Not available'}</p>
          <p>Percentage: {percentage || 'Not available'}</p>
          <p>Certificate Number: {certificateNo || 'Not available'}</p>
          <p>Subjects: {subjects.length || 'Not available'}</p>
          <p><small>Press Ctrl+Shift+D to hide debug info</small></p>
        </div>
      )}
      
      {/* Marksheet Design with Template Image */}
      <div
        ref={marksheetRef}
        className="marksheet-container max-w-4xl mx-auto relative border border-gray-300"
      >
        <div className="relative">
          {/* Marksheet Template Image */}
          <div className="w-full aspect-[16/11] relative border-8 border-white shadow-lg">
            {marksheetTemplate ? (
              <img
                src={marksheetTemplate.imageUrl}
                alt="Marksheet Template"
                className="w-full h-full object-contain"
                onError={() => setTemplateError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Marksheet template not found</p>
              </div>
            )}
            
            {/* Marksheet Content positioned according to config */}
            {templateConfig && (
              <div className="absolute inset-0">
                {/* Student Name */}
                <div className="absolute text-center w-full" 
                  style={{ 
                    top: `${templateConfig.studentNamePosition?.top}%`, 
                    transform: 'translateX(-50%)',
                    left: '50%',
                    fontSize: templateConfig.studentNameStyle?.fontSize,
                    fontWeight: templateConfig.studentNameStyle?.fontWeight,
                    fontStyle: templateConfig.studentNameStyle?.fontStyle,
                    color: templateConfig.studentNameStyle?.color
                  }}
                >
                  <p className="uppercase tracking-wider">
                    {studentName}
                  </p>
                </div>
                
                {/* Course Name */}
                <div className="absolute text-center w-full" 
                  style={{ 
                    top: `${templateConfig.courseNamePosition?.top}%`, 
                    transform: 'translateX(-50%)',
                    left: '50%',
                    fontSize: templateConfig.courseNameStyle?.fontSize,
                    fontWeight: templateConfig.courseNameStyle?.fontWeight,
                    fontStyle: templateConfig.courseNameStyle?.fontStyle,
                    color: templateConfig.courseNameStyle?.color
                  }}
                >
                  <p className="uppercase">
                    {courseName}
                  </p>
                </div>
                
                {/* Subjects */}
                <div className="absolute text-center w-full" 
                  style={{ 
                    top: `${templateConfig.subjectsPosition?.top}%`, 
                    transform: 'translateX(-50%)',
                    left: '50%',
                    fontSize: templateConfig.subjectsStyle?.fontSize,
                    fontWeight: templateConfig.subjectsStyle?.fontWeight,
                    fontStyle: templateConfig.subjectsStyle?.fontStyle,
                    color: templateConfig.subjectsStyle?.color
                  }}
                >
                  <table className="w-full max-w-lg mx-auto border-collapse border border-gray-400">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 px-4 py-2">Subject</th>
                        <th className="border border-gray-400 px-4 py-2">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="border border-gray-400 px-4 py-2">{subject.name}</td>
                          <td className="border border-gray-400 px-4 py-2">{subject.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Percentage */}
                <div className="absolute text-center" 
                  style={{ 
                    top: `${templateConfig.percentagePosition?.top}%`, 
                    left: `${templateConfig.percentagePosition?.left}%`,
                    fontSize: templateConfig.percentageStyle?.fontSize,
                    fontWeight: templateConfig.percentageStyle?.fontWeight,
                    fontStyle: templateConfig.percentageStyle?.fontStyle,
                    color: templateConfig.percentageStyle?.color
                  }}
                >
                  <span>{percentage.toFixed(2)}%</span>
                </div>

                {/* Grade */}
                <div className="absolute text-center" 
                  style={{ 
                    top: `${templateConfig.gradePosition?.top}%`, 
                    left: `${templateConfig.gradePosition?.left}%`,
                    fontSize: templateConfig.gradeStyle?.fontSize,
                    fontWeight: templateConfig.gradeStyle?.fontWeight,
                    fontStyle: templateConfig.gradeStyle?.fontStyle,
                    color: templateConfig.gradeStyle?.color
                  }}
                >
                  <span>Grade: {grade}</span>
                </div>
                
                {/* Course Duration */}
                <div className="absolute" 
                  style={{ 
                    top: `${templateConfig.durationPosition?.top}%`, 
                    left: `${templateConfig.durationPosition?.left}%`,
                    fontSize: templateConfig.durationStyle?.fontSize,
                    fontWeight: templateConfig.durationStyle?.fontWeight,
                    fontStyle: templateConfig.durationStyle?.fontStyle,
                    color: templateConfig.durationStyle?.color
                  }}
                >
                  <span>{courseDuration}</span>
                </div>
                
                {/* Date of Issue */}
                <div className="absolute text-center" 
                  style={{ 
                    top: `${templateConfig.datePosition?.top}%`, 
                    left: `${templateConfig.datePosition?.left}%`,
                    fontSize: templateConfig.dateStyle?.fontSize,
                    fontWeight: templateConfig.dateStyle?.fontWeight,
                    fontStyle: templateConfig.dateStyle?.fontStyle,
                    color: templateConfig.dateStyle?.color
                  }}
                >
                  <span>Issue Date: {issueDate}</span>
                </div>
                
                {/* Certificate Number */}
                <div className="absolute" 
                  style={{ 
                    top: `${templateConfig.certificateNumberPosition?.top}%`, 
                    left: `${templateConfig.certificateNumberPosition?.left}%`,
                    fontSize: templateConfig.certificateNumberStyle?.fontSize,
                    fontWeight: templateConfig.certificateNumberStyle?.fontWeight,
                    fontStyle: templateConfig.certificateNumberStyle?.fontStyle,
                    color: templateConfig.certificateNumberStyle?.color
                  }}
                >
                  <span>{certificateNo}</span>
                </div>
                
                {/* Student Photo */}
                <div className="absolute" 
                  style={{ 
                    top: `${templateConfig.photoPosition?.top}%`, 
                    right: `${templateConfig.photoPosition?.left}%` 
                  }}
                >
                  <div style={{ 
                    height: `${templateConfig.photoSize?.height || 120}px`, 
                    width: `${templateConfig.photoSize?.width || 90}px`
                  }} className="overflow-hidden">
                    {studentPhoto ? (
                      <img
                        src={studentPhoto}
                        alt={studentName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-user.jpg";
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder-user.jpg"
                        alt="No Photo"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 