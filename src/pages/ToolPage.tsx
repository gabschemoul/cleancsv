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
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        {!isLoaded && (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
              {tool.name}
            </h1>
            <p className="mb-6 text-zinc-600">{tool.description}</p>
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
