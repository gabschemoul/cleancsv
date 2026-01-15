import { useCsvContext } from '@/hooks/useCsvContext'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { DropZone } from '@/components/DropZone'
import { DataTable } from '@/components/DataTable'
import { FileInfo } from '@/components/FileInfo'
import { ToolBar } from '@/components/ToolBar'
import { FaqSection } from '@/components/FaqSection'
import { FAQ_CONTENT } from '@/config/faq'
import type { ToolRoute, RoutePath } from '@/config/routes'

interface ToolPageProps {
  tool: ToolRoute
}

export function ToolPage({ tool }: ToolPageProps) {
  const { isLoaded } = useCsvContext()
  const faqs = FAQ_CONTENT[tool.path as RoutePath] || []

  return (
    <ToolPageLayout>
      <div
        className={`rounded-3xl bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:p-10 ${
          !isLoaded ? 'mx-auto max-w-4xl' : ''
        }`}
      >
        {!isLoaded && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {tool.name}
            </h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">{tool.description}</p>
          </div>
        )}

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
