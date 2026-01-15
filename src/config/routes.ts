export const ROUTES = {
  HOME: '/',
  DEDUPLICATE: '/tools/deduplicate-csv',
  MERGE: '/tools/merge-csv',
  EMAIL: '/tools/clean-email-list',
  FORMAT: '/tools/format-csv',
  CONVERT: '/tools/convert-csv-to-excel',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export interface ToolRoute {
  path: RoutePath
  name: string
  shortName: string
  description: string
}

export const TOOL_ROUTES: ToolRoute[] = [
  {
    path: ROUTES.DEDUPLICATE,
    name: 'Remove Duplicates',
    shortName: 'Deduplicate',
    description: 'Remove duplicate rows from your CSV file',
  },
  {
    path: ROUTES.FORMAT,
    name: 'Format Text',
    shortName: 'Format',
    description: 'Format text to lowercase, uppercase, or title case',
  },
  {
    path: ROUTES.EMAIL,
    name: 'Clean Email List',
    shortName: 'Emails',
    description: 'Validate and clean email addresses',
  },
  {
    path: ROUTES.MERGE,
    name: 'Merge CSV Files',
    shortName: 'Merge',
    description: 'Combine multiple CSV files into one',
  },
  {
    path: ROUTES.CONVERT,
    name: 'Convert to Excel',
    shortName: 'Export',
    description: 'Download your CSV as an Excel file',
  },
]
