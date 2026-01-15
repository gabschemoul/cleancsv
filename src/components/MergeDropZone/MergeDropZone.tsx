import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react'
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-2xl border bg-white p-12 text-center transition-all duration-200',
          'hover:border-[#CE47FF]/50 hover:ring-4 hover:ring-[#CE47FF]/10',
          isDragActive && 'border-[#CE47FF] ring-4 ring-[#CE47FF]/20 bg-[#CE47FF]/5',
          isDragAccept && 'border-[#CE47FF] ring-4 ring-[#CE47FF]/20 bg-[#CE47FF]/10',
          !isDragActive && 'border-slate-200 shadow-lg shadow-slate-100'
        )}
      >
        <input {...getInputProps()} aria-label="Upload CSV files to merge" />

        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <>
              <div className="rounded-full bg-gradient-to-br from-[#CE47FF]/20 to-[#CE47FF]/10 p-5 shadow-inner">
                <FileSpreadsheet className="h-10 w-10 text-[#CE47FF]" />
              </div>
              <p className="text-xl font-semibold tracking-tight text-[#CE47FF]">
                Drop your files here
              </p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-gradient-to-br from-slate-100 to-slate-50 p-5 shadow-inner">
                <UploadCloud className="h-10 w-10 text-slate-600" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-slate-900">
                  Drag & drop multiple CSV files
                </p>
                <p className="mt-2 text-slate-500">
                  or{' '}
                  <span className="text-[#CE47FF] underline underline-offset-2">
                    click to browse
                  </span>{' '}
                  (select multiple files)
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Your data never leaves your browser
        </div>
      </div>

      {pendingFiles.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-slate-900">
              Files to merge ({pendingFiles.length})
            </h3>
          </div>
          <ul className="space-y-2">
            {pendingFiles.map((pf, index) => (
              <li
                key={pf.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{pf.file.name}</span>
                  <span className="text-sm text-slate-400">
                    {formatBytes(pf.file.size)}
                  </span>
                </div>
                <button
                  onClick={() => onFileRemove(pf.id)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500"
                  aria-label={`Remove ${pf.file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
