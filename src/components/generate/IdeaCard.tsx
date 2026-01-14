// Card component for displaying a single content idea
// Shows title, description, platform badge, engagement indicator, and selection checkbox

import { Linkedin, Instagram, Hash, TrendingUp, Sparkles, Check } from 'lucide-react'
import type { ContentIdea } from '../../types/ai'

interface IdeaCardProps {
  idea: ContentIdea
  selected?: boolean
  onSelect?: (idea: ContentIdea) => void
  selectable?: boolean
  disabled?: boolean
}

const platformConfig = {
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    bgColor: 'bg-gradient-to-r from-pink-100 to-purple-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
  both: {
    label: 'Multi-plateforme',
    icon: Sparkles,
    bgColor: 'bg-gradient-to-r from-indigo-100 to-purple-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
}

const engagementConfig = {
  low: {
    label: 'Standard',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  medium: {
    label: 'Bon potentiel',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  high: {
    label: 'Fort potentiel',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
}

export function IdeaCard({ idea, selected = false, onSelect, selectable = false, disabled = false }: IdeaCardProps) {
  const platform = platformConfig[idea.targetPlatform]
  const engagement = engagementConfig[idea.estimatedEngagement]
  const PlatformIcon = platform.icon

  const handleClick = () => {
    if (selectable && onSelect && !disabled) {
      onSelect(idea)
    }
  }

  const isClickable = selectable && !disabled

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 transition-all duration-200
        ${selected
          ? 'border-indigo-500 shadow-indigo-100 ring-2 ring-indigo-500/20 scale-[1.02]'
          : 'border-gray-200/50 hover:border-gray-300 hover:shadow-xl'
        }
        ${isClickable ? 'cursor-pointer' : ''}
        ${disabled && !selected ? 'opacity-60' : ''}
      `}
    >
      {/* Header with Platform Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${platform.bgColor} ${platform.textColor}
        `}>
          <PlatformIcon className="w-3.5 h-3.5" />
          <span>{platform.label}</span>
        </div>

        {/* Selection checkbox */}
        {selectable && (
          <div className={`
            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
            ${selected
              ? 'bg-indigo-500 border-indigo-500'
              : disabled
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-indigo-400'
            }
          `}>
            {selected && (
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2">
        {idea.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
        {idea.description}
      </p>

      {/* Footer with Category and Engagement */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Category */}
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
          {idea.category}
        </span>

        {/* Engagement Indicator */}
        <div className={`
          flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg
          ${engagement.bgColor} ${engagement.color}
        `}>
          <TrendingUp className="w-3 h-3" />
          <span>{engagement.label}</span>
        </div>
      </div>

      {/* Hashtags Preview (if available) */}
      {idea.suggestedHashtags && idea.suggestedHashtags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Hash className="w-3 h-3" />
            <span className="truncate">
              {idea.suggestedHashtags.slice(0, 3).join(' ')}
              {idea.suggestedHashtags.length > 3 && ` +${idea.suggestedHashtags.length - 3}`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
