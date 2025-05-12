import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About Krishna Computers</h3>
            <p className="mb-4">
              Krishna Computers is a leading computer education institute offering various courses and certifications to
              help students build successful careers in the IT industry.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-yellow-500" />
              <span>Kaman, Rajasthan</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-yellow-500" />
              <span>9001203861, 9772225669</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-500" />
              <span>krishna.computers.official2008@gmail.com</span>
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
          <p>&copy; {new Date().getFullYear()} Krishna Computers. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
