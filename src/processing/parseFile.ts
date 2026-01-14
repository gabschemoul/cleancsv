import Papa from 'papaparse'
import type { CsvRow } from '@/types/csv.types'
import { FILE_CONFIG } from '@/config/constants'

export interface ParseResult {
  rows: CsvRow[]
  columns: string[]
  errors: string[]
}

const PARSE_TIMEOUT_MS = 30000 // 30 second timeout for parsing

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Parsing timed out. The file may be too large or complex.'))
    }, PARSE_TIMEOUT_MS)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        clearTimeout(timeoutId)
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
        clearTimeout(timeoutId)
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      },
    })
  })
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_CONFIG.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${FILE_CONFIG.MAX_SIZE_MB}MB, your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    }
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!(FILE_CONFIG.ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a CSV file (.csv or .txt).`,
    }
  }

  return { valid: true }
}
