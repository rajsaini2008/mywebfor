"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer" 
import Navigation from "@/components/navigation"
import { GlobalSettings, defaultSettings, fetchGlobalSettings } from "@/lib/getGlobalSettings"

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchGlobalSettings()
        setGlobalSettings(settings)
      } catch (error) {
        console.error("Error loading global settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Update document title and favicon when settings load
  useEffect(() => {
    if (loading) return
    
    // Update document title if websiteName is set
    if (globalSettings.websiteName) {
      document.title = globalSettings.websiteName
    }

    // Update favicon if set
    if (globalSettings.favicon) {
      // Remove any existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      existingFavicons.forEach(favicon => favicon.remove())

      // Add new favicon link
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = globalSettings.favicon
      document.head.appendChild(link)
    }
  }, [globalSettings, loading])

  // Show minimal UI while loading
  if (loading) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <>
      <Header globalSettings={globalSettings} />
      <Navigation globalSettings={globalSettings} />
      <main>{children}</main>
      <Footer globalSettings={globalSettings} />
    </>
  )
} 