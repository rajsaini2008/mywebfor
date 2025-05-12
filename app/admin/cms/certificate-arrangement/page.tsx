"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import FontCustomizer from "@/components/FontCustomizer"

interface Template {
  _id: string
  type: string
  name: string
  imageUrl: string
  isActive: boolean
}

interface Position {
  top: number
  left: number
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
  studentNamePosition: Position
  courseNamePosition: Position
  percentagePosition: Position
  gradePosition: Position
  durationPosition: Position
  datePosition: Position
  photoPosition: Position
  certificateNumberPosition: Position
  photoSize: { width: number, height: number }
  studentNameStyle: Style
  courseNameStyle: Style
  percentageStyle: Style
  gradeStyle: Style
  durationStyle: Style
  dateStyle: Style
  certificateNumberStyle: Style
}

type ElementType = 
  | "studentName" 
  | "courseName" 
  | "percentage" 
  | "grade"
  | "duration" 
  | "date" 
  | "photo"
  | "certificateNumber"

export default function CertificateArrangement() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string>("")
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedElement, setSelectedElement] = useState<ElementType>("studentName")
  const [activeTab, setActiveTab] = useState<"certificate" | "marksheet">("certificate")
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)

  // Sample student data for preview
  const previewData = {
    studentName: "John Doe",
    courseName: "ADVANCED DIPLOMA IN COMPUTER APPLICATIONS",
    percentage: 85.5,
    grade: "A",
    courseDuration: "12 (MONTHS)",
    issueDate: "27 APR 2025",
    certificateNumber: "CERT123456"
  }

  // Fetch templates and active template on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true)
        
        // Fetch templates by type (certificate or marksheet)
        const response = await fetch(`/api/backgrounds?type=${activeTab}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${activeTab} templates`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setTemplates(data.data)
          
          // Find active template
          const activeTemplate = data.data.find((t: Template) => t.isActive)
          
          if (activeTemplate) {
            setActiveTemplateId(activeTemplate._id)
            await fetchTemplateConfig(activeTemplate._id)
          } else if (data.data.length > 0) {
            setActiveTemplateId(data.data[0]._id)
            await fetchTemplateConfig(data.data[0]._id)
          }
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} templates:`, error)
        toast({
          title: "Error",
          description: `Failed to load ${activeTab} templates`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTemplates()
  }, [activeTab])

  // Fetch template configuration
  const fetchTemplateConfig = async (templateId: string) => {
    try {
      const response = await fetch(`/api/template-config?templateId=${templateId}&type=${activeTab}`)
      
      if (response.status === 404) {
        // No configuration exists yet, create default
        const defaultConfig = {
          templateId,
          type: activeTab,
          studentNamePosition: { top: 51, left: 0 },
          courseNamePosition: { top: 60, left: 0 },
          percentagePosition: { top: 55, left: 30 },
          gradePosition: { top: 55, left: 0 },
          durationPosition: { top: 66.5, left: 0 },
          datePosition: { top: 76, left: 0 },
          photoPosition: { top: 23, left: 11 },
          photoSize: { width: 90, height: 120 },
          certificateNumberPosition: { top: 85, left: 10 },
          studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
          certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' }
        };
        setTemplateConfig(defaultConfig);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch template configuration')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        // Ensure all required properties are present
        const config = {
          ...data.data,
          gradePosition: data.data.gradePosition || { top: 55, left: 0 },
          photoSize: data.data.photoSize || { width: 90, height: 120 },
          gradeStyle: data.data.gradeStyle || { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
        };
        setTemplateConfig(config);
      }
    } catch (error) {
      console.error("Error fetching template configuration:", error)
      // Set default configuration with all required fields
      const defaultConfig = {
        templateId,
        type: activeTab,
        studentNamePosition: { top: 51, left: 0 },
        courseNamePosition: { top: 60, left: 0 },
        percentagePosition: { top: 55, left: 30 },
        gradePosition: { top: 55, left: 0 },
        durationPosition: { top: 66.5, left: 0 },
        datePosition: { top: 76, left: 0 },
        photoPosition: { top: 23, left: 11 },
        photoSize: { width: 90, height: 120 },
        certificateNumberPosition: { top: 85, left: 10 },
        studentNameStyle: { fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        courseNameStyle: { fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        percentageStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        gradeStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        durationStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        dateStyle: { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' },
        certificateNumberStyle: { fontSize: '14px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000', fontFamily: 'Arial, sans-serif' }
      };
      setTemplateConfig(defaultConfig);
      toast({
        title: "Error",
        description: "Failed to load template configuration",
        variant: "destructive",
      })
    }
  }

  // Handle template change
  const handleTemplateChange = async (templateId: string) => {
    setActiveTemplateId(templateId)
    await fetchTemplateConfig(templateId)
  }

  // Update position helper
  const updatePosition = (element: ElementType, direction: 'up' | 'down' | 'left' | 'right', amount: number = 0.5) => {
    if (!templateConfig) return
    
    const positionKey = `${element}Position` as keyof TemplateConfig
    const position = { ...templateConfig[positionKey] as Position }
    
    if (direction === 'up') {
      position.top = Math.max(0, position.top - amount)
    } else if (direction === 'down') {
      position.top = Math.min(100, position.top + amount)
    } else if (direction === 'left') {
      position.left = Math.max(0, position.left - amount)
    } else if (direction === 'right') {
      position.left = Math.min(100, position.left + amount)
    }
    
    setTemplateConfig({
      ...templateConfig,
      [positionKey]: position
    })
  }

  // Update photo size safely
  const updatePhotoSize = (dimension: 'width' | 'height', value: number) => {
    if (!templateConfig) return
    
    const photoSize = { ...(templateConfig.photoSize || { width: 90, height: 120 }) }
    photoSize[dimension] = value
    
    setTemplateConfig({
      ...templateConfig,
      photoSize
    })
  }

  // Update style helper
  const updateStyle = (element: ElementType, property: keyof Style, value: string) => {
    if (!templateConfig) return
    
    const styleKey = `${element}Style` as keyof TemplateConfig
    const style = { ...templateConfig[styleKey] as Style }
    
    style[property] = value
    
    // Create a new templateConfig object to ensure React detects the change
    const updatedConfig = {
      ...templateConfig,
      [styleKey]: style
    };
    
    setTemplateConfig(updatedConfig);
    console.log(`Updated ${element} style:`, style);
  }

  // Save configuration
  const saveConfiguration = async () => {
    if (!templateConfig) return
    
    try {
      setIsSaving(true)
      console.log("Saving template configuration:", templateConfig);
      
      const method = templateConfig._id ? 'PUT' : 'POST'
      const response = await fetch('/api/template-config', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateConfig)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save template configuration')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTemplateConfig(data.data)
        toast({
          title: "Success",
          description: "Template configuration saved successfully",
        })
        console.log("Configuration saved successfully:", data.data);
      } else {
        throw new Error(data.message || 'Failed to save template configuration')
      }
    } catch (error) {
      console.error("Error saving template configuration:", error)
      toast({
        title: "Error",
        description: "Failed to save template configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get position for selected element
  const getSelectedPosition = (): Position => {
    if (!templateConfig) return { top: 0, left: 0 }
    
    const positionKey = `${selectedElement}Position` as keyof TemplateConfig
    // Ensure we have a valid position to return
    return (templateConfig[positionKey] as Position) || { top: 0, left: 0 }
  }

  // Get style for selected element
  const getSelectedStyle = (): Style => {
    if (!templateConfig) return { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
    
    const styleKey = `${selectedElement}Style` as keyof TemplateConfig
    // Ensure we have a valid style to return
    return (templateConfig[styleKey] as Style) || { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' }
  }

  // Make sure template config has safe values throughout the component
  useEffect(() => {
    if (templateConfig) {
      // Ensure all position properties exist with safe defaults
      const safeConfig = { ...templateConfig };
      if (!safeConfig.gradePosition) safeConfig.gradePosition = { top: 55, left: 0 };
      if (!safeConfig.photoSize) safeConfig.photoSize = { width: 90, height: 120 };
      if (!safeConfig.gradeStyle) safeConfig.gradeStyle = { fontSize: '16px', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' };
      
      // Only update if changes were made
      if (JSON.stringify(safeConfig) !== JSON.stringify(templateConfig)) {
        setTemplateConfig(safeConfig);
      }
    }
  }, [templateConfig]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/cms')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to CMS Panel
        </Button>
        
        <Card className="p-8 text-center">
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600"></div>
            <span className="ml-2">Loading template data...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/cms')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to CMS Panel
        </Button>
        
        <Button
          onClick={saveConfiguration}
          disabled={isSaving}
          className="flex items-center"
        >
          <span className="mr-2">💾</span> {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Certificate & Marksheet Data Arrangement</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "certificate" | "marksheet")}>
        <TabsList className="mb-4">
          <TabsTrigger value="certificate">Certificate Templates</TabsTrigger>
          <TabsTrigger value="marksheet">Marksheet Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="certificate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Certificate Template</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p>No certificate templates found. Please upload templates in the Backgrounds section.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="template-select">Select Template</Label>
                    <Select value={activeTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name} {template.isActive ? '(Active)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Select Element to Position</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      <Button 
                        variant={selectedElement === "studentName" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("studentName")}
                        className="text-sm"
                      >
                        Student Name
                      </Button>
                      <Button 
                        variant={selectedElement === "courseName" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("courseName")}
                        className="text-sm"
                      >
                        Course Name
                      </Button>
                      <Button 
                        variant={selectedElement === "percentage" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("percentage")}
                        className="text-sm"
                      >
                        Percentage
                      </Button>
                      <Button 
                        variant={selectedElement === "grade" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("grade")}
                        className="text-sm"
                      >
                        Grade
                      </Button>
                      <Button 
                        variant={selectedElement === "duration" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("duration")}
                        className="text-sm"
                      >
                        Course Duration
                      </Button>
                      <Button 
                        variant={selectedElement === "date" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("date")}
                        className="text-sm"
                      >
                        Issue Date
                      </Button>
                      <Button 
                        variant={selectedElement === "photo" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("photo")}
                        className="text-sm"
                      >
                        Student Photo
                      </Button>
                      <Button 
                        variant={selectedElement === "certificateNumber" ? "default" : "outline"} 
                        onClick={() => setSelectedElement("certificateNumber")}
                        className="text-sm"
                      >
                        Certificate No.
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {templateConfig && activeTemplateId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Position Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Position</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Vertical (Top)</Label>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                variant="outline" 
                                onClick={() => updatePosition(selectedElement, 'up')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Input 
                                value={getSelectedPosition().top.toFixed(1)} 
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value)
                                  if (!isNaN(value)) {
                                    const positionKey = `${selectedElement}Position` as keyof TemplateConfig
                                    setTemplateConfig({
                                      ...templateConfig,
                                      [positionKey]: {
                                        ...templateConfig[positionKey] as Position,
                                        top: value
                                      }
                                    })
                                  }
                                }}
                                className="text-center"
                              />
                              <span>%</span>
                              <Button 
                                size="sm"
                                variant="outline" 
                                onClick={() => updatePosition(selectedElement, 'down')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Horizontal (Left)</Label>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                variant="outline" 
                                onClick={() => updatePosition(selectedElement, 'left')}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Input 
                                value={getSelectedPosition().left.toFixed(1)} 
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value)
                                  if (!isNaN(value)) {
                                    const positionKey = `${selectedElement}Position` as keyof TemplateConfig
                                    setTemplateConfig({
                                      ...templateConfig,
                                      [positionKey]: {
                                        ...templateConfig[positionKey] as Position,
                                        left: value
                                      }
                                    })
                                  }
                                }}
                                className="text-center"
                              />
                              <span>%</span>
                              <Button 
                                size="sm"
                                variant="outline" 
                                onClick={() => updatePosition(selectedElement, 'right')}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedElement === "photo" && (
                        <div className="pt-4 border-t">
                          <Label className="mb-2 block">Photo Size</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label>Width</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input 
                                  type="number"
                                  min="30"
                                  max="200"
                                  value={templateConfig?.photoSize?.width || 90}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    if (!isNaN(value) && value >= 30 && value <= 200) {
                                      updatePhotoSize('width', value)
                                    }
                                  }}
                                  className="text-center"
                                />
                                <span>px</span>
                              </div>
                            </div>
                            <div>
                              <Label>Height</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input 
                                  type="number"
                                  min="40"
                                  max="240"
                                  value={templateConfig?.photoSize?.height || 120}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    if (!isNaN(value) && value >= 40 && value <= 240) {
                                      updatePhotoSize('height', value)
                                    }
                                  }}
                                  className="text-center"
                                />
                                <span>px</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Label className="mb-2 block">Text Style</Label>
                        <FontCustomizer
                          style={getSelectedStyle()}
                          onStyleChange={(newStyle) => {
                            const styleKey = `${selectedElement}Style` as keyof TemplateConfig
                            setTemplateConfig({
                              ...templateConfig,
                              [styleKey]: newStyle
                            })
                          }}
                          label={selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div ref={previewRef} className="relative border border-gray-200 rounded-md max-w-full overflow-hidden">
                      <div className="w-full aspect-[16/11] relative">
                        {/* Certificate Template Image */}
                        <img
                          src={templates.find(t => t._id === activeTemplateId)?.imageUrl || ''}
                          alt="Certificate Template"
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Certificate Content Preview */}
                        <div className="absolute inset-0">
                          {/* Student Name */}
                          <div className={`absolute text-center ${selectedElement === 'studentName' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.studentNamePosition?.top || 51}%`, 
                              left: `${templateConfig.studentNamePosition?.left || 0}%`, 
                              right: `${templateConfig.studentNamePosition?.left || 0}%`,
                              fontSize: templateConfig.studentNameStyle?.fontSize || '20px',
                              fontWeight: templateConfig.studentNameStyle?.fontWeight || 'bold',
                              fontStyle: templateConfig.studentNameStyle?.fontStyle || 'normal',
                              color: templateConfig.studentNameStyle?.color || '#000000',
                              fontFamily: templateConfig.studentNameStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <p className="uppercase tracking-wider">
                              {previewData.studentName}
                            </p>
                          </div>
                          
                          {/* Percentage */}
                          <div className={`absolute text-center ${selectedElement === 'percentage' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.percentagePosition?.top || 55}%`, 
                              left: `${templateConfig.percentagePosition?.left || 30}%`,
                              fontSize: templateConfig.percentageStyle?.fontSize || '16px',
                              fontWeight: templateConfig.percentageStyle?.fontWeight || 'normal',
                              fontStyle: templateConfig.percentageStyle?.fontStyle || 'normal',
                              color: templateConfig.percentageStyle?.color || '#000000',
                              fontFamily: templateConfig.percentageStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <span>{previewData.percentage.toFixed(2)}%</span>
                          </div>

                          {/* Grade */}
                          <div className={`absolute text-center ${selectedElement === 'grade' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.gradePosition?.top || 55}%`, 
                              left: `${templateConfig.gradePosition?.left || 0}%`, 
                              fontSize: templateConfig.gradeStyle?.fontSize || '16px',
                              fontWeight: templateConfig.gradeStyle?.fontWeight || 'normal',
                              fontStyle: templateConfig.gradeStyle?.fontStyle || 'normal',
                              color: templateConfig.gradeStyle?.color || '#000000',
                              fontFamily: templateConfig.gradeStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <span>{previewData.grade}</span>
                          </div>
                          
                          {/* Course Name */}
                          <div className={`absolute text-center ${selectedElement === 'courseName' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.courseNamePosition?.top || 60}%`, 
                              left: `${templateConfig.courseNamePosition?.left || 0}%`, 
                              right: `${templateConfig.courseNamePosition?.left || 0}%`,
                              fontSize: templateConfig.courseNameStyle?.fontSize || '18px',
                              fontWeight: templateConfig.courseNameStyle?.fontWeight || 'bold',
                              fontStyle: templateConfig.courseNameStyle?.fontStyle || 'normal',
                              color: templateConfig.courseNameStyle?.color || '#000000',
                              fontFamily: templateConfig.courseNameStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <p className="uppercase">
                              {previewData.courseName}
                            </p>
                          </div>
                          
                          {/* Course Duration */}
                          <div className={`absolute ${selectedElement === 'duration' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.durationPosition?.top || 66.5}%`, 
                              left: `${templateConfig.durationPosition?.left || 0}%`,
                              fontSize: templateConfig.durationStyle?.fontSize || '16px',
                              fontWeight: templateConfig.durationStyle?.fontWeight || 'normal',
                              fontStyle: templateConfig.durationStyle?.fontStyle || 'normal',
                              color: templateConfig.durationStyle?.color || '#000000',
                              fontFamily: templateConfig.durationStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <span>{previewData.courseDuration}</span>
                          </div>
                          
                          {/* Date of Issue */}
                          <div className={`absolute text-center ${selectedElement === 'date' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.datePosition?.top || 76}%`, 
                              left: `${templateConfig.datePosition?.left || 0}%`,
                              fontSize: templateConfig.dateStyle?.fontSize || '16px',
                              fontWeight: templateConfig.dateStyle?.fontWeight || 'normal',
                              fontStyle: templateConfig.dateStyle?.fontStyle || 'normal',
                              color: templateConfig.dateStyle?.color || '#000000',
                              fontFamily: templateConfig.dateStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <span>{previewData.issueDate}</span>
                          </div>
                          
                          {/* Certificate Number */}
                          <div className={`absolute ${selectedElement === 'certificateNumber' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.certificateNumberPosition?.top || 85}%`, 
                              left: `${templateConfig.certificateNumberPosition?.left || 10}%`,
                              fontSize: templateConfig.certificateNumberStyle?.fontSize || '14px',
                              fontWeight: templateConfig.certificateNumberStyle?.fontWeight || 'normal',
                              fontStyle: templateConfig.certificateNumberStyle?.fontStyle || 'normal',
                              color: templateConfig.certificateNumberStyle?.color || '#000000',
                              fontFamily: templateConfig.certificateNumberStyle?.fontFamily || 'Arial, sans-serif'
                            }}
                          >
                            <span>{previewData.certificateNumber}</span>
                          </div>
                          
                          {/* Student Photo */}
                          <div className={`absolute ${selectedElement === 'photo' ? 'ring-2 ring-blue-500' : ''}`} 
                            style={{ 
                              top: `${templateConfig.photoPosition?.top || 23}%`, 
                              right: `${templateConfig.photoPosition?.left || 11}%` 
                            }}
                          >
                            <div style={{ 
                              height: `${templateConfig.photoSize?.height || 120}px`, 
                              width: `${templateConfig.photoSize?.width || 90}px`
                            }} className="overflow-hidden">
                              <img
                                src="/placeholder-user.jpg"
                                alt="Student Photo"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="marksheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Marksheet Template</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p>No marksheet templates found. Please upload templates in the Backgrounds section.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="template-select">Select Template</Label>
                    <Select value={activeTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name} {template.isActive ? '(Active)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Similar content as certificate tab, but for marksheet */}
                </div>
              )}
            </CardContent>
          </Card>
          
          {templateConfig && activeTemplateId && (
            <p>Marksheet configuration is similar to certificate configuration with the same controls and preview.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 