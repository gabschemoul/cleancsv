import type { CsvRow } from '@/types/csv.types'

export function exportToCsv(rows: CsvRow[], columns: string[]): Blob {
  // Add BOM for Excel compatibility
  const BOM = '\ufeff'

  // Create header row
  const header = columns.join(',')

  // Helper to escape CSV value and prevent formula injection
  const escapeValue = (value: string): string => {
    // Prevent formula injection: prefix with ' if starts with =, +, -, @, tab, or CR
    const needsFormulaProtection = /^[=+\-@\t\r]/.test(value)

    // Needs quoting if contains special chars or needs formula protection
    const needsQuotes =
      value.includes(',') ||
      value.includes('"') ||
      value.includes('\n') ||
      needsFormulaProtection

    if (needsQuotes) {
      const escaped = value.replace(/"/g, '""')
      // Add ' prefix inside quotes to prevent formula execution
      return needsFormulaProtection ? `"'${escaped}"` : `"${escaped}"`
    }
    return value
  }

  // Create data rows
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeValue(row[col] ?? '')).join(',')
  )

  const csv = BOM + [header, ...dataRows].join('\n')

  return new Blob([csv], { type: 'text/csv;charset=utf-8' })
}

export function downloadCsv(
  rows: CsvRow[],
  columns: string[],
  filename: string
): void {
  const blob = exportToCsv(rows, columns)
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Delay revoke to ensure download has started
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
