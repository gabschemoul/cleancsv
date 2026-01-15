import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

const SEO_CONFIG = {
  '/': {
    title: 'CleanCSV - Clean your CSV files online (100% private)',
    description:
      'Clean, deduplicate and format your CSV files directly in your browser. Your data never leaves your device. Free and no signup required.',
    canonical: 'https://cleancsv.io',
  },
  '/tools/deduplicate-csv': {
    title: 'Remove CSV duplicates online - CleanCSV',
    description:
      'Remove duplicate rows from your CSV file in just a few clicks. 100% local processing, your data stays private.',
    canonical: 'https://cleancsv.io/tools/deduplicate-csv',
  },
  '/tools/format-csv': {
    title: 'Format CSV text online - CleanCSV',
    description:
      'Convert text in your CSV files to lowercase, uppercase or Title Case. Free and private tool.',
    canonical: 'https://cleancsv.io/tools/format-csv',
  },
  '/tools/clean-email-list': {
    title: 'Clean email list CSV - CleanCSV',
    description:
      'Validate and clean your CSV email lists. Identify invalid emails without sending your data to any server.',
    canonical: 'https://cleancsv.io/tools/clean-email-list',
  },
  '/tools/merge-csv': {
    title: 'Merge CSV files online - CleanCSV',
    description:
      'Combine multiple CSV files into one. Fast and private merging directly in your browser.',
    canonical: 'https://cleancsv.io/tools/merge-csv',
  },
  '/tools/convert-csv-to-excel': {
    title: 'Convert CSV to Excel online - CleanCSV',
    description:
      'Convert your CSV files to Excel (.xlsx) for free. No upload required, 100% local processing.',
    canonical: 'https://cleancsv.io/tools/convert-csv-to-excel',
  },
}

function generatePageHtml(baseHtml, seo) {
  let html = baseHtml

  // Update title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`)

  // Update or add meta description
  if (html.includes('name="description"')) {
    html = html.replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${seo.description}"`
    )
  } else {
    html = html.replace(
      '</head>',
      `  <meta name="description" content="${seo.description}">\n  </head>`
    )
  }

  // Update or add canonical
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${seo.canonical}"`
    )
  } else {
    html = html.replace(
      '</head>',
      `  <link rel="canonical" href="${seo.canonical}">\n  </head>`
    )
  }

  // Add Open Graph tags
  const ogTags = `
  <meta property="og:title" content="${seo.title}">
  <meta property="og:description" content="${seo.description}">
  <meta property="og:url" content="${seo.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://cleancsv.io/og-image.png">
  <meta property="og:site_name" content="CleanCSV">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seo.title}">
  <meta name="twitter:description" content="${seo.description}">
  <meta name="twitter:image" content="https://cleancsv.io/og-image.png">`

  // Remove existing OG tags if any
  html = html.replace(/<meta property="og:[^>]*>\n?/g, '')
  html = html.replace(/<meta name="twitter:[^>]*>\n?/g, '')

  // Add OG tags before </head>
  html = html.replace('</head>', `${ogTags}\n  </head>`)

  return html
}

console.log('Generating SEO-optimized HTML pages...\n')

// Read base index.html
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

for (const [route, seo] of Object.entries(SEO_CONFIG)) {
  const pageHtml = generatePageHtml(baseHtml, seo)

  if (route === '/') {
    // Overwrite root index.html
    writeFileSync(join(distDir, 'index.html'), pageHtml)
    console.log(`  / -> dist/index.html`)
  } else {
    // Create subdirectory with index.html
    const pagePath = join(distDir, route.slice(1))
    if (!existsSync(pagePath)) {
      mkdirSync(pagePath, { recursive: true })
    }
    writeFileSync(join(pagePath, 'index.html'), pageHtml)
    console.log(`  ${route} -> dist${route}/index.html`)
  }
}

console.log('\nSEO pages generated successfully!')
