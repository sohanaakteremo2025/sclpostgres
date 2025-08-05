'use client'
import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ResultEntryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Result Entry Error:', error)
    console.error('Error Info:', errorInfo)
    
    // You can log to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isValidationError = error.message.includes('validation') || error.message.includes('invalid')
  
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <div>
            <strong>Something went wrong:</strong>
          </div>
          <div className="text-sm">
            {isNetworkError ? (
              'Network error occurred. Please check your connection and try again.'
            ) : isValidationError ? (
              'Data validation failed. Please refresh and try again.'
            ) : (
              error.message || 'An unexpected error occurred.'
            )}
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetError}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Specialized error fallbacks
export function FormErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <div>
            <strong>Form Error:</strong>
          </div>
          <div className="text-sm">
            {error.message.includes('validation') 
              ? 'Please check your inputs and try again.'
              : 'Failed to process form data. Please try again.'
            }
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetError}
            className="mt-2"
          >
            Reset Form
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function DataLoadingErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-6 text-center">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <div>
            <strong>Failed to load data</strong>
          </div>
          <div className="text-sm">
            {error.message.includes('not found') 
              ? 'The requested data could not be found.'
              : 'There was an error loading the data. Please try again.'
            }
          </div>
          <Button
            variant="outline"
            onClick={resetError}
            className="flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Data
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}