// Component for displaying AI generation quota information
// Shows remaining ideas and posts generations with visual indicators

import { Sparkles, FileText, Calendar } from 'lucide-react'
import type { QuotaInfo } from '../../types/ai'

interface QuotaDisplayProps {
  quota: QuotaInfo
  compact?: boolean
}

export function QuotaDisplay({ quota, compact = false }: QuotaDisplayProps) {
  const getProgressColor = (remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 20) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColor = (remaining: number, limit: number) => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-amber-600'
    return 'text-red-600'
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className={`text-sm font-medium ${getTextColor(quota.ideas.remaining, quota.ideas.limit)}`}>
            {quota.ideas.remaining}/{quota.ideas.limit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span className={`text-sm font-medium ${getTextColor(quota.posts.remaining, quota.posts.limit)}`}>
            {quota.posts.remaining}/{quota.posts.limit}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Quota mensuel</h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Renouvellement: {new Date(quota.resetsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Ideas Quota */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">Idées</span>
            </div>
            <span className={`text-sm font-semibold ${getTextColor(quota.ideas.remaining, quota.ideas.limit)}`}>
              {quota.ideas.remaining} / {quota.ideas.limit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(quota.ideas.remaining, quota.ideas.limit)} transition-all duration-300`}
              style={{ width: `${(quota.ideas.remaining / quota.ideas.limit) * 100}%` }}
            />
          </div>
        </div>

        {/* Posts Quota */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-gray-600">Posts</span>
            </div>
            <span className={`text-sm font-semibold ${getTextColor(quota.posts.remaining, quota.posts.limit)}`}>
              {quota.posts.remaining} / {quota.posts.limit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(quota.posts.remaining, quota.posts.limit)} transition-all duration-300`}
              style={{ width: `${(quota.posts.remaining / quota.posts.limit) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
