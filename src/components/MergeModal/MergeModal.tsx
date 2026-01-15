import { useState, useCallback } from 'react'
import { X, Combine, Loader2, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { useCsvContext } from '@/hooks/useCsvContext'
import { MergeDropZone, type PendingFile } from '@/components/MergeDropZone'
import { Button } from '@/components/ui/button'
import { parseFile } from '@/processing/parseFile'
import { mergeFiles, type FileData } from '@/processing/mergeFiles'
import { formatNumber, formatBytes } from '@/lib/utils'

interface MergeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MergeModal({ isOpen, onClose }: MergeModalProps) {
  const { data, columns, filename, fileStats, setData } = useCsvContext()
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isMerging, setIsMerging] = useState(false)

  const handleFilesAdded = useCallback((newFiles: PendingFile[]) => {
    setPendingFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== id))
  }, [])

  const canMerge = pendingFiles.length >= 1

  const handleMerge = useCallback(async () => {
    if (!canMerge) {
      toast.error('Add at least one file', {
        description: 'Add CSV files to merge with your current data.',
      })
      return
    }

    setIsMerging(true)
    const startTime = performance.now()

    try {
      const parsedFiles: FileData[] = []

      // Include currently loaded file
      if (data.length > 0) {
        parsedFiles.push({
          rows: data,
          columns: columns,
          filename: filename || 'current.csv',
        })
      }

      // Parse pending files
      for (const pf of pendingFiles) {
        const result = await parseFile(pf.file)
        if (result.rows.length === 0) {
          toast.warning(`Skipped empty file: ${pf.file.name}`)
          continue
        }
        parsedFiles.push({
          rows: result.rows,
          columns: result.columns,
          filename: pf.file.name,
        })
      }

      if (parsedFiles.length < 2) {
        toast.error('Not enough valid files', {
          description: 'At least 2 files with data are required.',
        })
        return
      }

      // Merge files
      const mergeResult = mergeFiles(parsedFiles)

      // Calculate total size
      const pendingSize = pendingFiles.reduce((acc, pf) => acc + pf.file.size, 0)
      const totalSize = (fileStats?.fileSize || 0) + pendingSize

      setData(
        mergeResult.data,
        mergeResult.columns,
        `merged_${parsedFiles.length}_files.csv`,
        totalSize
      )

      const duration = ((performance.now() - startTime) / 1000).toFixed(1)
      toast.success('Files merged successfully', {
        description: `${mergeResult.fileCount} files, ${formatNumber(mergeResult.newCount)} total rows in ${duration}s`,
      })

      // Clear and close
      setPendingFiles([])
      onClose()
    } catch (error) {
      toast.error('Merge failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsMerging(false)
    }
  }, [canMerge, data, columns, filename, fileStats, pendingFiles, setData, onClose])

  const handleClose = () => {
    setPendingFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Merge CSV Files
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Current file */}
            <div className="mb-6 rounded-xl bg-violet-50 p-4">
              <p className="mb-2 text-sm font-medium text-violet-600">
                Current file (will be included)
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <FileSpreadsheet className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{filename}</p>
                  <p className="text-sm text-slate-500">
                    {formatNumber(fileStats?.rowCount || 0)} rows • {formatBytes(fileStats?.fileSize || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Add more files */}
            <MergeDropZone
              pendingFiles={pendingFiles}
              onFilesAdded={handleFilesAdded}
              onFileRemove={handleFileRemove}
            />

            {pendingFiles.length === 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Add at least one file to merge with your current data
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleMerge}
              disabled={isMerging || !canMerge}
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Combine className="h-4 w-4" />
                  Merge {1 + pendingFiles.length} files
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
