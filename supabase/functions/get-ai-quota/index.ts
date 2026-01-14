// Supabase Edge Function: get-ai-quota
// Returns the current AI generation quota usage for the authenticated user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate start of current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Calculate start of next month (when quota resets)
    const nextMonth = new Date(startOfMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Get count of ideas generations this month
    const { count: ideasCount } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'ideas')
      .gte('created_at', startOfMonth.toISOString())

    // Get count of post generations this month
    const { count: postsCount } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('type', ['post_linkedin', 'post_instagram'])
      .gte('created_at', startOfMonth.toISOString())

    // Quota limits
    const ideasLimit = 100
    const postsLimit = 500

    const response = {
      ideas: {
        used: ideasCount ?? 0,
        remaining: Math.max(0, ideasLimit - (ideasCount ?? 0)),
        limit: ideasLimit,
      },
      posts: {
        used: postsCount ?? 0,
        remaining: Math.max(0, postsLimit - (postsCount ?? 0)),
        limit: postsLimit,
      },
      resetsAt: nextMonth.toISOString(),
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-ai-quota:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
