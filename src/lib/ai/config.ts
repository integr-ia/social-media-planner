// AI Configuration for Social Media Planner
// These settings are used by Supabase Edge Functions for AI generation

export const AI_CONFIG = {
  // Model settings
  model: 'gpt-4-turbo-preview',
  fallbackModel: 'gpt-3.5-turbo',

  // Generation limits
  maxTokensIdeas: 2000,
  maxTokensPost: 1000,
  maxTokensVariants: 1500,

  // Timeouts (in milliseconds)
  timeoutIdeas: 120000, // 2 minutes for ideas (OpenAI can be slow)
  timeoutPost: 60000,   // 1 minute for single post
  timeoutVariants: 60000, // 1 minute for variants

  // Temperature settings (creativity)
  temperatureIdeas: 0.8,  // More creative for ideas
  temperaturePost: 0.7,   // Balanced for posts
  temperatureVariants: 0.6, // Less random for variants

  // Rate limiting (per user per month)
  monthlyQuotaIdeas: 100,
  monthlyQuotaPosts: 500,

  // Retry settings
  maxRetries: 3,
  retryDelayMs: 1000,
  retryBackoffMultiplier: 2,
} as const

// Context for IntegrIA brand
export const INTEGRIA_CONTEXT = {
  company: 'IntegrIA',
  location: 'Suisse romande',
  sector: 'Accompagnement tech pour entrepreneurs',
  tone: 'Professionnel mais accessible, inspirant, pragmatique',
  language: 'Français',
  targetAudience: 'Entrepreneurs, startups, PME tech en Suisse romande',
  values: ['Innovation', 'Pragmatisme', 'Accompagnement humain', 'Expertise tech'],
}

// Platform-specific settings
export const PLATFORM_SETTINGS = {
  linkedin: {
    minLength: 150,
    maxLength: 3000,
    idealLength: { min: 200, max: 400 },
    hashtagCount: { min: 3, max: 5 },
    tone: 'Professionnel, expert, inspirant',
    structure: 'Accroche forte, contenu de valeur, CTA clair',
  },
  instagram: {
    minLength: 80,
    maxLength: 2200,
    idealLength: { min: 100, max: 200 },
    hashtagCount: { min: 5, max: 15 },
    tone: 'Léger, engageant, avec emojis',
    structure: 'Hook visuel, contenu concis, hashtags pertinents',
  },
} as const

export type Platform = keyof typeof PLATFORM_SETTINGS
