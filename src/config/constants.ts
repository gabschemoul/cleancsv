export const FILE_CONFIG = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_EXTENSIONS: ['.csv', '.txt'],
  ACCEPTED_MIME_TYPES: {
    'text/csv': ['.csv'],
    'text/plain': ['.txt'],
  },
} as const

export const APP_CONFIG = {
  NAME: 'CleanCSV',
  BASE_URL: 'https://cleancsv.com',
  OG_IMAGE: 'https://cleancsv.com/og-image.png',
} as const

export const HISTORY_CONFIG = {
  MAX_UNDO_STATES: 10,
} as const
