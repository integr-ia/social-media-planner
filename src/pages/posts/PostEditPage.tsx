// Page for editing a post
// STORY-015: Éditeur de post
// STORY-016: Sauvegarde automatique
// STORY-017: Prévisualisation de post

import { useState, useEffect, useReducer, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Linkedin,
  Instagram,
  AlertCircle,
  X,
  Plus,
  Hash,
  Cloud,
  CloudOff,
  RefreshCw,
  Loader2,
  Eye,
  Edit3,
} from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Alert } from '../../components/ui'
import { PostPreview, CopyButtons } from '../../components/posts'
import { usePost, useAutoSave } from '../../hooks'
import { updatePostWithLock } from '../../lib/content'
import type { Post } from '../../types/database'

// Character limits per platform
const CHAR_LIMITS = {
  linkedin: 3000,
  instagram: 2200,
  both: 2200, // Use the more restrictive limit
}

// Undo/Redo state management
interface EditorState {
  content: string
  hashtags: string[]
}

type EditorAction =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_HASHTAGS'; payload: string[] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'INIT'; payload: EditorState }

interface HistoryState {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
}

function historyReducer(state: HistoryState, action: EditorAction): HistoryState {
  switch (action.type) {
    case 'SET_CONTENT': {
      const newPresent = { ...state.present, content: action.payload }
      return {
        past: [...state.past, state.present],
        present: newPresent,
        future: [],
      }
    }
    case 'SET_HASHTAGS': {
      const newPresent = { ...state.present, hashtags: action.payload }
      return {
        past: [...state.past, state.present],
        present: newPresent,
        future: [],
      }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, -1)
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      }
    }
    case 'INIT': {
      return {
        past: [],
        present: action.payload,
        future: [],
      }
    }
    default:
      return state
  }
}

export function PostEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    post,
    isLoading,
    error,
    fetchPost,
    clearError,
  } = usePost()

  // Editor state with undo/redo history
  const [historyState, dispatch] = useReducer(historyReducer, {
    past: [],
    present: { content: '', hashtags: [] },
    future: [],
  })

  // UI state
  const [newHashtag, setNewHashtag] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [lastKnownUpdatedAt, setLastKnownUpdatedAt] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit') // STORY-017
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastInitializedPostIdRef = useRef<string | null>(null)

  // Auto-save hook (STORY-016)
  const { state: autoSaveState, saveNow, lastSavedDisplay } = useAutoSave({
    data: {
      content: historyState.present.content,
      hashtags: historyState.present.hashtags,
    },
    isDirty,
    serverUpdatedAt: lastKnownUpdatedAt,
    onSave: async (data) => {
      if (!id || !lastKnownUpdatedAt) return null

      const result = await updatePostWithLock(id, data, lastKnownUpdatedAt)

      if (result.conflict) {
        // Handle conflict - don't mark as dirty anymore, show conflict message
        return null
      }

      if (result.data) {
        setIsDirty(false)
        setLastKnownUpdatedAt(result.data.updated_at)
        return { updatedAt: result.data.updated_at }
      }

      return null
    },
    delay: 30000, // 30 seconds
    enabled: true,
  })

  // Load post on mount
  useEffect(() => {
    if (id) {
      fetchPost(id)
    }
  }, [id, fetchPost])

  // Initialize editor state when post loads
  // This effect intentionally sets state to initialize the editor from loaded post data.
  // The ref prevents re-initialization when the post object reference changes.
  useEffect(() => {
    if (post && lastInitializedPostIdRef.current !== post.id) {
      lastInitializedPostIdRef.current = post.id
      dispatch({
        type: 'INIT',
        payload: {
          content: post.content,
          hashtags: post.hashtags || [],
        },
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional initialization from loaded data
      setIsDirty(false)
      setLastKnownUpdatedAt(post.updated_at)
    }
  }, [post])

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent })
    setIsDirty(true)
  }, [])

  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyState.past.length > 0) {
      dispatch({ type: 'UNDO' })
      setIsDirty(true)
    }
  }, [historyState.past.length])

  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyState.future.length > 0) {
      dispatch({ type: 'REDO' })
      setIsDirty(true)
    }
  }, [historyState.future.length])

  // Handle save (uses auto-save's saveNow for consistency)
  const handleSave = useCallback(async () => {
    if (!id || !isDirty) return
    await saveNow()
  }, [id, isDirty, saveNow])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleSave])

  // Handle hashtag operations
  const addHashtag = useCallback(() => {
    const tag = newHashtag.trim().replace(/^#/, '')
    if (tag && !historyState.present.hashtags.includes(`#${tag}`)) {
      dispatch({
        type: 'SET_HASHTAGS',
        payload: [...historyState.present.hashtags, `#${tag}`],
      })
      setNewHashtag('')
      setIsDirty(true)
    }
  }, [newHashtag, historyState.present.hashtags])

  const removeHashtag = useCallback((tagToRemove: string) => {
    dispatch({
      type: 'SET_HASHTAGS',
      payload: historyState.present.hashtags.filter(tag => tag !== tagToRemove),
    })
    setIsDirty(true)
  }, [historyState.present.hashtags])

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag()
    }
  }

  // Calculate character count and limit
  const charCount = historyState.present.content.length
  const charLimit = post ? CHAR_LIMITS[post.platform] : CHAR_LIMITS.both
  const charPercentage = Math.min((charCount / charLimit) * 100, 100)
  const isOverLimit = charCount > charLimit

  // Get platform badge
  const getPlatformInfo = (platform: Post['platform']) => {
    switch (platform) {
      case 'linkedin':
        return {
          icon: Linkedin,
          label: 'LinkedIn',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
        }
      case 'instagram':
        return {
          icon: Instagram,
          label: 'Instagram',
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-600',
        }
      default:
        return {
          icon: Linkedin,
          label: 'Multi-plateforme',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
        }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error && !post) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert variant="error" className="mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error.message}</span>
            </div>
          </Alert>
          <Button variant="outline" onClick={() => navigate('/posts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux posts
          </Button>
        </div>
      </AppLayout>
    )
  }

  // No post found
  if (!post) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert variant="warning" className="mb-6">
            Post non trouvé
          </Alert>
          <Button variant="outline" onClick={() => navigate('/posts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux posts
          </Button>
        </div>
      </AppLayout>
    )
  }

  const platformInfo = getPlatformInfo(post.platform)
  const PlatformIcon = platformInfo.icon

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux posts
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${platformInfo.bgColor} ${platformInfo.textColor} rounded-full`}>
                <PlatformIcon className="w-4 h-4" />
                {platformInfo.label}
              </span>
              {post.ai_generated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-full">
                  Généré par IA
                </span>
              )}

              {/* Edit/Preview toggle (STORY-017) */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'edit'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Édition</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Aperçu</span>
                </button>
              </div>
            </div>

            {/* Save status indicator (STORY-016) */}
            <div className="flex items-center gap-2">
              {autoSaveState.status === 'saving' && (
                <span className="flex items-center gap-1.5 text-sm text-blue-600 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde en cours...
                </span>
              )}
              {autoSaveState.status === 'saved' && lastSavedDisplay && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <Cloud className="w-4 h-4" />
                  Enregistré à {lastSavedDisplay}
                </span>
              )}
              {autoSaveState.status === 'error' && (
                <span className="flex items-center gap-1.5 text-sm text-red-600">
                  <CloudOff className="w-4 h-4" />
                  Erreur de sauvegarde
                </span>
              )}
              {autoSaveState.status === 'conflict' && (
                <span className="flex items-center gap-1.5 text-sm text-amber-600">
                  <RefreshCw className="w-4 h-4" />
                  Conflit détecté
                </span>
              )}
              {autoSaveState.status === 'idle' && isDirty && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Cloud className="w-4 h-4" />
                  Non enregistré
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editor Card or Preview (STORY-017) */}
        {viewMode === 'edit' ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyState.past.length === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Annuler (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyState.future.length === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Rétablir (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Character counter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverLimit ? 'bg-red-500' : charPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${charPercentage}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
                    {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={historyState.present.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Écrivez votre post..."
                className={`w-full min-h-[300px] p-4 text-gray-900 placeholder-gray-400 border-0 resize-none focus:ring-0 focus:outline-none text-base leading-relaxed ${
                  isOverLimit ? 'text-red-600' : ''
                }`}
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            </div>

          {/* Hashtags section (for Instagram) */}
          {(post.platform === 'instagram' || post.platform === 'both') && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Hashtags</span>
                <span className="text-xs text-gray-400">({historyState.present.hashtags.length}/30)</span>
              </div>

              {/* Hashtag input */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value.replace(/\s/g, ''))}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="Ajouter un hashtag"
                    className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    maxLength={100}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHashtag}
                  disabled={!newHashtag.trim() || historyState.present.hashtags.length >= 30}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Hashtag list */}
              {historyState.present.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {historyState.present.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm group"
                    >
                      {tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        ) : (
          /* Preview Mode (STORY-017) */
          <div className="py-6">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">
                Aperçu {post.platform === 'linkedin' ? 'LinkedIn' : post.platform === 'instagram' ? 'Instagram' : 'multi-plateforme'}
              </p>
            </div>

            {/* Platform selector for "both" platform */}
            {post.platform === 'both' && (
              <div className="flex justify-center mb-6">
                <PreviewPlatformTabs
                  content={historyState.present.content}
                  hashtags={historyState.present.hashtags}
                />
              </div>
            )}

            {/* Single platform preview */}
            {post.platform !== 'both' && (
              <PostPreview
                platform={post.platform}
                content={historyState.present.content}
                hashtags={historyState.present.hashtags}
              />
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="error" className="mt-4">
            <div className="flex items-center justify-between">
              <span>{error.message}</span>
              <button onClick={clearError} className="text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Alert>
        )}

        {/* Auto-save error message (STORY-016) */}
        {autoSaveState.error && (
          <Alert variant="error" className="mt-4">
            <div className="flex items-center justify-between">
              <span>{autoSaveState.error.message}</span>
            </div>
          </Alert>
        )}

        {/* Conflict warning (STORY-016) */}
        {autoSaveState.hasConflict && (
          <Alert variant="warning" className="mt-4">
            <div className="flex items-center justify-between">
              <span>Ce post a été modifié par une autre session. Veuillez recharger la page pour voir les dernières modifications.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Recharger
              </Button>
            </div>
          </Alert>
        )}

        {/* Copy buttons section (STORY-018) */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Publier manuellement
          </p>
          <CopyButtons
            content={historyState.present.content}
            hashtags={historyState.present.hashtags}
            platform={post.platform}
            size="md"
            layout="inline"
          />
          <p className="text-xs text-gray-500 mt-2">
            Copiez le contenu formaté puis collez-le directement sur la plateforme.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            {autoSaveState.status === 'saving' ? (
              'Sauvegarde automatique en cours...'
            ) : isDirty ? (
              'Modifications non enregistrées (sauvegarde auto dans 30s)'
            ) : autoSaveState.lastSavedAt ? (
              `Enregistré à ${lastSavedDisplay}`
            ) : (
              `Dernière modification: ${new Date(post.updated_at).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            )}
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/posts')}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty || autoSaveState.status === 'saving' || isOverLimit}
              loading={autoSaveState.status === 'saving'}
            >
              <Save className="w-4 h-4 mr-2" />
              {autoSaveState.status === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        {/* Keyboard shortcuts hint (only in edit mode) */}
        {viewMode === 'edit' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 font-medium mb-2">Raccourcis clavier</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
              <div><kbd className="px-2 py-0.5 bg-white rounded border border-gray-200">Ctrl+Z</kbd> Annuler</div>
              <div><kbd className="px-2 py-0.5 bg-white rounded border border-gray-200">Ctrl+Y</kbd> Rétablir</div>
              <div><kbd className="px-2 py-0.5 bg-white rounded border border-gray-200">Ctrl+S</kbd> Enregistrer</div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// Preview Platform Tabs for "both" platform (STORY-017)
interface PreviewPlatformTabsProps {
  content: string
  hashtags: string[]
}

function PreviewPlatformTabs({ content, hashtags }: PreviewPlatformTabsProps) {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'instagram'>('linkedin')

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tab buttons */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'linkedin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'instagram'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </button>
        </div>
      </div>

      {/* Preview */}
      <PostPreview
        platform={activeTab}
        content={content}
        hashtags={hashtags}
      />
    </div>
  )
}
