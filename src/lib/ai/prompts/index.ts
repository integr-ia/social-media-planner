// AI Prompt Templates Module
// Central export for all prompt-related functionality

// Context and brand injection
export {
  INTEGRIA_BRAND_CONTEXT,
  injectBrandContext,
  formatBrandContext,
  SWISS_FRENCH_GUIDELINES,
  AUDIENCE_INSIGHTS,
} from './context'

// Registry and utilities
export {
  PROMPT_REGISTRY,
  getPromptTemplate,
  compilePrompt,
  getTemplateVersion,
  getAvailableTemplates,
  isTemplateImplemented,
  getTemplateMetadata,
  TEMPLATE_VERSION_HISTORY,
} from './registry'

// Individual templates
export { IDEAS_PROMPT_TEMPLATE, compileIdeasPrompt } from './templates/ideas'
export { LINKEDIN_POST_PROMPT_TEMPLATE, compileLinkedInPrompt } from './templates/linkedin'
export { INSTAGRAM_CAPTION_PROMPT_TEMPLATE, compileInstagramPrompt, SUGGESTED_HASHTAGS } from './templates/instagram'

// Output schemas
export {
  IDEAS_OUTPUT_SCHEMA,
  LINKEDIN_POST_OUTPUT_SCHEMA,
  INSTAGRAM_CAPTION_OUTPUT_SCHEMA,
  VARIANTS_OUTPUT_SCHEMA,
  schemaToPromptString,
} from './schemas'

// Re-export types
export type {
  PromptTemplate,
  PromptVersion,
  PromptVariables,
  CompiledPrompt,
  OutputSchema,
  SchemaProperty,
  BrandContext,
  GenerationType,
  Platform,
  ContentCategory,
  PromptRegistry,
  PromptRegistryEntry,
} from '../../../types/prompts'
