import { useState } from 'react'
import { Shield, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyBadgeProps {
  variant?: 'compact' | 'expanded'
}

export function PrivacyBadge({ variant = 'compact' }: PrivacyBadgeProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (variant === 'expanded') {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">
            Your data never leaves your browser
          </span>
        </div>
        <p className="mt-2 text-sm text-emerald-700">
          All processing happens locally on your device. We never upload,
          store, or access your files.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
          'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        )}
      >
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">100% Private</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            showDetails && 'rotate-180'
          )}
        />
      </button>

      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Privacy Guarantee</span>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm text-zinc-600">
              <p>
                <strong className="text-zinc-700">
                  Your data never leaves your browser.
                </strong>{' '}
                All CSV processing happens 100% locally using JavaScript.
              </p>

              <div className="rounded bg-zinc-50 p-3">
                <p className="font-medium text-zinc-700">What this means:</p>
                <ul className="mt-2 space-y-1 text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    No file uploads to any server
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    No data stored in cookies or databases
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    GDPR compliant by design
                  </li>
                </ul>
              </div>

              <p className="text-xs text-zinc-500">
                Verify yourself: Open DevTools (F12) → Network tab. You'll see
                zero outbound requests with your data.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
