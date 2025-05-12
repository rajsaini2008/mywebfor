import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <nav className="bg-white py-2 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/placeholder.svg?height=80&width=80"
              alt="Krishna Computer Logo"
              width={60}
              height={60}
              className="mr-2"
            />
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              <span className="text-blue-800">KRISHNA</span>
              <br />
              <span className="text-gray-700">COMPUTER</span>
            </div>
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
            <Link href="/legal" className="text-gray-700 hover:text-blue-800 font-medium">
              LEGAL
            </Link>
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
            <Link 
              href="/legal" 
              className="py-2 px-3 text-gray-700 hover:bg-gray-100 hover:text-blue-800 font-medium rounded-md"
              onClick={() => setIsNavOpen(false)}
            >
              LEGAL
            </Link>
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
            <Link 
              href="/certificate-verification" 
              className="py-2 px-3 bg-red-500 text-white hover:bg-red-600 font-medium rounded-md text-center mt-2"
              onClick={() => setIsNavOpen(false)}
            >
              CERTIFICATE VERIFICATION
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
