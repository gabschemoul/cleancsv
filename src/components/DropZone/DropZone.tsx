import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, Loader2, Shield } from 'lucide-react'
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
        'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:rounded-3xl sm:p-16 md:p-20',
        'bg-gradient-to-b from-slate-50/50 to-white',
        'hover:border-violet-300 hover:bg-gradient-to-b hover:from-violet-50/50 hover:to-white',
        'hover:shadow-lg hover:shadow-violet-100/50',
        isDragActive && 'border-violet-500 bg-gradient-to-b from-violet-50 to-white shadow-xl shadow-violet-100/50',
        isDragAccept && 'border-violet-500 bg-gradient-to-b from-violet-100/50 to-white shadow-xl shadow-violet-200/50',
        isLoading && 'cursor-wait opacity-75',
        !isDragActive && !isDragAccept && 'border-slate-200'
      )}
    >
      <input {...getInputProps()} aria-label="Upload CSV file" />

      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {isLoading ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 shadow-inner sm:h-20 sm:w-20 sm:rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600 sm:h-10 sm:w-10" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Processing file...
              </p>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-lg">
                This may take a few seconds for large files
              </p>
            </div>
          </>
        ) : isDragActive ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200 to-violet-100 shadow-inner sm:h-20 sm:w-20 sm:rounded-2xl">
              <FileSpreadsheet className="h-8 w-8 text-violet-600 sm:h-10 sm:w-10" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-violet-600 sm:text-2xl">
                Drop your file here
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 shadow-inner sm:h-20 sm:w-20 sm:rounded-2xl">
              <UploadCloud className="h-8 w-8 text-violet-600 sm:h-10 sm:w-10" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Drag & drop your CSV file
              </p>
              <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-lg">
                or{' '}
                <button className="font-medium text-violet-600 underline underline-offset-4 hover:text-violet-700">
                  browse files
                </button>
              </p>
              <p className="mt-2 text-sm text-slate-400">CSV files up to 10MB</p>
            </div>
          </>
        )}
      </div>

      {/* Privacy badge - redesigned */}
      <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 sm:mt-10 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 sm:h-8 sm:w-8 sm:rounded-xl">
          <Shield className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />
        </div>
        <span className="text-xs font-medium text-emerald-700 sm:text-sm">
          Your data never leaves your browser
        </span>
      </div>
    </div>
  )
}
