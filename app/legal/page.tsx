import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Legal() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Legal Information</h1>
          <p className="text-xl max-w-3xl mx-auto">Important legal documents and policies for Krishna Computers</p>
        </div>
      </section>

      {/* Legal Documents */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="terms" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <TabsTrigger
                  value="terms"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Terms & Conditions
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Privacy Policy
                </TabsTrigger>
                <TabsTrigger
                  value="refund"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Refund Policy
                </TabsTrigger>
                <TabsTrigger
                  value="disclaimer"
                  className="px-4 py-2 data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Disclaimer
                </TabsTrigger>
              </TabsList>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <TabsContent value="terms" className="mt-0">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Terms and Conditions</h2>
                  <div className="prose max-w-none">
                    <p>
                      Welcome to Krishna Computers. By accessing and using our website and services, you agree to comply
                      with and be bound by the following terms and conditions.
                    </p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                      By accessing this website, you agree to be bound by these Terms and Conditions, all applicable
                      laws and regulations, and agree that you are responsible for compliance with any applicable local
                      laws.
                    </p>

                    <h3>2. Course Registration and Admission</h3>
                    <p>
                      Course registration is subject to availability and meeting the eligibility criteria. Krishna
                      Computers reserves the right to refuse admission to any student without assigning any reason.
                    </p>

                    <h3>3. Fee Payment</h3>
                    <p>
                      All fees must be paid as per the schedule provided at the time of admission. Late payment may
                      attract penalties as decided by the management.
                    </p>

                    <h3>4. Attendance</h3>
                    <p>
                      Regular attendance is mandatory for all courses. Students with attendance below the required
                      percentage may not be allowed to appear for examinations.
                    </p>

                    <h3>5. Certification</h3>
                    <p>
                      Certificates will be issued only after successful completion of the course, including passing all
                      required examinations and meeting attendance requirements.
                    </p>

                    <h3>6. Code of Conduct</h3>
                    <p>
                      Students are expected to maintain discipline and adhere to the code of conduct. Any violation may
                      result in disciplinary action, including termination from the course.
                    </p>

                    <h3>7. Changes to Terms</h3>
                    <p>
                      Krishna Computers reserves the right to modify these terms at any time. Changes will be effective
                      immediately upon posting on the website.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Privacy Policy</h2>
                  <div className="prose max-w-none">
                    <p>
                      At Krishna Computers, we are committed to protecting your privacy. This Privacy Policy explains
                      how we collect, use, and safeguard your information when you visit our website or use our
                      services.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                      We collect personal information such as name, contact details, educational background, and payment
                      information when you register for our courses or contact us.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                      We use your information to process course registrations, communicate with you about our services,
                      improve our offerings, and comply with legal obligations.
                    </p>

                    <h3>3. Information Sharing</h3>
                    <p>
                      We do not sell, trade, or otherwise transfer your personal information to outside parties except
                      as necessary to provide our services or as required by law.
                    </p>

                    <h3>4. Data Security</h3>
                    <p>
                      We implement appropriate security measures to protect your personal information from unauthorized
                      access, alteration, disclosure, or destruction.
                    </p>

                    <h3>5. Cookies</h3>
                    <p>
                      Our website may use cookies to enhance your experience. You can choose to disable cookies through
                      your browser settings, but this may affect the functionality of our website.
                    </p>

                    <h3>6. Third-Party Links</h3>
                    <p>
                      Our website may contain links to third-party websites. We are not responsible for the privacy
                      practices or content of these websites.
                    </p>

                    <h3>7. Changes to Privacy Policy</h3>
                    <p>
                      We may update our Privacy Policy from time to time. Any changes will be posted on this page with
                      an updated revision date.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="refund" className="mt-0">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Refund Policy</h2>
                  <div className="prose max-w-none">
                    <p>This Refund Policy outlines the terms and conditions for refunds at Krishna Computers.</p>

                    <h3>1. Course Fee Refund</h3>
                    <p>
                      Course fees are non-refundable once classes have commenced. However, in exceptional circumstances,
                      a partial refund may be considered at the discretion of the management.
                    </p>

                    <h3>2. Cancellation by Student</h3>
                    <p>
                      If a student wishes to cancel their enrollment before the commencement of classes, a cancellation
                      fee of 10% of the total course fee will be charged, and the remaining amount will be refunded.
                    </p>

                    <h3>3. Cancellation by Krishna Computers</h3>
                    <p>
                      If a course is cancelled by Krishna Computers due to unforeseen circumstances, students will be
                      offered a full refund or the option to transfer to another course.
                    </p>

                    <h3>4. Transfer to Another Course</h3>
                    <p>
                      Students may request to transfer to another course within 7 days of the commencement of classes. A
                      transfer fee may apply, and the difference in course fees will be adjusted accordingly.
                    </p>

                    <h3>5. Refund Process</h3>
                    <p>
                      Refund requests must be submitted in writing to the administration office. Approved refunds will
                      be processed within 30 days of the request approval.
                    </p>

                    <h3>6. Non-Refundable Items</h3>
                    <p>
                      Registration fees, examination fees, and study materials are non-refundable under any
                      circumstances.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="disclaimer" className="mt-0">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Disclaimer</h2>
                  <div className="prose max-w-none">
                    <p>This disclaimer outlines the limitations of liability for Krishna Computers.</p>

                    <h3>1. Information Accuracy</h3>
                    <p>
                      While we strive to provide accurate and up-to-date information on our website, we make no
                      representations or warranties of any kind, express or implied, about the completeness, accuracy,
                      reliability, suitability, or availability of the information, products, services, or related
                      graphics contained on the website.
                    </p>

                    <h3>2. Website Availability</h3>
                    <p>
                      We do not guarantee that the website will be uninterrupted, error-free, or that defects will be
                      corrected. The website and its content are provided on an "as is" basis.
                    </p>

                    <h3>3. External Links</h3>
                    <p>
                      Our website may contain links to external websites that are not provided or maintained by us. We
                      do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these
                      external websites.
                    </p>

                    <h3>4. Limitation of Liability</h3>
                    <p>
                      In no event will Krishna Computers be liable for any loss or damage including without limitation,
                      indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of
                      data or profits arising out of, or in connection with, the use of this website.
                    </p>

                    <h3>5. Course Outcomes</h3>
                    <p>
                      While we make every effort to provide quality education, we do not guarantee specific outcomes,
                      job placements, or salary levels after completion of our courses.
                    </p>

                    <h3>6. Changes to Disclaimer</h3>
                    <p>We reserve the right to make changes to this disclaimer at any time without notice.</p>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
