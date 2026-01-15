import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, X, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils'
import { validateFile } from '@/processing/parseFile'
import { FILE_CONFIG } from '@/config/constants'

export interface PendingFile {
  file: File
  id: string
}

interface MergeDropZoneProps {
  pendingFiles: PendingFile[]
  onFilesAdded: (files: PendingFile[]) => void
  onFileRemove: (id: string) => void
}

export function MergeDropZone({
  pendingFiles,
  onFilesAdded,
  onFileRemove,
}: MergeDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles: PendingFile[] = []

      for (const file of acceptedFiles) {
        const validation = validateFile(file)
        if (!validation.valid) {
          toast.error(`Invalid file: ${file.name}`, {
            description: validation.error,
          })
          continue
        }
        validFiles.push({
          file,
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        })
      }

      if (validFiles.length > 0) {
        onFilesAdded(validFiles)
        toast.success(`${validFiles.length} file(s) added`, {
          description: 'Click "Merge" when ready.',
        })
      }
    },
    [onFilesAdded]
  )

  const onDropRejected = useCallback(
    (rejections: { file: File; errors: readonly { code: string }[] }[]) => {
      for (const rejection of rejections) {
        const errorCode = rejection.errors[0]?.code
        if (errorCode === 'file-invalid-type') {
          toast.error('Unsupported format', {
            description: `"${rejection.file.name}" is not a CSV file.`,
          })
        } else if (errorCode === 'file-too-large') {
          toast.error('File too large', {
            description: `"${rejection.file.name}" exceeds ${FILE_CONFIG.MAX_SIZE_MB}MB.`,
          })
        }
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept } =
    useDropzone({
      onDrop,
      onDropRejected,
      accept: FILE_CONFIG.ACCEPTED_MIME_TYPES,
      maxSize: FILE_CONFIG.MAX_SIZE_BYTES,
      multiple: true,
    })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:rounded-3xl sm:p-12 md:p-16',
          'bg-gradient-to-b from-slate-50/50 to-white',
          'hover:border-violet-300 hover:bg-gradient-to-b hover:from-violet-50/50 hover:to-white',
          'hover:shadow-lg hover:shadow-violet-100/50',
          isDragActive && 'border-violet-500 bg-gradient-to-b from-violet-50 to-white shadow-xl shadow-violet-100/50',
          isDragAccept && 'border-violet-500 bg-gradient-to-b from-violet-100/50 to-white shadow-xl shadow-violet-200/50',
          !isDragActive && !isDragAccept && 'border-slate-200'
        )}
      >
        <input {...getInputProps()} aria-label="Upload CSV files to merge" />

        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {isDragActive ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200 to-violet-100 shadow-inner sm:h-20 sm:w-20 sm:rounded-2xl">
                <FileSpreadsheet className="h-8 w-8 text-violet-600 sm:h-10 sm:w-10" />
              </div>
              <p className="text-xl font-semibold tracking-tight text-violet-600 sm:text-2xl">
                Drop your files here
              </p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 shadow-inner sm:h-20 sm:w-20 sm:rounded-2xl">
                <UploadCloud className="h-8 w-8 text-violet-600 sm:h-10 sm:w-10" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Drag & drop multiple CSV files
                </p>
                <p className="mt-2 text-base text-slate-500 sm:mt-3 sm:text-lg">
                  or{' '}
                  <button className="font-medium text-violet-600 underline underline-offset-4 hover:text-violet-700">
                    browse files
                  </button>{' '}
                  (select multiple)
                </p>
                <p className="mt-2 text-sm text-slate-400">CSV files up to 10MB each</p>
              </div>
            </>
          )}
        </div>

        {/* Privacy badge */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 sm:mt-10 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 sm:h-8 sm:w-8 sm:rounded-xl">
            <Shield className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs font-medium text-emerald-700 sm:text-sm">
            Your data never leaves your browser
          </span>
        </div>
      </div>

      {pendingFiles.length > 0 && (
        <div className="rounded-2xl bg-slate-50/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">
              Files to merge ({pendingFiles.length})
            </h3>
          </div>
          <ul className="space-y-3">
            {pendingFiles.map((pf, index) => (
              <li
                key={pf.id}
                className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm font-semibold text-violet-600">
                    {index + 1}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <FileSpreadsheet className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{pf.file.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatBytes(pf.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onFileRemove(pf.id)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${pf.file.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
