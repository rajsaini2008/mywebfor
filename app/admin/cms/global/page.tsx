"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Twitter, Youtube, Upload, X } from "@/components/ui/icons"

// Define interface for global settings
interface GlobalSettings {
  logo: string;
  favicon: string;
  websiteName: string;
  mobile: string;
  email: string;
  youtubeLink: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
}

export default function GlobalSettingsPage() {
  const router = useRouter()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [isLogoUploading, setIsLogoUploading] = useState(false)
  const [isFaviconUploading, setIsFaviconUploading] = useState(false)
  const [settings, setSettings] = useState<GlobalSettings>({
    logo: "",
    favicon: "",
    websiteName: "Krishna Computers",
    mobile: "9001203861, 9772225669",
    email: "krishna.computers.official2008@gmail.com",
    youtubeLink: "",
    facebookLink: "",
    instagramLink: "",
    twitterLink: ""
  })

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/cms?section=global")
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            const loadedSettings: Partial<GlobalSettings> = {}
            
            // Convert array of CMS items to settings object
            data.data.forEach((item: any) => {
              if (item.key && Object.keys(settings).includes(item.key)) {
                loadedSettings[item.key as keyof GlobalSettings] = item.value
              }
            })
            
            // Merge with defaults for any missing values
            setSettings(prev => ({ ...prev, ...loadedSettings }))
          }
        }
      } catch (error) {
        console.error("Error loading global settings:", error)
        toast.error("Error loading settings")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  // Handle input changes
  const handleChange = (key: keyof GlobalSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, GIF, WEBP)")
      return
    }
    
    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast.error("Image file is too large. Maximum size is 2MB")
      return
    }
    
    try {
      setIsLogoUploading(true)
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload the logo image
      const response = await fetch('/api/logo-upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update logo URL in settings
        handleChange('logo', result.url)
        toast.success("Logo uploaded successfully")
      } else {
        throw new Error(result.message || "Failed to upload logo")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast.error("Error uploading logo")
    } finally {
      setIsLogoUploading(false)
      // Reset file input
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type (only PNG for favicon)
    if (file.type !== 'image/png') {
      toast.error("Please upload a PNG image for favicon")
      return
    }
    
    // Validate file size (1MB max)
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      toast.error("Image file is too large. Maximum size is 1MB")
      return
    }
    
    try {
      setIsFaviconUploading(true)
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload the favicon image
      const response = await fetch('/api/favicon-upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update favicon URL in settings
        handleChange('favicon', result.url)
        toast.success("Favicon uploaded successfully")
      } else {
        throw new Error(result.message || "Failed to upload favicon")
      }
    } catch (error) {
      console.error("Error uploading favicon:", error)
      toast.error("Error uploading favicon")
    } finally {
      setIsFaviconUploading(false)
      // Reset file input
      if (faviconInputRef.current) {
        faviconInputRef.current.value = ''
      }
    }
  }
  
  // Clear logo
  const handleRemoveLogo = () => {
    handleChange('logo', '')
  }

  // Clear favicon
  const handleRemoveFavicon = () => {
    handleChange('favicon', '')
  }
  
  // Trigger logo file input click
  const triggerLogoInput = () => {
    logoInputRef.current?.click()
  }

  // Trigger favicon file input click
  const triggerFaviconInput = () => {
    faviconInputRef.current?.click()
  }

  // Save settings
  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Convert settings object to array of CMS items
      const cmsItems = Object.entries(settings).map(([key, value]) => ({
        section: "global",
        key,
        value
      }))
      
      // Save all settings at once
      const response = await fetch("/api/cms/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cmsItems }),
      })
      
      if (response.ok) {
        toast.success("Global settings saved successfully")
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving global settings:", error)
      toast.error("Error saving settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Global Settings</h1>
        <Button 
          onClick={() => router.push("/admin/cms")}
          variant="outline"
        >
          Back to CMS Panel
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure your website name, logo and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Image</Label>
                
                <div className="mt-2 flex flex-col space-y-4">
                  {/* Logo preview */}
                  {settings.logo && (
                    <div className="relative w-64 h-24 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      <Image
                        src={settings.logo}
                        alt="Logo preview"
                        fill
                        sizes="256px"
                        style={{ objectFit: 'contain' }}
                        className="p-2"
                      />
                      <button 
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        title="Remove logo"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload button and hidden file input */}
                  <div className="flex">
                    <input
                      ref={logoInputRef}
                      type="file"
                      id="logoFile"
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleLogoUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerLogoInput}
                      disabled={isLogoUploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isLogoUploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                    
                    {settings.logo && (
                      <Input 
                        value={settings.logo}
                        readOnly
                        className="ml-2 flex-1 bg-gray-50 text-gray-500"
                      />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Upload your company logo (PNG or JPG, max 2MB)
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="favicon">Favicon (Fav Logo)</Label>
                
                <div className="mt-2 flex flex-col space-y-4">
                  {/* Favicon preview */}
                  {settings.favicon && (
                    <div className="relative w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                      <Image
                        src={settings.favicon}
                        alt="Favicon preview"
                        width={32}
                        height={32}
                        style={{ objectFit: 'contain' }}
                        className="p-1"
                      />
                      <button 
                        onClick={handleRemoveFavicon}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                        title="Remove favicon"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload button and hidden file input */}
                  <div className="flex">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      id="faviconFile"
                      className="hidden"
                      accept="image/png"
                      onChange={handleFaviconUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={triggerFaviconInput}
                      disabled={isFaviconUploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isFaviconUploading ? "Uploading..." : "Upload Fav Logo"}
                    </Button>
                    
                    {settings.favicon && (
                      <Input 
                        value={settings.favicon}
                        readOnly
                        className="ml-2 flex-1 bg-gray-50 text-gray-500"
                      />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Upload your favicon (PNG only, max 1MB, recommended size: 32x32px)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websiteName">Website Name</Label>
                <Input 
                  id="websiteName" 
                  value={settings.websiteName} 
                  onChange={(e) => handleChange("websiteName", e.target.value)}
                  placeholder="Your website name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input 
                  id="mobile" 
                  value={settings.mobile} 
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  placeholder="Contact phone number"
                />
                <p className="text-sm text-muted-foreground">
                  You can add multiple numbers separated by commas
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={settings.email} 
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Contact email address"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Configure the social media links displayed in the website header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2" htmlFor="facebookLink">
                  <Facebook className="h-4 w-4" /> Facebook URL
                </Label>
                <Input 
                  id="facebookLink" 
                  value={settings.facebookLink} 
                  onChange={(e) => handleChange("facebookLink", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2" htmlFor="instagramLink">
                  <Instagram className="h-4 w-4" /> Instagram URL
                </Label>
                <Input 
                  id="instagramLink" 
                  value={settings.instagramLink} 
                  onChange={(e) => handleChange("instagramLink", e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2" htmlFor="twitterLink">
                  <Twitter className="h-4 w-4" /> Twitter URL
                </Label>
                <Input 
                  id="twitterLink" 
                  value={settings.twitterLink} 
                  onChange={(e) => handleChange("twitterLink", e.target.value)}
                  placeholder="https://twitter.com/yourpage"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2" htmlFor="youtubeLink">
                  <Youtube className="h-4 w-4" /> YouTube URL
                </Label>
                <Input 
                  id="youtubeLink" 
                  value={settings.youtubeLink} 
                  onChange={(e) => handleChange("youtubeLink", e.target.value)}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
} 