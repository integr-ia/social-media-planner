// AI Generation Types for Social Media Planner

export interface ContentIdea {
  id: string
  title: string
  description: string
  targetPlatform: 'linkedin' | 'instagram' | 'both'
  estimatedEngagement: 'low' | 'medium' | 'high'
  category: string
  suggestedHashtags?: string[]
}

export interface GenerateIdeasRequest {
  context?: string
  themes?: string[]
  count?: number
}

export interface GenerateIdeasResponse {
  ideas: ContentIdea[]
  generationId: string
  tokensUsed: number
  durationMs: number
  quotaUsed: number
  quotaRemaining: number
  templateInfo?: {
    id: string
    version: string
  }
}

export interface GeneratePostRequest {
  idea: {
    id?: string
    title: string
    description: string
    category?: string
  }
  platform: 'linkedin' | 'instagram'
  tone?: 'professional' | 'casual' | 'inspirational'
  length?: 'short' | 'medium' | 'long'
}

export interface GeneratedPost {
  id: string
  platform: 'linkedin' | 'instagram' | 'both'
  content: string
  hashtags: string[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  ideaSource: string | null
  aiGenerated: boolean
  metadata: {
    hook?: string
    callToAction?: string
    wordCount?: number
    tone?: string
    // Instagram-specific fields
    suggestedEmojis?: string[]
    visualSuggestion?: string
    generationParams?: {
      tone: string
      length: string
    }
    templateInfo?: {
      id: string
      version: string
    }
  }
  createdAt: string
}

export interface GeneratePostResponse {
  post: GeneratedPost
  generation: {
    hook: string
    callToAction: string
    wordCount: number
    tone?: string // LinkedIn only
    // Instagram-specific fields
    suggestedEmojis?: string[]
    visualSuggestion?: string
    tokensUsed: number
    durationMs: number
  }
  quota: {
    used: number
    remaining: number
    limit: number
  }
  templateInfo: {
    id: string
    version: string
  }
}

export interface GenerateVariantsRequest {
  postId: string
  variations: ('shorter' | 'longer' | 'more_casual' | 'more_professional' | 'with_cta' | 'with_question')[]
}

export interface PostVariant {
  id: string
  content: string
  variationType: string
  hashtags?: string[]
}

export interface GenerateVariantsResponse {
  variants: PostVariant[]
  generationId: string
  tokensUsed: number
  durationMs: number
}

export interface AIGenerationError {
  type: 'rate_limit' | 'quota_exceeded' | 'api_error' | 'validation_error' | 'timeout'
  message: string
  retryAfter?: number
}

export interface QuotaCategory {
  used: number
  remaining: number
  limit: number
}

export interface QuotaInfo {
  ideas: QuotaCategory
  posts: QuotaCategory
  resetsAt: string
}
