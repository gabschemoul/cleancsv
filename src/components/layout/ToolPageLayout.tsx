import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES, TOOL_ROUTES, type RoutePath } from '@/config/routes'
import { SEO_CONFIG, getJsonLd, type SeoConfig } from '@/config/seo'
import { FAQ_CONTENT, getFaqJsonLd } from '@/config/faq'
import { PrivacyBadge } from '@/components/PrivacyBadge'

interface ToolPageLayoutProps {
  children: ReactNode
  seo?: SeoConfig
}

// Helper to update or create meta tag (with CSS.escape for safety)
function updateMetaTag(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  const escapedName = CSS.escape(name)
  let element = document.querySelector(`meta[${attr}="${escapedName}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }
  element.content = content
}

// Helper to update or create link tag (with CSS.escape for safety)
function updateLinkTag(rel: string, href: string) {
  const escapedRel = CSS.escape(rel)
  let element = document.querySelector(`link[rel="${escapedRel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

// Helper to update JSON-LD script
function updateJsonLd(id: string, data: object) {
  let element = document.getElementById(id) as HTMLScriptElement | null
  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(data)
}

export function ToolPageLayout({ children, seo }: ToolPageLayoutProps) {
  const location = useLocation()
  const currentPath = location.pathname as RoutePath
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const seoConfig = seo ?? SEO_CONFIG[currentPath] ?? SEO_CONFIG[ROUTES.HOME]
  const jsonLd = getJsonLd(currentPath)
  const faqs = FAQ_CONTENT[currentPath] || []
  const faqJsonLd = faqs.length > 0 ? getFaqJsonLd(faqs) : null

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Update document head on route change
  useEffect(() => {
    const OG_IMAGE = 'https://cleancsv.io/og-image.png'

    // Title
    document.title = seoConfig.title

    // Meta tags
    updateMetaTag('description', seoConfig.description)

    // Open Graph
    updateMetaTag('og:title', seoConfig.title, true)
    updateMetaTag('og:description', seoConfig.description, true)
    updateMetaTag('og:url', seoConfig.canonical, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:image', OG_IMAGE, true)
    updateMetaTag('og:image:alt', 'CleanCSV - Clean your CSV files online', true)
    updateMetaTag('og:site_name', 'CleanCSV', true)

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', seoConfig.title)
    updateMetaTag('twitter:description', seoConfig.description)
    updateMetaTag('twitter:image', OG_IMAGE)

    // Canonical
    updateLinkTag('canonical', seoConfig.canonical)

    // JSON-LD
    updateJsonLd('jsonld-app', jsonLd)
    if (faqJsonLd) {
      updateJsonLd('jsonld-faq', faqJsonLd)
    } else {
      // Remove FAQ JSON-LD if not needed
      const faqScript = document.getElementById('jsonld-faq')
      if (faqScript) faqScript.remove()
    }
  }, [seoConfig, jsonLd, faqJsonLd])

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 sm:h-16 sm:px-8">
          <Link
            to={ROUTES.HOME}
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            style={{ fontFamily: 'Vollkorn, Georgia, serif' }}
          >
            CleanCSV
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-2 md:flex">
            <Link
              to={ROUTES.HOME}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                location.pathname === ROUTES.HOME
                  ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              All Tools
            </Link>
            {TOOL_ROUTES.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className={cn(
                  'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
                  location.pathname === tool.path
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {tool.shortName}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                to={ROUTES.HOME}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  location.pathname === ROUTES.HOME
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                All Tools
              </Link>
              {TOOL_ROUTES.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={cn(
                    'rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    location.pathname === tool.path
                      ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Fixed Privacy Badge - Hidden on mobile */}
      <div className="fixed bottom-4 right-4 z-50 hidden sm:bottom-6 sm:right-6 sm:block">
        <PrivacyBadge />
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-[1920px] px-4 py-8 sm:px-8 sm:py-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
              <span
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: 'Vollkorn, Georgia, serif' }}
              >
                CleanCSV
              </span>
              <span className="hidden text-slate-400 sm:inline">•</span>
              <span className="text-sm text-slate-500">
                Clean your CSV files in seconds
              </span>
            </div>
            <div className="text-sm text-slate-500">
              100% Private - Your data never leaves your browser
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-slate-400 sm:mt-8">
            © {new Date().getFullYear()} CleanCSV. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
