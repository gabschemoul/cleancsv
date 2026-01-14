import type { CsvRow, ProcessingResult } from '@/types/csv.types'

export interface EmailValidationResult {
  valid: CsvRow[]
  invalid: CsvRow[]
  validCount: number
  invalidCount: number
  invalidReasons: Map<number, string>
}

// Email validation (RFC 5322 simplified but stricter)
function isValidEmail(email: string): { valid: boolean; reason?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, reason: 'Empty email' }
  }

  const trimmed = email.trim().toLowerCase()

  // Check for multiple @ symbols
  const atCount = (trimmed.match(/@/g) || []).length
  if (atCount === 0) {
    return { valid: false, reason: 'Missing @' }
  }
  if (atCount > 1) {
    return { valid: false, reason: 'Multiple @ symbols' }
  }

  const atIndex = trimmed.indexOf('@')
  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)

  // Check local part
  if (!local || local.length === 0) {
    return { valid: false, reason: 'Missing local part' }
  }

  if (local.length > 64) {
    return { valid: false, reason: 'Local part too long' }
  }

  // Check for invalid local part patterns
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, reason: 'Local part cannot start or end with dot' }
  }

  if (local.includes('..')) {
    return { valid: false, reason: 'Consecutive dots in local part' }
  }

  // Check domain
  if (!domain || domain.length === 0) {
    return { valid: false, reason: 'Missing domain' }
  }

  if (domain.length > 253) {
    return { valid: false, reason: 'Domain too long' }
  }

  // Check for TLD
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Missing TLD' }
  }

  // Check for invalid domain patterns
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, reason: 'Domain cannot start or end with dot' }
  }

  if (domain.includes('..')) {
    return { valid: false, reason: 'Consecutive dots in domain' }
  }

  const parts = domain.split('.')
  const tld = parts[parts.length - 1]

  if (tld.length < 2) {
    return { valid: false, reason: 'Invalid TLD' }
  }

  // Check each domain part is valid
  for (const part of parts) {
    if (part.length === 0 || part.length > 63) {
      return { valid: false, reason: 'Invalid domain label length' }
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(part)) {
      return { valid: false, reason: 'Invalid domain format' }
    }
  }

  // Final regex check for allowed characters in local part
  const localPartRegex = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i
  if (!localPartRegex.test(local)) {
    return { valid: false, reason: 'Invalid characters in local part' }
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
