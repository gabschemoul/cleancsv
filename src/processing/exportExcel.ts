import type { CsvRow } from '@/types/csv.types'

export async function exportToExcel(
  rows: CsvRow[],
  columns: string[],
  filename: string
): Promise<void> {
  // CRITICAL: Dynamic import only - never static import xlsx
  const XLSX = await import('xlsx')

  // Create worksheet data
  const wsData = [columns, ...rows.map((row) => columns.map((col) => row[col] ?? ''))]

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')

  // Generate filename
  const outputFilename = filename.replace(/\.[^/.]+$/, '') + '.xlsx'

  // Write and download
  XLSX.writeFile(wb, outputFilename)
}
