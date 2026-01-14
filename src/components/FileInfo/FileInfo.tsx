import { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Rows3,
  Columns3,
  X,
  Undo2,
  Redo2,
  Download,
  FileDown,
  Loader2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCsvContext } from '@/hooks/useCsvContext'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { downloadCsv } from '@/processing/exportCsv'
import { exportToExcel } from '@/processing/exportExcel'
import { parseFile, validateFile } from '@/processing/parseFile'

export function FileInfo() {
  const { data, columns, filename, fileStats, isLoaded, clearData, setData, canUndo, canRedo, undo, redo } =
    useCsvContext()
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isLoaded || !fileStats) {
    return null
  }

  const handleClear = () => {
    clearData()
    toast.success('File cleared', {
      description: 'Ready to upload a new file.',
    })
  }

  const handleReplaceClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error('Invalid file', { description: validation.error })
      return
    }

    try {
      const result = await parseFile(file)
      if (result.rows.length === 0) {
        toast.error('Empty file', { description: 'The file contains no data rows.' })
        return
      }
      setData(result.rows, result.columns, file.name, file.size)
      toast.success('File replaced', {
        description: `${formatNumber(result.rows.length)} rows loaded from ${file.name}`,
      })
    } catch (error) {
      toast.error('Failed to parse file', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleUndo = () => {
    undo()
    toast.info('Undo', {
      description: 'Previous state restored.',
    })
  }

  const handleRedo = () => {
    redo()
    toast.info('Redo', {
      description: 'Action reapplied.',
    })
  }

  const handleExportCsv = () => {
    const cleanFilename = filename.replace(/\.[^/.]+$/, '') + '_clean.csv'
    downloadCsv(data, columns, cleanFilename)
    toast.success('CSV downloaded', {
      description: cleanFilename,
    })
  }

  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    try {
      const cleanFilename = filename.replace(/\.[^/.]+$/, '') + '_clean'
      await exportToExcel(data, columns, cleanFilename)
      toast.success('Excel downloaded', {
        description: `${cleanFilename}.xlsx`,
      })
    } catch (error) {
      toast.error('Excel export failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsExportingExcel(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm">
      {/* Hidden file input for replacing */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-700">
          <FileSpreadsheet className="h-4 w-4 text-zinc-500" />
          <span className="font-medium">{fileStats.filename}</span>
          <button
            onClick={handleReplaceClick}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
            title="Replace file"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-200" />

        <div className="flex items-center gap-2 text-zinc-600">
          <Rows3 className="h-4 w-4 text-zinc-400" />
          <span>
            <span className="font-medium text-zinc-700">
              {formatNumber(fileStats.rowCount)}
            </span>{' '}
            rows
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600">
          <Columns3 className="h-4 w-4 text-zinc-400" />
          <span>
            <span className="font-medium text-zinc-700">
              {formatNumber(fileStats.columnCount)}
            </span>{' '}
            columns
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Export buttons */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCsv}
          title="Download as CSV"
        >
          <Download className="h-4 w-4" />
          <span className="ml-1">CSV</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          title="Download as Excel"
        >
          {isExportingExcel ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          <span className="ml-1">Excel</span>
        </Button>

        <div className="h-4 w-px bg-zinc-200" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-zinc-200" />

        {/* Clear */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-zinc-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
          <span className="ml-1">Clear</span>
        </Button>
      </div>
    </div>
  )
}
