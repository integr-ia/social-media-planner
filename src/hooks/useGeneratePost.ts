// React hook for generating posts using AI
// Provides loading states, error handling, and quota information
// STORY-010: API génération post LinkedIn

import { useState, useCallback } from 'react'
import { aiClient } from '../lib/ai/client'
import type {
  GeneratePostRequest,
  GeneratePostResponse,
  GeneratedPost,
  AIGenerationError,
  ContentIdea,
} from '../types/ai'

export interface UseGeneratePostResult {
  // Data
  post: GeneratedPost | null
  generation: GeneratePostResponse['generation'] | null
  quotaUsed: number
  quotaRemaining: number

  // State
  isLoading: boolean
  error: AIGenerationError | null

  // Actions
  generatePost: (request: GeneratePostRequest) => Promise<GeneratedPost | null>
  generatePostFromIdea: (idea: ContentIdea, options?: GeneratePostOptions) => Promise<GeneratedPost | null>
  clearPost: () => void
  clearError: () => void
}

export interface GeneratePostOptions {
  platform?: 'linkedin' | 'instagram'
  tone?: 'professional' | 'casual' | 'inspirational'
  length?: 'short' | 'medium' | 'long'
}

/**
 * Hook for generating posts with AI
 *
 * @example
 * ```tsx
 * function GeneratePostButton({ idea }: { idea: ContentIdea }) {
 *   const {
 *     post,
 *     isLoading,
 *     error,
 *     generatePostFromIdea,
 *   } = useGeneratePost()
 *
 *   const handleGenerate = async () => {
 *     const generatedPost = await generatePostFromIdea(idea, {
 *       platform: 'linkedin',
 *       tone: 'professional',
 *       length: 'medium',
 *     })
 *     if (generatedPost) {
 *       console.log('Post created:', generatedPost.id)
 *     }
 *   }
 *
 *   return (
 *     <button onClick={handleGenerate} disabled={isLoading}>
 *       {isLoading ? 'Génération...' : 'Créer un post LinkedIn'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useGeneratePost(): UseGeneratePostResult {
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [generation, setGeneration] = useState<GeneratePostResponse['generation'] | null>(null)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaRemaining, setQuotaRemaining] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIGenerationError | null>(null)

  const generatePost = useCallback(async (request: GeneratePostRequest): Promise<GeneratedPost | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response: GeneratePostResponse = await aiClient.generatePost(request)

      setPost(response.post)
      setGeneration(response.generation)
      setQuotaUsed(response.quota.used)
      setQuotaRemaining(response.quota.remaining)

      return response.post
    } catch (err) {
      const aiError = err as AIGenerationError
      setError(aiError)
      console.error('Failed to generate post:', aiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generatePostFromIdea = useCallback(
    async (idea: ContentIdea, options: GeneratePostOptions = {}): Promise<GeneratedPost | null> => {
      const request: GeneratePostRequest = {
        idea: {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
        },
        platform: options.platform ?? 'linkedin',
        tone: options.tone ?? 'professional',
        length: options.length ?? 'medium',
      }

      return generatePost(request)
    },
    [generatePost]
  )

  const clearPost = useCallback(() => {
    setPost(null)
    setGeneration(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    post,
    generation,
    quotaUsed,
    quotaRemaining,
    isLoading,
    error,
    generatePost,
    generatePostFromIdea,
    clearPost,
    clearError,
  }
}
