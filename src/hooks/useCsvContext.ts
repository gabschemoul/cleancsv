import { useContext } from 'react'
import { CsvContext } from '@/context/csvContextValue'

export function useCsvContext() {
  const context = useContext(CsvContext)
  if (!context) {
    throw new Error('useCsvContext must be used within a CsvProvider')
  }
  return context
}
