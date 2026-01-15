import { ROUTES, type RoutePath } from './routes'

export interface SeoConfig {
  title: string
  description: string
  canonical: string
}

const BASE_URL = 'https://cleancsv.io'

export const SEO_CONFIG: Record<RoutePath, SeoConfig> = {
  [ROUTES.HOME]: {
    title: 'CleanCSV - Clean your CSV files online (100% private)',
    description:
      'Clean, deduplicate and format your CSV files directly in your browser. Your data never leaves your device. Free and no signup required.',
    canonical: BASE_URL,
  },
  [ROUTES.DEDUPLICATE]: {
    title: 'Remove CSV duplicates online - CleanCSV',
    description:
      'Remove duplicate rows from your CSV file in just a few clicks. 100% local processing, your data stays private.',
    canonical: `${BASE_URL}/tools/deduplicate-csv`,
  },
  [ROUTES.FORMAT]: {
    title: 'Format CSV text online - CleanCSV',
    description:
      'Convert text in your CSV files to lowercase, uppercase or Title Case. Free and private tool.',
    canonical: `${BASE_URL}/tools/format-csv`,
  },
  [ROUTES.EMAIL]: {
    title: 'Clean email list CSV - CleanCSV',
    description:
      'Validate and clean your CSV email lists. Identify invalid emails without sending your data to any server.',
    canonical: `${BASE_URL}/tools/clean-email-list`,
  },
  [ROUTES.MERGE]: {
    title: 'Merge CSV files online - CleanCSV',
    description:
      'Combine multiple CSV files into one. Fast and private merging directly in your browser.',
    canonical: `${BASE_URL}/tools/merge-csv`,
  },
  [ROUTES.CONVERT]: {
    title: 'Convert CSV to Excel online - CleanCSV',
    description:
      'Convert your CSV files to Excel (.xlsx) for free. No upload required, 100% local processing.',
    canonical: `${BASE_URL}/tools/convert-csv-to-excel`,
  },
}

export function getJsonLd(path: RoutePath): object {
  const seo = SEO_CONFIG[path] ?? SEO_CONFIG[ROUTES.HOME]

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CleanCSV',
    url: seo.canonical,
    description: seo.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'CSV duplicate removal',
      'Text formatting',
      'Email validation',
      'CSV merge',
      'Excel export',
      '100% client-side processing',
      'No data upload required',
    ],
  }
}
