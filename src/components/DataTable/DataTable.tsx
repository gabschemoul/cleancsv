import { useCsvContext } from '@/context/CsvContext'
import { cn } from '@/lib/utils'

interface DataTableProps {
  maxHeight?: string
}

export function DataTable({ maxHeight = '500px' }: DataTableProps) {
  const { data, columns, isLoaded, highlightedCells } = useCsvContext()

  const isCellHighlighted = (rowIndex: number, column: string) => {
    if (!highlightedCells) return false
    return highlightedCells.column === column && highlightedCells.rowIndices.has(rowIndex)
  }

  if (!isLoaded) {
    return null
  }

  return (
    <div
      className="overflow-auto rounded-lg border border-zinc-200 pb-2"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-100">
          <tr>
            <th className="w-12 border-b border-zinc-200 bg-zinc-100 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              #
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="max-w-xs border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700"
                title={column}
              >
                <span className="block truncate">{column}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'transition-colors hover:bg-zinc-50',
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'
              )}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
