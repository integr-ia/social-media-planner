/**
 * React hook for single post operations
 * Provides CRUD operations with loading states and error handling
 */

import { useState, useCallback } from 'react'
import {
  getPost,
  createPost,
  updatePost,
  deletePost,
  ratePost,
  schedulePost,
  markPostPublished,
  unschedulePost,
  duplicatePost,
} from '../lib/content'
import type { Post, PostInsert, PostUpdate } from '../types/database'

export interface UsePostResult {
  // Data
  post: Post | null

  // State
  isLoading: boolean
  isSaving: boolean
  isDeleting: boolean
  error: Error | null

  // Actions
  fetchPost: (id: string) => Promise<void>
  create: (data: Omit<PostInsert, 'user_id'>) => Promise<Post | null>
  update: (id: string, data: PostUpdate) => Promise<Post | null>
  remove: (id: string) => Promise<boolean>
  rate: (id: string, rating: number) => Promise<Post | null>
  schedule: (id: string, scheduledAt: Date) => Promise<Post | null>
  publish: (id: string) => Promise<Post | null>
  unschedule: (id: string) => Promise<Post | null>
  duplicate: (id: string) => Promise<Post | null>
  clearPost: () => void
  clearError: () => void
}

/**
 * Hook for single post CRUD operations
 *
 * @example
 * ```tsx
 * function PostEditor({ postId }: { postId: string }) {
 *   const {
 *     post,
 *     isLoading,
 *     isSaving,
 *     error,
 *     fetchPost,
 *     update,
 *   } = usePost()
 *
 *   useEffect(() => {
 *     fetchPost(postId)
 *   }, [postId, fetchPost])
 *
 *   const handleSave = async (content: string) => {
 *     await update(postId, { content })
 *   }
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <Alert>{error.message}</Alert>
 *
 *   return (
 *     <Editor
 *       content={post?.content}
 *       onSave={handleSave}
 *       isSaving={isSaving}
 *     />
 *   )
 * }
 * ```
 */
export function usePost(): UsePostResult {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPost = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getPost(id)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch post'))
      console.error('Failed to fetch post:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: Omit<PostInsert, 'user_id'>): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await createPost(data)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create post'))
      console.error('Failed to create post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const update = useCallback(async (id: string, data: PostUpdate): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await updatePost(id, data)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update post'))
      console.error('Failed to update post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deletePost(id)

      if (result.error) {
        throw result.error
      }

      setPost(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete post'))
      console.error('Failed to delete post:', err)
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  const rate = useCallback(async (id: string, rating: number): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await ratePost(id, rating)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to rate post'))
      console.error('Failed to rate post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const schedule = useCallback(async (id: string, scheduledAt: Date): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await schedulePost(id, scheduledAt)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to schedule post'))
      console.error('Failed to schedule post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const publish = useCallback(async (id: string): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await markPostPublished(id)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish post'))
      console.error('Failed to publish post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const unscheduleAction = useCallback(async (id: string): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await unschedulePost(id)

      if (result.error) {
        throw result.error
      }

      setPost(result.data)
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unschedule post'))
      console.error('Failed to unschedule post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const duplicateAction = useCallback(async (id: string): Promise<Post | null> => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await duplicatePost(id)

      if (result.error) {
        throw result.error
      }

      // Don't update local post state - the duplicate is a new post
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to duplicate post'))
      console.error('Failed to duplicate post:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const clearPost = useCallback(() => {
    setPost(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    post,
    isLoading,
    isSaving,
    isDeleting,
    error,
    fetchPost,
    create,
    update,
    remove,
    rate,
    schedule,
    publish,
    unschedule: unscheduleAction,
    duplicate: duplicateAction,
    clearPost,
    clearError,
  }
}
