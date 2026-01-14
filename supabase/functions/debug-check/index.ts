// Debug Edge Function to check configuration
// This helps diagnose issues with generate-ideas

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const checks: Record<string, { status: string; message: string }> = {}

  // Check 1: Environment variables
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  checks['OPENAI_API_KEY'] = openaiKey
    ? { status: 'OK', message: `Set (starts with ${openaiKey.substring(0, 7)}...)` }
    : { status: 'ERROR', message: 'Not set' }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  checks['SUPABASE_URL'] = supabaseUrl
    ? { status: 'OK', message: supabaseUrl }
    : { status: 'ERROR', message: 'Not set' }

  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
  checks['SUPABASE_ANON_KEY'] = supabaseKey
    ? { status: 'OK', message: 'Set' }
    : { status: 'ERROR', message: 'Not set' }

  // Check 2: Authorization
  const authHeader = req.headers.get('Authorization')
  checks['AUTH_HEADER'] = authHeader
    ? { status: 'OK', message: 'Present' }
    : { status: 'ERROR', message: 'Missing' }

  // Check 3: User authentication
  if (authHeader && supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      })

      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        checks['USER_AUTH'] = { status: 'ERROR', message: `Auth error: ${userError.message}` }
      } else if (user) {
        checks['USER_AUTH'] = { status: 'OK', message: `User: ${user.email}` }

        // Check 4: ai_generations table exists
        try {
          const { error: tableError } = await supabase
            .from('ai_generations')
            .select('id', { count: 'exact', head: true })
            .limit(1)

          if (tableError) {
            checks['AI_GENERATIONS_TABLE'] = {
              status: 'ERROR',
              message: `Table error: ${tableError.message}`
            }
          } else {
            checks['AI_GENERATIONS_TABLE'] = { status: 'OK', message: 'Table exists and accessible' }
          }
        } catch (e) {
          checks['AI_GENERATIONS_TABLE'] = {
            status: 'ERROR',
            message: `Exception: ${e instanceof Error ? e.message : 'Unknown'}`
          }
        }

        // Check 5: users table
        try {
          const { data: userData, error: usersError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          if (usersError) {
            checks['USERS_TABLE'] = {
              status: 'ERROR',
              message: `Users table error: ${usersError.message}`
            }
          } else if (userData) {
            checks['USERS_TABLE'] = { status: 'OK', message: 'User exists in users table' }
          } else {
            checks['USERS_TABLE'] = {
              status: 'WARNING',
              message: 'User not found in users table (trigger may not have run)'
            }
          }
        } catch (e) {
          checks['USERS_TABLE'] = {
            status: 'ERROR',
            message: `Exception: ${e instanceof Error ? e.message : 'Unknown'}`
          }
        }

      } else {
        checks['USER_AUTH'] = { status: 'ERROR', message: 'No user found' }
      }
    } catch (e) {
      checks['SUPABASE_CLIENT'] = {
        status: 'ERROR',
        message: `Client error: ${e instanceof Error ? e.message : 'Unknown'}`
      }
    }
  }

  // Check 6: OpenAI API connectivity (simple test)
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
      })

      if (response.ok) {
        checks['OPENAI_API'] = { status: 'OK', message: 'API key valid' }
      } else {
        const errorText = await response.text()
        checks['OPENAI_API'] = {
          status: 'ERROR',
          message: `API error ${response.status}: ${errorText.substring(0, 100)}`
        }
      }
    } catch (e) {
      checks['OPENAI_API'] = {
        status: 'ERROR',
        message: `Connection error: ${e instanceof Error ? e.message : 'Unknown'}`
      }
    }
  }

  // Summary
  const hasErrors = Object.values(checks).some(c => c.status === 'ERROR')
  const summary = hasErrors
    ? 'Des erreurs ont été détectées. Corrigez-les avant de générer des idées.'
    : 'Toutes les vérifications sont OK!'

  return new Response(
    JSON.stringify({ summary, checks }, null, 2),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
