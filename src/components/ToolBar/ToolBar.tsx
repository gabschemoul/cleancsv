import { useState, useEffect, useCallback, memo, useRef } from 'react'
import {
  Copy,
  Type,
  Mail,
  Scissors,
  ChevronDown,
  ArrowDownAZ,
  ArrowUpAZ,
  CaseSensitive,
  RemoveFormatting,
  Combine,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCsvContext } from '@/hooks/useCsvContext'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { MergeModal } from '@/components/MergeModal'
import { deduplicate } from '@/processing/deduplicate'
import {
  toLowerCase,
  toUpperCase,
  toTitleCase,
  trimWhitespace,
} from '@/processing/formatText'
import { removeInvalidEmails, validateEmails } from '@/processing/validateEmail'

export const ToolBar = memo(function ToolBar() {
  const { data, columns, isLoaded, updateData, setHighlightedCells } = useCsvContext()
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null)
    setFocusedIndex(-1)
  }, [])

  const handleDeduplicate = useCallback(() => {
    if (!selectedColumn) {
      toast.error('Select a column', {
        description: 'Choose which column to check for duplicates.',
      })
      return
    }

    const result = deduplicate(data, { column: selectedColumn })
    updateData(result.data)

    if (result.removedCount > 0) {
      toast.success('Duplicates removed', {
        description: result.message,
      })
    } else {
      toast.info('No duplicates', {
        description: result.message,
      })
    }
    setOpenDropdown(null)
  }, [data, selectedColumn, updateData])

  const handleFormat = useCallback((
    formatFn: (rows: typeof data, columns: string[]) => ReturnType<typeof toLowerCase>
  ) => {
    if (!selectedColumn) {
      toast.error('Select a column', {
        description: 'Choose which column to format.',
      })
      return
    }

    const result = formatFn(data, [selectedColumn])
    updateData(result.data)

    if (result.modifiedCount > 0) {
      toast.success('Formatting applied', {
        description: result.message,
      })
    } else {
      toast.info('No changes', {
        description: result.message,
      })
    }
    setOpenDropdown(null)
  }, [data, selectedColumn, updateData])

  const handleValidateEmails = useCallback(() => {
    if (!selectedColumn) {
      toast.error('Select a column', {
        description: 'Choose which column contains emails.',
      })
      return
    }

    const result = validateEmails(data, selectedColumn)

    if (result.invalidCount > 0) {
      const invalidIndices = new Set<number>()
      result.invalidReasons.forEach((_, index) => {
        invalidIndices.add(index)
      })
      setHighlightedCells({
        column: selectedColumn,
        rowIndices: invalidIndices,
        type: 'error',
      })

      toast.warning('Email validation complete', {
        description: `${result.validCount} valid, ${result.invalidCount} invalid emails found. Invalid emails are highlighted in red.`,
      })
    } else {
      setHighlightedCells(null)
      toast.success('All emails valid', {
        description: `${result.validCount} emails checked, all valid.`,
      })
    }
    setOpenDropdown(null)
  }, [data, selectedColumn, setHighlightedCells])

  const handleRemoveInvalidEmails = useCallback(() => {
    if (!selectedColumn) {
      toast.error('Select a column', {
        description: 'Choose which column contains emails.',
      })
      return
    }

    const result = removeInvalidEmails(data, selectedColumn)
    updateData(result.data)

    if (result.removedCount > 0) {
      toast.success('Invalid emails removed', {
        description: result.message,
      })
    } else {
      toast.info('No invalid emails', {
        description: result.message,
      })
    }
    setOpenDropdown(null)
  }, [data, selectedColumn, updateData])

  const toggleDropdown = useCallback((name: string) => {
    setOpenDropdown(prev => {
      const isOpening = prev !== name
      if (isOpening) {
        setFocusedIndex(0)
      } else {
        setFocusedIndex(-1)
      }
      return isOpening ? name : null
    })
  }, [])

  // Keyboard navigation for dropdowns
  useEffect(() => {
    if (!openDropdown) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]')
      if (!menuItems?.length) return

      const itemCount = menuItems.length

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          closeDropdown()
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev => (prev + 1) % itemCount)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount)
          break
        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setFocusedIndex(itemCount - 1)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0) {
            const item = menuItems[focusedIndex] as HTMLButtonElement
            item?.click()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openDropdown, focusedIndex, closeDropdown])

  // Focus the current menu item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && menuRef.current) {
      const menuItems = menuRef.current.querySelectorAll('[role="menuitem"]')
      const item = menuItems[focusedIndex] as HTMLButtonElement
      item?.focus()
    }
  }, [focusedIndex])

  if (!isLoaded) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50/80 p-4">
      {/* Column selector */}
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm">
        <span className="text-sm font-medium text-slate-500">Column</span>
        <Select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-44 border-0 bg-transparent font-medium text-slate-700"
        >
          <option value="">Select column</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </Select>
      </div>

      <div className="h-8 w-px bg-slate-200" />

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Deduplicate */}
        <Button
          variant="secondary"
          size="default"
          onClick={handleDeduplicate}
          disabled={!selectedColumn}
        >
          <Copy className="h-4 w-4" />
          Deduplicate
        </Button>

        {/* Format dropdown */}
        <div className="relative">
          <Button
            variant="secondary"
            size="default"
            onClick={() => toggleDropdown('format')}
            disabled={!selectedColumn}
            aria-expanded={openDropdown === 'format'}
            aria-haspopup="menu"
          >
            <Type className="h-4 w-4" />
            Format
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                openDropdown === 'format' && 'rotate-180'
              )}
            />
          </Button>

          {openDropdown === 'format' && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={closeDropdown}
              />
              <div
                ref={menuRef}
                className="absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg"
                role="menu"
                aria-label="Format options"
              >
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  onClick={() => handleFormat(toLowerCase)}
                  role="menuitem"
                >
                  <ArrowDownAZ className="h-4 w-4 text-slate-500" />
                  lowercase
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  onClick={() => handleFormat(toUpperCase)}
                  role="menuitem"
                >
                  <ArrowUpAZ className="h-4 w-4 text-slate-500" />
                  UPPERCASE
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  onClick={() => handleFormat(toTitleCase)}
                  role="menuitem"
                >
                  <CaseSensitive className="h-4 w-4 text-slate-500" />
                  Title Case
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  onClick={() => handleFormat(trimWhitespace)}
                  role="menuitem"
                >
                  <RemoveFormatting className="h-4 w-4 text-slate-500" />
                  Trim whitespace
                </button>
              </div>
            </>
          )}
        </div>

        {/* Email dropdown */}
        <div className="relative">
          <Button
            variant="secondary"
            size="default"
            onClick={() => toggleDropdown('email')}
            disabled={!selectedColumn}
            aria-expanded={openDropdown === 'email'}
            aria-haspopup="menu"
          >
            <Mail className="h-4 w-4" />
            Email
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                openDropdown === 'email' && 'rotate-180'
              )}
            />
          </Button>

          {openDropdown === 'email' && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={closeDropdown}
              />
              <div
                ref={menuRef}
                className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg"
                role="menu"
                aria-label="Email options"
              >
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  onClick={handleValidateEmails}
                  role="menuitem"
                >
                  <Mail className="h-4 w-4 text-slate-500" />
                  Validate emails
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-100 focus:outline-none"
                  onClick={handleRemoveInvalidEmails}
                  role="menuitem"
                >
                  <Scissors className="h-4 w-4" />
                  Remove invalid emails
                </button>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200" />

        {/* Merge button */}
        <Button
          variant="secondary"
          size="default"
          onClick={() => setIsMergeModalOpen(true)}
        >
          <Combine className="h-4 w-4" />
          Merge
        </Button>
      </div>

      {/* Merge Modal */}
      <MergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
      />
    </div>
  )
})
