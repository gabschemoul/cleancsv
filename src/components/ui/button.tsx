import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          // Variants
          variant === 'default' &&
            'bg-slate-900 text-white hover:bg-slate-800',
          variant === 'primary' &&
            'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 hover:from-violet-500 hover:to-violet-600',
          variant === 'secondary' &&
            'bg-slate-100 text-slate-900 hover:bg-slate-200',
          variant === 'outline' &&
            'border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900',
          variant === 'ghost' && 'hover:bg-slate-100 hover:text-slate-900',
          variant === 'destructive' &&
            'bg-red-500 text-white hover:bg-red-600',
          // Sizes
          size === 'default' && 'h-11 px-5 py-2.5',
          size === 'sm' && 'h-10 rounded-xl px-4',
          size === 'lg' && 'h-12 rounded-xl px-6 text-base',
          size === 'icon' && 'h-11 w-11',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
