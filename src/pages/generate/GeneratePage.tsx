// Page for generating content ideas using AI
// Displays generated ideas in cards with platform badges, quota information, and selection functionality
// STORY-012: Integrated batch post generation workflow

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, RefreshCw, Zap, AlertCircle, Lightbulb, CheckSquare, Square, ArrowRight, Bug } from 'lucide-react'
import { AppLayout } from '../../components/layout'
import { Button, Alert } from '../../components/ui'
import { useGenerateIdeas, useAIQuota, useBatchGeneration } from '../../hooks'
import { IdeaCard } from '../../components/generate/IdeaCard'
import { IdeaCardSkeleton } from '../../components/generate/IdeaCardSkeleton'
import { QuotaDisplay } from '../../components/generate/QuotaDisplay'
import { BatchGenerationModal } from '../../components/generate/BatchGenerationModal'
import { useIdeaSelection, MAX_IDEA_SELECTIONS } from '../../stores'
import { supabase } from '../../lib/supabase'

export function GeneratePage() {
  const navigate = useNavigate()

  const {
    ideas,
    isLoading,
    error,
    quotaRemaining,
    durationMs,
    generateIdeas,
    clearIdeas,
    clearError,
  } = useGenerateIdeas()

  const { quota, refreshQuota } = useAIQuota()
  const [hasGenerated, setHasGenerated] = useState(false)
  const [debugResult, setDebugResult] = useState<Record<string, unknown> | null>(null)
  const [isDebugging, setIsDebugging] = useState(false)

  // Batch generation state (STORY-012)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const {
    isGenerating: isBatchGenerating,
    progress: batchProgress,
    items: batchItems,
    result: batchResult,
    startBatchGeneration,
    cancelGeneration: cancelBatchGeneration,
    reset: resetBatchGeneration,
  } = useBatchGeneration()

  // Debug function to diagnose Edge Function issues
  const runDebugCheck = async () => {
    setIsDebugging(true)
    try {
      const { data, error } = await supabase.functions.invoke('debug-check')
      if (error) {
        setDebugResult({ error: error.message })
      } else {
        setDebugResult(data)
      }
    } catch (e) {
      setDebugResult({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setIsDebugging(false)
    }
  }

  // Selection state from Zustand store
  const {
    selectedIds,
    selectionCount,
    canSelectMore,
    toggleSelection,
    selectAll,
    deselectAll,
    clearSelection,
  } = useIdeaSelection()

  // Clear selection when ideas change (regenerate)
  useEffect(() => {
    clearSelection()
  }, [ideas, clearSelection])

  const handleGenerate = async () => {
    clearError()
    clearSelection()
    await generateIdeas()
    setHasGenerated(true)
    await refreshQuota()
  }

  const handleRegenerate = async () => {
    clearIdeas()
    clearError()
    clearSelection()
    await generateIdeas()
    await refreshQuota()
  }

  const handleSelectAll = () => {
    selectAll(ideas)
  }

  const handleDeselectAll = () => {
    deselectAll()
  }

  // STORY-012: Handle batch post generation
  const handleCreatePosts = async () => {
    if (selectionCount === 0) return

    // Open modal and start batch generation
    setShowBatchModal(true)
    resetBatchGeneration()

    // Get the actual selected ideas from the store
    const { selectedIdeas } = useIdeaSelection.getState()
    await startBatchGeneration(selectedIdeas)

    // Refresh quota after batch generation
    await refreshQuota()
  }

  const handleCloseBatchModal = () => {
    if (!isBatchGenerating) {
      setShowBatchModal(false)
      resetBatchGeneration()
    }
  }

  const handleCancelBatchGeneration = () => {
    cancelBatchGeneration()
  }

  const handleViewPosts = () => {
    setShowBatchModal(false)
    resetBatchGeneration()
    clearSelection()
    navigate('/posts')
  }

  const isQuotaExhausted = quota?.ideas.remaining === 0
  const allSelected = ideas.length > 0 && selectionCount === ideas.length
  const someSelected = selectionCount > 0 && selectionCount < ideas.length

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                Générer des idées
              </h1>
              <p className="text-gray-600 mt-2">
                Utilisez l'IA pour créer des idées de contenu personnalisées pour LinkedIn et Instagram
              </p>
            </div>
            {quota && <QuotaDisplay quota={quota} />}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Erreur lors de la génération</p>
                <p className="text-sm mt-1">{error.message}</p>
                {error.type === 'quota_exceeded' && (
                  <p className="text-sm mt-2">
                    Votre quota mensuel de génération d'idées est épuisé.
                    Il sera renouvelé le {quota?.resetsAt ? new Date(quota.resetsAt).toLocaleDateString('fr-FR') : 'mois prochain'}.
                  </p>
                )}
                {error.retryAfter && (
                  <p className="text-sm mt-2">
                    Réessayez dans {Math.ceil(error.retryAfter / 60)} minute(s).
                  </p>
                )}
                <button
                  onClick={runDebugCheck}
                  disabled={isDebugging}
                  className="mt-3 flex items-center gap-2 text-sm text-red-700 hover:text-red-800 underline"
                >
                  <Bug className="w-4 h-4" />
                  {isDebugging ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
                </button>
              </div>
            </div>
          </Alert>
        )}

        {/* Debug Results */}
        {debugResult && (
          <div className="mb-6 p-4 bg-gray-900 text-green-400 rounded-xl font-mono text-sm overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold">Résultats du diagnostic:</span>
              <button
                onClick={() => setDebugResult(null)}
                className="text-gray-400 hover:text-white"
              >
                Fermer
              </button>
            </div>
            <pre>{JSON.stringify(debugResult, null, 2)}</pre>
          </div>
        )}

        {/* Quota Exhausted Warning */}
        {isQuotaExhausted && !error && (
          <Alert variant="warning" className="mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Quota épuisé</p>
                <p className="text-sm mt-1">
                  Vous avez utilisé toutes vos générations d'idées ce mois-ci.
                  Le quota sera renouvelé le {quota?.resetsAt ? new Date(quota.resetsAt).toLocaleDateString('fr-FR') : 'mois prochain'}.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Initial State - No ideas generated yet */}
        {!hasGenerated && !isLoading && ideas.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-200/50 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Prêt à générer des idées ?
              </h2>
              <p className="text-gray-600 mb-8">
                Cliquez sur le bouton ci-dessous pour générer 10 à 15 idées de contenu
                personnalisées pour LinkedIn et Instagram, adaptées à votre contexte IntegrIA.
              </p>
              <Button
                onClick={handleGenerate}
                loading={isLoading}
                disabled={isQuotaExhausted}
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Générer des idées
              </Button>
              {quota && (
                <p className="text-sm text-gray-500 mt-4">
                  {quota.ideas.remaining} génération(s) restante(s) ce mois
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State - Skeleton cards */}
        {isLoading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-purple-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-medium">Génération en cours...</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <IdeaCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Ideas Grid */}
        {!isLoading && ideas.length > 0 && (
          <div>
            {/* Results Header with Selection Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {ideas.length} idées générées
                </h2>
                {durationMs && (
                  <p className="text-sm text-gray-500">
                    Générées en {(durationMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isLoading || isQuotaExhausted}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer
                </Button>
              </div>
            </div>

            {/* Selection Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Selection Counter */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                      ${selectionCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {selectionCount}
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectionCount === 0
                        ? 'Aucune idée sélectionnée'
                        : selectionCount === 1
                          ? '1 idée sélectionnée'
                          : `${selectionCount} idées sélectionnées`
                      }
                    </span>
                  </div>
                  {!canSelectMore && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Maximum atteint ({MAX_IDEA_SELECTIONS})
                    </span>
                  )}
                </div>

                {/* Select/Deselect All Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={allSelected || someSelected ? handleDeselectAll : handleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
                  >
                    {allSelected || someSelected ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Tout désélectionner</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Tout sélectionner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  selectable={true}
                  selected={selectedIds.has(idea.id)}
                  onSelect={toggleSelection}
                  disabled={!canSelectMore && !selectedIds.has(idea.id)}
                />
              ))}
            </div>

            {/* Bottom Actions - Create Posts */}
            <div className={`
              mt-8 p-6 rounded-2xl border transition-all
              ${selectionCount > 0
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg'
                : 'bg-gray-50 border-gray-200'
              }
            `}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectionCount > 0
                      ? `Prêt à créer ${selectionCount} post${selectionCount > 1 ? 's' : ''} ?`
                      : 'Sélectionnez des idées'
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectionCount > 0
                      ? 'Cliquez pour générer des posts LinkedIn et Instagram à partir de vos idées sélectionnées.'
                      : 'Cochez les idées qui vous plaisent pour générer des posts.'}
                  </p>
                </div>
                <Button
                  onClick={handleCreatePosts}
                  disabled={selectionCount === 0}
                  size="lg"
                  className={selectionCount > 0 ? 'shadow-lg' : ''}
                >
                  Créer les posts
                  {selectionCount > 0 && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                      {selectionCount}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Quota Reminder */}
            {quota && quota.ideas.remaining <= 10 && quota.ideas.remaining > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Il vous reste <span className="font-semibold">{quota.ideas.remaining}</span> génération(s) d'idées ce mois.
                    {quotaRemaining < quota.ideas.remaining && (
                      <span className="ml-1">(mis à jour)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Generation Modal (STORY-012) */}
      <BatchGenerationModal
        isOpen={showBatchModal}
        isGenerating={isBatchGenerating}
        progress={batchProgress}
        items={batchItems}
        result={batchResult}
        onClose={handleCloseBatchModal}
        onCancel={handleCancelBatchGeneration}
        onViewPosts={handleViewPosts}
      />
    </AppLayout>
  )
}
