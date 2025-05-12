import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./button"

interface CourseCardProps {
  id: string
  name: string
  code: string
  duration?: string
  description?: string
  imageUrl?: string
  className?: string
}

/**
 * A consistently styled card component for displaying courses across the application
 */
export function CourseCard({ id, name, code, duration, description, imageUrl, className = "" }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [displayImage, setDisplayImage] = useState(imageUrl || "");
  
  // Generate a fallback image URL if the provided one fails to load
  const fallbackImageUrl = `/placeholder.svg?text=${encodeURIComponent(code)}&width=600&height=400`;
  
  // Handle image loading error
  const handleImageError = () => {
    console.log(`Image failed to load for course: ${name} (${code})`);
    setImageError(true);
    setDisplayImage(fallbackImageUrl);
  };
  
  // Update display image when imageUrl prop changes
  useEffect(() => {
    if (imageUrl) {
      setDisplayImage(imageUrl);
      setImageError(false);
    } else {
      setDisplayImage(fallbackImageUrl);
    }
  }, [imageUrl, fallbackImageUrl]);
  
  return (
    <div className={`bg-white overflow-hidden border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {/* Image at the top */}
      <div className="relative h-48">
        <Image 
          src={imageError ? fallbackImageUrl : displayImage || fallbackImageUrl}
          alt={name}
          fill
          className="object-cover"
          onError={handleImageError}
          priority
        />
        {duration && (
          <div className="absolute top-2 right-2 bg-yellow-300 text-black px-2 py-1 text-sm font-semibold rounded">
            {duration}
          </div>
        )}
      </div>
      
      {/* Content below the image */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
        <p className="text-lg text-gray-600 mb-3">Course Code - {code}</p>
        
        {description && (
          <p className="text-gray-600 mb-4 text-sm line-clamp-3">{description}</p>
        )}
        
        <div className="flex justify-between mt-4">
          <Link href={`/courses/${id}`} passHref>
            <Button variant="outline" className="bg-blue-700 hover:bg-blue-800 text-white">
              Learn More
            </Button>
          </Link>
          <Link href={`/apply?course=${id}`} passHref>
            <Button variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 