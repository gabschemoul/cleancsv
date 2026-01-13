import { useEffect, useState } from 'react'
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
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    if (count === 0) {
      setDisplayCount(0)
      return
    }

    const duration = 400 // ms
    const steps = 20
    const increment = count / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= count) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
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
