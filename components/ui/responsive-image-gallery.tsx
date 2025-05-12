import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageItem {
  src: string
  alt: string
  href?: string
}

interface ResponsiveImageGalleryProps {
  images: ImageItem[]
  className?: string
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
  gap?: string
  aspectRatio?: string
  onClick?: (index: number) => void
}

export function ResponsiveImageGallery({
  images,
  className,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = "gap-4",
  aspectRatio = "aspect-video",
  onClick,
}: ResponsiveImageGalleryProps) {
  const gridClasses = cn(
    "grid",
    gap,
    columns.sm === 1 && "grid-cols-1",
    columns.sm === 2 && "grid-cols-2",
    columns.sm === 3 && "grid-cols-3",
    columns.md === 1 && "md:grid-cols-1",
    columns.md === 2 && "md:grid-cols-2",
    columns.md === 3 && "md:grid-cols-3",
    columns.md === 4 && "md:grid-cols-4",
    columns.lg === 1 && "lg:grid-cols-1",
    columns.lg === 2 && "lg:grid-cols-2",
    columns.lg === 3 && "lg:grid-cols-3",
    columns.lg === 4 && "lg:grid-cols-4",
    columns.lg === 5 && "lg:grid-cols-5",
    columns.lg === 6 && "lg:grid-cols-6",
    className
  )

  return (
    <div className={gridClasses}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "group relative overflow-hidden rounded-lg border bg-card",
            aspectRatio
          )}
          onClick={() => onClick && onClick(index)}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-all duration-300 group-hover:scale-105"
          />
          {image.href && (
            <a
              href={image.href}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-30"
            >
              <span className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                View Details
              </span>
            </a>
          )}
        </div>
      ))}
    </div>
  )
} 