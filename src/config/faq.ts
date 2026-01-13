import { ROUTES, type RoutePath } from './routes'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_CONTENT: Record<RoutePath, FaqItem[]> = {
  [ROUTES.HOME]: [
    {
      question: 'Is my data sent to a server?',
      answer:
        'No, never. CleanCSV processes your files 100% in your browser. No data is sent over the internet. You can verify this in the Network tab of your DevTools.',
    },
    {
      question: 'What is the maximum file size supported?',
      answer:
        'CleanCSV can process files up to 10,000 rows without any issues. For larger files, performance may vary depending on your browser.',
    },
    {
      question: 'What file formats are supported?',
      answer:
        'CleanCSV supports CSV files (.csv) and text files (.txt) delimited by commas.',
    },
    {
      question: 'Can I use CleanCSV for free?',
      answer:
        'Yes, CleanCSV is completely free. No signup required.',
    },
    {
      question: 'How do I export my cleaned file?',
      answer:
        'After cleaning your data, click "CSV" to download in CSV format, or "Excel" for an .xlsx file compatible with Microsoft Excel.',
    },
  ],
  [ROUTES.DEDUPLICATE]: [
    {
      question: 'How do I remove duplicates from a CSV file?',
      answer:
        'Upload your file, select the column to check in the dropdown menu, then click "Deduplicate". Duplicate rows will be removed instantly.',
    },
    {
      question: 'Which column is used to detect duplicates?',
      answer:
        'You choose the reference column. For example, if you select "Email", all rows with identical emails will be considered duplicates.',
    },
    {
      question: 'Is the comparison case-sensitive?',
      answer:
        'By default, the comparison is case-insensitive. "John@example.com" and "john@example.com" will be considered duplicates.',
    },
  ],
  [ROUTES.FORMAT]: [
    {
      question: 'What formatting options are available?',
      answer:
        'You can convert to lowercase, UPPERCASE, Title Case, or remove extra whitespace (Trim).',
    },
    {
      question: 'Can I format multiple columns at once?',
      answer:
        'Currently, formatting applies to one column at a time. Select the desired column before applying the formatting.',
    },
  ],
  [ROUTES.EMAIL]: [
    {
      question: 'What criteria determine if an email is valid?',
      answer:
        'CleanCSV checks for the presence of @, a domain with extension (TLD), and the general format of the address. Emails like "test@" or "test@domain" without a TLD are considered invalid.',
    },
    {
      question: 'What happens to invalid emails?',
      answer:
        'You can first validate to see the number of invalid emails, then choose to remove them by clicking "Remove invalid emails".',
    },
  ],
  [ROUTES.MERGE]: [
    {
      question: 'How do I merge multiple CSV files?',
      answer:
        'Upload your first file, then use the Merge tool to add other files. The rows will be combined into a single file.',
    },
    {
      question: 'What happens if the columns are different?',
      answer:
        'If the files have different columns, CleanCSV will create all necessary columns and fill missing cells with empty values.',
    },
  ],
  [ROUTES.CONVERT]: [
    {
      question: 'Is the Excel file compatible with all versions?',
      answer:
        'The generated .xlsx file is compatible with Excel 2007 and later versions, as well as Google Sheets and LibreOffice Calc.',
    },
    {
      question: 'Does the conversion slow down initial loading?',
      answer:
        'No. The Excel library is loaded only when you click "Excel", not when the page loads.',
    },
  ],
}

export function getFaqJsonLd(faqs: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
