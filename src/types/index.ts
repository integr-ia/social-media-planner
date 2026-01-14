/**
 * Type exports for Social Media Planner
 *
 * Re-exports all types from individual modules for easier imports.
 */

// Database types
export type {
  Json,
  Database,
  User,
  Post,
  PostInsert,
  PostUpdate,
  Template,
  Media,
  AIGeneration,
} from './database'

// Extract enum types from Database for convenience
export type PostPlatform = 'linkedin' | 'instagram' | 'both'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
export type TemplateCategory = 'conseil' | 'actualite' | 'temoignage' | 'etude_cas' | 'promo' | 'autre'
export type MediaType = 'image' | 'video'
export type GenerationType = 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'

// AI types
export type {
  ContentIdea,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  AIGenerationError,
  QuotaInfo,
  QuotaCategory,
} from './ai'

// Prompt types
export type {
  PromptTemplate,
  PromptVariables,
  Platform,
  ContentCategory,
  OutputSchema,
  SchemaProperty,
  BrandContext,
  CompiledPrompt,
} from './prompts'
