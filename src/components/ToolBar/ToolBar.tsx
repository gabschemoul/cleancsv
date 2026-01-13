import { useState } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCsvContext } from '@/context/CsvContext'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { deduplicate } from '@/processing/deduplicate'
import {
  toLowerCase,
  toUpperCase,
  toTitleCase,
  trimWhitespace,
} from '@/processing/formatText'
import { removeInvalidEmails, validateEmails } from '@/processing/validateEmail'

export function ToolBar() {
  const { data, columns, isLoaded, updateData, setHighlightedCells } = useCsvContext()
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  if (!isLoaded) {
    return null
  }

  const handleDeduplicate = () => {
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
  }

  const handleFormat = (
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
  }

  const handleValidateEmails = () => {
    if (!selectedColumn) {
      toast.error('Select a column', {
        description: 'Choose which column contains emails.',
      })
      return
    }

    const result = validateEmails(data, selectedColumn)

    if (result.invalidCount > 0) {
      // Highlight invalid email cells
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
  }

  const handleRemoveInvalidEmails = () => {
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
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
      {/* Column selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Column:</span>
        <Select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-40"
        >
          <option value="">Select column</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </Select>
      </div>

      <div className="h-6 w-px bg-zinc-200" />

      {/* Deduplicate */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDeduplicate}
        disabled={!selectedColumn}
      >
        <Copy className="h-4 w-4" />
        Deduplicate
      </Button>

      {/* Format dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('format')}
          disabled={!selectedColumn}
        >
          <Type className="h-4 w-4" />
          Format
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform',
              openDropdown === 'format' && 'rotate-180'
            )}
          />
        </Button>

        {openDropdown === 'format' && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => handleFormat(toLowerCase)}
              >
                <ArrowDownAZ className="h-4 w-4" />
                lowercase
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => handleFormat(toUpperCase)}
              >
                <ArrowUpAZ className="h-4 w-4" />
                UPPERCASE
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => handleFormat(toTitleCase)}
              >
                <CaseSensitive className="h-4 w-4" />
                Title Case
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={() => handleFormat(trimWhitespace)}
              >
                <RemoveFormatting className="h-4 w-4" />
                Trim whitespace
              </button>
            </div>
          </>
        )}
      </div>

      {/* Email dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleDropdown('email')}
          disabled={!selectedColumn}
        >
          <Mail className="h-4 w-4" />
          Email
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform',
              openDropdown === 'email' && 'rotate-180'
            )}
          />
        </Button>

        {openDropdown === 'email' && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                onClick={handleValidateEmails}
              >
                <Mail className="h-4 w-4" />
                Validate emails
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleRemoveInvalidEmails}
              >
                <Scissors className="h-4 w-4" />
                Remove invalid emails
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
