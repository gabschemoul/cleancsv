import type { CsvRow, ProcessingResult } from '@/types/csv.types'

interface DeduplicateOptions {
  column: string
  caseSensitive?: boolean
}

export function deduplicate(
  rows: CsvRow[],
  options: DeduplicateOptions
): ProcessingResult {
  const { column, caseSensitive = false } = options
  const seen = new Set<string>()
  const uniqueRows: CsvRow[] = []

  for (const row of rows) {
    const value = row[column] ?? ''
    const key = caseSensitive ? value : value.toLowerCase()

    if (!seen.has(key)) {
      seen.add(key)
      uniqueRows.push(row)
    }
  }

  const removedCount = rows.length - uniqueRows.length

  return {
    data: uniqueRows,
    originalCount: rows.length,
    newCount: uniqueRows.length,
    removedCount,
    modifiedCount: 0,
    message:
      removedCount > 0
        ? `${removedCount} duplicate${removedCount > 1 ? 's' : ''} removed`
        : 'No duplicates found',
  }
}
