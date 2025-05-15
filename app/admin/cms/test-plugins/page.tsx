"use client"

import { useState } from "react"
import TinyMCEWrapper from "@/components/TinyMCEWrapper"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"

export default function TestTinyMCEPlugins() {
  const [content, setContent] = useState(`
    <h2>Test All TinyMCE Plugins</h2>
    <p>This editor includes all free TinyMCE plugins. Try them out:</p>
    <ul>
      <li>Format text with <strong>bold</strong>, <em>italic</em>, and <u>underline</u></li>
      <li>Create tables, lists, and insert images</li>
      <li>Use code samples, emoticons, and more</li>
    </ul>
    <p>The toolbar has been organized into three rows for better access to all features.</p>
  `)
  const [savedContent, setSavedContent] = useState("")

  const handleSave = () => {
    setSavedContent(content)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>TinyMCE Plugins Test</CardTitle>
          <CardDescription>
            Try out all the available plugins in this demo editor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TinyMCEWrapper
            value={content}
            onChange={setContent}
            placeholder="Try all the plugins..."
          />
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Content</Button>
          </div>
          
          {savedContent && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Preview:</h3>
              <div 
                className="border rounded-md p-4 bg-gray-50 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: savedContent }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 