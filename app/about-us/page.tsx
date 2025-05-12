import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, BookOpen, Users, Target, CheckCircle } from "lucide-react"

export default function AboutUs() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Krishna Computers</h1>
          <p className="text-xl max-w-3xl mx-auto">
            A leading computer education institute dedicated to empowering students with the skills they need to succeed
            in today's digital world.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Krishna Computers Building"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Founded in 2008, Krishna Computers has been at the forefront of computer education in Kaman, Rajasthan.
                What started as a small training center has now grown into a comprehensive institute offering a wide
                range of courses.
              </p>
              <p className="text-gray-700 mb-4">
                Our journey has been defined by a commitment to quality education, innovative teaching methods, and a
                student-first approach. We have trained thousands of students who have gone on to build successful
                careers in the IT industry.
              </p>
              <p className="text-gray-700 mb-6">
                At Krishna Computers, we believe in the power of education to transform lives and communities. Our
                mission is to make quality computer education accessible to all, regardless of their background or prior
                experience.
              </p>
              <Button className="bg-blue-800 hover:bg-blue-900">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              The principles that guide everything we do at Krishna Computers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-blue-800" />,
                title: "Quality Education",
                description: "We are committed to providing the highest quality education with up-to-date curriculum.",
              },
              {
                icon: <Users className="h-10 w-10 text-blue-800" />,
                title: "Student-Centered",
                description:
                  "Our students are at the heart of everything we do, with personalized attention and support.",
              },
              {
                icon: <Target className="h-10 w-10 text-blue-800" />,
                title: "Innovation",
                description:
                  "We constantly innovate our teaching methods and curriculum to stay ahead of industry trends.",
              },
              {
                icon: <Award className="h-10 w-10 text-blue-800" />,
                title: "Excellence",
                description:
                  "We strive for excellence in all aspects of our operations, from teaching to administration.",
              },
            ].map((value, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Our Team</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Meet the dedicated professionals who make Krishna Computers a center of excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((member) => (
              <Card key={member} className="border-none shadow-lg overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={`/placeholder.svg?height=300&width=300&text=Team Member ${member}`}
                    alt={`Team Member ${member}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Team Member {member}</h3>
                  <p className="text-blue-800 font-medium mb-3">Position Title</p>
                  <p className="text-gray-600">
                    Brief description about the team member and their expertise in the field of computer education.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Krishna Computers?</h2>
            <p className="text-xl max-w-3xl mx-auto">
              We offer more than just computer courses - we provide a pathway to success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Experienced and qualified instructors",
              "State-of-the-art computer labs and facilities",
              "Comprehensive curriculum covering the latest technologies",
              "Hands-on practical training with real-world projects",
              "Flexible class timings to accommodate working professionals",
              "Placement assistance and career counseling",
              "Affordable fee structure with installment options",
              "Government recognized certifications",
            ].map((reason, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <p className="text-lg">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
