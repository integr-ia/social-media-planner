// Supabase Edge Function: generate-post
// Generates LinkedIn posts and Instagram captions from content ideas using OpenAI GPT-4
// STORY-010: API génération post LinkedIn
// STORY-011: API génération caption Instagram

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'
import {
  LINKEDIN_POST_TEMPLATE,
  INSTAGRAM_CAPTION_TEMPLATE,
  getTemplateId,
  getTemplateVersion
} from '../_shared/prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentIdea {
  id?: string
  title: string
  description: string
  category?: string
  targetPlatform?: string
  suggestedHashtags?: string[]
}

interface RequestBody {
  idea: ContentIdea
  platform?: 'linkedin' | 'instagram'
  tone?: 'professional' | 'casual' | 'inspirational'
  length?: 'short' | 'medium' | 'long'
}

interface LinkedInPostResponse {
  content: string
  hook: string
  callToAction: string
  hashtags: string[]
  wordCount: number
  tone: string
}

interface InstagramCaptionResponse {
  caption: string
  hook: string
  callToAction: string
  hashtags: string[]
  suggestedEmojis?: string[]
  visualSuggestion?: string
  wordCount: number
}

serve(async (req) => {
  console.log('[generate-post] === REQUEST RECEIVED ===', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    console.log('[generate-post] Has auth header:', !!authHeader)
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: { type: 'api_error', message: 'Missing authorization header' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')

    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Verify user
    console.log('[generate-post] Verifying user with token length:', token.length)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error('[generate-post] Auth error:', userError?.message, userError?.status)
      return new Response(
        JSON.stringify({
          error: {
            type: 'api_error',
            message: `Auth failed: ${userError?.message || 'No user'}`,
            code: userError?.code,
            status: userError?.status
          }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('[generate-post] User verified:', user.id)

    // Parse and validate request body
    const body: RequestBody = await req.json()

    // Validate idea object
    if (!body.idea || !body.idea.title || !body.idea.description) {
      return new Response(
        JSON.stringify({
          error: {
            type: 'validation_error',
            message: 'Idea with title and description is required'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const idea = body.idea
    const platform = body.platform ?? 'linkedin'
    const tone = body.tone ?? (platform === 'instagram' ? 'casual' : 'professional')
    const length = body.length ?? 'medium'

    // Validate platform
    if (platform !== 'linkedin' && platform !== 'instagram') {
      return new Response(
        JSON.stringify({
          error: {
            type: 'validation_error',
            message: 'Platform must be "linkedin" or "instagram"'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check monthly quota
    // Use admin client since we already verified the user
    console.log('Checking quota...')
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: usageCount, error: quotaError } = await supabaseAdmin
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('type', ['post_linkedin', 'post_instagram'])
      .gte('created_at', startOfMonth.toISOString())

    if (quotaError) {
      console.error('Quota check error:', quotaError.message)
    }
    console.log('Post generation quota usage:', usageCount ?? 0)

    const monthlyQuota = 100 // 100 post generations per month
    if ((usageCount ?? 0) >= monthlyQuota) {
      console.log('Quota exceeded')
      return new Response(
        JSON.stringify({
          error: {
            type: 'quota_exceeded',
            message: 'Monthly post generation quota exceeded. Quota resets on the 1st of each month.',
          },
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize OpenAI
    console.log('Initializing OpenAI...')
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not set!')
      throw new Error('OpenAI API key not configured')
    }

    const openai = new OpenAI({ apiKey: openaiKey })

    // Build prompts using template system based on platform
    console.log('Building prompts for platform:', platform)
    const isInstagram = platform === 'instagram'
    const template = isInstagram ? INSTAGRAM_CAPTION_TEMPLATE : LINKEDIN_POST_TEMPLATE
    const templateType = isInstagram ? 'post_instagram' : 'post_linkedin'

    const systemPrompt = template.systemPrompt
    const userPrompt = template.buildUserPrompt({
      idea: {
        title: idea.title,
        description: idea.description,
        category: idea.category,
      },
      tone,
      length,
    })

    // Log template usage
    const templateId = getTemplateId(templateType)
    const templateVersion = getTemplateVersion(templateType)
    console.log('Template:', templateId, templateVersion)

    // Call OpenAI
    console.log('Calling OpenAI API...')
    const startTime = Date.now()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })
    console.log('OpenAI response received in', Date.now() - startTime, 'ms')

    const durationMs = Date.now() - startTime
    const tokensUsed = completion.usage?.total_tokens ?? 0
    const responseText = completion.choices[0]?.message?.content ?? '{}'

    // Parse response based on platform
    let content: string
    let hook: string
    let callToAction: string
    let hashtags: string[]
    let wordCount: number
    let extraMetadata: Record<string, unknown> = {}

    try {
      const parsedResponse = JSON.parse(responseText)

      if (isInstagram) {
        // Instagram response uses 'caption' field
        const instagramData = parsedResponse as InstagramCaptionResponse
        if (!instagramData.caption) {
          throw new Error('Missing caption field in Instagram AI response')
        }
        content = instagramData.caption
        hook = instagramData.hook || ''
        callToAction = instagramData.callToAction || ''
        hashtags = instagramData.hashtags || []
        wordCount = instagramData.wordCount || 0
        extraMetadata = {
          suggestedEmojis: instagramData.suggestedEmojis,
          visualSuggestion: instagramData.visualSuggestion,
        }
      } else {
        // LinkedIn response uses 'content' field
        const linkedinData = parsedResponse as LinkedInPostResponse
        if (!linkedinData.content) {
          throw new Error('Missing content field in LinkedIn AI response')
        }
        content = linkedinData.content
        hook = linkedinData.hook || ''
        callToAction = linkedinData.callToAction || ''
        hashtags = linkedinData.hashtags || []
        wordCount = linkedinData.wordCount || 0
        extraMetadata = {
          tone: linkedinData.tone,
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Failed to parse AI response')
    }

    // Log generation to ai_generations table
    // Use admin client (service role) to bypass RLS - user already verified above
    const { error: generationLogError } = await supabaseAdmin
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: templateType,
        model: 'gpt-4-turbo-preview',
        prompt: `[${templateId}@${templateVersion}] ${userPrompt.substring(0, 4900)}`,
        response: responseText.substring(0, 10000),
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        success: true,
      })

    if (generationLogError) {
      console.error('Failed to log generation:', generationLogError)
    }

    // Create post in database as draft
    // Use admin client (service role) to bypass RLS - user already verified above
    console.log('Creating post in database...')
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: user.id,
        platform: platform,
        content: content,
        hashtags: hashtags,
        status: 'draft',
        idea_source: idea.title,
        ai_generated: true,
        metadata: {
          hook,
          callToAction,
          wordCount,
          ...extraMetadata,
          generationParams: {
            tone,
            length,
          },
          templateInfo: {
            id: templateId,
            version: templateVersion,
          },
        },
      })
      .select()
      .single()

    if (postError) {
      console.error('Failed to create post:', postError)
      throw new Error('Failed to save generated post')
    }

    // Calculate quota info
    const quotaUsed = (usageCount ?? 0) + 1

    // Return response
    const response = {
      post: {
        id: post.id,
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags,
        status: post.status,
        ideaSource: post.idea_source,
        aiGenerated: post.ai_generated,
        metadata: post.metadata,
        createdAt: post.created_at,
      },
      generation: {
        hook,
        callToAction,
        wordCount,
        ...extraMetadata,
        tokensUsed,
        durationMs,
      },
      quota: {
        used: quotaUsed,
        remaining: monthlyQuota - quotaUsed,
        limit: monthlyQuota,
      },
      templateInfo: {
        id: templateId,
        version: templateVersion,
      },
    }

    console.log('Post generated successfully:', post.id)
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in generate-post:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const status = errorMessage === 'Unauthorized' ? 401 : 500

    return new Response(
      JSON.stringify({
        error: {
          type: 'api_error',
          message: errorMessage,
        },
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
