import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, IndianRupee } from "lucide-react"

export default function Jobs() {
  const jobListings = [
    {
      id: 1,
      title: "Computer Instructor",
      location: "Kaman, Rajasthan",
      type: "Full-time",
      salary: "₹15,000 - ₹25,000 per month",
      description:
        "We are looking for an experienced Computer Instructor to teach various computer courses including DCA, CCC, and Tally. The ideal candidate should have excellent communication skills and a passion for teaching.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Minimum 2 years of teaching experience",
        "Proficiency in MS Office, programming languages, and accounting software",
        "Excellent communication and presentation skills",
        "Ability to explain complex concepts in a simple manner",
      ],
      responsibilities: [
        "Conduct classes for various computer courses",
        "Develop and update course materials",
        "Evaluate student performance and provide feedback",
        "Maintain attendance and progress records",
        "Assist in curriculum development",
      ],
    },
    {
      id: 2,
      title: "Web Developer",
      location: "Kaman, Rajasthan",
      type: "Full-time",
      salary: "₹20,000 - ₹35,000 per month",
      description:
        "We are seeking a skilled Web Developer to join our team. The successful candidate will be responsible for designing and developing websites and web applications for our clients.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Proficiency in HTML, CSS, JavaScript, and PHP",
        "Experience with responsive design and mobile-first approach",
        "Knowledge of front-end frameworks like React or Angular",
        "Understanding of database management systems",
      ],
      responsibilities: [
        "Design and develop websites and web applications",
        "Ensure cross-browser compatibility and responsiveness",
        "Optimize websites for maximum speed and scalability",
        "Collaborate with designers and content creators",
        "Troubleshoot and fix bugs and issues",
      ],
    },
    {
      id: 3,
      title: "Administrative Assistant",
      location: "Kaman, Rajasthan",
      type: "Full-time",
      salary: "₹12,000 - ₹18,000 per month",
      description:
        "We are looking for an Administrative Assistant to support our daily operations. The ideal candidate should be organized, detail-oriented, and have excellent communication skills.",
      requirements: [
        "Bachelor's degree in any discipline",
        "Proficiency in MS Office and computer operations",
        "Excellent verbal and written communication skills",
        "Strong organizational and time management skills",
        "Ability to multitask and prioritize work",
      ],
      responsibilities: [
        "Handle administrative tasks and office procedures",
        "Manage student inquiries and admissions",
        "Maintain records and databases",
        "Coordinate with faculty and staff",
        "Assist in organizing events and activities",
      ],
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Career Opportunities</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Join our team and be part of a dynamic organization committed to excellence in computer education
          </p>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="openings" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TabsTrigger
                  value="openings"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Current Openings
                </TabsTrigger>
                <TabsTrigger
                  value="apply"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Apply for a Job
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="openings" className="mt-0">
              <div className="grid gap-8">
                {jobListings.map((job) => (
                  <Card key={job.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-blue-800 mb-2">{job.title}</h2>
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-blue-800 hover:bg-blue-900 whitespace-nowrap">Apply Now</Button>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-gray-800 mb-2">Job Description</h3>
                        <p className="text-gray-700">{job.description}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-gray-800 mb-2">Requirements</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 mb-2">Responsibilities</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="apply" className="mt-0">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Job Application Form</h2>
                  <form className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="firstName" className="font-medium text-gray-700">
                          First Name
                        </label>
                        <Input id="firstName" placeholder="Your first name" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="lastName" className="font-medium text-gray-700">
                          Last Name
                        </label>
                        <Input id="lastName" placeholder="Your last name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="email" className="font-medium text-gray-700">
                          Email Address
                        </label>
                        <Input id="email" type="email" placeholder="Your email" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="phone" className="font-medium text-gray-700">
                          Phone Number
                        </label>
                        <Input id="phone" placeholder="Your phone number" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="position" className="font-medium text-gray-700">
                        Position Applied For
                      </label>
                      <Input id="position" placeholder="Job title" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="experience" className="font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <Input id="experience" type="number" placeholder="Years of experience" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="education" className="font-medium text-gray-700">
                        Highest Education
                      </label>
                      <Input id="education" placeholder="Your highest qualification" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="skills" className="font-medium text-gray-700">
                        Key Skills
                      </label>
                      <Textarea id="skills" placeholder="List your key skills" rows={3} />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="resume" className="font-medium text-gray-700">
                        Upload Resume
                      </label>
                      <Input id="resume" type="file" className="cursor-pointer" />
                      <p className="text-sm text-gray-500">PDF or Word document only (Max size: 2MB)</p>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="coverLetter" className="font-medium text-gray-700">
                        Cover Letter
                      </label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell us why you're a good fit for this position"
                        rows={5}
                      />
                    </div>

                    <Button className="bg-blue-800 hover:bg-blue-900">Submit Application</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Why Work With Us?</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">Join our team and enjoy these benefits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Professional Growth",
                description: "We provide opportunities for continuous learning and professional development.",
              },
              {
                title: "Collaborative Environment",
                description: "Work in a supportive team environment that values collaboration and innovation.",
              },
              {
                title: "Work-Life Balance",
                description: "We understand the importance of balancing work and personal life.",
              },
              {
                title: "Competitive Compensation",
                description: "We offer competitive salaries and benefits packages.",
              },
              {
                title: "Recognition & Rewards",
                description: "Your contributions are valued and recognized through various reward programs.",
              },
              {
                title: "Career Advancement",
                description: "Clear paths for career progression and advancement within the organization.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
