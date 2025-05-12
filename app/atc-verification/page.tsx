import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"

export default function ATCVerification() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ATC Verification</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Verify the authenticity of Authorized Training Centers (ATC) affiliated with Krishna Computers
          </p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-2xl text-blue-800">Verify ATC</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid gap-2">
                    <label htmlFor="atc-id" className="font-medium text-gray-700">
                      ATC ID
                    </label>
                    <Input id="atc-id" placeholder="Enter ATC ID" />
                    <p className="text-sm text-gray-500">
                      The ATC ID can be found on the center's certificate or official documents.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="center-name" className="font-medium text-gray-700">
                      Center Name
                    </label>
                    <Input id="center-name" placeholder="Enter center name" />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="location" className="font-medium text-gray-700">
                      Location
                    </label>
                    <Input id="location" placeholder="Enter city or area" />
                  </div>

                  <Button className="w-full bg-blue-800 hover:bg-blue-900">Verify ATC</Button>
                </form>
              </CardContent>
            </Card>

            {/* Sample Verification Result - This would be shown conditionally based on form submission */}
            <Card className="border-none shadow-lg mt-8">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  ATC Verified
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ATC ID</p>
                      <p className="font-medium">KC-ATC-2023-001</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">10 January, 2023</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Center Name</p>
                      <p className="font-medium">ABC Computer Education</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium text-green-600">Active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">Jaipur, Rajasthan</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Courses Offered</p>
                      <p className="font-medium">DCA, CCC, Tally</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700">
                      This center is an authorized training partner of Krishna Computers and is authorized to conduct
                      courses and issue certificates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ATC Information */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">About Authorized Training Centers</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">Understanding Krishna Computers' ATC network</p>
          </div>

          <div className="grid gap-8 max-w-3xl mx-auto">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3">What is an ATC?</h3>
                <p className="text-gray-700">
                  Authorized Training Centers (ATCs) are educational institutions that have been officially recognized
                  and authorized by Krishna Computers to deliver our curriculum and training programs. These centers
                  meet our strict quality standards and are regularly monitored to ensure compliance with our
                  guidelines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Benefits of Studying at an ATC</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access to Krishna Computers' standardized curriculum and learning materials</li>
                  <li>Courses taught by trainers certified by Krishna Computers</li>
                  <li>Nationally recognized certification upon course completion</li>
                  <li>Quality assurance through regular audits and inspections</li>
                  <li>Access to Krishna Computers' placement assistance network</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3">How to Identify a Genuine ATC</h3>
                <p className="text-gray-700 mb-4">
                  To ensure you are enrolling in a genuine Krishna Computers ATC, look for the following:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>An official ATC certificate displayed prominently at the center</li>
                  <li>The center's ATC ID, which can be verified on this page</li>
                  <li>Krishna Computers branding and materials</li>
                  <li>Trainers with Krishna Computers certification</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  If you have any doubts about the authenticity of an ATC, please use the verification tool above or
                  contact our head office directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
