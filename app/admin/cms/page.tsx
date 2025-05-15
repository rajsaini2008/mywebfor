"use client"

import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { 
  LayoutDashboard, 
  LayoutDashboard as HomeIcon, 
  Users, 
  BookOpen, 
  ImageIcon, 
  Award, 
  FileText
} from "lucide-react"
import Link from "next/link"

export default function CMSPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">CMS Panel</h1>
      </div>
      
      <div className="text-xl mb-4">
        Welcome to the Content Management System. Use the options below to update website content.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Global Settings Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Global Settings</CardTitle>
            <div className="text-orange-500">
              <FileText className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage website logo, name, contact details and social media links</p>
            <button
              onClick={() => window.location.href = "/admin/cms/global"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Settings
            </button>
          </CardContent>
        </Card>
        
        {/* Home Page Content Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Home Page Content</CardTitle>
            <div className="text-orange-500">
              <HomeIcon className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Edit main banner text, featured content, and welcome message</p>
            <button
              onClick={() => window.location.href = "/admin/cms/home"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* Certificate & Marksheet Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Certificate & Marksheet Data Arrangement</CardTitle>
            <div className="text-orange-500">
              <Award className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Configure position and style of student data on certificate and marksheet templates</p>
            <button
              onClick={() => window.location.href = "/admin/cms/certificate-arrangement"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* About Us Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>About Us</CardTitle>
            <div className="text-orange-500">
              <Users className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Edit about us content, mission, vision and team information</p>
            <button
              onClick={() => window.location.href = "/admin/cms/about"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* Courses & Programs Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Courses & Programs</CardTitle>
            <div className="text-orange-500">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage course information, descriptions and features</p>
            <button
              onClick={() => window.location.href = "/admin/cms/courses"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* Slider Content Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Slider Content</CardTitle>
            <div className="text-orange-500">
              <FileText className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Edit slider images, captions and links</p>
            <button
              onClick={() => window.location.href = "/admin/cms/slider"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* Gallery Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Gallery</CardTitle>
            <div className="text-orange-500">
              <ImageIcon className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage photo gallery images and albums</p>
            <button
              onClick={() => window.location.href = "/admin/cms/gallery"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
        
        {/* Legal Information Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle>Legal Information</CardTitle>
            <div className="text-orange-500">
              <FileText className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Edit legal documents including terms & conditions, privacy policy, refund policy, and disclaimer</p>
            <button
              onClick={() => window.location.href = "/admin/cms/legal"}
              className="block w-full py-2 text-center bg-blue-800 hover:bg-blue-900 text-white rounded"
            >
              Edit Content
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 