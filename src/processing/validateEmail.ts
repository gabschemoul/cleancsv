import type { CsvRow, ProcessingResult } from '@/types/csv.types'

export interface EmailValidationResult {
  valid: CsvRow[]
  invalid: CsvRow[]
  validCount: number
  invalidCount: number
  invalidReasons: Map<number, string>
}

// Basic email validation (RFC 5322 simplified)
function isValidEmail(email: string): { valid: boolean; reason?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, reason: 'Empty email' }
  }

  const trimmed = email.trim().toLowerCase()

  // Check for @ symbol
  if (!trimmed.includes('@')) {
    return { valid: false, reason: 'Missing @' }
  }

  const [local, domain] = trimmed.split('@')

  // Check local part
  if (!local || local.length === 0) {
    return { valid: false, reason: 'Missing local part' }
  }

  if (local.length > 64) {
    return { valid: false, reason: 'Local part too long' }
  }

  // Check domain
  if (!domain || domain.length === 0) {
    return { valid: false, reason: 'Missing domain' }
  }

  // Check for TLD
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Missing TLD' }
  }

  const parts = domain.split('.')
  const tld = parts[parts.length - 1]

  if (tld.length < 2) {
    return { valid: false, reason: 'Invalid TLD' }
  }

  // Basic regex for additional validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: 'Invalid format' }
  }

  return { valid: true }
}

export function validateEmails(
  rows: CsvRow[],
  column: string
): EmailValidationResult {
  const valid: CsvRow[] = []
  const invalid: CsvRow[] = []
  const invalidReasons = new Map<number, string>()

  rows.forEach((row, index) => {
    const email = row[column] ?? ''
    const result = isValidEmail(email)

    if (result.valid) {
      valid.push(row)
    } else {
      invalid.push(row)
      invalidReasons.set(index, result.reason ?? 'Invalid')
    }
  })

  return {
    valid,
    invalid,
    validCount: valid.length,
    invalidCount: invalid.length,
    invalidReasons,
  }
}

export function removeInvalidEmails(
  rows: CsvRow[],
  column: string
): ProcessingResult {
  const result = validateEmails(rows, column)

  return {
    data: result.valid,
    originalCount: rows.length,
    newCount: result.validCount,
    removedCount: result.invalidCount,
    modifiedCount: 0,
    message:
      result.invalidCount > 0
        ? `${result.invalidCount} invalid email${result.invalidCount > 1 ? 's' : ''} removed`
        : 'All emails are valid',
  }
}
