import { createContext } from 'react'
import type { CsvRow, FileStats } from '@/types/csv.types'

interface HighlightedCells {
  column: string
  rowIndices: Set<number>
  type: 'error' | 'warning'
}

export interface CsvContextType {
  // Current state
  data: CsvRow[]
  columns: string[]
  filename: string
  isLoaded: boolean
  fileStats: FileStats | null

  // Highlighting for validation feedback
  highlightedCells: HighlightedCells | null
  setHighlightedCells: (cells: HighlightedCells | null) => void

  // Actions
  setData: (rows: CsvRow[], columns: string[], filename: string, fileSize?: number) => void
  updateData: (rows: CsvRow[]) => void
  clearData: () => void

  // History (for undo)
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

export const CsvContext = createContext<CsvContextType | null>(null)
