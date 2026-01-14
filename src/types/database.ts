// Database types for Supabase
// These types will be auto-generated once you run `supabase gen types typescript`
// For now, we define the basic structure manually

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          platform: 'linkedin' | 'instagram' | 'both'
          content: string
          hashtags: string[]
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          idea_source: string | null
          ai_generated: boolean
          rating: number | null
          scheduled_at: string | null
          published_at: string | null
          error_message: string | null
          template_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'linkedin' | 'instagram' | 'both'
          content: string
          hashtags?: string[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          idea_source?: string | null
          ai_generated?: boolean
          rating?: number | null
          scheduled_at?: string | null
          published_at?: string | null
          error_message?: string | null
          template_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'linkedin' | 'instagram' | 'both'
          content?: string
          hashtags?: string[]
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          idea_source?: string | null
          ai_generated?: boolean
          rating?: number | null
          scheduled_at?: string | null
          published_at?: string | null
          error_message?: string | null
          template_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'posts_template_id_fkey'
            columns: ['template_id']
            referencedRelation: 'templates'
            referencedColumns: ['id']
          }
        ]
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: 'conseil' | 'actualite' | 'temoignage' | 'etude_cas' | 'promo' | 'autre'
          platform: 'linkedin' | 'instagram' | 'both'
          content: string
          hashtags: string[]
          variables: Json
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: 'conseil' | 'actualite' | 'temoignage' | 'etude_cas' | 'promo' | 'autre'
          platform: 'linkedin' | 'instagram' | 'both'
          content: string
          hashtags?: string[]
          variables?: Json
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: 'conseil' | 'actualite' | 'temoignage' | 'etude_cas' | 'promo' | 'autre'
          platform?: 'linkedin' | 'instagram' | 'both'
          content?: string
          hashtags?: string[]
          variables?: Json
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'templates_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      media: {
        Row: {
          id: string
          user_id: string
          type: 'image' | 'video'
          filename: string
          storage_path: string
          url: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          duration: number | null
          tags: string[]
          alt_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'image' | 'video'
          filename: string
          storage_path: string
          url: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          duration?: number | null
          tags?: string[]
          alt_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'image' | 'video'
          filename?: string
          storage_path?: string
          url?: string
          mime_type?: string
          size_bytes?: number
          width?: number | null
          height?: number | null
          duration?: number | null
          tags?: string[]
          alt_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'media_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      ai_generations: {
        Row: {
          id: string
          user_id: string
          type: 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'
          model: string
          prompt: string
          response: string
          tokens_used: number
          duration_ms: number
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'
          model: string
          prompt: string
          response: string
          tokens_used: number
          duration_ms: number
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'
          model?: string
          prompt?: string
          response?: string
          tokens_used?: number
          duration_ms?: number
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_generations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      post_platform: 'linkedin' | 'instagram' | 'both'
      post_status: 'draft' | 'scheduled' | 'published' | 'failed'
      template_category: 'conseil' | 'actualite' | 'temoignage' | 'etude_cas' | 'promo' | 'autre'
      media_type: 'image' | 'video'
      generation_type: 'ideas' | 'post_linkedin' | 'post_instagram' | 'variants'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type Template = Database['public']['Tables']['templates']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type AIGeneration = Database['public']['Tables']['ai_generations']['Row']

// Enum types for convenience
export type PostPlatform = Database['public']['Enums']['post_platform']
export type PostStatus = Database['public']['Enums']['post_status']
export type TemplateCategory = Database['public']['Enums']['template_category']
export type MediaType = Database['public']['Enums']['media_type']
export type GenerationType = Database['public']['Enums']['generation_type']
