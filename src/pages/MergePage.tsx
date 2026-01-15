import { useState, useCallback } from 'react'
import { Loader2, Combine } from 'lucide-react'
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
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const mergeTool = TOOL_ROUTES.find((t) => t.path === ROUTES.MERGE)!
const faqs = FAQ_CONTENT[ROUTES.MERGE] || []

export function MergePage() {
  const { isLoaded, setData } = useCsvContext()
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isMerging, setIsMerging] = useState(false)

  const handleFilesAdded = useCallback((newFiles: PendingFile[]) => {
    setPendingFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((id: string) => {
    setPendingFiles((prev) => prev.filter((pf) => pf.id !== id))
  }, [])

  const handleMerge = useCallback(async () => {
    if (pendingFiles.length < 2) {
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
      const totalSize = pendingFiles.reduce((acc, pf) => acc + pf.file.size, 0)

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

      // Clear pending files
      setPendingFiles([])
    } catch (error) {
      toast.error('Merge failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsMerging(false)
    }
  }, [pendingFiles, setData])

  return (
    <ToolPageLayout>
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        {!isLoaded && (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
              {mergeTool.name}
            </h1>
            <p className="mb-6 text-zinc-600">{mergeTool.description}</p>

            <MergeDropZone
              pendingFiles={pendingFiles}
              onFilesAdded={handleFilesAdded}
              onFileRemove={handleFileRemove}
            />

            {pendingFiles.length >= 2 && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleMerge}
                  disabled={isMerging}
                  size="lg"
                  className="bg-[#CE47FF] hover:bg-[#b83de6] text-white px-8"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Combine className="mr-2 h-5 w-5" />
                      Merge {pendingFiles.length} files
                    </>
                  )}
                </Button>
              </div>
            )}

            {pendingFiles.length === 1 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Add at least one more file to merge
              </p>
            )}
          </>
        )}

        {isLoaded && (
          <div className="space-y-4">
            <FileInfo />
            <ToolBar />
            <DataTable />
          </div>
        )}
      </div>

      <FaqSection faqs={faqs} />
    </ToolPageLayout>
  )
}
