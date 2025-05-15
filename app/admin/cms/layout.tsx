"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  Award,
  Phone,
  BookOpen,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Search,
  PlusCircle
} from "lucide-react"

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full min-h-screen">
      {/* Main content area - without sidebar */}
      <div className="flex-1 bg-gray-100">
        {children}
      </div>
    </div>
  )
} 