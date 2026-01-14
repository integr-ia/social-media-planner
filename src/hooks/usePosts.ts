/**
 * React hook for managing posts
 * Provides CRUD operations with loading states and error handling
 */

import { useState, useCallback } from 'react'
import {
  getPosts,
  getPostsCountByStatus,
  type PostFilters,
  type PaginationOptions,
  type PaginatedPosts,
} from '../lib/content'
import type { Post } from '../types/database'
import type { Database } from '../types/database'

type PostStatus = Database['public']['Enums']['post_status']

export interface UsePostsResult {
  // Data
  posts: Post[]
  total: number
  hasMore: boolean
  counts: Record<PostStatus, number> | null

  // State
  isLoading: boolean
  isLoadingMore: boolean
  error: Error | null

  // Actions
  fetchPosts: (filters?: PostFilters) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing a list of posts
 *
 * @example
 * ```tsx
 * function PostsPage() {
 *   const {
 *     posts,
 *     isLoading,
 *     error,
 *     hasMore,
 *     fetchPosts,
 *     loadMore,
 *     counts,
 *   } = usePosts()
 *
 *   useEffect(() => {
 *     fetchPosts()
 *   }, [fetchPosts])
 *
 *   return (
 *     <div>
 *       {isLoading && <Spinner />}
 *       {error && <Alert>{error.message}</Alert>}
 *       {posts.map(post => <PostCard key={post.id} post={post} />)}
 *       {hasMore && <button onClick={loadMore}>Charger plus</button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePosts(initialFilters?: PostFilters): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<PostStatus, number> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentFilters, setCurrentFilters] = useState<PostFilters>(initialFilters ?? {})

  const fetchPosts = useCallback(async (filters: PostFilters = {}) => {
    setIsLoading(true)
    setError(null)
    setCurrentFilters(filters)

    try {
      const [postsResult, countsResult] = await Promise.all([
        getPosts(filters),
        getPostsCountByStatus(),
      ])

      if (postsResult.error) {
        throw postsResult.error
      }

      if (countsResult.error) {
        console.warn('Failed to fetch counts:', countsResult.error)
      }

      const data = postsResult.data as PaginatedPosts
      setPosts(data.data)
      setTotal(data.meta.total)
      setHasMore(data.meta.hasMore)
      setNextCursor(data.meta.nextCursor)
      setCounts(countsResult.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'))
      console.error('Failed to fetch posts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    setError(null)

    try {
      const pagination: PaginationOptions = {
        cursor: nextCursor,
      }

      const result = await getPosts(currentFilters, pagination)

      if (result.error) {
        throw result.error
      }

      const data = result.data as PaginatedPosts
      setPosts(prev => [...prev, ...data.data])
      setHasMore(data.meta.hasMore)
      setNextCursor(data.meta.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more posts'))
      console.error('Failed to load more posts:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, nextCursor, isLoadingMore, currentFilters])

  const refresh = useCallback(async () => {
    await fetchPosts(currentFilters)
  }, [fetchPosts, currentFilters])

  return {
    posts,
    total,
    hasMore,
    counts,
    isLoading,
    isLoadingMore,
    error,
    fetchPosts,
    loadMore,
    refresh,
  }
}
