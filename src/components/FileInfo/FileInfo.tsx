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
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCsvContext } from '@/hooks/useCsvContext'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { downloadCsv } from '@/processing/exportCsv'
import { exportToExcel } from '@/processing/exportExcel'
import { parseFile, validateFile } from '@/processing/parseFile'

export function FileInfo() {
  const { data, columns, filename, fileStats, isLoaded, clearData, setData, canUndo, canRedo, undo, redo } =
    useCsvContext()
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
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
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-slate-50/80 px-6 py-4">
      {/* Hidden file input for replacing */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Replace CSV file"
      />

      {/* Stats section */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Filename */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <FileSpreadsheet className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">File</p>
            <p className="font-medium text-slate-900">{fileStats.filename}</p>
          </div>
          <button
            onClick={handleReplaceClick}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 hover:shadow-sm"
            title="Replace file"
            aria-label="Replace file"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="h-10 w-px bg-slate-200" />

        {/* Rows */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Rows3 className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Rows</p>
            <p className="font-medium text-slate-900">{formatNumber(fileStats.rowCount)}</p>
          </div>
        </div>

        {/* Columns */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Columns3 className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Columns</p>
            <p className="font-medium text-slate-900">{formatNumber(fileStats.columnCount)}</p>
          </div>
        </div>
      </div>

      {/* Actions section */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="h-10 w-10"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="h-10 w-10"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* Export buttons */}
        <Button
          variant="primary"
          size="default"
          onClick={handleExportCsv}
          title="Download as CSV"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
        <Button
          variant="secondary"
          size="default"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
          title="Download as Excel"
        >
          {isExportingExcel ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Excel
        </Button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Clear */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowClearConfirm(true)}
          className="h-10 w-10 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Clear all data"
          aria-label="Clear all data"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClear}
        title="Clear all data?"
        description="This will remove all your current data and you'll need to upload a new file. This action cannot be undone."
        confirmLabel="Clear data"
        cancelLabel="Keep editing"
        variant="danger"
      />
    </div>
  )
}
