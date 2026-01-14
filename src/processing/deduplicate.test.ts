import { describe, it, expect } from 'vitest'
import { deduplicate } from './deduplicate'

describe('deduplicate', () => {
  it('should remove duplicate rows based on column value', () => {
    const rows = [
      { email: 'test@example.com', name: 'John' },
      { email: 'test@example.com', name: 'Jane' },
      { email: 'other@example.com', name: 'Bob' },
    ]

    const result = deduplicate(rows, { column: 'email' })

    expect(result.data).toHaveLength(2)
    expect(result.removedCount).toBe(1)
    expect(result.data[0].name).toBe('John')
    expect(result.data[1].name).toBe('Bob')
  })

  it('should be case-insensitive by default', () => {
    const rows = [
      { email: 'Test@Example.com', name: 'John' },
      { email: 'test@example.com', name: 'Jane' },
    ]

    const result = deduplicate(rows, { column: 'email' })

    expect(result.data).toHaveLength(1)
    expect(result.removedCount).toBe(1)
  })

  it('should respect caseSensitive option', () => {
    const rows = [
      { email: 'Test@Example.com', name: 'John' },
      { email: 'test@example.com', name: 'Jane' },
    ]

    const result = deduplicate(rows, { column: 'email', caseSensitive: true })

    expect(result.data).toHaveLength(2)
    expect(result.removedCount).toBe(0)
  })

  it('should handle empty rows', () => {
    const result = deduplicate([], { column: 'email' })

    expect(result.data).toHaveLength(0)
    expect(result.removedCount).toBe(0)
    expect(result.message).toBe('No duplicates found')
  })

  it('should handle missing column values', () => {
    const rows = [
      { email: 'test@example.com', name: 'John' },
      { email: '', name: 'Jane' },
      { email: '', name: 'Bob' },
    ]

    const result = deduplicate(rows, { column: 'email' })

    expect(result.data).toHaveLength(2)
    expect(result.removedCount).toBe(1)
  })

  it('should generate correct message for multiple duplicates', () => {
    const rows = [
      { email: 'test@example.com' },
      { email: 'test@example.com' },
      { email: 'test@example.com' },
    ]

    const result = deduplicate(rows, { column: 'email' })

    expect(result.message).toBe('2 duplicates removed')
  })

  it('should generate correct message for single duplicate', () => {
    const rows = [
      { email: 'test@example.com' },
      { email: 'test@example.com' },
    ]

    const result = deduplicate(rows, { column: 'email' })

    expect(result.message).toBe('1 duplicate removed')
  })
})
