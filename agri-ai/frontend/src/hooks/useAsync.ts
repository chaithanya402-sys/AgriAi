import { useCallback, useState } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: string
}

/**
 * Standardized async state management for data-fetching pages.
 * `run` takes a promise-returning factory and stores the result.
 */
export function useAsync<T>() {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: '',
  })

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    try {
      const data = await fn()
      setState({ data, loading: false, error: '' })
      return data
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message || 'Something went wrong' })
      return null
    }
  }, [])

  return { ...state, run }
}
