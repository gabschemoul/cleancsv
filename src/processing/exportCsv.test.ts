import { describe, it, expect } from 'vitest'
import { exportToCsv } from './exportCsv'

describe('exportToCsv', () => {
  it('should create valid CSV blob', () => {
    const rows = [
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' },
    ]
    const columns = ['name', 'email']

    const blob = exportToCsv(rows, columns)

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/csv;charset=utf-8')
  })

  it('should include BOM for Excel compatibility', async () => {
    const rows = [{ name: 'John' }]
    const columns = ['name']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text.charCodeAt(0)).toBe(0xfeff) // BOM
  })

  it('should create header row', async () => {
    const rows = [{ name: 'John', email: 'john@example.com' }]
    const columns = ['name', 'email']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()
    const lines = text.split('\n')

    expect(lines[0]).toBe('\ufeffname,email')
  })

  it('should quote values containing commas', async () => {
    const rows = [{ name: 'Doe, John' }]
    const columns = ['name']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain('"Doe, John"')
  })

  it('should escape double quotes', async () => {
    const rows = [{ name: 'John "Johnny" Doe' }]
    const columns = ['name']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain('"John ""Johnny"" Doe"')
  })

  it('should quote values containing newlines', async () => {
    const rows = [{ address: 'Line 1\nLine 2' }]
    const columns = ['address']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain('"Line 1\nLine 2"')
  })

  it('should prevent formula injection with = prefix', async () => {
    const rows = [{ formula: '=SUM(A1:A10)' }]
    const columns = ['formula']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain("\"'=SUM(A1:A10)\"")
  })

  it('should prevent formula injection with + prefix', async () => {
    const rows = [{ formula: '+1234567890' }]
    const columns = ['formula']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain("\"'+1234567890\"")
  })

  it('should prevent formula injection with - prefix', async () => {
    const rows = [{ formula: '-1234567890' }]
    const columns = ['formula']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain("\"'-1234567890\"")
  })

  it('should prevent formula injection with @ prefix', async () => {
    const rows = [{ mention: '@username' }]
    const columns = ['mention']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()

    expect(text).toContain("\"'@username\"")
  })

  it('should handle empty values', async () => {
    const rows = [{ name: '', email: 'test@example.com' }]
    const columns = ['name', 'email']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()
    const lines = text.split('\n')

    expect(lines[1]).toBe(',test@example.com')
  })

  it('should handle undefined values', async () => {
    const rows = [{ email: 'test@example.com' }] // name is missing
    const columns = ['name', 'email']

    const blob = exportToCsv(rows, columns)
    const text = await blob.text()
    const lines = text.split('\n')

    expect(lines[1]).toBe(',test@example.com')
  })
})
