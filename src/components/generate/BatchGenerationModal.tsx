// Modal component for batch post generation with progress display
// STORY-012: Workflow génération batch

import { useEffect } from 'react'
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Linkedin,
  Instagram,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../ui'
import type {
  BatchGenerationItem,
  BatchGenerationProgress,
  BatchGenerationResult,
} from '../../hooks/useBatchGeneration'

interface BatchGenerationModalProps {
  isOpen: boolean
  isGenerating: boolean
  progress: BatchGenerationProgress
  items: BatchGenerationItem[]
  result: BatchGenerationResult | null
  onClose: () => void
  onCancel: () => void
  onViewPosts: () => void
}

export function BatchGenerationModal({
  isOpen,
  isGenerating,
  progress,
  items,
  result,
  onClose,
  onCancel,
  onViewPosts,
}: BatchGenerationModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const isComplete = result !== null
  const hasErrors = result ? result.failureCount > 0 : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isGenerating ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {isGenerating ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            ) : isComplete && !hasErrors ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            ) : isComplete && hasErrors ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isGenerating
                  ? 'Génération en cours...'
                  : isComplete
                    ? hasErrors
                      ? 'Génération terminée avec des erreurs'
                      : 'Génération terminée !'
                    : 'Génération de posts'}
              </h2>
              <p className="text-sm text-gray-500">
                {isGenerating
                  ? `Idée ${progress.current} sur ${progress.total}`
                  : isComplete
                    ? `${result.totalPostsCreated} posts créés`
                    : 'Préparez vos posts'}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {progress.percentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            {progress.currentIdea && progress.currentPlatform && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span>Génération</span>
                {progress.currentPlatform === 'linkedin' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Linkedin className="w-3 h-3" />
                    LinkedIn
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                    <Instagram className="w-3 h-3" />
                    Instagram
                  </span>
                )}
                <span>pour :</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  {progress.currentIdea.title}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content - Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {items.map((item, index) => (
              <BatchGenerationItemRow key={item.idea.id} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {isGenerating ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Ne fermez pas cette fenêtre pendant la génération...
              </p>
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          ) : isComplete ? (
            <div className="flex items-center justify-between">
              <div>
                {result && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-green-600">{result.successCount}</span> idées traitées,{' '}
                    <span className="font-semibold text-indigo-600">{result.totalPostsCreated}</span> posts créés
                    {result.failureCount > 0 && (
                      <span className="text-amber-600">
                        {' '}({result.failureCount} erreur{result.failureCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
                <Button onClick={onViewPosts}>
                  Voir mes posts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Individual item row component
function BatchGenerationItemRow({ item, index }: { item: BatchGenerationItem; index: number }) {
  const isPending = item.status === 'pending'
  const isGeneratingLinkedIn = item.status === 'generating_linkedin'
  const isGeneratingInstagram = item.status === 'generating_instagram'
  const isCompleted = item.status === 'completed'
  const isFailed = item.status === 'failed'

  return (
    <div
      className={`
        p-4 rounded-xl border transition-all
        ${isPending ? 'bg-gray-50 border-gray-200 opacity-60' : ''}
        ${isGeneratingLinkedIn || isGeneratingInstagram ? 'bg-indigo-50 border-indigo-200 shadow-sm' : ''}
        ${isCompleted ? 'bg-green-50 border-green-200' : ''}
        ${isFailed ? 'bg-red-50 border-red-200' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isPending && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
              {index + 1}
            </div>
          )}
          {(isGeneratingLinkedIn || isGeneratingInstagram) && (
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          )}
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
          {isFailed && (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {item.idea.title}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {item.idea.description}
          </p>

          {/* Platform Status */}
          <div className="mt-2 flex items-center gap-3">
            {/* LinkedIn Status */}
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-4 h-4 text-blue-600" />
              {item.linkedinPost ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : item.linkedinError ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : isGeneratingLinkedIn ? (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-200" />
              )}
            </div>

            {/* Instagram Status */}
            <div className="flex items-center gap-1.5">
              <Instagram className="w-4 h-4 text-pink-600" />
              {item.instagramPost ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : item.instagramError ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : isGeneratingInstagram ? (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-200" />
              )}
            </div>
          </div>

          {/* Error Messages */}
          {(item.linkedinError || item.instagramError) && (
            <div className="mt-2 space-y-1">
              {item.linkedinError && (
                <p className="text-xs text-red-600">
                  LinkedIn: {item.linkedinError.message}
                </p>
              )}
              {item.instagramError && (
                <p className="text-xs text-red-600">
                  Instagram: {item.instagramError.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
