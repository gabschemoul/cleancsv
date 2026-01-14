import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCsvContext } from '@/hooks/useCsvContext'
import { parseFile, validateFile } from '@/processing/parseFile'
import { formatNumber } from '@/lib/utils'
import { FILE_CONFIG } from '@/config/constants'

export function DropZone() {
  const { setData, isLoaded } = useCsvContext()
  const [isLoading, setIsLoading] = useState(false)
  const processingRef = useRef(false)

  const handleFile = useCallback(
    async (file: File) => {
      // Prevent concurrent file processing
      if (processingRef.current) {
        return
      }

      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error('Invalid file', {
          description: validation.error,
        })
        return
      }

      processingRef.current = true
      setIsLoading(true)
      const startTime = performance.now()

      try {
        const result = await parseFile(file)

        if (result.rows.length === 0) {
          toast.error('Empty file', {
            description: 'The file contains no data rows.',
          })
          return
        }

        setData(result.rows, result.columns, file.name, file.size)

        const duration = ((performance.now() - startTime) / 1000).toFixed(1)
        toast.success('File loaded', {
          description: `${formatNumber(result.rows.length)} rows loaded in ${duration}s`,
        })

        if (result.errors.length > 0) {
          toast.warning('Parsing warnings', {
            description: `${result.errors.length} rows had issues and were skipped.`,
          })
        }
      } catch (error) {
        toast.error('Failed to parse file', {
          description:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })
      } finally {
        processingRef.current = false
        setIsLoading(false)
      }
    },
    [setData]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0])
      }
    },
    [handleFile]
  )

  const onDropRejected = useCallback(
    (rejections: { file: File; errors: readonly { code: string }[] }[]) => {
      const rejection = rejections[0]
      if (!rejection) return

      const errorCode = rejection.errors[0]?.code
      if (errorCode === 'file-invalid-type') {
        toast.error('Unsupported format', {
          description: `"${rejection.file.name}" is not a CSV file. Only .csv and .txt files are accepted.`,
        })
      } else if (errorCode === 'file-too-large') {
        toast.error('File too large', {
          description: `"${rejection.file.name}" exceeds the ${FILE_CONFIG.MAX_SIZE_MB}MB limit.`,
        })
      } else {
        toast.error('File rejected', {
          description: `"${rejection.file.name}" cannot be processed.`,
        })
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept } =
    useDropzone({
      onDrop,
      onDropRejected,
      accept: FILE_CONFIG.ACCEPTED_MIME_TYPES,
      maxFiles: 1,
      maxSize: FILE_CONFIG.MAX_SIZE_BYTES,
      disabled: isLoading,
    })

  if (isLoaded) {
    return null // Don't show dropzone when file is loaded
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all',
        'hover:border-emerald-500 hover:bg-emerald-50/50',
        isDragActive && 'border-emerald-500 bg-emerald-50',
        isDragAccept && 'border-emerald-600 bg-emerald-100',
        isLoading && 'cursor-wait opacity-75',
        !isDragActive && 'border-zinc-300 bg-zinc-50/50'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <>
            <div className="rounded-full bg-emerald-100 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900">
                Processing file...
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                This may take a few seconds for large files
              </p>
            </div>
          </>
        ) : isDragActive ? (
          <>
            <div className="rounded-full bg-emerald-100 p-4">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-emerald-700">
                Drop your file here
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-full bg-zinc-100 p-4">
              <Upload className="h-8 w-8 text-zinc-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900">
                Drag & drop your CSV file here
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                or click to browse (max 10MB)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Privacy message */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-700">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Your data never leaves your browser</span>
      </div>
    </div>
  )
}
