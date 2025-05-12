import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import Link from "next/link"

export default function ExamTemplatePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Exam Question Template</h1>

      <Card>
        <CardHeader>
          <CardTitle>Download Excel Template</CardTitle>
          <CardDescription>Use this template to prepare your exam questions for upload</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">The template contains the following columns:</p>

          <ul className="list-disc pl-6 mb-6 space-y-1">
            <li>Sr. No - Serial number of the question</li>
            <li>Paper ID - Unique identifier for the paper</li>
            <li>Question - The question text</li>
            <li>Option A - First option</li>
            <li>Option B - Second option</li>
            <li>Option C - Third option</li>
            <li>Option D - Fourth option</li>
            <li>Correct Option - The correct answer (A, B, C, or D)</li>
          </ul>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/templates/exam-template.xlsx" download>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
