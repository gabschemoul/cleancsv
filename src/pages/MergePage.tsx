import { useState, useCallback } from 'react'
import { Loader2, Combine, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { useCsvContext } from '@/hooks/useCsvContext'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { MergeDropZone, type PendingFile } from '@/components/MergeDropZone'
import { DataTable } from '@/components/DataTable'
import { FileInfo } from '@/components/FileInfo'
import { ToolBar } from '@/components/ToolBar'
import { FaqSection } from '@/components/FaqSection'
import { FAQ_CONTENT } from '@/config/faq'
import { ROUTES, TOOL_ROUTES } from '@/config/routes'
import { parseFile } from '@/processing/parseFile'
import { mergeFiles, type FileData } from '@/processing/mergeFiles'
import { formatNumber, formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const mergeTool = TOOL_ROUTES.find((t) => t.path === ROUTES.MERGE)!
const faqs = FAQ_CONTENT[ROUTES.MERGE] || []

export function MergePage() {
  const { data, columns, filename, fileStats, isLoaded, setData } = useCsvContext()
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [showMergeMode, setShowMergeMode] = useState(false)

  const handleFilesAdded = useCallback((newFiles: PendingFile[]) => {
    setPendingFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== id))
  }, [])

  // Calculate how many files will be merged (current + pending)
  const totalFilesToMerge = (isLoaded ? 1 : 0) + pendingFiles.length
  const canMerge = totalFilesToMerge >= 2

  const handleMerge = useCallback(async () => {
    if (!canMerge) {
      toast.error('Need at least 2 files', {
        description: 'Add more CSV files to merge.',
      })
      return
    }

    setIsMerging(true)
    const startTime = performance.now()

    try {
      // Parse all files
      const parsedFiles: FileData[] = []

      // Include currently loaded file if exists
      if (isLoaded && data.length > 0) {
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

      // Calculate total size for stats
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

      // Clear pending files and exit merge mode
      setPendingFiles([])
      setShowMergeMode(false)
    } catch (error) {
      toast.error('Merge failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsMerging(false)
    }
  }, [canMerge, isLoaded, data, columns, filename, fileStats, pendingFiles, setData])

  return (
    <ToolPageLayout>
      {/* No file loaded - show merge dropzone */}
      {!isLoaded && (
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:rounded-3xl sm:p-10">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {mergeTool.name}
            </h1>
            <p className="mt-3 text-lg text-slate-600">{mergeTool.description}</p>
          </div>

          <MergeDropZone
            pendingFiles={pendingFiles}
            onFilesAdded={handleFilesAdded}
            onFileRemove={handleFileRemove}
          />

          {pendingFiles.length >= 2 && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleMerge}
                disabled={isMerging}
                variant="primary"
                size="lg"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Combine className="h-5 w-5" />
                    Merge {pendingFiles.length} files
                  </>
                )}
              </Button>
            </div>
          )}

          {pendingFiles.length === 1 && (
            <p className="mt-6 text-center text-slate-500">
              Add at least one more file to merge
            </p>
          )}
        </div>
      )}

      {/* File loaded - show data with merge option */}
      {isLoaded && !showMergeMode && (
        <div className="rounded-2xl bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:rounded-3xl sm:p-10">
          <div className="space-y-6">
            <FileInfo />

            {/* Merge button */}
            <div className="flex justify-center border-t border-slate-100 pt-6">
              <Button
                onClick={() => setShowMergeMode(true)}
                variant="secondary"
                size="lg"
              >
                <Combine className="h-5 w-5" />
                Merge with other files
              </Button>
            </div>

            <ToolBar />
            <DataTable />
          </div>
        </div>
      )}

      {/* File loaded + merge mode - show current file and add more */}
      {isLoaded && showMergeMode && (
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-card sm:rounded-3xl sm:p-10">
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Merge CSV Files
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Add more files to merge with your current data
              </p>
            </div>

            {/* Current file indicator */}
            <div className="mb-6 rounded-2xl bg-violet-50 p-5">
              <p className="mb-3 text-sm font-medium text-violet-600">Current file (will be included)</p>
              <div className="flex items-center gap-4">
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

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => {
                  setShowMergeMode(false)
                  setPendingFiles([])
                }}
                variant="secondary"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMerge}
                disabled={isMerging || !canMerge}
                variant="primary"
                size="lg"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Combine className="h-5 w-5" />
                    Merge {totalFilesToMerge} files
                  </>
                )}
              </Button>
            </div>

            {pendingFiles.length === 0 && (
              <p className="mt-6 text-center text-slate-500">
                Add at least one more file to merge with your current data
              </p>
            )}
          </div>
        </div>
      )}

      <FaqSection faqs={faqs} />
    </ToolPageLayout>
  )
}
