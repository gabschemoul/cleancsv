import type { CsvRow, ProcessingResult } from '@/types/csv.types'

export interface MergeResult extends ProcessingResult {
  columns: string[]
  fileCount: number
}

export interface FileData {
  rows: CsvRow[]
  columns: string[]
  filename: string
}

export function mergeFiles(files: FileData[]): MergeResult {
  if (files.length === 0) {
    return {
      data: [],
      columns: [],
      originalCount: 0,
      newCount: 0,
      removedCount: 0,
      modifiedCount: 0,
      message: 'No files to merge',
      fileCount: 0,
    }
  }

  if (files.length === 1) {
    return {
      data: files[0].rows,
      columns: files[0].columns,
      originalCount: files[0].rows.length,
      newCount: files[0].rows.length,
      removedCount: 0,
      modifiedCount: 0,
      message: 'Only one file provided',
      fileCount: 1,
    }
  }

  // Get union of all columns
  const allColumnsSet = new Set<string>()
  for (const file of files) {
    for (const col of file.columns) {
      allColumnsSet.add(col)
    }
  }
  const allColumns = Array.from(allColumnsSet)

  // Merge all rows, filling missing columns with empty string
  const mergedRows: CsvRow[] = []
  let totalOriginal = 0

  for (const file of files) {
    totalOriginal += file.rows.length

    for (const row of file.rows) {
      const normalizedRow: CsvRow = {}
      for (const col of allColumns) {
        normalizedRow[col] = row[col] ?? ''
      }
      mergedRows.push(normalizedRow)
    }
  }

  return {
    data: mergedRows,
    columns: allColumns,
    originalCount: totalOriginal,
    newCount: mergedRows.length,
    removedCount: 0,
    modifiedCount: 0,
    message: `${files.length} files merged, ${mergedRows.length} total rows`,
    fileCount: files.length,
  }
}

export function checkColumnCompatibility(files: FileData[]): {
  compatible: boolean
  missingColumns: Map<string, string[]>
} {
  if (files.length < 2) {
    return { compatible: true, missingColumns: new Map() }
  }

  // Use first file as reference
  const referenceColumns = new Set(files[0].columns)
  const missingColumns = new Map<string, string[]>()

  for (let i = 1; i < files.length; i++) {
    const file = files[i]
    const fileColumns = new Set(file.columns)

    // Check what's missing from this file
    const missing: string[] = []
    for (const col of referenceColumns) {
      if (!fileColumns.has(col)) {
        missing.push(col)
      }
    }

    if (missing.length > 0) {
      missingColumns.set(file.filename, missing)
    }

    // Check what's extra in this file (not in reference)
    for (const col of fileColumns) {
      if (!referenceColumns.has(col)) {
        referenceColumns.add(col) // Add to track all columns
      }
    }
  }

  return {
    compatible: missingColumns.size === 0,
    missingColumns,
  }
}
