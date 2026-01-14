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
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        {!isLoaded && (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
              Clean your CSV files
            </h1>
            <p className="mb-6 text-zinc-600">
              Upload your file to get started. Your data stays 100% private.
            </p>
          </>
        )}

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
