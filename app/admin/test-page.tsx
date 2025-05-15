"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function TestAdminPage() {
  const router = useRouter()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Page - Authentication Working!</h1>
      <p className="mb-4">If you can see this page, it means authentication is working correctly.</p>
      
      <div className="space-y-4">
        <Button 
          onClick={() => router.push('/admin/cms')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to CMS Panel
        </Button>
        
        <Button 
          onClick={() => router.push('/admin/cms/gallery')}
          className="bg-green-600 hover:bg-green-700"
        >
          Go to Gallery Directly
        </Button>
      </div>
    </div>
  )
} 