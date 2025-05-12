"use client"

import { useState, useEffect } from 'react'

interface UseCmsContentProps {
  section: string
  key?: string
  defaultValue?: string
}

export function useCmsContent({ section, key, defaultValue = "" }: UseCmsContentProps) {
  const [content, setContent] = useState<string>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Build the URL depending on whether key is provided
        const url = key 
          ? `/api/cms?section=${section}&key=${key}` 
          : `/api/cms?section=${section}`
          
        const response = await fetch(url)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch CMS content")
        }
        
        if (key) {
          // If a specific key was requested, set the value directly
          const value = data.data?.value || defaultValue
          setContent(value)
        } else {
          // If just a section was requested, it returns an array
          // We would need to process this differently, but for now,
          // just handle the single key case
          setContent(defaultValue)
        }
      } catch (err) {
        console.error("Error fetching CMS content:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setContent(defaultValue)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [section, key, defaultValue])
  
  return { content, isLoading, error }
}

interface UseSectionContentProps {
  section: string
  defaultValues?: { [key: string]: string }
}

export function useSectionContent({ section, defaultValues = {} }: UseSectionContentProps) {
  const [contentMap, setContentMap] = useState<{ [key: string]: string }>(defaultValues)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSectionContent = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/cms?section=${section}`)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch CMS section content")
        }
        
        // Process the array of content items into a key-value map
        const newContentMap = { ...defaultValues }
        
        if (Array.isArray(data.data)) {
          data.data.forEach(item => {
            if (item.key && item.value) {
              newContentMap[item.key] = item.value
            }
          })
        }
        
        setContentMap(newContentMap)
      } catch (err) {
        console.error("Error fetching CMS section content:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        // Keep default values on error
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSectionContent()
  }, [section, defaultValues])
  
  return { contentMap, isLoading, error }
} 