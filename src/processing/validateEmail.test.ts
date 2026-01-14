import { describe, it, expect } from 'vitest'
import { validateEmails, removeInvalidEmails } from './validateEmail'

describe('validateEmails', () => {
  it('should validate correct email addresses', () => {
    const rows = [
      { email: 'test@example.com' },
      { email: 'user.name@domain.org' },
      { email: 'user+tag@example.co.uk' },
    ]

    const result = validateEmails(rows, 'email')

    expect(result.validCount).toBe(3)
    expect(result.invalidCount).toBe(0)
  })

  it('should detect missing @ symbol', () => {
    const rows = [{ email: 'testexample.com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Missing @')
  })

  it('should detect multiple @ symbols', () => {
    const rows = [{ email: 'test@@example.com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Multiple @ symbols')
  })

  it('should detect missing TLD', () => {
    const rows = [{ email: 'test@example' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Missing TLD')
  })

  it('should detect invalid TLD (too short)', () => {
    const rows = [{ email: 'test@example.c' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Invalid TLD')
  })

  it('should detect empty emails', () => {
    const rows = [{ email: '' }, { email: '   ' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(2)
    expect(result.invalidReasons.get(0)).toBe('Empty email')
  })

  it('should detect consecutive dots in local part', () => {
    const rows = [{ email: 'test..user@example.com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Consecutive dots in local part')
  })

  it('should detect consecutive dots in domain', () => {
    const rows = [{ email: 'test@example..com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Consecutive dots in domain')
  })

  it('should detect local part starting with dot', () => {
    const rows = [{ email: '.test@example.com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Local part cannot start or end with dot')
  })

  it('should detect local part ending with dot', () => {
    const rows = [{ email: 'test.@example.com' }]

    const result = validateEmails(rows, 'email')

    expect(result.invalidCount).toBe(1)
    expect(result.invalidReasons.get(0)).toBe('Local part cannot start or end with dot')
  })

  it('should handle mixed valid and invalid emails', () => {
    const rows = [
      { email: 'valid@example.com' },
      { email: 'invalid' },
      { email: 'also.valid@test.org' },
      { email: 'test@@double.com' },
    ]

    const result = validateEmails(rows, 'email')

    expect(result.validCount).toBe(2)
    expect(result.invalidCount).toBe(2)
    expect(result.valid).toHaveLength(2)
    expect(result.invalid).toHaveLength(2)
  })
})

describe('removeInvalidEmails', () => {
  it('should remove rows with invalid emails', () => {
    const rows = [
      { email: 'valid@example.com', name: 'John' },
      { email: 'invalid', name: 'Jane' },
      { email: 'another@test.org', name: 'Bob' },
    ]

    const result = removeInvalidEmails(rows, 'email')

    expect(result.data).toHaveLength(2)
    expect(result.removedCount).toBe(1)
    expect(result.data[0].name).toBe('John')
    expect(result.data[1].name).toBe('Bob')
  })

  it('should return correct message when all emails are valid', () => {
    const rows = [
      { email: 'valid@example.com' },
      { email: 'another@test.org' },
    ]

    const result = removeInvalidEmails(rows, 'email')

    expect(result.message).toBe('All emails are valid')
    expect(result.removedCount).toBe(0)
  })

  it('should return correct message for removed emails', () => {
    const rows = [
      { email: 'valid@example.com' },
      { email: 'invalid1' },
      { email: 'invalid2' },
    ]

    const result = removeInvalidEmails(rows, 'email')

    expect(result.message).toBe('2 invalid emails removed')
  })
})
