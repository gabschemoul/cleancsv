import { memo, useRef, useCallback, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCsvContext } from '@/hooks/useCsvContext'
import { cn } from '@/lib/utils'

interface DataTableProps {
  maxHeight?: string
}

const ROW_HEIGHT = 44
const ROW_NUMBER_WIDTH = 64
const COLUMN_WIDTH = 180

export const DataTable = memo(function DataTable({ maxHeight = '500px' }: DataTableProps) {
  const { data, columns, isLoaded, highlightedCells } = useCsvContext()
  const parentRef = useRef<HTMLDivElement>(null)

  const totalWidth = useMemo(() => {
    return ROW_NUMBER_WIDTH + columns.length * COLUMN_WIDTH
  }, [columns.length])

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
      className="overflow-auto rounded-2xl border border-slate-200 bg-white"
      style={{ maxHeight }}
      role="grid"
      aria-label="CSV data table"
      aria-rowcount={data.length + 1}
      tabIndex={0}
    >
      <div style={{ minWidth: totalWidth }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm"
          style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}
          role="row"
        >
          <div
            className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400"
            style={{ display: 'table-cell', width: ROW_NUMBER_WIDTH, verticalAlign: 'middle' }}
            role="columnheader"
            aria-label="Row number"
          >
            #
          </div>
          {columns.map((column) => (
            <div
              key={column}
              className="truncate px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600"
              style={{ display: 'table-cell', width: COLUMN_WIDTH, verticalAlign: 'middle' }}
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
            height: rowVirtualizer.getTotalSize(),
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
                  'border-b border-slate-100 text-sm transition-colors hover:bg-slate-50/50',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                )}
                style={{
                  display: 'table',
                  width: '100%',
                  tableLayout: 'fixed',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: ROW_HEIGHT,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="px-4 py-3 text-xs font-medium text-slate-400"
                  style={{ display: 'table-cell', width: ROW_NUMBER_WIDTH, verticalAlign: 'middle' }}
                  role="gridcell"
                >
                  {rowIndex + 1}
                </div>
                {columns.map((column) => {
                  const isHighlighted = isCellHighlighted(rowIndex, column)
                  return (
                    <div
                      key={`${rowIndex}-${column}`}
                      role="gridcell"
                      className={cn(
                        'truncate px-4 py-3',
                        isHighlighted ? 'bg-red-50 text-red-700' : 'text-slate-700'
                      )}
                      style={{ display: 'table-cell', width: COLUMN_WIDTH, verticalAlign: 'middle' }}
                      title={row[column] || undefined}
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
    </div>
  )
})
