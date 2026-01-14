// React hook for generating content ideas using AI
// Provides loading states, error handling, and quota information

import { useState, useCallback } from 'react'
import { aiClient } from '../lib/ai/client'
import type {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  ContentIdea,
  AIGenerationError,
} from '../types/ai'

export interface UseGenerateIdeasResult {
  // Data
  ideas: ContentIdea[]
  generationId: string | null
  quotaUsed: number
  quotaRemaining: number
  durationMs: number | null

  // State
  isLoading: boolean
  error: AIGenerationError | null

  // Actions
  generateIdeas: (request?: GenerateIdeasRequest) => Promise<void>
  clearIdeas: () => void
  clearError: () => void
}

/**
 * Hook for generating content ideas with AI
 *
 * @example
 * ```tsx
 * function GenerateIdeasPage() {
 *   const {
 *     ideas,
 *     isLoading,
 *     error,
 *     quotaRemaining,
 *     generateIdeas,
 *   } = useGenerateIdeas()
 *
 *   return (
 *     <div>
 *       <button onClick={() => generateIdeas()} disabled={isLoading}>
 *         {isLoading ? 'Génération...' : 'Générer des idées'}
 *       </button>
 *       {error && <p className="error">{error.message}</p>}
 *       {ideas.map(idea => (
 *         <IdeaCard key={idea.id} idea={idea} />
 *       ))}
 *       <p>Quota restant: {quotaRemaining}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useGenerateIdeas(): UseGenerateIdeasResult {
  const [ideas, setIdeas] = useState<ContentIdea[]>([])
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaRemaining, setQuotaRemaining] = useState(100)
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIGenerationError | null>(null)

  const generateIdeas = useCallback(async (request: GenerateIdeasRequest = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const response: GenerateIdeasResponse = await aiClient.generateIdeas(request)

      setIdeas(response.ideas)
      setGenerationId(response.generationId)
      setQuotaUsed(response.quotaUsed)
      setQuotaRemaining(response.quotaRemaining)
      setDurationMs(response.durationMs)
    } catch (err) {
      const aiError = err as AIGenerationError
      setError(aiError)
      console.error('Failed to generate ideas:', aiError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearIdeas = useCallback(() => {
    setIdeas([])
    setGenerationId(null)
    setDurationMs(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    ideas,
    generationId,
    quotaUsed,
    quotaRemaining,
    durationMs,
    isLoading,
    error,
    generateIdeas,
    clearIdeas,
    clearError,
  }
}
