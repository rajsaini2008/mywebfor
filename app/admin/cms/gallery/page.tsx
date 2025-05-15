"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast as useToastOriginal } from "@/components/ui/use-toast"
import { Trash, Pencil, ArrowLeft, PlusCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

// Fix for useToast hook to properly extract the toast function
function useToast() {
  const { toast } = useToastOriginal() as unknown as { toast: (props: any) => void };
  return { toast };
}

// Types for gallery items
interface GalleryItem {
  _id: string;
  itemType: "image" | "video";
  title: string;
  description?: string;
  category: "campus" | "classrooms" | "events" | "students";
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryManager() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Add New Gallery Item state
  const [itemType, setItemType] = useState<"image" | "video">("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"campus" | "classrooms" | "events" | "students">("campus");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch gallery items
  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/gallery${activeTab !== 'all' ? `?category=${activeTab}` : ''}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch gallery items");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGalleryItems(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch gallery items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching gallery items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    fetchGalleryItems();
  }, [activeTab]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen]);
  
  // Reset form fields
  const resetForm = () => {
    setItemType("image");
    setTitle("");
    setDescription("");
    setCategory("campus");
    setImageUrl("");
    setVideoUrl("");
    setIsActive(true);
    setDisplayOrder(0);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete gallery item
  const deleteGalleryItem = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Gallery item deleted successfully",
        });
        
        fetchGalleryItems();
      } else {
        throw new Error(data.message || "Failed to delete gallery item");
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast({
        title: "Error",
        description: "Failed to delete gallery item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  
  // Get YouTube thumbnail from video ID
  const getYouTubeThumbnailUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPreviewImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload image to server
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");
      formData.append("category", category);
      
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);
      
      const response = await fetch("/api/upload-gallery", {
        method: "POST",
        body: formData,
      });
      
      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", errorText);
        throw new Error(`Failed to upload image: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Upload response data:", data);
      
      if (!data.success) {
        throw new Error(data.message || "Failed to upload image");
      }
      
      console.log("Image uploaded successfully:", data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save gallery item
  const saveGalleryItem = async () => {
    try {
      // Validate required fields
      if (!title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }
      
      if (itemType === "image" && !imageUrl && !fileInputRef.current?.files?.[0]) {
        toast({
          title: "Error",
          description: "Please upload an image or provide an image URL",
          variant: "destructive",
        });
        return;
      }
      
      if (itemType === "video" && !videoUrl) {
        toast({
          title: "Error",
          description: "Please provide a YouTube video URL",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      // If a file was selected, upload it
      let finalImageUrl = imageUrl;
      let thumbnailUrl = "";
      
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        
        // Validate file type and size
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
          toast({
            title: "Error",
            description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast({
            title: "Error",
            description: "File size exceeds 5MB limit. Please upload a smaller image.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const uploadedUrl = await uploadImage(file);
        
        if (!uploadedUrl) {
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (itemType === "image") {
          finalImageUrl = uploadedUrl;
        } else {
          thumbnailUrl = uploadedUrl;
        }
      }
      
      // For video type, automatically set thumbnail if not already set
      if (itemType === "video" && !thumbnailUrl && videoUrl) {
        const thumbUrl = getYouTubeThumbnailUrl(videoUrl);
        if (thumbUrl) {
          thumbnailUrl = thumbUrl;
        }
      }
      
      // Prepare data for submission
      const data = {
        itemType,
        title,
        description,
        category,
        imageUrl: finalImageUrl,
        videoUrl,
        thumbnailUrl,
        isActive,
        order: displayOrder,
      };
      
      console.log("Saving gallery item:", data);
      
      // Send request to API
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error saving gallery item:", errorText);
        throw new Error("Failed to save gallery item");
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Gallery item created successfully",
        });
        
        setIsDialogOpen(false);
        fetchGalleryItems();
      } else {
        throw new Error(responseData.message || "Failed to save gallery item");
      }
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save gallery item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle video URL change
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    
    if (url) {
      const thumbUrl = getYouTubeThumbnailUrl(url);
      if (thumbUrl) {
        setPreviewImage(thumbUrl);
      }
    } else {
      setPreviewImage(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            className="rounded px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100"
            onClick={() => router.push("/admin/cms")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Gallery Manager</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Gallery Item
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[550px] bg-white rounded-lg p-6 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Gallery Item</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="itemType"
                      checked={itemType === "image"}
                      onChange={() => setItemType("image")}
                      className="mr-2"
                    />
                    <span>Image</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="itemType"
                      checked={itemType === "video"}
                      onChange={() => setItemType("video")}
                      className="mr-2"
                    />
                    <span>YouTube Video</span>
                  </label>
                </div>
              </div>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a title"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter a description"
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="campus">Campus</option>
                  <option value="classrooms">Classrooms</option>
                  <option value="events">Events</option>
                  <option value="students">Students</option>
                </select>
              </div>
              
              {/* Image Upload or Video URL */}
              {itemType === "image" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">or Image URL</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (e.target.value) {
                          setPreviewImage(e.target.value);
                        } else if (!fileInputRef.current?.files?.[0]) {
                          setPreviewImage(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter an image URL"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL *</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a YouTube video URL"
                  />
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Thumbnail (Optional)</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              
              {/* Preview */}
              {previewImage && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-300">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Display in Gallery */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">Show in gallery</label>
              </div>
              
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button 
                type="button" 
                className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading || isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={saveGalleryItem}
                disabled={isLoading || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading || isUploading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="campus">Campus</TabsTrigger>
          <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto w-12 h-12 text-gray-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium">No gallery items found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add your first gallery item by clicking the "Add New Gallery Item" button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={item.itemType === "image" ? item.imageUrl! : item.thumbnailUrl!}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    {item.itemType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{item.category}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="rounded px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this gallery item. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGalleryItem(item._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 