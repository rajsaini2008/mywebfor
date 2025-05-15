"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu as MenuIcon, X, ChevronDown } from "lucide-react"
import { Menu } from "@/components/ui/icons"
import { GlobalSettings } from "@/lib/getGlobalSettings"

// Add props to accept global settings
interface NavigationProps {
  globalSettings: GlobalSettings;
}

export default function Navigation({ globalSettings }: NavigationProps) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Add a small delay before closing the dropdown when mouse leaves
  const closeDropdownTimer = useRef<NodeJS.Timeout | null>(null)
  
  const handleMouseEnter = () => {
    if (closeDropdownTimer.current) {
      clearTimeout(closeDropdownTimer.current)
      closeDropdownTimer.current = null
    }
    setIsLegalDropdownOpen(true)
  }
  
  const handleMouseLeave = () => {
    // Add a delay before closing to allow users to move cursor to the dropdown
    closeDropdownTimer.current = setTimeout(() => {
      setIsLegalDropdownOpen(false)
    }, 300) // 300ms delay
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLegalDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Default logo placeholder if no logo is set
  const logoUrl = globalSettings.logo || "/placeholder.svg?height=80&width=80";
  const siteName = globalSettings.websiteName || "Krishna Computer";

  return (
    <nav className="bg-white py-2 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={siteName}
                width={180}
                height={180}
                className="mr-4 py-1"
                style={{ objectFit: 'contain', maxHeight: '80px' }}
                unoptimized={true}
              />
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-800 font-medium">
              HOME
            </Link>
            <Link href="/about-us" className="text-gray-700 hover:text-blue-800 font-medium">
              ABOUT US
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-800 font-medium">
              COURSES
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-blue-800 font-medium">
              GALLERY
            </Link>
            
            {/* Legal Dropdown - Hover-based but with improved interaction */}
            <div 
              ref={dropdownRef}
              className="relative" 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="text-gray-700 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer">
                LEGAL <ChevronDown className="h-4 w-4" />
              </div>
              
              {isLegalDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 py-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <Link 
                    href="/legal" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-800"
                    onClick={() => setIsLegalDropdownOpen(false)}
                  >
                    Legal Information
                  </Link>
                  <Link 
                    href="/legal/documents" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-800"
                    onClick={() => setIsLegalDropdownOpen(false)}
                  >
                    Legal Documents
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/contact-us" className="text-gray-700 hover:text-blue-800 font-medium">
              CONTACT US
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-800 font-medium">
              JOBS
            </Link>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              <Link href="/certificate-verification">CERTIFICATE VERIFICATION</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isNavOpen && (
          <div className="md:hidden py-4 flex flex-col space-y-2 border-t border-gray-200 mt-2">
            <Link 
              href="/" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              HOME
            </Link>
            <Link 
              href="/about-us" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              ABOUT US
            </Link>
            <Link 
              href="/courses" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              COURSES
            </Link>
            <Link 
              href="/gallery" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              GALLERY
            </Link>
            
            {/* Mobile Legal Submenu */}
            <div className="py-2 px-3 text-gray-700 font-medium">
              LEGAL
              <div className="pl-4 mt-1 space-y-1">
                <Link 
                  href="/legal" 
                  className="block py-1 px-2 text-gray-600 hover:bg-gray-100 hover:text-blue-800 rounded-md"
                  onClick={() => setIsNavOpen(false)}
                >
                  Legal Information
                </Link>
                <Link 
                  href="/legal/documents" 
                  className="block py-1 px-2 text-gray-600 hover:bg-gray-100 hover:text-blue-800 rounded-md"
                  onClick={() => setIsNavOpen(false)}
                >
                  Legal Documents
                </Link>
              </div>
            </div>
            
            <Link 
              href="/contact-us" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              CONTACT US
            </Link>
            <Link 
              href="/jobs" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              JOBS
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
