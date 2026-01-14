-- =============================================================
-- Social Media Planner - Supabase Database Setup
-- =============================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- USERS TABLE
-- =============================================================
-- This table syncs with Supabase Auth's auth.users table
-- It stores additional user profile data

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================
-- TRIGGER: Auto-create user profile on auth signup
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- POSTS TABLE (for future use)
-- =============================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE post_platform AS ENUM ('linkedin', 'instagram', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform post_platform NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  status post_status DEFAULT 'draft' NOT NULL,
  idea_source TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  template_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT scheduled_posts_have_date CHECK (
    status != 'scheduled' OR scheduled_at IS NOT NULL
  ),
  CONSTRAINT published_posts_have_date CHECK (
    status != 'published' OR published_at IS NOT NULL
  )
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_platform ON public.posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Apply updated_at trigger to posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- AI_GENERATIONS TABLE (for tracking AI usage and quota)
-- =============================================================

DO $$ BEGIN
  CREATE TYPE generation_type AS ENUM ('ideas', 'post_linkedin', 'post_instagram', 'variants');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type generation_type NOT NULL,
  model VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for ai_generations
CREATE INDEX IF NOT EXISTS idx_ai_gen_user_id ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_type ON public.ai_generations(type);
CREATE INDEX IF NOT EXISTS idx_ai_gen_created_at ON public.ai_generations(created_at DESC);

-- Enable RLS for ai_generations
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- AI generations policies
CREATE POLICY "Users can view own generations"
  ON public.ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- VERIFICATION QUERY
-- =============================================================
-- Run this to verify the setup is complete:

-- SELECT
--   table_name,
--   (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
-- FROM information_schema.tables t
-- WHERE table_schema = 'public'
-- AND table_name IN ('users', 'posts');

-- =============================================================
-- NOTES
-- =============================================================
--
-- 1. After running this SQL, go to Authentication > Settings and:
--    - Enable email confirmations (optional for dev)
--    - Set Site URL to http://localhost:5173
--    - Add redirect URLs for your app
--
-- 2. Go to Project Settings > API to get your:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_ANON_KEY
--
-- 3. Row Level Security (RLS) ensures users can only access their own data
--
-- 4. The trigger automatically creates a user profile when someone signs up
--
-- =============================================================
