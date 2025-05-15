"use client"

import Link from "next/link"
import { useState } from "react"
import { Facebook, Instagram, Twitter, Info, X, Menu, Phone, Mail } from "@/components/ui/icons"
import { GlobalSettings } from "@/lib/getGlobalSettings"

// Add props to accept global settings
interface HeaderProps {
  globalSettings: GlobalSettings;
}

export default function Header({ globalSettings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mobile = globalSettings.mobile || "9001203861, 9772225669";
  const email = globalSettings.email || "krishna.computers.official2008@gmail.com";

  return (
    <div className="bg-black text-white py-2 px-4">
      <div className="container mx-auto">
        {/* Top row with contact info and social media */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-2 md:mb-0 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{mobile}</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <Mail className="h-4 w-4" />
              <span className="text-sm truncate max-w-[180px] sm:max-w-none">{email}</span>
            </div>
          </div>
          
          {/* Social media icons - always visible */}
          <div className="flex items-center gap-4">
            <Link href={globalSettings.facebookLink || "#"} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-4 w-4" />
            </Link>
            <Link href={globalSettings.twitterLink || "#"} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href={globalSettings.instagramLink || "#"} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Information">
              <Info className="h-4 w-4" />
            </Link>
            
            {/* Menu toggle for mobile */}
            <button 
              className="md:hidden ml-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            {/* Desktop navigation links */}
            <div className="hidden md:flex items-center">
              <div className="border-l border-gray-500 h-4 mx-2"></div>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <div className="border-l border-gray-500 h-4 mx-2"></div>
              <Link href="/franchise-registration" className="text-sm hover:underline">
                Franchise Registration
              </Link>
              <div className="border-l border-gray-500 h-4 mx-2"></div>
              <Link href="/download" className="text-sm hover:underline">
                Download
              </Link>
              <div className="border-l border-gray-500 h-4 mx-2"></div>
              <Link href="/atc-verification" className="text-sm hover:underline">
                ATC Verification
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile menu - conditionally rendered */}
        {isMenuOpen && (
          <div className="md:hidden py-3 flex flex-col space-y-2 border-t border-gray-700 mt-2">
            <Link href="/login" className="text-sm hover:underline">
              Login
            </Link>
            <Link href="/franchise-registration" className="text-sm hover:underline">
              Franchise Registration
            </Link>
            <Link href="/download" className="text-sm hover:underline">
              Download
            </Link>
            <Link href="/atc-verification" className="text-sm hover:underline">
              ATC Verification
            </Link>
            <div className="flex items-center gap-2 sm:hidden pt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm text-gray-300">{email}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
