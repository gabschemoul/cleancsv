import { useCsvContext } from '@/hooks/useCsvContext'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { DropZone } from '@/components/DropZone'
import { DataTable } from '@/components/DataTable'
import { FileInfo } from '@/components/FileInfo'
import { ToolBar } from '@/components/ToolBar'
import { FaqSection } from '@/components/FaqSection'
import { FAQ_CONTENT } from '@/config/faq'
import { ROUTES } from '@/config/routes'

export function HomePage() {
  const { isLoaded } = useCsvContext()
  const faqs = FAQ_CONTENT[ROUTES.HOME]

  return (
    <ToolPageLayout>
      {/* Hero Section - Premium */}
      {!isLoaded && (
        <div className="relative mb-8 text-center sm:mb-16">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-medium text-violet-700 sm:mb-8 sm:px-4 sm:py-2 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            100% Private - Runs locally
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Clean your CSV files
            <span className="mt-1 block bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent sm:mt-2">
              in seconds
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:mt-8 sm:text-xl">
            Deduplicate, format, and clean your spreadsheets.
            Your data never leaves your browser.
          </p>
        </div>
      )}

      {/* Main Card - Premium shadow */}
      <div
        className={`rounded-2xl bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:rounded-3xl sm:p-10 ${
          !isLoaded ? 'mx-auto max-w-4xl' : ''
        }`}
      >
        <DropZone />

        {isLoaded && (
          <div className="space-y-6">
            <FileInfo />
            <ToolBar />
            <DataTable />
          </div>
        )}
      </div>

      <FaqSection faqs={faqs} />
    </ToolPageLayout>
  )
}
