import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Gallery() {
  const categories = [
    { id: "all", label: "All Photos" },
    { id: "campus", label: "Campus" },
    { id: "classrooms", label: "Classrooms" },
    { id: "events", label: "Events" },
    { id: "students", label: "Students" },
  ]

  const galleryImages = [
    { id: 1, category: "campus", src: "/placeholder.svg?height=300&width=400&text=Campus 1", alt: "Campus Building" },
    { id: 2, category: "campus", src: "/placeholder.svg?height=300&width=400&text=Campus 2", alt: "Campus Garden" },
    {
      id: 3,
      category: "classrooms",
      src: "/placeholder.svg?height=300&width=400&text=Classroom 1",
      alt: "Computer Lab",
    },
    {
      id: 4,
      category: "classrooms",
      src: "/placeholder.svg?height=300&width=400&text=Classroom 2",
      alt: "Lecture Hall",
    },
    { id: 5, category: "events", src: "/placeholder.svg?height=300&width=400&text=Event 1", alt: "Annual Function" },
    { id: 6, category: "events", src: "/placeholder.svg?height=300&width=400&text=Event 2", alt: "Workshop" },
    {
      id: 7,
      category: "students",
      src: "/placeholder.svg?height=300&width=400&text=Students 1",
      alt: "Students Working",
    },
    {
      id: 8,
      category: "students",
      src: "/placeholder.svg?height=300&width=400&text=Students 2",
      alt: "Graduation Ceremony",
    },
    { id: 9, category: "campus", src: "/placeholder.svg?height=300&width=400&text=Campus 3", alt: "Reception Area" },
    {
      id: 10,
      category: "classrooms",
      src: "/placeholder.svg?height=300&width=400&text=Classroom 3",
      alt: "Programming Lab",
    },
    { id: 11, category: "events", src: "/placeholder.svg?height=300&width=400&text=Event 3", alt: "Tech Fest" },
    {
      id: 12,
      category: "students",
      src: "/placeholder.svg?height=300&width=400&text=Students 3",
      alt: "Project Presentation",
    },
  ]

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
                  {galleryImages
                    .filter((img) => category.id === "all" || img.category === category.id)
                    .map((image) => (
                      <div
                        key={image.id}
                        className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow group"
                      >
                        <div className="aspect-[4/3] relative">
                          <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-end">
                            <div className="p-4 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <h3 className="font-medium">{image.alt}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((video) => (
              <div
                key={video}
                className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video relative bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
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
                    src={`/placeholder.svg?height=225&width=400&text=Video ${video}`}
                    alt={`Video ${video}`}
                    fill
                    className="object-cover opacity-70"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-blue-800">Video Title {video}</h3>
                  <p className="text-gray-600">Brief description of the video content.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
