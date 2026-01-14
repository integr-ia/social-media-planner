// Supabase Edge Function: generate-ideas
// Generates 10-15 content ideas using OpenAI GPT-4
// Uses prompt templates from STORY-006

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'
import { IDEAS_TEMPLATE, getTemplateId, getTemplateVersion } from '../_shared/prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  context?: string
  themes?: string[]
  count?: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
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
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: { type: 'api_error', message: 'Unauthorized' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user context for RLS queries
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Parse request body
    const body: RequestBody = await req.json()
    const count = Math.min(body.count ?? 15, 20) // Max 20 ideas
    const themes = body.themes ?? ['productivité', 'innovation', 'entrepreneuriat']
    const additionalContext = body.context ?? ''

    // Check monthly quota
    console.log('Checking quota...')
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: usageCount, error: quotaError } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'ideas')
      .gte('created_at', startOfMonth.toISOString())

    if (quotaError) {
      console.error('Quota check error:', quotaError.message)
    }
    console.log('Quota usage:', usageCount ?? 0)

    const monthlyQuota = 100
    if ((usageCount ?? 0) >= monthlyQuota) {
      console.log('Quota exceeded')
      return new Response(
        JSON.stringify({
          error: {
            type: 'quota_exceeded',
            message: 'Monthly quota exceeded. Quota resets on the 1st of each month.',
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
    console.log('OpenAI key present, length:', openaiKey.length)

    const openai = new OpenAI({ apiKey: openaiKey })

    // Build prompt using template system (STORY-006)
    console.log('Building prompts...')
    const systemPrompt = IDEAS_TEMPLATE.systemPrompt
    const userPrompt = IDEAS_TEMPLATE.buildUserPrompt({
      themes,
      count,
      additionalContext: additionalContext || undefined,
    })

    // Log template usage for analytics
    const templateId = getTemplateId('ideas')
    const templateVersion = getTemplateVersion('ideas')
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
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })
    console.log('OpenAI response received in', Date.now() - startTime, 'ms')

    const durationMs = Date.now() - startTime
    const tokensUsed = completion.usage?.total_tokens ?? 0
    const responseText = completion.choices[0]?.message?.content ?? '{}'

    // Parse response
    let ideas
    try {
      const parsed = JSON.parse(responseText)
      ideas = parsed.ideas ?? []
    } catch {
      throw new Error('Failed to parse AI response')
    }

    // Log generation to database with template metadata
    const { data: generation, error: insertError } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        type: 'ideas',
        model: 'gpt-4-turbo-preview',
        prompt: `[${templateId}@${templateVersion}] ${userPrompt.substring(0, 4900)}`,
        response: responseText.substring(0, 10000),
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        success: true,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to log generation:', insertError)
    }

    // Return response
    const quotaUsed = (usageCount ?? 0) + 1
    const response = {
      ideas,
      generationId: generation?.id ?? 'unknown',
      tokensUsed,
      durationMs,
      quotaUsed,
      quotaRemaining: monthlyQuota - quotaUsed,
      templateInfo: {
        id: templateId,
        version: templateVersion,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in generate-ideas:', error)

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
