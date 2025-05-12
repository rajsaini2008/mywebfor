import * as XLSX from "xlsx"

export interface ExamQuestion {
  srNo: number
  paperId: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
}

export function parseExcelQuestions(file: File): Promise<ExamQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Skip header row and process data
        const questions: ExamQuestion[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]

          // Skip empty rows
          if (!row || row.length < 8) continue

          questions.push({
            srNo: row[0] || i,
            paperId: row[1] || "",
            question: row[2] || "",
            optionA: row[3] || "",
            optionB: row[4] || "",
            optionC: row[5] || "",
            optionD: row[6] || "",
            correctOption: row[7] || "",
          })
        }

        resolve(questions)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
