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
  CreditCard
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function ATCSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showExamSubmenu, setShowExamSubmenu] = useState(false)
  const [showFeatureMasterSubmenu, setShowFeatureMasterSubmenu] = useState(false)
  const [showStudentSubmenu, setShowStudentSubmenu] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the ATC panel",
    })
    router.push("/login")
  }

  const toggleExamSubmenu = () => {
    setShowExamSubmenu(!showExamSubmenu)
  }

  const toggleFeatureMasterSubmenu = () => {
    setShowFeatureMasterSubmenu(!showFeatureMasterSubmenu)
  }

  const toggleStudentSubmenu = () => {
    setShowStudentSubmenu(!showStudentSubmenu)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/atc/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Certificates",
      href: "/atc/certificates",
      icon: <Award className="h-5 w-5" />,
    },
    {
      name: "Payments",
      href: "/atc/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ]

  const featureMasterSubmenuItems = [
    { name: "Courses", href: "/atc/courses" },
  ]

  const studentSubmenuItems = [
    { name: "All Students", href: "/atc/students" },
    { name: "New Student", href: "/atc/students/new" },
  ]

  const examSubmenuItems = [
    { name: "Apply For Exam", href: "/atc/apply-for-exam" },
    { name: "Offline Exam Marks Update", href: "/atc/exams/offline-marks" },
    { name: "Online Exam Marks Update", href: "/atc/exams/online-marks" },
    { name: "Exam Results", href: "/atc/exams/results" },
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
            <h1 className="text-xl font-bold">ATC Panel</h1>
          </div>

          <div className="flex-1 overflow-y-auto py-4 mobile-nav">
            <nav className="space-y-1 px-2">
              {/* Dashboard */}
              <Link
                href="/atc/dashboard"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/atc/dashboard" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="ml-3">Dashboard</span>
              </Link>

              {/* Backgrounds as a main feature */}
              <Link
                href="/atc/backgrounds"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/atc/backgrounds" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="ml-3">Backgrounds</span>
              </Link>

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

              {/* Certificates */}
              <Link
                href="/atc/certificates"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/atc/certificates" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award className="h-5 w-5" />
                <span className="ml-3">Certificates</span>
              </Link>

              {/* Payments */}
              <Link
                href="/atc/payments"
                className={`
                  group flex items-center rounded-md px-2 py-2 text-sm font-medium
                  ${pathname === "/atc/payments" ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700"}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                <span className="ml-3">Payments</span>
              </Link>
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
