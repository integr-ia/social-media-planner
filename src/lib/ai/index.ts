// AI Module - Exports for Social Media Planner
// Use this module to interact with AI services

export { aiClient, AIClient } from './client'
export { AI_CONFIG, INTEGRIA_CONTEXT, PLATFORM_SETTINGS } from './config'
export type { Platform } from './config'

// OpenAI utilities for server-side usage
export {
  createSystemPrompt,
  getPlatformInstructions,
  validateApiKey,
  parseOpenAIError,
  OPENAI_DEFAULTS,
  GENERATION_PRESETS,
  OPENAI_ERROR_CODES,
} from './openai'
export type { OpenAIClientConfig } from './openai'

// Re-export types for convenience
export type {
  ContentIdea,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  GeneratePostRequest,
  GeneratePostResponse,
  GenerateVariantsRequest,
  GenerateVariantsResponse,
  PostVariant,
  AIGenerationError,
  QuotaInfo,
} from '../../types/ai'
