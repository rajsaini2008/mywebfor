"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { defaultHomeContent } from "@/lib/cms/home-content"

type HomeContentType = typeof defaultHomeContent

export function HomeComponent() {
  const [content, setContent] = useState<HomeContentType>(defaultHomeContent)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/cms?section=home")
        const data = await response.json()
        
        if (data.success && Array.isArray(data.data)) {
          // Process hero banner data
          const heroBanner = { ...defaultHomeContent.heroBanner }
          
          // Process feature boxes data
          const featureBoxes = [...defaultHomeContent.featureBoxes]
          
          // Process welcome section data
          const welcomeSection = { ...defaultHomeContent.welcomeSection }
          
          // Map DB content to the expected structures
          data.data.forEach((item: any) => {
            if (item.key.startsWith('heroBanner_')) {
              const field = item.key.replace('heroBanner_', '') as keyof typeof heroBanner
              if (field in heroBanner) {
                heroBanner[field] = item.value
              }
            } else if (item.key.match(/^featureBox\d+_/)) {
              const matches = item.key.match(/^featureBox(\d+)_(.+)$/)
              if (matches) {
                const boxIndex = parseInt(matches[1]) - 1
                const field = matches[2] as keyof (typeof featureBoxes)[0]
                
                // Ensure the feature box exists at this index
                while (featureBoxes.length <= boxIndex) {
                  featureBoxes.push({
                    title: "",
                    description: "",
                    iconName: "",
                  })
                }
                
                // Update the field
                if (field in featureBoxes[boxIndex]) {
                  featureBoxes[boxIndex][field] = item.value
                }
              }
            } else if (item.key.startsWith('welcomeSection_')) {
              const field = item.key.replace('welcomeSection_', '') as keyof typeof welcomeSection
              if (field in welcomeSection) {
                welcomeSection[field] = item.value
              }
            }
          })
          
          setContent({
            heroBanner,
            featureBoxes,
            welcomeSection,
          })
        }
      } catch (error) {
        console.error("Error fetching home content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <section 
        className="relative h-[500px] flex items-center"
        style={{ 
          backgroundImage: `url('${content.heroBanner.imageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container relative z-10 text-white">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-4">{content.heroBanner.title}</h1>
            <p className="text-xl mb-6">{content.heroBanner.subtitle}</p>
            <Link href={content.heroBanner.buttonLink}>
              <Button size="lg">{content.heroBanner.buttonText}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Boxes */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.featureBoxes.map((box, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="mb-4">
                  {/* Simple icon placeholder */}
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                </div>
                <CardTitle className="mb-2">{box.title}</CardTitle>
                <div 
                  className="text-muted-foreground text-sm"
                  dangerouslySetInnerHTML={{ __html: box.description }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Welcome Section */}
      <section className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{content.welcomeSection.title}</h2>
            <div 
              className="space-y-4 text-gray-600"
              dangerouslySetInnerHTML={{ __html: content.welcomeSection.description }}
            />
          </div>
          <div className="relative h-[400px]">
            <Image 
              src={content.welcomeSection.imageUrl} 
              alt={content.welcomeSection.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  )
} 