"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Key,
  ImageIcon,
  Award,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  Pencil,
  Clock,
  Mail,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showExamSubmenu, setShowExamSubmenu] = useState(false)
  const [showFeatureMasterSubmenu, setShowFeatureMasterSubmenu] = useState(false)
  const [showEnquirySubmenu, setShowEnquirySubmenu] = useState(false)
  const [showStudentSubmenu, setShowStudentSubmenu] = useState(false)
  const [showSubCenterSubmenu, setShowSubCenterSubmenu] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel",
    })
    router.push("/login")
  }

  const toggleExamSubmenu = () => {
    setShowExamSubmenu(!showExamSubmenu)
  }

  const toggleFeatureMasterSubmenu = () => {
    setShowFeatureMasterSubmenu(!showFeatureMasterSubmenu)
  }

  const toggleEnquirySubmenu = () => {
    setShowEnquirySubmenu(!showEnquirySubmenu)
  }

  const toggleStudentSubmenu = () => {
    setShowStudentSubmenu(!showStudentSubmenu)
  }

  const toggleSubCenterSubmenu = () => {
    setShowSubCenterSubmenu(!showSubCenterSubmenu)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "CMS Panel",
      href: "/admin/cms",
      icon: <Pencil className="h-5 w-5" />,
    },
    {
      name: "Certificates",
      href: "/admin/certificates",
      icon: <Award className="h-5 w-5" />,
    },
    {
      name: "Show All Passwords",
      href: "/admin/show-all-passwords",
      icon: <Key className="h-5 w-5" />,
    },
    {
      name: "Database Actions",
      href: "/admin/database-actions",
      icon: <RefreshCw className="h-5 w-5" />,
    },
  ]

  const featureMasterSubmenuItems = [
    { name: "Add Subject", href: "/admin/subjects/new" },
    { name: "Add Course Multiple Subject", href: "/admin/course-subjects/new" },
    { name: "New Course", href: "/admin/courses/new" },
    { name: "Courses", href: "/admin/courses" },
  ]

  const studentSubmenuItems = [
    { name: "All Students", href: "/admin/students" },
    { name: "New Student", href: "/admin/students/new" },
  ]

  const enquirySubmenuItems = [
    { name: "Contact Enquiries", href: "/admin/enquiries/contact" },
    { name: "Student Enquiries", href: "/admin/enquiries/student" },
  ]

  const examSubmenuItems = [
    { name: "Add Exam", href: "/admin/exams/new" },
    { name: "Show Exam", href: "/admin/exams" },
    { name: "Apply For Exam", href: "/admin/apply-for-exam" },
    { name: "Offline Exam Marks Update", href: "/admin/exams/offline-marks" },
    { name: "Online Exam Marks Update", href: "/admin/exams/online-marks" },
    { name: "Exam OTP", href: "/admin/exams/otp" },
    { name: "All Exam Result", href: "/admin/exams/results" },
  ]

  const subCenterSubmenuItems = [
    { name: "Add Sub Center", href: "/admin/subcenters/new" },
    { name: "All Sub Centers", href: "/admin/subcenters" },
    { name: "Student Record", href: "/admin/subcenters/student-record" },
    { name: "Center Wise Student Record", href: "/admin/subcenters/center-wise-record" },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile overlay to close menu when clicked outside */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={toggleMobileMenu}
        ></div>
      )}
      
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          onClick={toggleMobileMenu} 
          className="bg-white shadow-md h-10 w-10 p-2 rounded-md border border-gray-200"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-blue-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-blue-700">
            <h1 className="text-xl font-bold">Krishna Computers</h1>
          </div>

          <div className="flex-1 overflow-y-auto py-4 mobile-nav">
            <nav className="space-y-1 px-2">
              {/* Dashboard */}
              <Link
                href="/admin/dashboard"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/admin/dashboard" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="ml-3">Dashboard</span>
              </Link>

              {/* CMS Panel */}
              <Link
                href="/admin/cms"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/admin/cms" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Pencil className="h-5 w-5" />
                <span className="ml-3">CMS Panel</span>
              </Link>

              {/* Backgrounds as a main feature */}
              <Link
                href="/admin/backgrounds"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/admin/backgrounds" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="ml-3">Backgrounds</span>
              </Link>
              
              {/* Enquiry dropdown as a main feature */}
              <div className="space-y-1">
                <button
                  onClick={toggleEnquirySubmenu}
                  className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
                >
                  <div className="flex items-center">
                    <Mail className="h-5 w-5" />
                    <span className="ml-3">Enquiry</span>
                  </div>
                  {showEnquirySubmenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showEnquirySubmenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-blue-700 pl-2">
                    {enquirySubmenuItems.map((subItem) => (
                <Link
                        key={subItem.name}
                        href={subItem.href}
                  className={`
                    group flex items-center rounded-md px-2 py-2 text-sm font-medium
                          ${pathname === subItem.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="ml-3">{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Feature Master dropdown */}
              <div className="space-y-1">
                <button
                  onClick={toggleFeatureMasterSubmenu}
                  className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5" />
                    <span className="ml-3">Feature Master</span>
                  </div>
                  {showFeatureMasterSubmenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showFeatureMasterSubmenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-blue-700 pl-2">
                    {featureMasterSubmenuItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`
                          group flex items-center rounded-md px-2 py-2 text-sm font-medium
                          ${pathname === subItem.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                        `}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="ml-3">{subItem.name}</span>
                </Link>
              ))}
                  </div>
                )}
              </div>
              
              {/* Students dropdown as a main feature */}
              <div className="space-y-1">
                <button
                  onClick={toggleStudentSubmenu}
                  className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5" />
                    <span className="ml-3">Students</span>
                  </div>
                  {showStudentSubmenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showStudentSubmenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-blue-700 pl-2">
                    {studentSubmenuItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`
                          group flex items-center rounded-md px-2 py-2 text-sm font-medium
                          ${pathname === subItem.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                        `}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="ml-3">{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Exam dropdown - moved directly after Students section */}
              <div className="space-y-1">
                <button
                  onClick={toggleExamSubmenu}
                  className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5" />
                    <span className="ml-3">Student Exam</span>
                  </div>
                  {showExamSubmenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showExamSubmenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-blue-700 pl-2">
                    {examSubmenuItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`
                          group flex items-center rounded-md px-2 py-2 text-sm font-medium
                          ${pathname === subItem.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                        `}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="ml-3">{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub Center dropdown moved after Student Exam */}
              <div className="space-y-1">
                <button
                  onClick={toggleSubCenterSubmenu}
                  className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
                >
                  <div className="flex items-center">
                    <Award className="h-5 w-5" />
                    <span className="ml-3">Sub Center</span>
                  </div>
                  {showSubCenterSubmenu ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {showSubCenterSubmenu && (
                  <div className="ml-4 space-y-1 border-l-2 border-blue-700 pl-2">
                    {subCenterSubmenuItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`
                          group flex items-center rounded-md px-2 py-2 text-sm font-medium
                          ${pathname === subItem.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                        `}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="ml-3">{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Other nav items (except those that moved to other submenus) */}
              {navItems.slice(2).map((item) => {
                // Skip items that are now in other submenus or have been repositioned
                if (
                  item.name !== "Courses" && 
                  item.name !== "New Course" && 
                  item.name !== "Add Subject" && 
                  item.name !== "Add Course Multiple Subject" &&
                  item.name !== "All Students" &&
                  item.name !== "New Student" &&
                  item.name !== "Add Sub Center" &&
                  item.name !== "All Sub Centers" &&
                  item.name !== "Backgrounds"
                ) {
                  return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center rounded-md px-2 py-2 text-sm font-medium
                    ${pathname === item.href ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
                  );
                }
                return null;
              })}
            </nav>
          </div>

          <div className="border-t border-blue-700 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
