import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, FileText, Book, FileCode } from "lucide-react"

export default function Download() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Downloads</h1>
          <p className="text-xl max-w-3xl mx-auto">Access course materials, software, and other resources</p>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Course Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    { name: "DCA Course Syllabus", size: "1.2 MB" },
                    { name: "CCC Study Material", size: "2.5 MB" },
                    { name: "Tally Prime Guide", size: "3.8 MB" },
                    { name: "O Level Notes", size: "5.2 MB" },
                    { name: "Web Design Basics", size: "2.1 MB" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{item.size}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Software
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    { name: "Visual Studio Code", size: "65.8 MB" },
                    { name: "XAMPP Server", size: "148.2 MB" },
                    { name: "Python 3.10", size: "25.1 MB" },
                    { name: "Java Development Kit", size: "172.5 MB" },
                    { name: "Node.js", size: "18.4 MB" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{item.size}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  E-Books
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    { name: "HTML & CSS Basics", size: "4.2 MB" },
                    { name: "JavaScript Fundamentals", size: "5.8 MB" },
                    { name: "Python Programming", size: "7.3 MB" },
                    { name: "Database Management", size: "3.9 MB" },
                    { name: "Computer Networks", size: "6.1 MB" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{item.size}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Forms & Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {[
                    { name: "Admission Form", size: "0.8 MB" },
                    { name: "Fee Structure", size: "0.5 MB" },
                    { name: "Course Calendar", size: "1.2 MB" },
                    { name: "Student Handbook", size: "2.7 MB" },
                    { name: "Scholarship Form", size: "0.6 MB" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{item.size}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Additional Resources</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Useful links and resources to enhance your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Video Tutorials",
                description: "Access our collection of video tutorials covering various topics from our courses.",
                buttonText: "Watch Videos",
              },
              {
                title: "Practice Exercises",
                description: "Download practice exercises and assignments to test your knowledge and skills.",
                buttonText: "Get Exercises",
              },
              {
                title: "Sample Projects",
                description: "Explore sample projects to understand practical applications of concepts learned.",
                buttonText: "View Projects",
              },
              {
                title: "Interview Questions",
                description: "Prepare for job interviews with our collection of commonly asked questions.",
                buttonText: "Prepare Now",
              },
              {
                title: "Career Resources",
                description: "Access resources to help you build your career in the IT industry.",
                buttonText: "Explore Resources",
              },
              {
                title: "Online Tools",
                description: "Discover useful online tools and platforms to enhance your productivity.",
                buttonText: "Use Tools",
              },
            ].map((resource, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">{resource.title}</h3>
                  <p className="text-gray-700 mb-4">{resource.description}</p>
                  <Button className="w-full bg-blue-800 hover:bg-blue-900">{resource.buttonText}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
