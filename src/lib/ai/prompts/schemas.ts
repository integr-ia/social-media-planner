// JSON Output Schemas for AI Responses
// These schemas define the expected structure of AI-generated content

import type { OutputSchema } from '../../../types/prompts'

/**
 * Schema for idea generation output
 * Defines the structure of generated content ideas
 */
export const IDEAS_OUTPUT_SCHEMA: OutputSchema = {
  type: 'object',
  description: 'Liste d\'idées de contenu générées par l\'IA',
  properties: {
    ideas: {
      type: 'array',
      description: 'Tableau des idées générées',
      items: {
        type: 'object',
        description: 'Une idée de contenu',
        properties: {
          id: {
            type: 'string',
            description: 'Identifiant unique de l\'idée (format: idea-1, idea-2, etc.)',
          },
          title: {
            type: 'string',
            description: 'Titre accrocheur de l\'idée',
            maxLength: 80,
          },
          description: {
            type: 'string',
            description: 'Description détaillée de l\'idée (2-3 phrases)',
            minLength: 50,
            maxLength: 300,
          },
          targetPlatform: {
            type: 'string',
            description: 'Plateforme cible recommandée',
            enum: ['linkedin', 'instagram', 'both'],
          },
          estimatedEngagement: {
            type: 'string',
            description: 'Niveau d\'engagement estimé',
            enum: ['low', 'medium', 'high'],
          },
          category: {
            type: 'string',
            description: 'Catégorie de contenu',
            enum: ['conseil', 'actualite', 'temoignage', 'etude_cas', 'inspiration', 'behind_the_scenes'],
          },
          suggestedHashtags: {
            type: 'array',
            description: 'Hashtags suggérés pour cette idée',
            items: {
              type: 'string',
              description: 'Un hashtag sans le symbole #',
            },
          },
        },
      },
    },
  },
  required: ['ideas'],
}

/**
 * Schema for LinkedIn post output
 * Defines the structure of generated LinkedIn content
 */
export const LINKEDIN_POST_OUTPUT_SCHEMA: OutputSchema = {
  type: 'object',
  description: 'Post LinkedIn généré par l\'IA',
  properties: {
    content: {
      type: 'string',
      description: 'Contenu complet du post LinkedIn',
      minLength: 150,
      maxLength: 3000,
    },
    hook: {
      type: 'string',
      description: 'Accroche du post (première ligne)',
      maxLength: 150,
    },
    callToAction: {
      type: 'string',
      description: 'Appel à l\'action à la fin du post',
      maxLength: 100,
    },
    hashtags: {
      type: 'array',
      description: 'Hashtags professionnels pour LinkedIn',
      items: {
        type: 'string',
        description: 'Un hashtag sans le symbole #',
      },
    },
    wordCount: {
      type: 'number',
      description: 'Nombre de mots dans le post',
      minimum: 100,
      maximum: 500,
    },
    tone: {
      type: 'string',
      description: 'Ton utilisé dans le post',
      enum: ['professional', 'inspirational', 'educational', 'conversational'],
    },
  },
  required: ['content', 'hashtags'],
}

/**
 * Schema for Instagram caption output
 * Defines the structure of generated Instagram content
 */
export const INSTAGRAM_CAPTION_OUTPUT_SCHEMA: OutputSchema = {
  type: 'object',
  description: 'Caption Instagram générée par l\'IA',
  properties: {
    caption: {
      type: 'string',
      description: 'Contenu de la caption Instagram',
      minLength: 50,
      maxLength: 2200,
    },
    hook: {
      type: 'string',
      description: 'Accroche visuelle (première ligne)',
      maxLength: 100,
    },
    callToAction: {
      type: 'string',
      description: 'Appel à l\'action engageant',
      maxLength: 80,
    },
    hashtags: {
      type: 'array',
      description: 'Hashtags mixtes (populaires + niche)',
      items: {
        type: 'string',
        description: 'Un hashtag sans le symbole #',
      },
    },
    suggestedEmojis: {
      type: 'array',
      description: 'Emojis suggérés pour le post',
      items: {
        type: 'string',
        description: 'Un emoji',
      },
    },
    visualSuggestion: {
      type: 'string',
      description: 'Suggestion pour l\'image/visuel accompagnant',
      maxLength: 200,
    },
    wordCount: {
      type: 'number',
      description: 'Nombre de mots dans la caption',
      minimum: 50,
      maximum: 300,
    },
  },
  required: ['caption', 'hashtags'],
}

/**
 * Schema for post variants output
 */
export const VARIANTS_OUTPUT_SCHEMA: OutputSchema = {
  type: 'object',
  description: 'Variantes de post générées par l\'IA',
  properties: {
    variants: {
      type: 'array',
      description: 'Liste des variantes générées',
      items: {
        type: 'object',
        description: 'Une variante du post original',
        properties: {
          id: {
            type: 'string',
            description: 'Identifiant de la variante',
          },
          variationType: {
            type: 'string',
            description: 'Type de variation appliquée',
            enum: ['shorter', 'longer', 'more_casual', 'more_professional', 'with_cta', 'with_question'],
          },
          content: {
            type: 'string',
            description: 'Contenu de la variante',
          },
          hashtags: {
            type: 'array',
            description: 'Hashtags adaptés à la variante',
            items: {
              type: 'string',
              description: 'Un hashtag',
            },
          },
          changesSummary: {
            type: 'string',
            description: 'Résumé des modifications apportées',
            maxLength: 150,
          },
        },
      },
    },
  },
  required: ['variants'],
}

/**
 * Convert OutputSchema to a string format for prompt injection
 */
export function schemaToPromptString(schema: OutputSchema): string {
  const formatProperty = (prop: OutputSchema['properties'], indent = 2): string => {
    if (!prop) return ''

    return Object.entries(prop)
      .map(([key, value]) => {
        const spaces = ' '.repeat(indent)
        let line = `${spaces}"${key}": `

        if (value.type === 'array' && value.items) {
          line += `[${value.items.type}] // ${value.description}`
        } else if (value.type === 'object' && value.properties) {
          line += `{\n${formatProperty(value.properties, indent + 2)}\n${spaces}}`
        } else if (value.enum) {
          line += `"${value.enum.join('|')}" // ${value.description}`
        } else {
          line += `${value.type} // ${value.description}`
        }

        return line
      })
      .join('\n')
  }

  if (schema.type === 'object' && schema.properties) {
    return `{\n${formatProperty(schema.properties)}\n}`
  }

  return JSON.stringify(schema, null, 2)
}
