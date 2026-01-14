/**
 * Posts CRUD functions for Social Media Planner
 *
 * Provides type-safe database operations for posts management.
 * Uses Supabase client with Row-Level Security for data isolation.
 */

import { supabase } from '../supabase'
import type {
  Post,
  PostInsert,
  PostUpdate,
  Database
} from '../../types/database'

// Type aliases for cleaner code
type PostPlatform = Database['public']['Enums']['post_platform']
type PostStatus = Database['public']['Enums']['post_status']

// Filter options for listing posts
export interface PostFilters {
  status?: PostStatus
  platform?: PostPlatform
  search?: string
}

// Pagination options
export interface PaginationOptions {
  cursor?: string
  limit?: number
}

// Response type for paginated lists
export interface PaginatedPosts {
  data: Post[]
  meta: {
    total: number
    hasMore: boolean
    nextCursor: string | null
  }
}

// Result type for operations
export interface OperationResult<T> {
  data: T | null
  error: Error | null
}

/**
 * Get all posts for the current user with optional filters and pagination
 */
export async function getPosts(
  filters: PostFilters = {},
  pagination: PaginationOptions = {}
): Promise<OperationResult<PaginatedPosts>> {
  try {
    const { status, platform, search } = filters
    const { cursor, limit = 20 } = pagination

    // Start query
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    if (search) {
      query = query.ilike('content', `%${search}%`)
    }

    // Apply cursor-based pagination
    if (cursor) {
      // Get the cursor post's created_at for keyset pagination
      const { data: cursorPost } = await supabase
        .from('posts')
        .select('created_at')
        .eq('id', cursor)
        .single()

      if (cursorPost) {
        query = query.lt('created_at', cursorPost.created_at)
      }
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const total = count ?? 0
    const hasMore = data ? data.length === limit : false
    const nextCursor = hasMore && data && data.length > 0
      ? data[data.length - 1].id
      : null

    return {
      data: {
        data: data ?? [],
        meta: {
          total,
          hasMore,
          nextCursor,
        },
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(id: string): Promise<OperationResult<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Create a new post
 */
export async function createPost(
  post: Omit<PostInsert, 'user_id'>
): Promise<OperationResult<Post>> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate required fields
    if (!post.platform) {
      throw new Error('Platform is required')
    }
    if (!post.content || post.content.trim() === '') {
      throw new Error('Content is required')
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: string,
  updates: PostUpdate
): Promise<OperationResult<Post>> {
  try {
    // Prevent updating user_id
    const { user_id: _userId, ...safeUpdates } = updates

    const { data, error } = await supabase
      .from('posts')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Update a post with optimistic locking (conflict detection)
 * STORY-016: Sauvegarde automatique
 *
 * Uses updated_at to detect if the post was modified by another session.
 * If the server's updated_at is newer than our expected value, a conflict is detected.
 */
export async function updatePostWithLock(
  id: string,
  updates: PostUpdate,
  expectedUpdatedAt: string
): Promise<OperationResult<Post> & { conflict?: boolean }> {
  try {
    // Prevent updating user_id
    const { user_id: _userId, ...safeUpdates } = updates

    // First, check if the post was modified since we last fetched it
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('updated_at')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Compare timestamps to detect conflicts
    const serverUpdatedAt = new Date(currentPost.updated_at).getTime()
    const expectedTime = new Date(expectedUpdatedAt).getTime()

    // Allow a small tolerance (1 second) for timing differences
    if (serverUpdatedAt > expectedTime + 1000) {
      return {
        data: null,
        error: new Error('Le post a été modifié par une autre session. Veuillez recharger la page.'),
        conflict: true,
      }
    }

    // Proceed with the update
    const { data, error } = await supabase
      .from('posts')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null, conflict: false }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
      conflict: false,
    }
  }
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<OperationResult<boolean>> {
  try {
    // First check if post exists and can be deleted
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Business rule: cannot delete published posts
    if (post.status === 'published') {
      throw new Error('Cannot delete a published post')
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return { data: true, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Rate a post (1-5 stars)
 */
export async function ratePost(
  id: string,
  rating: number
): Promise<OperationResult<Post>> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ rating })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Schedule a post for publication
 */
export async function schedulePost(
  id: string,
  scheduledAt: Date
): Promise<OperationResult<Post>> {
  try {
    // Validate scheduled date is in the future
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled date must be in the future')
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        status: 'scheduled' as PostStatus,
        scheduled_at: scheduledAt.toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Mark a post as published
 */
export async function markPostPublished(
  id: string
): Promise<OperationResult<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        status: 'published' as PostStatus,
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Unschedule a post (revert to draft)
 */
export async function unschedulePost(
  id: string
): Promise<OperationResult<Post>> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        status: 'draft' as PostStatus,
        scheduled_at: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Get posts count by status for the current user
 */
export async function getPostsCountByStatus(): Promise<OperationResult<Record<PostStatus, number>>> {
  try {
    const statuses: PostStatus[] = ['draft', 'scheduled', 'published', 'failed']
    const counts: Record<string, number> = {}

    for (const status of statuses) {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)

      if (error) {
        throw error
      }

      counts[status] = count ?? 0
    }

    return {
      data: counts as Record<PostStatus, number>,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}

/**
 * Duplicate a post (creates a new draft copy)
 */
export async function duplicatePost(id: string): Promise<OperationResult<Post>> {
  try {
    // Get the original post
    const { data: original, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !original) {
      throw fetchError ?? new Error('Post not found')
    }

    // Create new draft post with data from original
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: original.user_id,
        platform: original.platform,
        content: original.content,
        hashtags: original.hashtags,
        status: 'draft' as PostStatus,
        idea_source: original.idea_source,
        ai_generated: original.ai_generated,
        rating: original.rating,
        scheduled_at: null,
        published_at: null,
        error_message: null,
        template_id: original.template_id,
        metadata: original.metadata,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    }
  }
}
