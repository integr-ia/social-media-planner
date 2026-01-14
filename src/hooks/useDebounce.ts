/**
 * React hook for debouncing values
 * Useful for search inputs to avoid excessive API calls
 */

import { useState, useEffect } from 'react'

/**
 * Debounce a value by a specified delay
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 500)
 *
 *   useEffect(() => {
 *     // This will only run 500ms after the user stops typing
 *     fetchResults(debouncedSearch)
 *   }, [debouncedSearch])
 *
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
