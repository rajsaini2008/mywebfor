import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, BookOpen, Users, Star, CheckSquare } from "lucide-react"
import connectToDatabase from "@/lib/mongodb"
import CmsContent from "@/models/CmsContent"
import TeamMember from "@/models/TeamMember"

// Helper function to get CMS content
async function getCmsContent(section: string) {
  await connectToDatabase();
  const contents = await CmsContent.find({ section }).lean();
  
  // Convert to a key-value map
  const contentMap: Record<string, string> = {};
  contents.forEach((item: any) => {
    contentMap[item.key] = item.value;
  });
  
  return contentMap;
}

// Helper function to get team members
async function getTeamMembers() {
  await connectToDatabase();
  return TeamMember.find().sort({ order: 1 }).lean();
}

export default async function AboutUs() {
  // Fetch content from CMS
  const aboutContent = await getCmsContent("about");
  
  // Fetch team members
  const teamMembers = await getTeamMembers();
  
  // Hero section
  const heroTitle = aboutContent.heroTitle || "About Krishna Computers";
  const heroSubtitle = aboutContent.heroSubtitle || "A leading computer education institute dedicated to empowering students with the skills they need to succeed in today's digital world.";
  
  // Story section
  const storyTitle = aboutContent.storyTitle || "Our Story";
  const storyContent1 = aboutContent.storyContent1 || "Founded in 2008, Krishna Computers has been at the forefront of computer education in Kaman, Rajasthan. What started as a small training center has now grown into a comprehensive institute offering a wide range of courses.";
  const storyContent2 = aboutContent.storyContent2 || "Our journey has been defined by a commitment to quality education, innovative teaching methods, and a student-first approach. We have trained thousands of students who have gone on to build successful careers in the IT industry.";
  const storyContent3 = aboutContent.storyContent3 || "At Krishna Computers, we believe in the power of education to transform lives and communities. Our mission is to make quality computer education accessible to all, regardless of their background or prior experience.";
  const storyButtonText = aboutContent.storyButtonText || "Learn More";
  const storyImageUrl = aboutContent.storyImageUrl || "/placeholder.svg?height=400&width=600";
  
  // Values section
  const valuesTitle = aboutContent.valuesTitle || "Our Values";
  const valuesSubtitle = aboutContent.valuesSubtitle || "The principles that guide everything we do at Krishna Computers";
  
  const values = [
    {
      icon: <BookOpen className="h-10 w-10 text-blue-800" />,
      title: aboutContent.value1Title || "Quality Education",
      description: aboutContent.value1Description || "We are committed to providing the highest quality education with up-to-date curriculum.",
    },
    {
      icon: <Users className="h-10 w-10 text-blue-800" />,
      title: aboutContent.value2Title || "Student-Centered",
      description: aboutContent.value2Description || "Our students are at the heart of everything we do, with personalized attention and support.",
    },
    {
      icon: <Star className="h-10 w-10 text-blue-800" />,
      title: aboutContent.value3Title || "Innovation",
      description: aboutContent.value3Description || "We constantly innovate our teaching methods and curriculum to stay ahead of industry trends.",
    },
    {
      icon: <Award className="h-10 w-10 text-blue-800" />,
      title: aboutContent.value4Title || "Excellence",
      description: aboutContent.value4Description || "We strive for excellence in all aspects of our operations, from teaching to administration.",
    }
  ];
  
  // Why Choose Us section
  const whyChooseTitle = aboutContent.whyChooseTitle || "Why Choose Krishna Computers?";
  const whyChooseSubtitle = aboutContent.whyChooseSubtitle || "We offer more than just computer courses - we provide a pathway to success";
  
  const reasons = [
    aboutContent.reason1 || "Experienced and qualified instructors",
    aboutContent.reason2 || "State-of-the-art computer labs and facilities",
    aboutContent.reason3 || "Comprehensive curriculum covering the latest technologies",
    aboutContent.reason4 || "Hands-on practical training with real-world projects",
    aboutContent.reason5 || "Flexible class timings to accommodate working professionals",
    aboutContent.reason6 || "Placement assistance and career counseling",
    aboutContent.reason7 || "Affordable fee structure with installment options",
    aboutContent.reason8 || "Government recognized certifications",
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
          <div 
            className="text-xl max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: heroSubtitle }}
          />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src={storyImageUrl}
                alt="Krishna Computers Building"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">{storyTitle}</h2>
              <div 
                className="text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: storyContent1 }}
              />
              <div 
                className="text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: storyContent2 }}
              />
              <div 
                className="text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: storyContent3 }}
              />
              <Button className="bg-blue-800 hover:bg-blue-900">{storyButtonText}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">{valuesTitle}</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {valuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                  <div 
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: value.description }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      {teamMembers.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Our Team</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Meet the dedicated professionals who make Krishna Computers a center of excellence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member._id} className="border-none shadow-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-blue-800 font-medium mb-3">{member.position}</p>
                    <p className="text-gray-600">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{whyChooseTitle}</h2>
            <p className="text-xl max-w-3xl mx-auto">
              {whyChooseSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckSquare className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div 
                  className="text-lg"
                  dangerouslySetInnerHTML={{ __html: reason }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
