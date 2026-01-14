// React hook for batch post generation from multiple ideas
// STORY-012: Workflow génération batch
// Generates LinkedIn + Instagram posts for each selected idea sequentially

import { useState, useCallback, useRef } from 'react'
import { aiClient } from '../lib/ai/client'
import type {
  ContentIdea,
  GeneratedPost,
  AIGenerationError,
} from '../types/ai'

export interface BatchGenerationItem {
  idea: ContentIdea
  linkedinPost: GeneratedPost | null
  instagramPost: GeneratedPost | null
  linkedinError: AIGenerationError | null
  instagramError: AIGenerationError | null
  status: 'pending' | 'generating_linkedin' | 'generating_instagram' | 'completed' | 'failed'
}

export interface BatchGenerationProgress {
  total: number
  completed: number
  current: number
  currentIdea: ContentIdea | null
  currentPlatform: 'linkedin' | 'instagram' | null
  percentage: number
}

export interface BatchGenerationResult {
  items: BatchGenerationItem[]
  successCount: number
  failureCount: number
  totalPostsCreated: number
}

export interface UseBatchGenerationResult {
  // State
  isGenerating: boolean
  progress: BatchGenerationProgress
  items: BatchGenerationItem[]
  result: BatchGenerationResult | null

  // Actions
  startBatchGeneration: (ideas: ContentIdea[]) => Promise<BatchGenerationResult>
  cancelGeneration: () => void
  reset: () => void
}

const initialProgress: BatchGenerationProgress = {
  total: 0,
  completed: 0,
  current: 0,
  currentIdea: null,
  currentPlatform: null,
  percentage: 0,
}

/**
 * Hook for batch generation of posts from multiple ideas
 *
 * For each selected idea, generates:
 * - 1 LinkedIn post
 * - 1 Instagram post
 *
 * Generation is sequential to avoid rate limits.
 * Continues even if individual generations fail.
 */
export function useBatchGeneration(): UseBatchGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<BatchGenerationProgress>(initialProgress)
  const [items, setItems] = useState<BatchGenerationItem[]>([])
  const [result, setResult] = useState<BatchGenerationResult | null>(null)

  // Ref to track cancellation
  const cancelledRef = useRef(false)

  const startBatchGeneration = useCallback(async (ideas: ContentIdea[]): Promise<BatchGenerationResult> => {
    if (ideas.length === 0) {
      throw new Error('No ideas provided for batch generation')
    }

    // Reset state
    cancelledRef.current = false
    setIsGenerating(true)
    setResult(null)

    // Initialize items
    const initialItems: BatchGenerationItem[] = ideas.map(idea => ({
      idea,
      linkedinPost: null,
      instagramPost: null,
      linkedinError: null,
      instagramError: null,
      status: 'pending',
    }))
    setItems(initialItems)

    // Total operations: 2 per idea (LinkedIn + Instagram)
    const totalOperations = ideas.length * 2
    let completedOperations = 0

    setProgress({
      total: ideas.length,
      completed: 0,
      current: 0,
      currentIdea: null,
      currentPlatform: null,
      percentage: 0,
    })

    const updatedItems = [...initialItems]
    let successCount = 0
    let failureCount = 0
    let totalPostsCreated = 0

    // Process each idea sequentially
    for (let i = 0; i < ideas.length; i++) {
      // Check for cancellation
      if (cancelledRef.current) {
        break
      }

      const idea = ideas[i]

      // Update progress - starting LinkedIn
      setProgress({
        total: ideas.length,
        completed: i,
        current: i + 1,
        currentIdea: idea,
        currentPlatform: 'linkedin',
        percentage: Math.round((completedOperations / totalOperations) * 100),
      })

      // Update item status
      updatedItems[i] = { ...updatedItems[i], status: 'generating_linkedin' }
      setItems([...updatedItems])

      // Generate LinkedIn post
      try {
        const linkedinResponse = await aiClient.generatePost({
          idea: {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            category: idea.category,
          },
          platform: 'linkedin',
          tone: 'professional',
          length: 'medium',
        })

        updatedItems[i] = {
          ...updatedItems[i],
          linkedinPost: linkedinResponse.post,
        }
        totalPostsCreated++
      } catch (error) {
        updatedItems[i] = {
          ...updatedItems[i],
          linkedinError: error as AIGenerationError,
        }
      }

      completedOperations++
      setItems([...updatedItems])

      // Check for cancellation before Instagram
      if (cancelledRef.current) {
        break
      }

      // Update progress - starting Instagram
      setProgress({
        total: ideas.length,
        completed: i,
        current: i + 1,
        currentIdea: idea,
        currentPlatform: 'instagram',
        percentage: Math.round((completedOperations / totalOperations) * 100),
      })

      // Update item status
      updatedItems[i] = { ...updatedItems[i], status: 'generating_instagram' }
      setItems([...updatedItems])

      // Generate Instagram post
      try {
        const instagramResponse = await aiClient.generatePost({
          idea: {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            category: idea.category,
          },
          platform: 'instagram',
          tone: 'casual',
          length: 'short',
        })

        updatedItems[i] = {
          ...updatedItems[i],
          instagramPost: instagramResponse.post,
        }
        totalPostsCreated++
      } catch (error) {
        updatedItems[i] = {
          ...updatedItems[i],
          instagramError: error as AIGenerationError,
        }
      }

      completedOperations++

      // Determine final status for this idea
      const hasLinkedIn = updatedItems[i].linkedinPost !== null
      const hasInstagram = updatedItems[i].instagramPost !== null

      if (hasLinkedIn || hasInstagram) {
        updatedItems[i] = { ...updatedItems[i], status: 'completed' }
        successCount++
      } else {
        updatedItems[i] = { ...updatedItems[i], status: 'failed' }
        failureCount++
      }

      setItems([...updatedItems])

      // Update progress
      setProgress({
        total: ideas.length,
        completed: i + 1,
        current: i + 1,
        currentIdea: idea,
        currentPlatform: null,
        percentage: Math.round((completedOperations / totalOperations) * 100),
      })
    }

    // Final result
    const finalResult: BatchGenerationResult = {
      items: updatedItems,
      successCount,
      failureCount,
      totalPostsCreated,
    }

    setResult(finalResult)
    setIsGenerating(false)
    setProgress(prev => ({ ...prev, percentage: 100, currentIdea: null, currentPlatform: null }))

    return finalResult
  }, [])

  const cancelGeneration = useCallback(() => {
    cancelledRef.current = true
  }, [])

  const reset = useCallback(() => {
    setIsGenerating(false)
    setProgress(initialProgress)
    setItems([])
    setResult(null)
    cancelledRef.current = false
  }, [])

  return {
    isGenerating,
    progress,
    items,
    result,
    startBatchGeneration,
    cancelGeneration,
    reset,
  }
}
