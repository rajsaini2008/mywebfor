"use client"

import { useState } from "react"
import TinyMCEWrapper from "@/components/TinyMCEWrapper"
import { Button } from "@/components/ui/button"

export default function TestTinyMCE() {
  const [content, setContent] = useState("<p>Test content here. Edit me!</p>")
  const [savedContent, setSavedContent] = useState("")

  const handleSave = () => {
    setSavedContent(content)
    alert("Content saved successfully!")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">TinyMCE Test Page</h1>
      <div className="border rounded-md p-4">
        <TinyMCEWrapper
          value={content}
          onChange={setContent}
          placeholder="Start typing here..."
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Content</Button>
      </div>
      
      {savedContent && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Saved Content:</h3>
          <div 
            className="border rounded-md p-4 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: savedContent }}
          />
        </div>
      )}
    </div>
  )
} 