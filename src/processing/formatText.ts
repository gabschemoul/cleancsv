import type { CsvRow, ProcessingResult } from '@/types/csv.types'

type FormatFunction = (value: string) => string

function applyFormat(
  rows: CsvRow[],
  columns: string[],
  formatFn: FormatFunction,
  formatName: string
): ProcessingResult {
  let modifiedCount = 0

  const newRows = rows.map((row) => {
    const newRow = { ...row }
    for (const column of columns) {
      const original = row[column] ?? ''
      const formatted = formatFn(original)
      if (formatted !== original) {
        modifiedCount++
      }
      newRow[column] = formatted
    }
    return newRow
  })

  return {
    data: newRows,
    originalCount: rows.length,
    newCount: rows.length,
    removedCount: 0,
    modifiedCount,
    message:
      modifiedCount > 0
        ? `${modifiedCount} cell${modifiedCount > 1 ? 's' : ''} formatted to ${formatName}`
        : 'No changes needed',
  }
}

export function toLowerCase(rows: CsvRow[], columns: string[]): ProcessingResult {
  return applyFormat(rows, columns, (v) => v.toLowerCase(), 'lowercase')
}

export function toUpperCase(rows: CsvRow[], columns: string[]): ProcessingResult {
  return applyFormat(rows, columns, (v) => v.toUpperCase(), 'UPPERCASE')
}

export function toTitleCase(rows: CsvRow[], columns: string[]): ProcessingResult {
  const titleCase = (str: string) =>
    str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

  return applyFormat(rows, columns, titleCase, 'Title Case')
}

export function trimWhitespace(rows: CsvRow[], columns: string[]): ProcessingResult {
  const trim = (str: string) => str.trim().replace(/\s+/g, ' ')

  return applyFormat(rows, columns, trim, 'trimmed')
}
