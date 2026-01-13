import {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { CsvRow, FileStats } from '@/types/csv.types'

interface CsvState {
  data: CsvRow[]
  columns: string[]
  filename: string
  fileSize: number
}

interface HighlightedCells {
  column: string
  rowIndices: Set<number>
  type: 'error' | 'warning'
}

interface CsvContextType {
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

const CsvContext = createContext<CsvContextType | null>(null)

const MAX_HISTORY = 10

const EMPTY_STATE: CsvState = {
  data: [],
  columns: [],
  filename: '',
  fileSize: 0,
}

// Combined state for reducer
interface ReducerState {
  current: CsvState
  history: CsvState[]
  historyIndex: number
}

type Action =
  | { type: 'SET_DATA'; payload: CsvState }
  | { type: 'UPDATE_DATA'; payload: CsvRow[] }
  | { type: 'CLEAR' }
  | { type: 'UNDO' }
  | { type: 'REDO' }

function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case 'SET_DATA': {
      return {
        current: action.payload,
        history: [action.payload],
        historyIndex: 0,
      }
    }

    case 'UPDATE_DATA': {
      const newState: CsvState = { ...state.current, data: action.payload }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newState)

      // Keep only last MAX_HISTORY states
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift()
        return {
          current: newState,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        }
      }

      return {
        current: newState,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      }
    }

    case 'CLEAR': {
      return {
        current: EMPTY_STATE,
        history: [],
        historyIndex: -1,
      }
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1
        return {
          ...state,
          current: state.history[newIndex],
          historyIndex: newIndex,
        }
      }
      return state
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1
        return {
          ...state,
          current: state.history[newIndex],
          historyIndex: newIndex,
        }
      }
      return state
    }

    default:
      return state
  }
}

interface CsvProviderProps {
  children: ReactNode
}

export function CsvProvider({ children }: CsvProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    current: EMPTY_STATE,
    history: [],
    historyIndex: -1,
  })

  const [highlightedCells, setHighlightedCells] = useState<HighlightedCells | null>(null)

  const { current, historyIndex, history } = state

  const isLoaded = current.data.length > 0

  const fileStats: FileStats | null = isLoaded
    ? {
        filename: current.filename,
        rowCount: current.data.length,
        columnCount: current.columns.length,
        columns: current.columns,
        fileSize: current.fileSize,
      }
    : null

  const setData = useCallback(
    (rows: CsvRow[], columns: string[], filename: string, fileSize = 0) => {
      dispatch({
        type: 'SET_DATA',
        payload: { data: rows, columns, filename, fileSize },
      })
    },
    []
  )

  const updateData = useCallback((rows: CsvRow[]) => {
    dispatch({ type: 'UPDATE_DATA', payload: rows })
    setHighlightedCells(null)
  }, [])

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    setHighlightedCells(null)
  }, [])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  return (
    <CsvContext.Provider
      value={{
        data: current.data,
        columns: current.columns,
        filename: current.filename,
        isLoaded,
        fileStats,
        highlightedCells,
        setHighlightedCells,
        setData,
        updateData,
        clearData,
        canUndo,
        canRedo,
        undo,
        redo,
      }}
    >
      {children}
    </CsvContext.Provider>
  )
}

export function useCsvContext() {
  const context = useContext(CsvContext)
  if (!context) {
    throw new Error('useCsvContext must be used within a CsvProvider')
  }
  return context
}
