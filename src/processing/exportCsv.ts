import type { CsvRow } from '@/types/csv.types'

export function exportToCsv(rows: CsvRow[], columns: string[]): Blob {
  // Add BOM for Excel compatibility
  const BOM = '\ufeff'

  // Create header row
  const header = columns.join(',')

  // Create data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col] ?? ''
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
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

  URL.revokeObjectURL(url)
}
