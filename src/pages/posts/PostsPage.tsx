// Page for listing and managing posts
// STORY-014: Liste des posts (brouillons)

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Search,
  Linkedin,
  Instagram,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Alert } from '../../components/ui'
import { CopyButtons } from '../../components/posts'
import { usePosts, useDebounce } from '../../hooks'
import type { Post, Database } from '../../types/database'

type PostStatus = Database['public']['Enums']['post_status']
type PostPlatform = Database['public']['Enums']['post_platform']

export function PostsPage() {
  const navigate = useNavigate()
  const {
    posts,
    total,
    hasMore,
    counts,
    isLoading,
    isLoadingMore,
    error,
    fetchPosts,
    loadMore,
  } = usePosts()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('')
  const [platformFilter, setPlatformFilter] = useState<PostPlatform | ''>('')

  // Debounce search query to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Fetch posts when filters change
  const refreshPosts = useCallback(() => {
    const filters: {
      status?: PostStatus
      platform?: PostPlatform
      search?: string
    } = {}

    if (statusFilter) {
      filters.status = statusFilter
    }
    if (platformFilter) {
      filters.platform = platformFilter
    }
    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch.trim()
    }

    fetchPosts(filters)
  }, [statusFilter, platformFilter, debouncedSearch, fetchPosts])

  // Fetch posts on mount and when filters change
  useEffect(() => {
    refreshPosts()
  }, [refreshPosts])

  const getStatusBadge = (status: Post['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            <Clock className="w-3 h-3" />
            Brouillon
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            <Clock className="w-3 h-3" />
            Planifié
          </span>
        )
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Publié
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Échec
          </span>
        )
      default:
        return null
    }
  }

  const getPlatformBadge = (platform: Post['platform']) => {
    switch (platform) {
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
            <Linkedin className="w-3 h-3" />
            LinkedIn
          </span>
        )
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-pink-50 text-pink-600 rounded-full">
            <Instagram className="w-3 h-3" />
            Instagram
          </span>
        )
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Mes posts
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez vos brouillons, posts planifiés et publications
              </p>
            </div>
            <Button onClick={() => navigate('/generate')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer des idées
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && debouncedSearch !== searchQuery && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PostStatus | '')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="scheduled">Planifiés</option>
            <option value="published">Publiés</option>
            <option value="failed">Échecs</option>
          </select>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PostPlatform | '')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Toutes les plateformes</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        {/* Results count */}
        {!isLoading && posts.length > 0 && (
          <div className="mb-4 text-sm text-gray-500">
            {total} post{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            {(statusFilter || platformFilter || debouncedSearch) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setPlatformFilter('')
                }}
                className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="error" className="mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error.message}</span>
            </div>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-200/50 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {(statusFilter || platformFilter || debouncedSearch)
                  ? 'Aucun résultat'
                  : 'Aucun post pour le moment'}
              </h2>
              <p className="text-gray-600 mb-8">
                {(statusFilter || platformFilter || debouncedSearch)
                  ? 'Modifiez vos filtres pour trouver des posts.'
                  : 'Commencez par générer des idées et créez vos premiers posts.'}
              </p>
              {!(statusFilter || platformFilter || debouncedSearch) && (
                <Button onClick={() => navigate('/generate')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer des idées
                </Button>
              )}
              {(statusFilter || platformFilter || debouncedSearch) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('')
                    setPlatformFilter('')
                  }}
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}/edit`)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2">
                      {getPlatformBadge(post.platform)}
                      {getStatusBadge(post.status)}
                      {post.ai_generated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          IA
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-900 line-clamp-2 mb-2">
                      {post.content}
                    </p>

                    {/* Hashtags (Instagram) */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <p className="text-sm text-gray-500 truncate">
                        {post.hashtags.slice(0, 5).join(' ')}
                        {post.hashtags.length > 5 && ` +${post.hashtags.length - 5}`}
                      </p>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-400 mt-2">
                      Créé le {new Date(post.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>

                    {/* Quick Copy Buttons (STORY-018) */}
                    <div
                      className="mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CopyButtons
                        content={post.content}
                        hashtags={post.hashtags || []}
                        platform={post.platform}
                        size="sm"
                        showSingle={false}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        {counts && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(counts.draft || 0) + (counts.scheduled || 0) + (counts.published || 0) + (counts.failed || 0)}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">
                  {counts.draft || 0}
                </p>
                <p className="text-sm text-gray-500">Brouillons</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {counts.scheduled || 0}
                </p>
                <p className="text-sm text-gray-500">Planifiés</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {counts.published || 0}
                </p>
                <p className="text-sm text-gray-500">Publiés</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
