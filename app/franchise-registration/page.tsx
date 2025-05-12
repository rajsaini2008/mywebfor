import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function FranchiseRegistration() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Franchise Registration</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Join the Krishna Computers network and start your own computer education center
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-2xl text-blue-800">Franchise Application Form</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid gap-6">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="first-name" className="font-medium text-gray-700">
                          First Name
                        </label>
                        <Input id="first-name" placeholder="Your first name" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="last-name" className="font-medium text-gray-700">
                          Last Name
                        </label>
                        <Input id="last-name" placeholder="Your last name" />
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
                      <label htmlFor="address" className="font-medium text-gray-700">
                        Address
                      </label>
                      <Textarea id="address" placeholder="Your complete address" rows={3} />
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <h3 className="text-lg font-semibold text-gray-800">Business Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="business-name" className="font-medium text-gray-700">
                          Business Name
                        </label>
                        <Input id="business-name" placeholder="Your business name" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="business-type" className="font-medium text-gray-700">
                          Business Type
                        </label>
                        <Input id="business-type" placeholder="e.g., Sole Proprietorship, Partnership" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="business-address" className="font-medium text-gray-700">
                        Business Address
                      </label>
                      <Textarea id="business-address" placeholder="Your business address" rows={3} />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="experience" className="font-medium text-gray-700">
                        Experience in Education Sector
                      </label>
                      <Textarea
                        id="experience"
                        placeholder="Describe your experience in the education sector"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <h3 className="text-lg font-semibold text-gray-800">Franchise Details</h3>

                    <div className="grid gap-2">
                      <label htmlFor="location" className="font-medium text-gray-700">
                        Proposed Franchise Location
                      </label>
                      <Input id="location" placeholder="City and area where you want to open the franchise" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="investment" className="font-medium text-gray-700">
                        Investment Capacity (in INR)
                      </label>
                      <Input id="investment" placeholder="Your investment capacity" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="space" className="font-medium text-gray-700">
                        Available Space (in sq. ft.)
                      </label>
                      <Input id="space" placeholder="Space available for the franchise" />
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="timeline" className="font-medium text-gray-700">
                        Expected Timeline to Start
                      </label>
                      <Input id="timeline" placeholder="e.g., 1 month, 3 months" />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the terms and conditions and understand that my application will be reviewed by
                        Krishna Computers.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="privacy" />
                      <Label htmlFor="privacy" className="text-sm text-gray-700">
                        I consent to Krishna Computers collecting and processing my personal information for the purpose
                        of franchise application.
                      </Label>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-800 hover:bg-blue-900">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Franchise Benefits */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Franchise Benefits</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">Why you should partner with Krishna Computers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Established Brand",
                description: "Leverage our established brand name and reputation in the computer education sector.",
              },
              {
                title: "Comprehensive Support",
                description: "Receive comprehensive training, marketing, and operational support from our team.",
              },
              {
                title: "Proven Business Model",
                description: "Benefit from our proven business model with high success rate and return on investment.",
              },
              {
                title: "Quality Curriculum",
                description: "Access to our industry-recognized curriculum and teaching methodologies.",
              },
              {
                title: "Marketing Assistance",
                description: "Get marketing materials, strategies, and support to promote your franchise.",
              },
              {
                title: "Ongoing Training",
                description: "Regular training sessions and updates to keep your franchise at the cutting edge.",
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

      {/* Franchise Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Franchise Process</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Simple steps to become a Krishna Computers franchise
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Process Steps */}
              <div className="hidden md:block absolute left-1/2 h-full w-0.5 bg-blue-200 transform -translate-x-1/2"></div>

              {[
                {
                  title: "Application Submission",
                  description: "Fill out and submit the franchise application form with all required details.",
                },
                {
                  title: "Initial Screening",
                  description: "Our team reviews your application and conducts an initial screening.",
                },
                {
                  title: "Discussion & Meeting",
                  description: "Meet with our franchise team to discuss the opportunity in detail.",
                },
                {
                  title: "Location Assessment",
                  description: "We assess your proposed location for suitability and market potential.",
                },
                {
                  title: "Agreement Signing",
                  description: "Sign the franchise agreement and complete the necessary documentation.",
                },
                {
                  title: "Setup & Training",
                  description: "Set up your center and receive comprehensive training for your team.",
                },
                {
                  title: "Grand Opening",
                  description: "Launch your Krishna Computers franchise with our marketing support.",
                },
              ].map((step, index) => (
                <div key={index} className="relative flex items-start mb-12 md:mb-16">
                  <div className="hidden md:flex flex-col items-center mr-4">
                    <div
                      className={`rounded-full h-10 w-10 flex items-center justify-center z-10 ${
                        index % 2 === 0 ? "bg-blue-800 text-white" : "bg-yellow-500 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <Card
                    className={`border-none shadow-lg md:w-[calc(50%-2rem)] ${
                      index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="md:hidden rounded-full h-8 w-8 flex items-center justify-center mb-4 bg-blue-800 text-white">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-blue-800 mb-2">{step.title}</h3>
                      <p className="text-gray-700">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
