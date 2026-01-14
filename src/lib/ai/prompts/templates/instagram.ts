// Instagram Caption Prompt Template
// Generates engaging Instagram captions with hashtags

import type { PromptTemplate, PromptVariables, CompiledPrompt } from '../../../../types/prompts'
import { injectBrandContext, INTEGRIA_BRAND_CONTEXT, AUDIENCE_INSIGHTS, SWISS_FRENCH_GUIDELINES } from '../context'
import { INSTAGRAM_CAPTION_OUTPUT_SCHEMA, schemaToPromptString } from '../schemas'

/**
 * Length specifications for Instagram captions
 */
const LENGTH_SPECS = {
  short: { min: 50, max: 100, description: 'Courte et punchy (50-100 mots)' },
  medium: { min: 100, max: 180, description: 'Équilibrée (100-180 mots)' },
  long: { min: 180, max: 280, description: 'Storytelling complet (180-280 mots)' },
}

/**
 * Tone specifications for Instagram captions
 */
const TONE_SPECS = {
  professional: 'Ton expert mais accessible, insights concis, crédibilité',
  casual: 'Ton décontracté et authentique, emojis, langage du quotidien',
  inspirational: 'Ton motivant et positif, énergie, appel à l\'action émotionnel',
}

/**
 * Popular Swiss Romande tech/business hashtags
 */
export const SUGGESTED_HASHTAGS = {
  location: ['SuisseRomande', 'SwissTech', 'Geneve', 'Lausanne', 'Romandie', 'SwissStartup'],
  tech: ['TechSuisse', 'Innovation', 'Digital', 'IA', 'Startup', 'Entrepreneur'],
  business: ['PME', 'Business', 'Leadership', 'Productivite', 'Croissance'],
  lifestyle: ['VieEntrepreneur', 'Motivation', 'Succes', 'WorkLifeBalance'],
}

/**
 * Instagram caption prompt template - v1.0.0
 *
 * Changelog:
 * - v1.0.0 (2026-01-11): Initial version with IntegrIA context
 */
export const INSTAGRAM_CAPTION_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'instagram-caption-v1',
  type: 'post_instagram',
  name: 'Générateur de caption Instagram',
  description: 'Génère une caption Instagram engageante avec hashtags optimisés',
  version: {
    version: '1.0.0',
    createdAt: '2026-01-11',
    description: 'Version initiale optimisée pour l\'engagement Instagram',
    changelog: 'Initial release',
  },
  systemPrompt: `Tu es un expert en création de contenu Instagram pour les marques tech et entrepreneuriales.
Tu crées des captions qui génèrent de l'engagement et reflètent l'authenticité de la marque.

Tu connais les meilleures pratiques Instagram:
- La première ligne est cruciale (hook visuel)
- Les emojis augmentent l'engagement quand bien utilisés
- Les questions en fin de post boostent les commentaires
- Les hashtags doivent mélanger populaires et niche
- Le ton est plus léger que LinkedIn mais reste professionnel

Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après le JSON.

${SWISS_FRENCH_GUIDELINES}`,

  userPromptTemplate: `{{brandContext}}

${AUDIENCE_INSIGHTS.instagram}

IDÉE À DÉVELOPPER:
Titre: {{ideaTitle}}
Description: {{ideaDescription}}
{{#if ideaCategory}}Catégorie: {{ideaCategory}}{{/if}}

PARAMÈTRES DE LA CAPTION:
- Longueur: {{lengthSpec}}
- Ton: {{toneSpec}}

STRUCTURE ATTENDUE:
1. HOOK (Accroche visuelle)
   → Première ligne qui capte l'attention immédiatement
   → Peut inclure un emoji accrocheur
   → Doit créer la curiosité ou l'émotion

2. CORPS DU MESSAGE
   → Contenu de valeur concis
   → Storytelling personnel si approprié
   → Emojis stratégiques (pas plus de 5-8 au total)
   → Paragraphes courts ou liste

3. CALL-TO-ACTION
   → Question engageante OU
   → Invitation à commenter/partager OU
   → Incitation à sauvegarder le post

4. HASHTAGS (séparés du texte principal)
   → 8-12 hashtags optimaux
   → Mix: 30% populaires (>500K), 40% moyens (10K-500K), 30% niche (<10K)
   → Inclure des hashtags Suisse romande

CATÉGORIES DE HASHTAGS À INCLURE:
- Localisation: ${SUGGESTED_HASHTAGS.location.slice(0, 3).join(', ')}
- Tech/Business: ${SUGGESTED_HASHTAGS.tech.slice(0, 4).join(', ')}
- Thématique liée au contenu

RÈGLES DE STYLE:
- Ton plus léger et accessible que LinkedIn
- Emojis pertinents et pas excessifs
- Sauts de ligne pour aérer
- La caption doit pouvoir fonctionner AVEC un visuel
- Suggère une idée de visuel approprié

FORMAT DE RÉPONSE JSON:
${schemaToPromptString(INSTAGRAM_CAPTION_OUTPUT_SCHEMA)}`,

  outputSchema: INSTAGRAM_CAPTION_OUTPUT_SCHEMA,
}

/**
 * Compile the Instagram caption prompt template with provided variables
 */
export function compileInstagramPrompt(variables: PromptVariables): CompiledPrompt {
  const {
    brandContext = INTEGRIA_BRAND_CONTEXT,
    idea,
    tone = 'casual',
    length = 'medium',
  } = variables

  if (!idea) {
    throw new Error('Idea is required for Instagram caption generation')
  }

  const lengthSpec = LENGTH_SPECS[length]
  const toneSpec = TONE_SPECS[tone]

  // Build user prompt from template
  let userPrompt = INSTAGRAM_CAPTION_PROMPT_TEMPLATE.userPromptTemplate
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
    systemPrompt: INSTAGRAM_CAPTION_PROMPT_TEMPLATE.systemPrompt,
    userPrompt,
    expectedSchema: INSTAGRAM_CAPTION_OUTPUT_SCHEMA,
    metadata: {
      templateId: INSTAGRAM_CAPTION_PROMPT_TEMPLATE.id,
      templateVersion: INSTAGRAM_CAPTION_PROMPT_TEMPLATE.version.version,
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
