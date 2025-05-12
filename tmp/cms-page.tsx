"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Image, 
  BookOpen, 
  Users, 
  Mail, 
  Phone, 
  Award,
  LayoutDashboard,
  BarChart
} from "lucide-react"

const cmsPages = [
  {
    title: "Home Page Content",
    description: "Edit main banner text, featured content, and welcome message",
    icon: <LayoutDashboard className="h-6 w-6" />,
    url: "/admin/cms/home",
  },
  {
    title: "Certificate & Marksheet Data Arrangement",
    description: "Configure position and style of student data on certificate and marksheet templates",
    icon: <Award className="h-6 w-6" />,
    url: "/admin/cms/certificate-arrangement",
  },
  {
    title: "About Us",
    description: "Edit about us content, mission, vision and team information",
    icon: <Users className="h-6 w-6" />,
    url: "/admin/cms/about",
  },
  {
    title: "Courses & Programs",
    description: "Manage course information, descriptions and features",
    icon: <BookOpen className="h-6 w-6" />,
    url: "/admin/cms/courses",
  },
  {
    title: "Slider Content",
    description: "Edit slider images, captions and links",
    icon: <BarChart className="h-6 w-6" />,
    url: "/admin/cms/slider",
  },
  {
    title: "Gallery",
    description: "Manage photo gallery images and albums",
    icon: <Image className="h-6 w-6" />,
    url: "/admin/cms/gallery",
  },
  {
    title: "Testimonials",
    description: "Edit student testimonials and success stories",
    icon: <Award className="h-6 w-6" />,
    url: "/admin/cms/testimonials",
  },
  {
    title: "Contact Info",
    description: "Update contact details, address, phone and email",
    icon: <Phone className="h-6 w-6" />,
    url: "/admin/cms/contact",
  },
  {
    title: "Footer Content",
    description: "Edit footer links, social media and copyright information",
    icon: <LayoutDashboard className="h-6 w-6" />,
    url: "/admin/cms/footer",
  }
]

export default function CMSPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">CMS Panel</h1>
      </div>
      <p className="text-muted-foreground">
        Welcome to the Content Management System. Use the options below to update website content.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cmsPages.map((page, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{page.title}</CardTitle>
              <div className="text-primary">{page.icon}</div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{page.description}</p>
            </CardContent>
            <CardFooter>
              <Link href={page.url} className="w-full">
                <Button variant="outline" className="w-full">Edit Content</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 