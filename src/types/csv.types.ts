export type CsvRow = Record<string, string>

export interface CsvData {
  rows: CsvRow[]
  columns: string[]
  filename: string
}

export interface ProcessingResult {
  data: CsvRow[]
  originalCount: number
  newCount: number
  removedCount: number
  modifiedCount: number
  message: string
}

export interface FileStats {
  filename: string
  rowCount: number
  columnCount: number
  columns: string[]
  fileSize: number
}
