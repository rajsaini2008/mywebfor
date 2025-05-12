"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

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
  fontFamily?: string
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
  studentNameStyle?: Style
  courseNameStyle?: Style
  percentageStyle?: Style
  gradeStyle?: Style
  durationStyle?: Style
  dateStyle?: Style
  certificateNumberStyle?: Style
}

export default function PrintCertificate({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<ExamApplication | null>(null)
  const [certificateTemplate, setCertificateTemplate] = useState<Template | null>(null)
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null)
  const certificateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-trigger print when component is fully loaded
    const timer = setTimeout(() => {
      if (application && certificateTemplate && templateConfig) {
        window.print();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [application, certificateTemplate, templateConfig]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch application data
        const appRes = await fetch(`/api/exam-applications/${params.id}`)
        const appData = await appRes.json()
        if (appData.success) {
          setApplication(appData.data)
        }

        // Fetch active certificate template
        const templateRes = await fetch('/api/backgrounds?type=certificate&active=true')
        const templateData = await templateRes.json()
        if (templateData.success && templateData.data && templateData.data.length > 0) {
          const activeTemplate = templateData.data[0]
          setCertificateTemplate(activeTemplate)

          // Fetch template configuration
          const configRes = await fetch(`/api/template-config?templateId=${activeTemplate._id}&type=certificate`)
          const configData = await configRes.json()
          if (configData.success) {
            setTemplateConfig(configData.data)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load certificate data",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [params.id])

  const formatDate = () => {
    const now = new Date()
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  }

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C"
    return "D"
  }

  if (!application || !certificateTemplate || !templateConfig) {
    return <div className="flex justify-center items-center min-h-screen">Loading certificate...</div>
  }

  const studentName = application.studentName || application.student?.name || ""
  const courseName = application.student?.course?.name || "ADVANCED DIPLOMA IN COMPUTER APPLICATIONS"
  const percentage = application.percentage || 0
  const grade = calculateGrade(percentage)
  const certificateNo = application.certificateNo || ""
  const issueDate = formatDate()
  const studentPhoto = application.student?.photo || null
  const courseDuration = "12 (MONTHS)"

  return (
    <>
      <style jsx global>{`
        /* Reset all browser styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: white;
          height: 100vh;
          width: 100vw;
        }
        
        /* Print styles */
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .certificate-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .certificate-container {
            box-shadow: none !important;
            border: none !important;
            max-width: 100%;
            max-height: 100%;
          }
          
          .print-button {
            display: none !important;
          }
        }
        
        /* Screen display styles */
        .certificate-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100vw;
          background: white;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .certificate-container {
          max-width: 90%;
          max-height: 90vh;
        }
      `}</style>
      
      <div className="certificate-wrapper">
        <Button
          className="print-button fixed top-4 right-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 z-10"
          onClick={() => {
            // Log the attempt
            console.log("Certificate view attempted for ID:", params.id);
            
            // Show improved toast notification
            toast({
              title: "Feature unavailable",
              description: "Certificate viewing feature is temporarily unavailable. Please contact administrator.",
              variant: "destructive",
            });
          }}
        >
          View Certificate
        </Button>
        
        <div
          ref={certificateRef}
          className="certificate-container"
        >
          <div className="relative">
            <div className="w-full aspect-[16/11] relative">
              <img
                src={certificateTemplate.imageUrl}
                alt="Certificate Template"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0">
                {/* Student Name */}
                <div className="absolute text-center w-full"
                  style={{
                    top: `${templateConfig.studentNamePosition?.top}%`,
                    transform: 'translateX(-50%)',
                    left: '50%',
                    fontSize: templateConfig.studentNameStyle?.fontSize || '20px',
                    fontWeight: templateConfig.studentNameStyle?.fontWeight || 'bold',
                    fontStyle: templateConfig.studentNameStyle?.fontStyle || 'normal',
                    color: templateConfig.studentNameStyle?.color || '#000000',
                    fontFamily: templateConfig.studentNameStyle?.fontFamily || 'Arial'
                  }}
                >
                  <p className="uppercase tracking-wider">{studentName}</p>
                </div>

                {/* Percentage */}
                <div className="absolute text-center"
                  style={{
                    top: `${templateConfig.percentagePosition?.top}%`,
                    left: `${templateConfig.percentagePosition?.left}%`,
                    fontSize: templateConfig.percentageStyle?.fontSize || '16px',
                    fontWeight: templateConfig.percentageStyle?.fontWeight || 'normal',
                    fontStyle: templateConfig.percentageStyle?.fontStyle || 'normal',
                    color: templateConfig.percentageStyle?.color || '#000000',
                    fontFamily: templateConfig.percentageStyle?.fontFamily || 'Arial'
                  }}
                >
                  <span>{percentage.toFixed(2)}%</span>
                </div>

                {/* Grade */}
                <div className="absolute text-center"
                  style={{
                    top: `${templateConfig.gradePosition?.top}%`,
                    left: `${templateConfig.gradePosition?.left}%`,
                    fontSize: templateConfig.gradeStyle?.fontSize || '16px',
                    fontWeight: templateConfig.gradeStyle?.fontWeight || 'normal',
                    fontStyle: templateConfig.gradeStyle?.fontStyle || 'normal',
                    color: templateConfig.gradeStyle?.color || '#000000',
                    fontFamily: templateConfig.gradeStyle?.fontFamily || 'Arial'
                  }}
                >
                  <span>{grade}</span>
                </div>

                {/* Course Name */}
                <div className="absolute text-center w-full"
                  style={{
                    top: `${templateConfig.courseNamePosition?.top}%`,
                    transform: 'translateX(-50%)',
                    left: '50%',
                    fontSize: templateConfig.courseNameStyle?.fontSize || '18px',
                    fontWeight: templateConfig.courseNameStyle?.fontWeight || 'bold',
                    fontStyle: templateConfig.courseNameStyle?.fontStyle || 'normal',
                    color: templateConfig.courseNameStyle?.color || '#000000',
                    fontFamily: templateConfig.courseNameStyle?.fontFamily || 'Arial'
                  }}
                >
                  <p className="uppercase">{courseName}</p>
                </div>

                {/* Course Duration */}
                <div className="absolute"
                  style={{
                    top: `${templateConfig.durationPosition?.top}%`,
                    left: `${templateConfig.durationPosition?.left}%`,
                    fontSize: templateConfig.durationStyle?.fontSize || '16px',
                    fontWeight: templateConfig.durationStyle?.fontWeight || 'normal',
                    fontStyle: templateConfig.durationStyle?.fontStyle || 'normal',
                    color: templateConfig.durationStyle?.color || '#000000',
                    fontFamily: templateConfig.durationStyle?.fontFamily || 'Arial'
                  }}
                >
                  <span>{courseDuration}</span>
                </div>

                {/* Date of Issue */}
                <div className="absolute text-center"
                  style={{
                    top: `${templateConfig.datePosition?.top}%`,
                    left: `${templateConfig.datePosition?.left}%`,
                    fontSize: templateConfig.dateStyle?.fontSize || '16px',
                    fontWeight: templateConfig.dateStyle?.fontWeight || 'normal',
                    fontStyle: templateConfig.dateStyle?.fontStyle || 'normal',
                    color: templateConfig.dateStyle?.color || '#000000',
                    fontFamily: templateConfig.dateStyle?.fontFamily || 'Arial'
                  }}
                >
                  <span>{issueDate}</span>
                </div>

                {/* Certificate Number */}
                <div className="absolute"
                  style={{
                    top: `${templateConfig.certificateNumberPosition?.top}%`,
                    left: `${templateConfig.certificateNumberPosition?.left}%`,
                    fontSize: templateConfig.certificateNumberStyle?.fontSize || '14px',
                    fontWeight: templateConfig.certificateNumberStyle?.fontWeight || 'normal',
                    fontStyle: templateConfig.certificateNumberStyle?.fontStyle || 'normal',
                    color: templateConfig.certificateNumberStyle?.color || '#000000',
                    fontFamily: templateConfig.certificateNumberStyle?.fontFamily || 'Arial'
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
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 