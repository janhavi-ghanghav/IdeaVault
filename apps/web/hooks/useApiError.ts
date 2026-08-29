import { useState, useCallback } from 'react'

export type ApiError = {
  message: string
  type: 'rate_limit' | 'server' | 'network' | 'auth' | 'unknown'
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null)

  const handleError = useCallback((err: any) => {
    const status = err?.response?.status

    if (status === 429) {
      setError({
        type: 'rate_limit',
        message: 'AI enrichment limit reached — 10 ideas per hour. Try again shortly.',
      })
    } else if (status === 401) {
      setError({
        type: 'auth',
        message: 'Session expired. Please refresh the page.',
      })
    } else if (status >= 500) {
      setError({
        type: 'server',
        message: 'Something went wrong on our end. Please try again.',
      })
    } else if (!status) {
      setError({
        type: 'network',
        message: 'Connection issue. Check your internet and try again.',
      })
    } else {
      setError({
        type: 'unknown',
        message: 'An unexpected error occurred.',
      })
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { error, handleError, clearError }
}