// Brand Context for AI Prompt Injection
// IntegrIA-specific context that gets injected into all prompts

import type { BrandContext } from '../../../types/prompts'

/**
 * IntegrIA brand context - core identity for content generation
 * This context is injected into all prompts to ensure brand consistency
 */
export const INTEGRIA_BRAND_CONTEXT: BrandContext = {
  company: 'IntegrIA',
  location: 'Suisse romande',
  sector: 'Accompagnement tech pour entrepreneurs et startups',
  tone: 'Professionnel mais accessible, inspirant, pragmatique, authentique',
  language: 'Français',
  targetAudience: 'Entrepreneurs, fondateurs de startups, PME tech, décideurs IT en Suisse romande',
  values: [
    'Innovation pratique',
    'Pragmatisme',
    'Accompagnement humain',
    'Expertise tech accessible',
    'Transparence',
    'Impact local',
  ],
}

/**
 * Format brand context as a string for prompt injection
 */
export function formatBrandContext(context: BrandContext): string {
  return `Entreprise: ${context.company}
Localisation: ${context.location}
Secteur: ${context.sector}
Ton de communication: ${context.tone}
Langue: ${context.language}
Public cible: ${context.targetAudience}
Valeurs: ${context.values.join(', ')}`
}

/**
 * Create the full brand context section for system prompts
 */
export function injectBrandContext(context: BrandContext = INTEGRIA_BRAND_CONTEXT): string {
  return `Tu travailles pour ${context.company}, une entreprise basée en ${context.location}.

CONTEXTE DE L'ENTREPRISE:
${formatBrandContext(context)}

INSTRUCTIONS GÉNÉRALES:
- Tout le contenu doit être en français
- Adapte le contenu au marché suisse romand
- Utilise un ton ${context.tone.toLowerCase()}
- Cible principalement: ${context.targetAudience}
- Reflète les valeurs: ${context.values.join(', ')}
- Évite les clichés marketing et le jargon excessif
- Privilégie l'authenticité et la valeur ajoutée concrète`
}

/**
 * Swiss French specific formatting guidelines
 */
export const SWISS_FRENCH_GUIDELINES = `
RÈGLES DE FRANÇAIS SUISSE:
- Utilise "nonante" au lieu de "quatre-vingt-dix" si approprié au contexte
- Préfère les expressions locales quand pertinent
- Référence le contexte économique suisse (PME, innovation, qualité)
- Évite les expressions trop franco-françaises
- Considère le multilinguisme romand (potentiel code-switching léger)
`

/**
 * Platform-specific audience insights
 */
export const AUDIENCE_INSIGHTS = {
  linkedin: `
AUDIENCE LINKEDIN EN SUISSE ROMANDE:
- Professionnels tech, entrepreneurs, décideurs
- Valorisent l'expertise et les conseils pratiques
- Préfèrent le contenu de qualité au contenu fréquent
- Réseautage actif mais sélectif
- Sensibles à l'innovation et aux tendances tech`,

  instagram: `
AUDIENCE INSTAGRAM EN SUISSE ROMANDE:
- Mix entrepreneurs, employés tech, curieux de l'innovation
- Apprécient le behind-the-scenes et l'authenticité
- Répondent bien aux stories et au contenu visuel
- Engagement fort sur le contenu local
- Intéressés par le lifestyle entrepreneurial`,
}
