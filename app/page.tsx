"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/CourseCard"

interface Course {
  _id: string
  name: string
  code: string
  duration: string
  description: string
  imageUrl?: string
}

interface HomeContent {
  // Banner
  bannerUrl: string;
  
  // Feature boxes
  feature1Title: string;
  feature1Content: string;
  feature2Title: string;
  feature2Content: string;
  feature3Title: string;
  feature3Content: string;
  feature4Title: string;
  feature4Content: string;
  
  // About section
  aboutTitle: string;
  aboutSubtitle: string;
  aboutContent: string;
  aboutButtonText: string;
  
  // Courses section
  coursesTitle: string;
  coursesSubtitle: string;
  
  // CTA section
  ctaTitle: string;
  ctaContent: string;
  ctaButton1Text: string;
  ctaButton2Text: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<HomeContent>({
    // Default values for banner
    bannerUrl: "/203b2MIdJk6j8X5jobSlider.jpeg",
    
    // Default values for feature boxes
    feature1Title: "Apply Online",
    feature1Content: "Ensuring quality and recognized technical education standards.",
    feature2Title: "Superfast Support", 
    feature2Content: "Achieve digital success with our cutting edge computer institute courses.",
    feature3Title: "Certification",
    feature3Content: "Choose online or in person classes for flexibility.",
    feature4Title: "Online Payment",
    feature4Content: "Empowering minds through transformative computer institute education.",
    
    // Default values for about section
    aboutTitle: "ABOUT US",
    aboutSubtitle: "GIVE US A CHANCE AND SEE",
    aboutContent: "With experienced instructors and state-of-the-art facilities, We provide a dynamic learning environment that fosters innovation and creativity. Whether you are a beginner eager to start your journey in technology or a professional looking to enhance your skills.",
    aboutButtonText: "Learn More About Us",
    
    // Courses section
    coursesTitle: "OUR COURSES",
    coursesSubtitle: "POPULAR COURSES WE OFFER",
    
    // CTA section
    ctaTitle: "Ready to Start Your Career in IT?",
    ctaContent: "Join Krishna Computers today and take the first step towards a successful future in the digital world.",
    ctaButton1Text: "Apply Now",
    ctaButton2Text: "Contact Us"
  });

  // Add a function to refresh courses
  const refreshCourses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Manually refreshing courses for homepage...");
      // Add a unique timestamp to prevent caching
      const timestamp = new Date().getTime(); 
      const response = await fetch(`/api/courses?refresh=true&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Homepage received data:`, data);
      
      if (data.success) {
        console.log(`Homepage received ${data.data.length} courses`);
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error refreshing courses:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load CMS content
  const loadCmsContent = async () => {
    try {
      const response = await fetch("/api/cms?section=home");
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Create a map of keys to values
        const contentMap: Record<string, string> = {};
        data.data.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        
        // Update all content from database or use defaults
        setPageContent({
          // Banner
          bannerUrl: contentMap["bannerUrl"] || pageContent.bannerUrl,
          
          // Feature boxes
          feature1Title: contentMap["feature1Title"] || pageContent.feature1Title,
          feature1Content: contentMap["feature1Content"] || pageContent.feature1Content,
          feature2Title: contentMap["feature2Title"] || pageContent.feature2Title,
          feature2Content: contentMap["feature2Content"] || pageContent.feature2Content,
          feature3Title: contentMap["feature3Title"] || pageContent.feature3Title,
          feature3Content: contentMap["feature3Content"] || pageContent.feature3Content,
          feature4Title: contentMap["feature4Title"] || pageContent.feature4Title,
          feature4Content: contentMap["feature4Content"] || pageContent.feature4Content,
          
          // About section
          aboutTitle: contentMap["aboutTitle"] || pageContent.aboutTitle,
          aboutSubtitle: contentMap["aboutSubtitle"] || pageContent.aboutSubtitle,
          aboutContent: contentMap["aboutContent"] || pageContent.aboutContent,
          aboutButtonText: contentMap["aboutButtonText"] || pageContent.aboutButtonText,
          
          // Courses section
          coursesTitle: contentMap["coursesTitle"] || pageContent.coursesTitle,
          coursesSubtitle: contentMap["coursesSubtitle"] || pageContent.coursesSubtitle,
          
          // CTA section
          ctaTitle: contentMap["ctaTitle"] || pageContent.ctaTitle,
          ctaContent: contentMap["ctaContent"] || pageContent.ctaContent,
          ctaButton1Text: contentMap["ctaButton1Text"] || pageContent.ctaButton1Text,
          ctaButton2Text: contentMap["ctaButton2Text"] || pageContent.ctaButton2Text
        });
      }
    } catch (error) {
      console.error("Error loading CMS content:", error);
    }
  };
  
  useEffect(() => {
    refreshCourses();
    loadCmsContent();
  }, []);

  // Get the top 6 courses for display
  const displayCourses = courses.slice(0, 6);

  // Safely get course codes for the banner
  const courseCodes = courses && courses.length > 0 
    ? courses.slice(0, 4).map(course => course.code).join(", ")
    : "DCA, ADCA, PGDCA";

  return (
    <div className="overflow-x-hidden">
      {/* Hero Banner */}
      <div className="w-full">
        <div className="w-full">
          <Image
            src={pageContent.bannerUrl}
            alt="University courses information"
            width={1920}
            height={600}
            className="w-full h-auto"
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
      
      {/* Feature Cards - Now using data from CMS */}
      <div className="container mx-auto px-4 -mt-8 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="feature-card green-card text-white border-none shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="text-green-500 font-bold">✓</div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{pageContent.feature1Title}</h3>
              <div 
                className="text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: pageContent.feature1Content }}
              />
            </CardContent>
          </Card>
          
          <Card className="feature-card yellow-card text-white border-none shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="text-yellow-500 font-bold">☎</div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{pageContent.feature2Title}</h3>
              <div 
                className="text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: pageContent.feature2Content }}
              />
            </CardContent>
          </Card>
          
          <Card className="feature-card blue-card text-white border-none shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="text-blue-500 font-bold">★</div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{pageContent.feature3Title}</h3>
              <div 
                className="text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: pageContent.feature3Content }}
              />
            </CardContent>
          </Card>
          
          <Card className="feature-card pink-card text-white border-none shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="bg-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="text-pink-500 font-bold">💳</div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{pageContent.feature4Title}</h3>
              <div 
                className="text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: pageContent.feature4Content }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* About Us Section - Now using data from CMS */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">{pageContent.aboutTitle}</h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-8">{pageContent.aboutSubtitle}</h3>
          <div 
            className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-2"
            dangerouslySetInnerHTML={{ __html: pageContent.aboutContent }}
          />
          <Button className="bg-blue-800 hover:bg-blue-900 text-white">{pageContent.aboutButtonText}</Button>
        </div>
      </section>

      {/* Only show this error if manually trying to see the error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
          <p>{error}</p>
          <button 
            onClick={refreshCourses}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Courses Section - Now using titles from CMS */}
      <section className="py-10 sm:py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">{pageContent.coursesTitle}</h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-gray-800">{pageContent.coursesSubtitle}</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading courses. {error}</p>
              <button 
                onClick={refreshCourses}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Try Again
              </button>
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="text-center py-8">
              No courses found. <Link href="/contact" className="underline">Contact us</Link> to learn more about our programs.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayCourses.map((course) => (
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
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/courses">
              <Button className="bg-blue-800 hover:bg-blue-900 text-white">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action - Now using data from CMS */}
      <section className="py-10 sm:py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{pageContent.ctaTitle}</h2>
          <div 
            className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: pageContent.ctaContent }}
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-red-500 hover:bg-red-600 text-white">{pageContent.ctaButton1Text}</Button>
            <Button className="bg-transparent hover:bg-white hover:text-blue-800 border border-white">
              {pageContent.ctaButton2Text}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
