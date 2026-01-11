// AI Client - Calls Supabase Edge Functions for AI generation
// This is the client-side interface to the AI services

import { supabase } from '../supabase'
import { AI_CONFIG } from './config'
import type {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  GeneratePostRequest,
  GeneratePostResponse,
  GenerateVariantsRequest,
  GenerateVariantsResponse,
  AIGenerationError,
  QuotaInfo,
} from '../../types/ai'

// French error messages for user-friendly display
const ERROR_MESSAGES_FR: Record<AIGenerationError['type'], string> = {
  rate_limit: 'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.',
  quota_exceeded: 'Quota mensuel dépassé. Le quota sera réinitialisé le 1er du mois prochain.',
  api_error: 'Une erreur est survenue lors de la génération. Veuillez réessayer.',
  validation_error: 'Les données fournies sont invalides. Veuillez vérifier votre saisie.',
  timeout: 'La génération a pris trop de temps. Veuillez réessayer.',
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate delay for exponential backoff
 */
function getRetryDelay(attempt: number): number {
  return AI_CONFIG.retryDelayMs * Math.pow(AI_CONFIG.retryBackoffMultiplier, attempt)
}

class AIClient {
  /**
   * Call a Supabase Edge Function with timeout, retry, and error handling
   */
  private async callEdgeFunction<T>(
    functionName: string,
    payload: Record<string, unknown>,
    timeoutMs: number = AI_CONFIG.timeoutIdeas
  ): Promise<T> {
    let lastError: AIGenerationError | null = null

    for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        try {
          const { data, error } = await supabase.functions.invoke<T>(functionName, {
            body: payload,
          })

          clearTimeout(timeoutId)

          if (error) {
            const aiError = this.parseError(error)

            // Don't retry on quota exceeded or validation errors
            if (aiError.type === 'quota_exceeded' || aiError.type === 'validation_error') {
              throw aiError
            }

            // Rate limit: wait for specified time before retry
            if (aiError.type === 'rate_limit' && aiError.retryAfter) {
              await sleep(aiError.retryAfter * 1000)
              lastError = aiError
              continue
            }

            lastError = aiError

            // Retry on other errors with exponential backoff
            if (attempt < AI_CONFIG.maxRetries) {
              await sleep(getRetryDelay(attempt))
              continue
            }

            throw aiError
          }

          if (!data) {
            throw {
              type: 'api_error',
              message: ERROR_MESSAGES_FR.api_error,
            } as AIGenerationError
          }

          return data
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (error) {
        // Handle AbortError (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError: AIGenerationError = {
            type: 'timeout',
            message: ERROR_MESSAGES_FR.timeout,
          }

          if (attempt < AI_CONFIG.maxRetries) {
            lastError = timeoutError
            await sleep(getRetryDelay(attempt))
            continue
          }

          throw timeoutError
        }

        // Re-throw AIGenerationError as-is
        if (this.isAIGenerationError(error)) {
          throw error
        }

        // Wrap unknown errors
        lastError = {
          type: 'api_error',
          message: error instanceof Error ? error.message : ERROR_MESSAGES_FR.api_error,
        }

        if (attempt < AI_CONFIG.maxRetries) {
          await sleep(getRetryDelay(attempt))
          continue
        }

        throw lastError
      }
    }

    // Should not reach here, but throw last error if we do
    throw lastError ?? {
      type: 'api_error',
      message: ERROR_MESSAGES_FR.api_error,
    }
  }

  /**
   * Parse error from Supabase function invocation
   */
  private parseError(error: { message?: string; status?: number }): AIGenerationError {
    const message = error.message?.toLowerCase() ?? ''

    if (message.includes('rate limit') || error.status === 429) {
      return {
        type: 'rate_limit',
        message: ERROR_MESSAGES_FR.rate_limit,
        retryAfter: 60,
      }
    }

    if (message.includes('quota')) {
      return {
        type: 'quota_exceeded',
        message: ERROR_MESSAGES_FR.quota_exceeded,
      }
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'timeout',
        message: ERROR_MESSAGES_FR.timeout,
      }
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return {
        type: 'validation_error',
        message: ERROR_MESSAGES_FR.validation_error,
      }
    }

    return {
      type: 'api_error',
      message: error.message || ERROR_MESSAGES_FR.api_error,
    }
  }

  /**
   * Type guard for AIGenerationError
   */
  private isAIGenerationError(error: unknown): error is AIGenerationError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error
    )
  }

  /**
   * Get French error message for display
   */
  getErrorMessage(error: AIGenerationError): string {
    return ERROR_MESSAGES_FR[error.type] ?? ERROR_MESSAGES_FR.api_error
  }

  /**
   * Generate content ideas based on context and themes
   * @param request - The request parameters
   * @returns Promise with generated ideas and metadata
   */
  async generateIdeas(request: GenerateIdeasRequest = {}): Promise<GenerateIdeasResponse> {
    return this.callEdgeFunction<GenerateIdeasResponse>(
      'generate-ideas',
      {
        context: request.context,
        themes: request.themes,
        count: request.count ?? 15,
      },
      AI_CONFIG.timeoutIdeas
    )
  }

  /**
   * Generate a post for LinkedIn or Instagram from an idea
   * @param request - The request parameters including idea and platform
   * @returns Promise with generated post content
   */
  async generatePost(request: GeneratePostRequest): Promise<GeneratePostResponse> {
    return this.callEdgeFunction<GeneratePostResponse>(
      'generate-post',
      {
        idea: request.idea,
        platform: request.platform,
        tone: request.tone ?? 'professional',
        length: request.length ?? 'medium',
      },
      AI_CONFIG.timeoutPost
    )
  }

  /**
   * Generate variants of an existing post
   * @param request - The request parameters including post ID and variation types
   * @returns Promise with post variants
   */
  async generateVariants(request: GenerateVariantsRequest): Promise<GenerateVariantsResponse> {
    return this.callEdgeFunction<GenerateVariantsResponse>(
      'generate-variants',
      {
        postId: request.postId,
        variations: request.variations,
      },
      AI_CONFIG.timeoutVariants
    )
  }

  /**
   * Get current quota information for the authenticated user
   * @returns Promise with quota details
   */
  async getQuota(): Promise<QuotaInfo> {
    // Short timeout for quota check - should be fast
    return this.callEdgeFunction<QuotaInfo>('get-ai-quota', {}, 5000)
  }
}

// Export singleton instance
export const aiClient = new AIClient()

// Export class for testing
export { AIClient }
