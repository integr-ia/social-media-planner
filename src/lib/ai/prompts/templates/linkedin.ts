// LinkedIn Post Prompt Template
// Generates professional LinkedIn posts from content ideas

import type { PromptTemplate, PromptVariables, CompiledPrompt } from '../../../../types/prompts'
import { injectBrandContext, INTEGRIA_BRAND_CONTEXT, AUDIENCE_INSIGHTS, SWISS_FRENCH_GUIDELINES } from '../context'
import { LINKEDIN_POST_OUTPUT_SCHEMA, schemaToPromptString } from '../schemas'

/**
 * Length specifications for LinkedIn posts
 */
const LENGTH_SPECS = {
  short: { min: 100, max: 200, description: 'Court et percutant (100-200 mots)' },
  medium: { min: 200, max: 350, description: 'Standard engageant (200-350 mots)' },
  long: { min: 350, max: 500, description: 'Approfondi et détaillé (350-500 mots)' },
}

/**
 * Tone specifications for LinkedIn posts
 */
const TONE_SPECS = {
  professional: 'Ton expert et factuel, citations de données, insights business',
  casual: 'Ton conversationnel et accessible, storytelling personnel, questions ouvertes',
  inspirational: 'Ton motivant et visionnaire, appel à l\'action fort, partage de leçons apprises',
}

/**
 * LinkedIn post prompt template - v1.0.0
 *
 * Changelog:
 * - v1.0.0 (2026-01-11): Initial version with IntegrIA context
 */
export const LINKEDIN_POST_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'linkedin-post-v1',
  type: 'post_linkedin',
  name: 'Générateur de post LinkedIn',
  description: 'Génère un post LinkedIn professionnel et engageant à partir d\'une idée de contenu',
  version: {
    version: '1.0.0',
    createdAt: '2026-01-11',
    description: 'Version initiale optimisée pour l\'algorithme LinkedIn',
    changelog: 'Initial release',
  },
  systemPrompt: `Tu es un expert en copywriting LinkedIn spécialisé dans le contenu B2B tech et entrepreneuriat.
Tu crées des posts professionnels qui génèrent de l'engagement et établissent une expertise.

Tu connais parfaitement l'algorithme LinkedIn:
- Les premiers mots sont cruciaux (accroche)
- Les posts avec paragraphes courts performent mieux
- Les questions augmentent les commentaires
- Un CTA clair booste l'engagement

Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après le JSON.

${SWISS_FRENCH_GUIDELINES}`,

  userPromptTemplate: `{{brandContext}}

${AUDIENCE_INSIGHTS.linkedin}

IDÉE À DÉVELOPPER:
Titre: {{ideaTitle}}
Description: {{ideaDescription}}
{{#if ideaCategory}}Catégorie: {{ideaCategory}}{{/if}}

PARAMÈTRES DU POST:
- Longueur: {{lengthSpec}}
- Ton: {{toneSpec}}

STRUCTURE ATTENDUE:
1. ACCROCHE (Hook) - Première ligne qui capte l'attention
   → Question provocante, statistique surprenante, ou affirmation forte
   → Doit donner envie de cliquer "voir plus"

2. CONTEXTE - 1-2 paragraphes
   → Établir le problème ou l'opportunité
   → Connecter avec l'expérience du lecteur

3. CONTENU DE VALEUR - 2-4 paragraphes
   → Points clés numérotés ou bullet points
   → Conseils actionables
   → Exemples concrets

4. CONCLUSION & CTA - Dernière partie
   → Résumé de la valeur
   → Question ouverte OU appel à l'action clair
   → Hashtags pertinents

RÈGLES DE FORMATAGE:
- Paragraphes courts (2-3 lignes max)
- Sauts de ligne entre les paragraphes
- Utilise des → ou • pour les listes
- Maximum 1-2 emojis (optionnel, pas obligatoire)
- 3-5 hashtags professionnels à la fin

FORMAT DE RÉPONSE JSON:
${schemaToPromptString(LINKEDIN_POST_OUTPUT_SCHEMA)}`,

  outputSchema: LINKEDIN_POST_OUTPUT_SCHEMA,
}

/**
 * Compile the LinkedIn post prompt template with provided variables
 */
export function compileLinkedInPrompt(variables: PromptVariables): CompiledPrompt {
  const {
    brandContext = INTEGRIA_BRAND_CONTEXT,
    idea,
    tone = 'professional',
    length = 'medium',
  } = variables

  if (!idea) {
    throw new Error('Idea is required for LinkedIn post generation')
  }

  const lengthSpec = LENGTH_SPECS[length]
  const toneSpec = TONE_SPECS[tone]

  // Build user prompt from template
  let userPrompt = LINKEDIN_POST_PROMPT_TEMPLATE.userPromptTemplate
    .replace('{{brandContext}}', injectBrandContext(brandContext))
    .replace('{{ideaTitle}}', idea.title)
    .replace('{{ideaDescription}}', idea.description)
    .replace('{{lengthSpec}}', lengthSpec.description)
    .replace('{{toneSpec}}', toneSpec)

  // Handle conditional category
  if (idea.category) {
    userPrompt = userPrompt
      .replace('{{#if ideaCategory}}', '')
      .replace('{{/if}}', '')
      .replace('{{ideaCategory}}', idea.category)
  } else {
    userPrompt = userPrompt.replace(/\{\{#if ideaCategory\}\}.*?\{\{\/if\}\}/g, '')
  }

  return {
    systemPrompt: LINKEDIN_POST_PROMPT_TEMPLATE.systemPrompt,
    userPrompt,
    expectedSchema: LINKEDIN_POST_OUTPUT_SCHEMA,
    metadata: {
      templateId: LINKEDIN_POST_PROMPT_TEMPLATE.id,
      templateVersion: LINKEDIN_POST_PROMPT_TEMPLATE.version.version,
      compiledAt: new Date().toISOString(),
      variables: {
        ideaTitle: idea.title,
        tone,
        length,
        wordRange: `${lengthSpec.min}-${lengthSpec.max}`,
      },
    },
  }
}
