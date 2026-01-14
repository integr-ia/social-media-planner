// Prompt Template Registry
// Central registry for all prompt templates with versioning support

import type {
  PromptTemplate,
  PromptVariables,
  CompiledPrompt,
  GenerationType,
  PromptVersion,
} from '../../../types/prompts'

import { IDEAS_PROMPT_TEMPLATE, compileIdeasPrompt } from './templates/ideas'
import { LINKEDIN_POST_PROMPT_TEMPLATE, compileLinkedInPrompt } from './templates/linkedin'
import { INSTAGRAM_CAPTION_PROMPT_TEMPLATE, compileInstagramPrompt } from './templates/instagram'

/**
 * Registry of all available prompt templates
 */
export const PROMPT_REGISTRY: Record<GenerationType, {
  template: PromptTemplate
  compile: (variables: PromptVariables) => CompiledPrompt
}> = {
  ideas: {
    template: IDEAS_PROMPT_TEMPLATE,
    compile: compileIdeasPrompt,
  },
  post_linkedin: {
    template: LINKEDIN_POST_PROMPT_TEMPLATE,
    compile: compileLinkedInPrompt,
  },
  post_instagram: {
    template: INSTAGRAM_CAPTION_PROMPT_TEMPLATE,
    compile: compileInstagramPrompt,
  },
  variants: {
    // Placeholder - to be implemented in future story
    template: {
      id: 'variants-v1',
      type: 'variants',
      name: 'Générateur de variantes',
      description: 'Génère des variantes d\'un post existant',
      version: {
        version: '0.1.0',
        createdAt: '2026-01-11',
        description: 'Placeholder - à implémenter',
      },
      systemPrompt: '',
      userPromptTemplate: '',
      outputSchema: { type: 'object', description: 'Variantes de post' },
    },
    compile: () => {
      throw new Error('Variants template not yet implemented')
    },
  },
}

/**
 * Get a prompt template by type
 */
export function getPromptTemplate(type: GenerationType): PromptTemplate {
  const entry = PROMPT_REGISTRY[type]
  if (!entry) {
    throw new Error(`Unknown prompt template type: ${type}`)
  }
  return entry.template
}

/**
 * Compile a prompt template with variables
 */
export function compilePrompt(type: GenerationType, variables: PromptVariables): CompiledPrompt {
  const entry = PROMPT_REGISTRY[type]
  if (!entry) {
    throw new Error(`Unknown prompt template type: ${type}`)
  }
  return entry.compile(variables)
}

/**
 * Get version information for a template
 */
export function getTemplateVersion(type: GenerationType): PromptVersion {
  return getPromptTemplate(type).version
}

/**
 * Get all available template types
 */
export function getAvailableTemplates(): GenerationType[] {
  return Object.keys(PROMPT_REGISTRY) as GenerationType[]
}

/**
 * Check if a template type exists and is implemented
 */
export function isTemplateImplemented(type: GenerationType): boolean {
  const entry = PROMPT_REGISTRY[type]
  if (!entry) return false

  try {
    // Try to compile with minimal variables to check if implemented
    if (type === 'ideas') {
      entry.compile({})
      return true
    }
    // Other types require idea variable
    return entry.template.systemPrompt.length > 0
  } catch {
    return false
  }
}

/**
 * Get template metadata for logging/analytics
 */
export function getTemplateMetadata(type: GenerationType): {
  id: string
  version: string
  name: string
} {
  const template = getPromptTemplate(type)
  return {
    id: template.id,
    version: template.version.version,
    name: template.name,
  }
}

/**
 * Version history for tracking template changes
 * This can be used for A/B testing different prompt versions
 */
export const TEMPLATE_VERSION_HISTORY: Record<GenerationType, PromptVersion[]> = {
  ideas: [
    IDEAS_PROMPT_TEMPLATE.version,
  ],
  post_linkedin: [
    LINKEDIN_POST_PROMPT_TEMPLATE.version,
  ],
  post_instagram: [
    INSTAGRAM_CAPTION_PROMPT_TEMPLATE.version,
  ],
  variants: [
    PROMPT_REGISTRY.variants.template.version,
  ],
}
