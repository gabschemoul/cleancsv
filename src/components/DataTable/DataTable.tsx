import { memo, useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCsvContext } from '@/hooks/useCsvContext'
import { cn } from '@/lib/utils'

interface DataTableProps {
  maxHeight?: string
}

const ROW_HEIGHT = 41 // Height of each row in pixels

export const DataTable = memo(function DataTable({ maxHeight = '500px' }: DataTableProps) {
  const { data, columns, isLoaded, highlightedCells } = useCsvContext()
  const parentRef = useRef<HTMLDivElement>(null)

  const isCellHighlighted = useCallback((rowIndex: number, column: string) => {
    if (!highlightedCells) return false
    return highlightedCells.column === column && highlightedCells.rowIndices.has(rowIndex)
  }, [highlightedCells])

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  if (!isLoaded) {
    return null
  }

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-lg border border-slate-200"
      style={{ maxHeight }}
      role="grid"
      aria-label="CSV data table"
      aria-rowcount={data.length + 1}
      tabIndex={0}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 grid border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-wider"
        style={{ gridTemplateColumns: `60px repeat(${columns.length}, minmax(120px, 1fr))` }}
        role="row"
      >
        <div className="px-3 py-3 text-slate-500" role="columnheader" aria-label="Row number">
          #
        </div>
        {columns.map((column) => (
          <div
            key={column}
            className="truncate px-4 py-3 text-slate-700"
            title={column}
            role="columnheader"
          >
            {column}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowIndex = virtualRow.index
          const row = data[rowIndex]
          return (
            <div
              key={rowIndex}
              role="row"
              aria-rowindex={rowIndex + 2}
              className={cn(
                'grid border-b border-slate-100 text-sm transition-colors hover:bg-slate-50',
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
              )}
              style={{
                gridTemplateColumns: `60px repeat(${columns.length}, minmax(120px, 1fr))`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="px-3 py-2 text-xs text-slate-400" role="gridcell">
                {rowIndex + 1}
              </div>
              {columns.map((column) => {
                const isHighlighted = isCellHighlighted(rowIndex, column)
                return (
                  <div
                    key={`${rowIndex}-${column}`}
                    role="gridcell"
                    className={cn(
                      'truncate px-4 py-2',
                      isHighlighted
                        ? 'bg-red-50 text-red-700'
                        : 'text-slate-700'
                    )}
                    title={row[column]}
                  >
                    {row[column] || (
                      <span className={isHighlighted ? 'text-red-300' : 'text-slate-300'}>-</span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
})
