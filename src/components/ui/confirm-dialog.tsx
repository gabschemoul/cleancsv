import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus the confirm button when dialog opens
    confirmButtonRef.current?.focus()

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative z-10 w-full max-w-md"
      >
        <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                variant === 'danger'
                  ? 'bg-red-100'
                  : 'bg-amber-100'
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  variant === 'danger' ? 'text-red-600' : 'text-amber-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h2
                id="confirm-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h2>
              <p
                id="confirm-description"
                className="mt-2 text-sm leading-relaxed text-slate-600"
              >
                {description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 bg-slate-50 px-6 py-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              ref={confirmButtonRef}
              variant={variant === 'danger' ? 'destructive' : 'default'}
              className="flex-1"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
