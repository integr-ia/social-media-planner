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

// Prompt templates system (STORY-006)
export {
  // Context injection
  INTEGRIA_BRAND_CONTEXT,
  injectBrandContext,
  formatBrandContext,
  SWISS_FRENCH_GUIDELINES,
  AUDIENCE_INSIGHTS,
  // Registry
  PROMPT_REGISTRY,
  getPromptTemplate,
  compilePrompt,
  getTemplateVersion,
  getAvailableTemplates,
  isTemplateImplemented,
  getTemplateMetadata,
  TEMPLATE_VERSION_HISTORY,
  // Templates
  IDEAS_PROMPT_TEMPLATE,
  compileIdeasPrompt,
  LINKEDIN_POST_PROMPT_TEMPLATE,
  compileLinkedInPrompt,
  INSTAGRAM_CAPTION_PROMPT_TEMPLATE,
  compileInstagramPrompt,
  SUGGESTED_HASHTAGS,
  // Schemas
  IDEAS_OUTPUT_SCHEMA,
  LINKEDIN_POST_OUTPUT_SCHEMA,
  INSTAGRAM_CAPTION_OUTPUT_SCHEMA,
  VARIANTS_OUTPUT_SCHEMA,
  schemaToPromptString,
} from './prompts'

// Prompt types
export type {
  PromptTemplate,
  PromptVersion,
  PromptVariables,
  CompiledPrompt,
  OutputSchema,
  SchemaProperty,
  BrandContext,
  GenerationType,
  ContentCategory,
  PromptRegistry,
  PromptRegistryEntry,
} from './prompts'

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
