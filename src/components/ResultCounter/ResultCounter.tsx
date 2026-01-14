import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ResultCounterProps {
  count: number
  label: string
  variant?: 'success' | 'warning' | 'info'
  className?: string
}

export function ResultCounter({
  count,
  label,
  variant = 'success',
  className,
}: ResultCounterProps) {
  const [displayCount, setDisplayCount] = useState(count)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // For zero, show immediately - no animation needed
    if (count === 0) {
      // eslint-disable-next-line -- Intentional: reset counter immediately when count is cleared
      setDisplayCount(0)
      return
    }

    // Animate from 0 to count
    const duration = 400 // ms
    const steps = 20
    const increment = count / steps
    const stepDuration = duration / steps

    let current = 0
    timerRef.current = setInterval(() => {
      current += increment
      if (current >= count) {
        setDisplayCount(count)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, stepDuration)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [count])

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
        variant === 'success' && 'bg-emerald-50 text-emerald-700',
        variant === 'warning' && 'bg-amber-50 text-amber-700',
        variant === 'info' && 'bg-blue-50 text-blue-700',
        className
      )}
    >
      <span className="text-lg font-bold tabular-nums">
        {displayCount.toLocaleString('fr-FR')}
      </span>
      <span>{label}</span>
    </div>
  )
}
