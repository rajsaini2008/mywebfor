import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle } from "lucide-react"

export default function CertificateVerification() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Certificate Verification</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Verify the authenticity of certificates issued by Krishna Computers
          </p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-2xl text-blue-800">Verify Your Certificate</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid gap-2">
                    <label htmlFor="certificate-number" className="font-medium text-gray-700">
                      Certificate Number
                    </label>
                    <Input id="certificate-number" placeholder="Enter your certificate number" />
                    <p className="text-sm text-gray-500">
                      The certificate number can be found on the bottom of your certificate.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="student-name" className="font-medium text-gray-700">
                      Student Name
                    </label>
                    <Input id="student-name" placeholder="Enter your full name as on certificate" />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="course-name" className="font-medium text-gray-700">
                      Course Name
                    </label>
                    <Input id="course-name" placeholder="Enter the course name" />
                  </div>

                  <Button className="w-full bg-blue-800 hover:bg-blue-900">Verify Certificate</Button>
                </form>
              </CardContent>
            </Card>

            {/* Sample Verification Result - This would be shown conditionally based on form submission */}
            <Card className="border-none shadow-lg mt-8">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-2xl text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Certificate Verified
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Certificate Number</p>
                      <p className="font-medium">KC-2023-12345</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">15 June, 2023</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium">John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium">Diploma in Computer Applications (DCA)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">6 Months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-medium">A (Excellent)</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700">
                      This certificate has been verified as authentic and was issued by Krishna Computers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Common questions about our certificate verification process
            </p>
          </div>

          <div className="grid gap-6 max-w-3xl mx-auto">
            {[
              {
                question: "How can I verify my certificate?",
                answer:
                  "You can verify your certificate by entering the certificate number, your name, and the course name in the verification form above.",
              },
              {
                question: "Where can I find my certificate number?",
                answer:
                  "Your certificate number is printed at the bottom of your certificate, usually in the format KC-YYYY-XXXXX.",
              },
              {
                question: "What if my certificate cannot be verified?",
                answer:
                  "If your certificate cannot be verified, please contact our office with your certificate details for further assistance.",
              },
              {
                question: "Can employers verify my certificate?",
                answer:
                  "Yes, employers can use the same verification process to confirm the authenticity of your certificate.",
              },
              {
                question: "How long does the verification process take?",
                answer: "The verification process is instant for valid certificates in our database.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
