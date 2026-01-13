import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Something went wrong
          </h2>
          <p className="max-w-md text-zinc-600">
            An unexpected error occurred. Your data is safe - try refreshing or
            clearing your file to continue.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          {this.state.error && (
            <details className="mt-4 max-w-md text-left">
              <summary className="cursor-pointer text-sm text-zinc-500">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-zinc-100 p-2 text-xs text-zinc-700">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
