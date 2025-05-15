"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail } from "@/components/ui/icons"
import { GlobalSettings } from "@/lib/getGlobalSettings"

// Add props to accept global settings
interface FooterProps {
  globalSettings: GlobalSettings;
}

export default function Footer({ globalSettings }: FooterProps) {
  // Default logo placeholder if no logo is set
  const logoUrl = globalSettings.logo || "/placeholder.svg?height=80&width=80";
  const siteName = globalSettings.websiteName || "Krishna Computer";
  const email = globalSettings.email || "krishna.computers.official2008@gmail.com";
  const mobile = globalSettings.mobile || "9001203861, 9772225669";

  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              {logoUrl && (
                <div className="mb-2 mr-3 inline-block">
                  <Image
                    src={logoUrl}
                    alt={siteName}
                    width={140}
                    height={140}
                    style={{ objectFit: 'contain', maxHeight: '75px' }}
                    className="rounded-md"
                    unoptimized={true}
                  />
                </div>
              )}
            </div>
            <p className="mb-4">
              A leading computer education institute offering various courses and certifications to
              help students build successful careers in the IT industry.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-yellow-500" />
              <span>Kaman, Rajasthan</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-yellow-500" />
              <span>{mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-500" />
              <span>{email}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-yellow-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-yellow-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-yellow-500">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-yellow-500">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-yellow-500">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-yellow-500">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-yellow-500">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Courses</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses/dca" className="hover:text-yellow-500">
                  DCA
                </Link>
              </li>
              <li>
                <Link href="/courses/ccc" className="hover:text-yellow-500">
                  CCC
                </Link>
              </li>
              <li>
                <Link href="/courses/tally" className="hover:text-yellow-500">
                  Tally
                </Link>
              </li>
              <li>
                <Link href="/courses/o-level" className="hover:text-yellow-500">
                  O Level
                </Link>
              </li>
              <li>
                <Link href="/courses/web-design" className="hover:text-yellow-500">
                  Web Design
                </Link>
              </li>
              <li>
                <Link href="/courses/programming" className="hover:text-yellow-500">
                  Programming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
