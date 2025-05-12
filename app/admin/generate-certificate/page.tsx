"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Search, Download, Printer } from "lucide-react"
import Image from "next/image"

interface Student {
  id: string
  firstName: string
  lastName: string
  fatherName?: string
  motherName?: string
  email: string
  phone: string
  course: string
  batch: string
  joiningDate: string
}

interface Template {
  id: string
  type: "certificate" | "marksheet"
  name: string
  imageUrl: string
  isActive: boolean
}

export default function GenerateCertificate() {
  const [students, setStudents] = useState<Student[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [certificateType, setCertificateType] = useState<"certificate" | "marksheet">("certificate")
  const [certificateData, setCertificateData] = useState({
    certificateNo: "",
    issueDate: new Date().toISOString().split("T")[0],
    grade: "A+",
    marks: "95",
    courseDuration: "6 months",
    coursePeriod: "Jan 2023 - Jun 2023",
    subjects: [
      { name: "Computer Fundamentals", objectiveMarks: "45", practicalMarks: "48", totalMarks: "93" },
      { name: "MS Office", objectiveMarks: "42", practicalMarks: "45", totalMarks: "87" },
      { name: "Internet & Email", objectiveMarks: "44", practicalMarks: "46", totalMarks: "90" },
    ],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load students and templates from localStorage
    const loadData = () => {
      try {
        // Load students
        const storedStudents = localStorage.getItem("students")
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents))
        }

        // Load templates
        const storedTemplates = localStorage.getItem("templates")
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates))
        } else {
          // Add default templates if none exist
          const defaultTemplates = [
            {
              id: "1",
              type: "certificate",
              name: "Default Certificate Template",
              imageUrl:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/867tel1R7Li42hQSh0Certificate-zcESYRrilH6sqTX59rbglXBy0uDkny.jpeg",
              isActive: true,
            },
            {
              id: "2",
              type: "marksheet",
              name: "Default Marksheet Template",
              imageUrl:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/867tel1R7Li42hQSh0Marksheet-3uxsKiCeuRxSpyUXeWUdDcm0A9FWpZ.jpeg",
              isActive: true,
            },
          ]
          localStorage.setItem("templates", JSON.stringify(defaultTemplates))
          setTemplates(defaultTemplates)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading the required data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSearch = () => {
    if (!searchTerm) {
      toast({
        title: "Search term required",
        description: "Please enter a student name, ID, or email to search.",
        variant: "destructive",
      })
      return
    }

    const filteredStudents = students.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filteredStudents.length === 0) {
      toast({
        title: "No students found",
        description: "No students match your search criteria.",
        variant: "destructive",
      })
      return
    }

    // Select the first matching student
    setSelectedStudent(filteredStudents[0])

    // Generate a certificate number
    setCertificateData({
      ...certificateData,
      certificateNo: `KC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    })
  }

  const handleGenerateCertificate = () => {
    if (!selectedStudent) {
      toast({
        title: "No student selected",
        description: "Please search and select a student first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // In a real application, this would be an API call to generate the certificate
    // For now, we'll just simulate a delay and show the preview
    setTimeout(() => {
      setShowPreview(true)
      setIsGenerating(false)

      toast({
        title: "Certificate generated",
        description: "The certificate has been generated successfully.",
      })
    }, 1000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your certificate is being downloaded.",
    })
  }

  const getActiveTemplate = (type: "certificate" | "marksheet") => {
    return templates.find((template) => template.type === type && template.isActive)
  }

  const activeTemplate = getActiveTemplate(certificateType)

  const getCourseDisplayName = (courseCode: string) => {
    const courses: Record<string, string> = {
      dca: "Diploma in Computer Applications",
      ccc: "Course on Computer Concepts",
      tally: "Tally Prime with GST",
      "o-level": "NIELIT O Level",
      "web-design": "Web Design & Development",
    }
    return courses[courseCode] || courseCode
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Generate Certificate</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {selectedStudent && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Selected Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{getCourseDisplayName(selectedStudent.course)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">{new Date(selectedStudent.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="certificateType">Certificate Type</Label>
                    <Select
                      value={certificateType}
                      onValueChange={(value) => setCertificateType(value as "certificate" | "marksheet")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="marksheet">Marksheet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="certificateNo">Certificate Number</Label>
                    <Input
                      id="certificateNo"
                      value={certificateData.certificateNo}
                      onChange={(e) => setCertificateData({ ...certificateData, certificateNo: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={certificateData.issueDate}
                      onChange={(e) => setCertificateData({ ...certificateData, issueDate: e.target.value })}
                    />
                  </div>

                  {certificateType === "certificate" && (
                    <>
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Select
                          value={certificateData.grade}
                          onValueChange={(value) => setCertificateData({ ...certificateData, grade: value })}
                        >
                          <SelectTrigger id="grade">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+ (Excellent)</SelectItem>
                            <SelectItem value="A">A (Very Good)</SelectItem>
                            <SelectItem value="B">B (Good)</SelectItem>
                            <SelectItem value="C">C (Average)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="marks">Marks</Label>
                        <Input
                          id="marks"
                          value={certificateData.marks}
                          onChange={(e) => setCertificateData({ ...certificateData, marks: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="courseDuration">Course Duration</Label>
                    <Input
                      id="courseDuration"
                      value={certificateData.courseDuration}
                      onChange={(e) => setCertificateData({ ...certificateData, courseDuration: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coursePeriod">Course Period</Label>
                    <Input
                      id="coursePeriod"
                      value={certificateData.coursePeriod}
                      onChange={(e) => setCertificateData({ ...certificateData, coursePeriod: e.target.value })}
                    />
                  </div>
                </div>

                {certificateType === "marksheet" && (
                  <div className="mt-6">
                    <Label className="block mb-2">Subjects and Marks</Label>
                    {certificateData.subjects.map((subject, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                        <Input
                          className="col-span-2"
                          placeholder="Subject Name"
                          value={subject.name}
                          onChange={(e) => {
                            const updatedSubjects = [...certificateData.subjects]
                            updatedSubjects[index].name = e.target.value
                            setCertificateData({ ...certificateData, subjects: updatedSubjects })
                          }}
                        />
                        <Input
                          placeholder="Objective"
                          value={subject.objectiveMarks}
                          onChange={(e) => {
                            const updatedSubjects = [...certificateData.subjects]
                            updatedSubjects[index].objectiveMarks = e.target.value
                            updatedSubjects[index].totalMarks = (
                              Number.parseInt(e.target.value || "0") +
                              Number.parseInt(updatedSubjects[index].practicalMarks || "0")
                            ).toString()
                            setCertificateData({ ...certificateData, subjects: updatedSubjects })
                          }}
                        />
                        <Input
                          placeholder="Practical"
                          value={subject.practicalMarks}
                          onChange={(e) => {
                            const updatedSubjects = [...certificateData.subjects]
                            updatedSubjects[index].practicalMarks = e.target.value
                            updatedSubjects[index].totalMarks = (
                              Number.parseInt(updatedSubjects[index].objectiveMarks || "0") +
                              Number.parseInt(e.target.value || "0")
                            ).toString()
                            setCertificateData({ ...certificateData, subjects: updatedSubjects })
                          }}
                        />
                      </div>
                    ))}
                    <div className="flex justify-between mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCertificateData({
                            ...certificateData,
                            subjects: [
                              ...certificateData.subjects,
                              { name: "", objectiveMarks: "", practicalMarks: "", totalMarks: "" },
                            ],
                          })
                        }}
                      >
                        Add Subject
                      </Button>
                      {certificateData.subjects.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCertificateData({
                              ...certificateData,
                              subjects: certificateData.subjects.slice(0, -1),
                            })
                          }}
                        >
                          Remove Subject
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Button onClick={handleGenerateCertificate} disabled={isGenerating} className="w-full">
                    {isGenerating ? "Generating..." : "Generate Certificate"}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="block mb-2">Template Preview</Label>
                {activeTemplate ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="aspect-[16/11] relative">
                      <Image
                        src={activeTemplate.imageUrl || "/placeholder.svg"}
                        alt={activeTemplate.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-8 text-center text-gray-500">
                    No active template found for {certificateType}. Please upload and set an active template.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certificate Preview</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={certificateRef} className="border rounded-md p-4">
              {certificateType === "certificate" ? (
                <div className="relative">
                  {activeTemplate && (
                    <div className="relative aspect-[16/11]">
                      <Image
                        src={activeTemplate.imageUrl || "/placeholder.svg"}
                        alt="Certificate Template"
                        width={800}
                        height={600}
                        className="object-contain"
                      />
                      <div className="absolute inset-0 flex flex-col items-center">
                        <div className="mt-[40%] text-center w-full">
                          <p className="text-2xl font-bold text-purple-900">
                            {selectedStudent?.firstName} {selectedStudent?.lastName}
                          </p>
                        </div>
                        <div className="absolute bottom-[35%] left-0 right-0 flex justify-between px-[15%]">
                          <div className="text-center">
                            <p className="text-sm">Grade: {certificateData.grade}</p>
                            <p className="text-sm">Marks: {certificateData.marks}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm">{getCourseDisplayName(selectedStudent?.course || "")}</p>
                          </div>
                        </div>
                        <div className="absolute bottom-[25%] left-0 right-0 flex justify-between px-[15%]">
                          <div className="text-center">
                            <p className="text-sm">Course Duration: {certificateData.courseDuration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm">Course Period: {certificateData.coursePeriod}</p>
                          </div>
                        </div>
                        <div className="absolute bottom-[15%] left-0 right-0 flex justify-between px-[15%]">
                          <div className="text-center">
                            <p className="text-sm">Certificate No.: {certificateData.certificateNo}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm">
                              Date of Issue: {new Date(certificateData.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {activeTemplate && (
                    <div className="relative aspect-[16/11]">
                      <Image
                        src={activeTemplate.imageUrl || "/placeholder.svg"}
                        alt="Marksheet Template"
                        width={800}
                        height={600}
                        className="object-contain"
                      />
                      <div className="absolute inset-0">
                        <div className="absolute top-[25%] left-[30%]">
                          <p className="text-sm">
                            {selectedStudent?.firstName} {selectedStudent?.lastName}
                          </p>
                        </div>
                        <div className="absolute top-[25%] right-[15%]">
                          <p className="text-sm">{certificateData.courseDuration}</p>
                        </div>
                        <div className="absolute top-[31%] left-[30%]">
                          <p className="text-sm">{selectedStudent?.fatherName || "Father's Name"}</p>
                        </div>
                        <div className="absolute top-[31%] right-[15%]">
                          <p className="text-sm">{certificateData.certificateNo}</p>
                        </div>
                        <div className="absolute top-[37%] left-[30%]">
                          <p className="text-sm">{selectedStudent?.motherName || "Mother's Name"}</p>
                        </div>
                        <div className="absolute top-[37%] right-[15%]">
                          <p className="text-sm">{new Date(selectedStudent?.dateOfBirth || "").toLocaleDateString()}</p>
                        </div>
                        <div className="absolute top-[43%] left-[30%]">
                          <p className="text-sm">{getCourseDisplayName(selectedStudent?.course || "")}</p>
                        </div>

                        {/* Subjects and Marks */}
                        <div className="absolute top-[55%] left-0 right-0">
                          <div className="px-[10%]">
                            {certificateData.subjects.map((subject, index) => (
                              <div key={index} className="flex justify-between mb-2">
                                <div className="w-[50%] text-center">
                                  <p className="text-sm">{subject.name}</p>
                                </div>
                                <div className="w-[15%] text-center">
                                  <p className="text-sm">{subject.objectiveMarks}</p>
                                </div>
                                <div className="w-[15%] text-center">
                                  <p className="text-sm">{subject.practicalMarks}</p>
                                </div>
                                <div className="w-[15%] text-center">
                                  <p className="text-sm">{subject.totalMarks}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total Marks */}
                        <div className="absolute bottom-[15%] right-[15%]">
                          <p className="text-sm font-bold">
                            {certificateData.subjects.reduce(
                              (total, subject) => total + Number.parseInt(subject.totalMarks || "0"),
                              0,
                            )}
                          </p>
                        </div>

                        {/* Issue Date */}
                        <div className="absolute bottom-[5%] left-[20%]">
                          <p className="text-sm">{new Date(certificateData.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
