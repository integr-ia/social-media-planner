// React hook for checking AI generation quota
// Fetches current usage and remaining quota for the authenticated user

import { useState, useCallback, useEffect } from 'react'
import { aiClient } from '../lib/ai/client'
import type { QuotaInfo, AIGenerationError } from '../types/ai'

export interface UseAIQuotaResult {
  // Data
  quota: QuotaInfo | null

  // State
  isLoading: boolean
  error: AIGenerationError | null

  // Actions
  refreshQuota: () => Promise<void>
}

/**
 * Hook for checking AI generation quota
 *
 * @param autoFetch - Whether to automatically fetch quota on mount (default: true)
 *
 * @example
 * ```tsx
 * function QuotaDisplay() {
 *   const { quota, isLoading, refreshQuota } = useAIQuota()
 *
 *   if (isLoading) return <p>Chargement...</p>
 *   if (!quota) return null
 *
 *   return (
 *     <div>
 *       <p>Idées: {quota.ideas.remaining}/{quota.ideas.limit}</p>
 *       <p>Posts: {quota.posts.remaining}/{quota.posts.limit}</p>
 *       <p>Renouvellement: {new Date(quota.resetsAt).toLocaleDateString()}</p>
 *       <button onClick={refreshQuota}>Actualiser</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAIQuota(autoFetch = true): UseAIQuotaResult {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIGenerationError | null>(null)

  const refreshQuota = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await aiClient.getQuota()
      setQuota(response)
    } catch (err) {
      const aiError = err as AIGenerationError
      setError(aiError)
      console.error('Failed to fetch quota:', aiError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refreshQuota()
    }
  }, [autoFetch, refreshQuota])

  return {
    quota,
    isLoading,
    error,
    refreshQuota,
  }
}
