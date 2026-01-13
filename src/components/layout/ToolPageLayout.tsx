import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES, TOOL_ROUTES, type RoutePath } from '@/config/routes'
import { SEO_CONFIG, getJsonLd, type SeoConfig } from '@/config/seo'
import { FAQ_CONTENT, getFaqJsonLd } from '@/config/faq'
import { PrivacyBadge } from '@/components/PrivacyBadge'

interface ToolPageLayoutProps {
  children: ReactNode
  seo?: SeoConfig
}

// Helper to update or create meta tag
function updateMetaTag(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }
  element.content = content
}

// Helper to update or create link tag
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
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

  const seoConfig = seo ?? SEO_CONFIG[currentPath] ?? SEO_CONFIG[ROUTES.HOME]
  const jsonLd = getJsonLd(currentPath)
  const faqs = FAQ_CONTENT[currentPath] || []
  const faqJsonLd = faqs.length > 0 ? getFaqJsonLd(faqs) : null

  // Update document head on route change
  useEffect(() => {
    // Title
    document.title = seoConfig.title

    // Meta tags
    updateMetaTag('description', seoConfig.description)
    updateMetaTag('og:title', seoConfig.title, true)
    updateMetaTag('og:description', seoConfig.description, true)
    updateMetaTag('og:url', seoConfig.canonical, true)
    updateMetaTag('og:type', 'website', true)

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
    <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link to={ROUTES.HOME} className="text-xl font-semibold text-zinc-900">
              CleanCSV
            </Link>
            <PrivacyBadge />
          </div>
        </header>

        {/* Tool Navigation */}
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              <Link
                to={ROUTES.HOME}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === ROUTES.HOME
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                All Tools
              </Link>
              {TOOL_ROUTES.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === tool.path
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  )}
                >
                  {tool.shortName}
                </Link>
              ))}
            </div>
          </div>
        </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
