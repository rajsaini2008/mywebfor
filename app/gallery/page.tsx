import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import connectToDatabase from "@/lib/mongodb"
import GalleryItem from "@/models/Gallery"

// Define categories
const categories = [
  { id: "all", label: "All Photos" },
  { id: "campus", label: "Campus" },
  { id: "classrooms", label: "Classrooms" },
  { id: "events", label: "Events" },
  { id: "students", label: "Students" },
]

// Define types for gallery items
interface GalleryImageType {
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
}

// Get YouTube video ID from URL
function getYouTubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default async function Gallery() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Fetch all active gallery items
    const galleryItems = await GalleryItem.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    // Separate images and videos
    const images = galleryItems.filter(
      (item: any) => item.itemType === "image"
    ) as GalleryImageType[];
    
    const videos = galleryItems.filter(
      (item: any) => item.itemType === "video"
    ) as GalleryImageType[];

    return (
      <div>
        {/* Hero Section */}
        <section className="bg-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Gallery</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Take a visual tour of our campus, classrooms, events, and student activities
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="flex flex-wrap justify-center gap-2">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images
                      .filter((img) => category.id === "all" || img.category === category.id)
                      .map((image) => (
                        <div
                          key={image._id.toString()}
                          className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group"
                        >
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={image.imageUrl || "/placeholder.svg"}
                              alt={image.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-end">
                              <div className="p-4 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h3 className="font-medium">{image.title}</h3>
                                {image.description && (
                                  <p className="text-sm mt-1">{image.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {images.filter((img) => category.id === "all" || img.category === category.id).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No images found in this category</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Video Gallery */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Video Gallery</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Watch videos of our campus tours, student testimonials, and special events
              </p>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No videos available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => {
                  const videoId = getYouTubeVideoId(video.videoUrl || "");
                  
                  return (
                    <div
                      key={video._id.toString()}
                      className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    >
                      <div className="aspect-video relative bg-gray-200">
                        {videoId ? (
                          <a
                            href={`https://www.youtube.com/watch?v=${videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="w-16 h-16 rounded-full bg-blue-800 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-8 w-8 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <Image
                              src={video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              alt={video.title}
                              fill
                              className="object-cover opacity-70"
                            />
                          </a>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-gray-500">Invalid video URL</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-blue-800">{video.title}</h3>
                        {video.description && (
                          <p className="text-gray-600">{video.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error in Gallery page:", error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gallery</h1>
        <p className="text-gray-700">
          We're having trouble loading the gallery images. Please try again later.
        </p>
      </div>
    );
  }
}
