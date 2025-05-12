"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, User, BookOpen, Calendar, FileText, Award, LogOut, Menu, X, ClipboardCheck, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    // In a real application, this would call an API to log out
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the student portal",
    })
    router.push("/login?tab=student")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/student/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "My Profile",
      href: "/student/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "My Course",
      href: "/student/course",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Exams",
      href: "/student/exams",
      icon: <PenTool className="h-5 w-5" />,
    },
    {
      name: "Practice Sets",
      href: "/student/practice-sets",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      name: "Class Schedule",
      href: "/student/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Assignments",
      href: "/student/assignments",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Certificates",
      href: "/student/certificates",
      icon: <Award className="h-5 w-5" />,
    },
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
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
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
              ))}
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
