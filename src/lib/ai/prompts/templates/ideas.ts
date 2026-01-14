// Ideas Generation Prompt Template
// Generates 10-15 content ideas for social media

import type { PromptTemplate, PromptVariables, CompiledPrompt } from '../../../../types/prompts'
import { injectBrandContext, INTEGRIA_BRAND_CONTEXT, SWISS_FRENCH_GUIDELINES } from '../context'
import { IDEAS_OUTPUT_SCHEMA, schemaToPromptString } from '../schemas'

/**
 * Ideas generation prompt template - v1.0.0
 *
 * Changelog:
 * - v1.0.0 (2026-01-11): Initial version with IntegrIA context
 */
export const IDEAS_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'ideas-v1',
  type: 'ideas',
  name: 'Générateur d\'idées de contenu',
  description: 'Génère 10-15 idées de contenu originales et engageantes pour LinkedIn et Instagram',
  version: {
    version: '1.0.0',
    createdAt: '2026-01-11',
    description: 'Version initiale avec contexte IntegrIA et support multi-plateforme',
    changelog: 'Initial release',
  },
  systemPrompt: `Tu es un expert en content marketing spécialisé dans les réseaux sociaux professionnels (LinkedIn et Instagram).
Tu génères des idées de contenu originales, engageantes et adaptées au marché suisse romand.

Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après le JSON.

${SWISS_FRENCH_GUIDELINES}`,

  userPromptTemplate: `{{brandContext}}

MISSION:
Génère {{count}} idées de contenu originales et engageantes pour les réseaux sociaux.

{{#if themes}}
THÈMES À EXPLORER:
{{themes}}
{{/if}}

{{#if additionalContext}}
CONTEXTE ADDITIONNEL:
{{additionalContext}}
{{/if}}

POUR CHAQUE IDÉE, FOURNIS:
1. Un titre accrocheur (max 60 caractères) - doit donner envie de lire
2. Une description détaillée (2-3 phrases) - explique le contenu et son angle
3. La plateforme cible (linkedin, instagram, ou both) - selon le format et le ton
4. Le niveau d'engagement estimé (low, medium, high) - basé sur le potentiel viral
5. Une catégorie (conseil, actualite, temoignage, etude_cas, inspiration, behind_the_scenes)
6. 3-5 hashtags pertinents pour la Suisse romande

CRITÈRES DE QUALITÉ:
- Contenu 100% en français
- Adapté au marché suisse romand
- Évite les clichés marketing et le jargon
- Privilégie l'authenticité et la valeur ajoutée
- Varie les formats (conseils pratiques, questions, histoires, données)
- Équilibre entre LinkedIn (pro) et Instagram (lifestyle)

FORMAT DE RÉPONSE JSON:
${schemaToPromptString(IDEAS_OUTPUT_SCHEMA)}`,

  outputSchema: IDEAS_OUTPUT_SCHEMA,
}

/**
 * Compile the ideas prompt template with provided variables
 */
export function compileIdeasPrompt(variables: PromptVariables = {}): CompiledPrompt {
  const {
    brandContext = INTEGRIA_BRAND_CONTEXT,
    additionalContext,
    themes = ['productivité', 'innovation', 'entrepreneuriat', 'tech'],
    count = 15,
  } = variables

  // Build user prompt from template
  let userPrompt = IDEAS_PROMPT_TEMPLATE.userPromptTemplate
    .replace('{{brandContext}}', injectBrandContext(brandContext))
    .replace('{{count}}', String(Math.min(count, 20))) // Cap at 20

  // Handle conditional themes section
  if (themes && themes.length > 0) {
    userPrompt = userPrompt
      .replace('{{#if themes}}', '')
      .replace('{{/if}}', '')
      .replace('{{themes}}', themes.map(t => `- ${t}`).join('\n'))
  } else {
    // Remove the entire themes section if no themes
    userPrompt = userPrompt.replace(/\{\{#if themes\}\}[\s\S]*?\{\{\/if\}\}/g, '')
  }

  // Handle conditional additional context
  if (additionalContext) {
    userPrompt = userPrompt
      .replace('{{#if additionalContext}}', '')
      .replace('{{/if}}', '')
      .replace('{{additionalContext}}', additionalContext)
  } else {
    userPrompt = userPrompt.replace(/\{\{#if additionalContext\}\}[\s\S]*?\{\{\/if\}\}/g, '')
  }

  return {
    systemPrompt: IDEAS_PROMPT_TEMPLATE.systemPrompt,
    userPrompt,
    expectedSchema: IDEAS_OUTPUT_SCHEMA,
    metadata: {
      templateId: IDEAS_PROMPT_TEMPLATE.id,
      templateVersion: IDEAS_PROMPT_TEMPLATE.version.version,
      compiledAt: new Date().toISOString(),
      variables: {
        themes,
        count,
        hasAdditionalContext: !!additionalContext,
      },
    },
  }
}
