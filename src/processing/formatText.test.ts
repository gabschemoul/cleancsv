import { describe, it, expect } from 'vitest'
import { toLowerCase, toUpperCase, toTitleCase, trimWhitespace } from './formatText'

describe('toLowerCase', () => {
  it('should convert text to lowercase', () => {
    const rows = [
      { name: 'JOHN DOE', email: 'TEST@EXAMPLE.COM' },
      { name: 'Jane Smith', email: 'jane@test.org' },
    ]

    const result = toLowerCase(rows, ['name'])

    expect(result.data[0].name).toBe('john doe')
    expect(result.data[1].name).toBe('jane smith')
    expect(result.data[0].email).toBe('TEST@EXAMPLE.COM') // unchanged
  })

  it('should count modified cells', () => {
    const rows = [
      { name: 'JOHN' },
      { name: 'jane' }, // already lowercase
    ]

    const result = toLowerCase(rows, ['name'])

    expect(result.modifiedCount).toBe(1)
  })

  it('should return correct message when no changes needed', () => {
    const rows = [{ name: 'john' }]

    const result = toLowerCase(rows, ['name'])

    expect(result.message).toBe('No changes needed')
  })
})

describe('toUpperCase', () => {
  it('should convert text to uppercase', () => {
    const rows = [{ name: 'john doe' }]

    const result = toUpperCase(rows, ['name'])

    expect(result.data[0].name).toBe('JOHN DOE')
  })

  it('should return correct message', () => {
    const rows = [{ name: 'john' }]

    const result = toUpperCase(rows, ['name'])

    expect(result.message).toBe('1 cell formatted to UPPERCASE')
  })
})

describe('toTitleCase', () => {
  it('should convert text to title case', () => {
    const rows = [
      { name: 'john doe' },
      { name: 'JANE SMITH' },
    ]

    const result = toTitleCase(rows, ['name'])

    expect(result.data[0].name).toBe('John Doe')
    expect(result.data[1].name).toBe('Jane Smith')
  })

  it('should handle single word', () => {
    const rows = [{ name: 'john' }]

    const result = toTitleCase(rows, ['name'])

    expect(result.data[0].name).toBe('John')
  })
})

describe('trimWhitespace', () => {
  it('should trim leading and trailing whitespace', () => {
    const rows = [{ name: '  john doe  ' }]

    const result = trimWhitespace(rows, ['name'])

    expect(result.data[0].name).toBe('john doe')
  })

  it('should collapse multiple spaces', () => {
    const rows = [{ name: 'john    doe' }]

    const result = trimWhitespace(rows, ['name'])

    expect(result.data[0].name).toBe('john doe')
  })

  it('should handle multiple columns', () => {
    const rows = [{ name: '  john  ', email: '  test@example.com  ' }]

    const result = trimWhitespace(rows, ['name', 'email'])

    expect(result.data[0].name).toBe('john')
    expect(result.data[0].email).toBe('test@example.com')
    expect(result.modifiedCount).toBe(2)
  })
})
