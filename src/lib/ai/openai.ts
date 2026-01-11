// OpenAI Direct Client Configuration
// This file provides utilities for server-side OpenAI API calls
// Used by Supabase Edge Functions and potentially API routes

import { AI_CONFIG, INTEGRIA_CONTEXT, PLATFORM_SETTINGS, type Platform } from './config'

/**
 * OpenAI API configuration for server-side usage
 * Note: The actual OpenAI client is initialized in Edge Functions
 * This file provides shared utilities and configuration
 */

export interface OpenAIClientConfig {
  apiKey: string
  model?: string
  fallbackModel?: string
  maxRetries?: number
}

/**
 * Creates the system prompt for IntegrIA content generation
 */
export function createSystemPrompt(): string {
  return `Tu es un expert en content marketing pour les réseaux sociaux (LinkedIn et Instagram).
Tu travailles pour ${INTEGRIA_CONTEXT.company}, une entreprise basée en ${INTEGRIA_CONTEXT.location}.

Contexte de l'entreprise:
- Secteur: ${INTEGRIA_CONTEXT.sector}
- Ton: ${INTEGRIA_CONTEXT.tone}
- Langue: ${INTEGRIA_CONTEXT.language}
- Public cible: ${INTEGRIA_CONTEXT.targetAudience}
- Valeurs: ${INTEGRIA_CONTEXT.values.join(', ')}

Tu réponds toujours en français et tu adaptes ton contenu au marché suisse romand.`
}

/**
 * Creates platform-specific instructions for content generation
 */
export function getPlatformInstructions(platform: Platform): string {
  const settings = PLATFORM_SETTINGS[platform]

  if (platform === 'linkedin') {
    return `
Instructions pour LinkedIn:
- Longueur idéale: ${settings.idealLength.min}-${settings.idealLength.max} mots
- Ton: ${settings.tone}
- Structure: ${settings.structure}
- Hashtags: ${settings.hashtagCount.min}-${settings.hashtagCount.max} hashtags professionnels
- Évite les emojis excessifs (1-2 max)
- Privilégie la valeur ajoutée et l'expertise`
  }

  return `
Instructions pour Instagram:
- Longueur idéale: ${settings.idealLength.min}-${settings.idealLength.max} mots
- Ton: ${settings.tone}
- Structure: ${settings.structure}
- Hashtags: ${settings.hashtagCount.min}-${settings.hashtagCount.max} hashtags mixtes (populaires + niche)
- Utilise des emojis de manière stratégique
- Crée un hook visuel fort dans la première ligne`
}

/**
 * Validates that an API key looks valid (basic format check)
 */
export function validateApiKey(apiKey: string | undefined): boolean {
  if (!apiKey) return false
  // OpenAI keys start with 'sk-' and are 51 characters long (or longer for project keys)
  return apiKey.startsWith('sk-') && apiKey.length >= 40
}

/**
 * Default configuration for OpenAI requests
 */
export const OPENAI_DEFAULTS = {
  model: AI_CONFIG.model,
  fallbackModel: AI_CONFIG.fallbackModel,
  maxRetries: AI_CONFIG.maxRetries,
  responseFormat: { type: 'json_object' as const },
} as const

/**
 * Generation presets for different content types
 */
export const GENERATION_PRESETS = {
  ideas: {
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperatureIdeas,
    maxTokens: AI_CONFIG.maxTokensIdeas,
    timeoutMs: AI_CONFIG.timeoutIdeas,
  },
  post: {
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperaturePost,
    maxTokens: AI_CONFIG.maxTokensPost,
    timeoutMs: AI_CONFIG.timeoutPost,
  },
  variants: {
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperatureVariants,
    maxTokens: AI_CONFIG.maxTokensVariants,
    timeoutMs: AI_CONFIG.timeoutVariants,
  },
} as const

/**
 * Error messages for OpenAI API errors (server-side logging)
 */
export const OPENAI_ERROR_CODES: Record<string, string> = {
  'insufficient_quota': 'Le quota OpenAI est épuisé. Veuillez vérifier votre compte OpenAI.',
  'rate_limit_exceeded': 'Limite de requêtes OpenAI atteinte. Réessayez dans quelques instants.',
  'invalid_api_key': 'Clé API OpenAI invalide. Veuillez vérifier la configuration.',
  'model_not_found': 'Modèle IA non disponible. Tentative avec le modèle de secours.',
  'context_length_exceeded': 'Le contenu est trop long pour être traité.',
  'server_error': 'Erreur serveur OpenAI. Veuillez réessayer.',
}

/**
 * Parse OpenAI error and return user-friendly message
 */
export function parseOpenAIError(error: unknown): { code: string; message: string } {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()

    for (const [code, message] of Object.entries(OPENAI_ERROR_CODES)) {
      if (errorMessage.includes(code.replace('_', ' ')) || errorMessage.includes(code)) {
        return { code, message }
      }
    }

    // Check for status codes in message
    if (errorMessage.includes('429')) {
      return { code: 'rate_limit_exceeded', message: OPENAI_ERROR_CODES.rate_limit_exceeded }
    }
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return { code: 'invalid_api_key', message: OPENAI_ERROR_CODES.invalid_api_key }
    }
    if (errorMessage.includes('500') || errorMessage.includes('503')) {
      return { code: 'server_error', message: OPENAI_ERROR_CODES.server_error }
    }
  }

  return {
    code: 'unknown_error',
    message: 'Une erreur inattendue est survenue lors de la génération.',
  }
}
