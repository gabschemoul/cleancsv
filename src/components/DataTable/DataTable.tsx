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
      className="overflow-auto rounded-lg border border-zinc-200"
      style={{ maxHeight }}
      role="region"
      aria-label="CSV data table"
      tabIndex={0}
    >
      <table className="w-full border-collapse text-sm" role="grid" aria-rowcount={data.length + 1}>
        <thead className="sticky top-0 z-10 bg-zinc-100">
          <tr role="row">
            <th
              className="w-12 border-b border-zinc-200 bg-zinc-100 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
              scope="col"
              aria-label="Row number"
            >
              #
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="max-w-xs border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700"
                title={column}
                scope="col"
              >
                <span className="block truncate">{column}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const rowIndex = virtualRow.index
            const row = data[rowIndex]
            return (
              <tr
                key={rowIndex}
                role="row"
                aria-rowindex={rowIndex + 2}
                className={cn(
                  'transition-colors hover:bg-zinc-50',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'table-row',
                }}
              >
                <td className="border-b border-zinc-100 px-3 py-2 text-xs text-zinc-400">
                  {rowIndex + 1}
                </td>
                {columns.map((column) => {
                  const isHighlighted = isCellHighlighted(rowIndex, column)
                  return (
                    <td
                      key={`${rowIndex}-${column}`}
                      className={cn(
                        'border-b border-zinc-100 px-4 py-2',
                        isHighlighted
                          ? 'bg-red-50 text-red-700'
                          : 'text-zinc-700'
                      )}
                    >
                      <span className="block max-w-xs truncate" title={row[column]}>
                        {row[column] || (
                          <span className={isHighlighted ? 'text-red-300' : 'text-zinc-300'}>-</span>
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
})
