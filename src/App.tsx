import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CsvProvider } from '@/context/CsvContext'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { HomePage } from '@/pages/HomePage'
import { ToolPage } from '@/pages/ToolPage'
import { ROUTES, TOOL_ROUTES } from '@/config/routes'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CsvProvider>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            {TOOL_ROUTES.map((tool) => (
              <Route
                key={tool.path}
                path={tool.path}
                element={<ToolPage tool={tool} />}
              />
            ))}
          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-sans',
              style: {
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </CsvProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
