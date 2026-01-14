// Prompt Template Types for Social Media Planner
// Version-controlled prompt templates for AI content generation

/**
 * Platform type for content generation
 */
export type Platform = 'linkedin' | 'instagram'

/**
 * Content category for organizing ideas and posts
 */
export type ContentCategory =
  | 'conseil'
  | 'actualite'
  | 'temoignage'
  | 'etude_cas'
  | 'inspiration'
  | 'behind_the_scenes'
  | 'promo'
  | 'autre'

/**
 * Generation type identifier
 */
export type GenerationType = 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'

/**
 * Prompt template version information
 */
export interface PromptVersion {
  version: string
  createdAt: string
  description: string
  changelog?: string
}

/**
 * Base prompt template structure
 */
export interface PromptTemplate {
  id: string
  type: GenerationType
  name: string
  description: string
  version: PromptVersion
  systemPrompt: string
  userPromptTemplate: string
  outputSchema: OutputSchema
}

/**
 * JSON output schema definition for structured AI responses
 */
export interface OutputSchema {
  type: 'object' | 'array'
  description: string
  properties?: Record<string, SchemaProperty>
  items?: SchemaProperty
  required?: string[]
}

/**
 * Schema property definition
 */
export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  enum?: string[]
  items?: SchemaProperty
  properties?: Record<string, SchemaProperty>
  maxLength?: number
  minLength?: number
  minimum?: number
  maximum?: number
}

/**
 * IntegrIA brand context for injection
 */
export interface BrandContext {
  company: string
  location: string
  sector: string
  tone: string
  language: string
  targetAudience: string
  values: string[]
}

/**
 * Variables that can be injected into prompt templates
 */
export interface PromptVariables {
  // Common variables
  brandContext?: BrandContext
  additionalContext?: string

  // Ideas generation
  themes?: string[]
  count?: number

  // Post generation
  idea?: {
    title: string
    description: string
    category?: string
  }
  platform?: Platform
  tone?: 'professional' | 'casual' | 'inspirational'
  length?: 'short' | 'medium' | 'long'

  // Variants generation
  originalContent?: string
  variationTypes?: string[]
}

/**
 * Compiled prompt ready for API call
 */
export interface CompiledPrompt {
  systemPrompt: string
  userPrompt: string
  expectedSchema: OutputSchema
  metadata: {
    templateId: string
    templateVersion: string
    compiledAt: string
    variables: Record<string, unknown>
  }
}

/**
 * Prompt template registry entry
 */
export interface PromptRegistryEntry {
  template: PromptTemplate
  compile: (variables: PromptVariables) => CompiledPrompt
}

/**
 * Prompt template registry
 */
export type PromptRegistry = Record<GenerationType, PromptRegistryEntry>
