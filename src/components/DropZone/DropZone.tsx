import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-react'
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
        'relative cursor-pointer rounded-2xl border bg-white p-16 text-center transition-all duration-200',
        'hover:border-blue-400 hover:ring-4 hover:ring-blue-50',
        isDragActive && 'border-blue-500 ring-4 ring-blue-100 bg-blue-50/30',
        isDragAccept && 'border-blue-600 ring-4 ring-blue-100 bg-blue-50/50',
        isLoading && 'cursor-wait opacity-75',
        !isDragActive && 'border-slate-200 shadow-lg shadow-slate-100'
      )}
    >
      <input {...getInputProps()} aria-label="Upload CSV file" />

      <div className="flex flex-col items-center gap-5">
        {isLoading ? (
          <>
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-blue-50 p-5 shadow-inner">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900">
                Processing file...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                This may take a few seconds for large files
              </p>
            </div>
          </>
        ) : isDragActive ? (
          <>
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-blue-50 p-5 shadow-inner">
              <FileSpreadsheet className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-blue-700">
                Drop your file here
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-full bg-gradient-to-br from-slate-100 to-slate-50 p-5 shadow-inner">
              <UploadCloud className="h-10 w-10 text-slate-600" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900">
                Drag & drop your CSV file here
              </p>
              <p className="mt-2 text-slate-500">
                or <span className="text-blue-600 underline underline-offset-2">click to browse</span> (max 10MB)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Privacy message */}
      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Your data never leaves your browser
      </div>
    </div>
  )
}
