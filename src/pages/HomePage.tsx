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
      {/* Hero Section */}
      {!isLoaded && (
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Clean your CSV files
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Deduplicate, format, and clean your spreadsheets in seconds.
            100% private — your data never leaves your browser.
          </p>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
        <DropZone />

        {isLoaded && (
          <div className="space-y-4">
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
