import Papa from 'papaparse'
import type { CsvRow } from '@/types/csv.types'

export interface ParseResult {
  rows: CsvRow[]
  columns: string[]
  errors: string[]
}

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const columns = results.meta.fields ?? []
        const rows = results.data.filter((row) => {
          // Filter out completely empty rows
          return Object.values(row).some((val) => val !== '')
        })

        const errors = results.errors.map(
          (e) => `Row ${e.row}: ${e.message}`
        )

        resolve({ rows, columns, errors })
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      },
    })
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const validExtensions = ['.csv', '.txt']

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is 10MB, your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    }
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a CSV file (.csv or .txt).`,
    }
  }

  return { valid: true }
}
