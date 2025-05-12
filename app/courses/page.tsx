"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/ui/CourseCard"
import { ResponsiveImageGallery } from "@/components/ui/responsive-image-gallery"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  description: string
  imageUrl?: string
  category?: string // For categorization
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch courses from the database
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses for courses page...");
        const timestamp = new Date().getTime(); // Add timestamp to prevent caching
        const response = await fetch(`/api/courses?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log(`Courses page received ${data.data.length} courses`);
            // Add a default category to courses for filtering
            const coursesWithCategory = data.data.map((course: Course) => ({
              ...course,
              category: course.code.length <= 3 ? "basic" : course.duration.includes("year") ? "advanced" : "professional"
            }));
            setCourses(coursesWithCategory);
          } else {
            console.error("API returned failure:", data.message);
            setError(data.message || "Failed to load courses");
          }
        } else {
          console.error("API response not OK:", response.status);
          setError("Server error: Failed to load courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to connect to the server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const courseCategories = [
    { id: "all", label: "All Courses" },
    { id: "basic", label: "Basic Courses" },
    { id: "advanced", label: "Advanced Courses" },
    { id: "professional", label: "Professional Courses" },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16 w-full">
        <div className="px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Courses</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive computer education programs designed to build your skills and advance your career
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">Explore Our Programs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect course to match your career goals and interests
            </p>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="inline-flex p-1 bg-gray-100 rounded-md border border-gray-200">
                {courseCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="px-4 py-2 text-sm font-medium rounded data-[state=active]:bg-blue-800 data-[state=active]:text-white transition-all"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                No courses found. Please check back later or contact us for more information.
              </div>
            ) : (
              courseCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  {(() => {
                    const filteredCourses = courses.filter(
                      (course) => category.id === "all" || course.category === category.id
                    );
                    return (
                      <>
                        <p className="text-sm text-gray-500 mb-6 text-center">
                          Showing {filteredCourses.length} {category.id === "all" ? "total" : category.id} course{filteredCourses.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                          {filteredCourses.map((course) => (
                            <CourseCard
                              key={course._id}
                              id={course._id}
                              name={course.name}
                              code={course.code}
                              duration={course.duration}
                              description={course.description}
                              imageUrl={course.imageUrl}
                            />
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </TabsContent>
              ))
            )}
          </Tabs>
        </div>
      </section>

      {/* Course Benefits */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Benefits of Our Courses</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Why choose Krishna Computers for your computer education needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Industry-Relevant Curriculum",
                description:
                  "Our courses are designed in consultation with industry experts to ensure you learn skills that are in demand.",
              },
              {
                title: "Hands-on Training",
                description:
                  "Learn by doing with practical exercises and real-world projects that reinforce theoretical concepts.",
              },
              {
                title: "Experienced Faculty",
                description:
                  "Learn from instructors who have years of experience in both teaching and industry practice.",
              },
              {
                title: "Flexible Schedule",
                description:
                  "Choose from morning, afternoon, or evening batches to fit your education around your other commitments.",
              },
              {
                title: "Placement Assistance",
                description:
                  "Get help with resume building, interview preparation, and job placement after course completion.",
              },
              {
                title: "Recognized Certification",
                description:
                  "Earn certificates that are recognized by government and industry, enhancing your employability.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-800 text-white w-full">
        <div className="px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Enroll in one of our courses today and take the first step towards a successful career in IT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-red-500 hover:bg-red-600 text-white">Apply Now</Button>
            <Button className="bg-transparent hover:bg-white hover:text-blue-800 border border-white">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
