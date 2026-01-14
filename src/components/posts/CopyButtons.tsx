// STORY-018: Copy Buttons for manual publishing
// Allows users to copy post content formatted for LinkedIn or Instagram

import { useState } from 'react'
import { Copy, Linkedin, Instagram, Check, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { PostPlatform } from '../../types/database'

interface CopyButtonsProps {
  content: string
  hashtags: string[]
  platform: PostPlatform
  /** Show only relevant button(s) based on platform */
  showSingle?: boolean
  /** Size variant for different contexts */
  size?: 'sm' | 'md'
  /** Layout: inline or stacked */
  layout?: 'inline' | 'stacked'
}

/**
 * CopyButtons component - Provides quick copy functionality for posts
 *
 * Features:
 * - Platform-specific formatting (LinkedIn vs Instagram)
 * - Toast notifications on copy
 * - Hashtags included for Instagram
 * - Line breaks and emojis preserved
 * - Visual feedback when copied
 */
export function CopyButtons({
  content,
  hashtags,
  platform,
  showSingle = false,
  size = 'md',
  layout = 'inline',
}: CopyButtonsProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<'linkedin' | 'instagram' | null>(null)

  /**
   * Format content for LinkedIn
   * - Preserves line breaks
   * - Preserves emojis
   * - Clean text without hashtags
   */
  const formatForLinkedIn = (): string => {
    // LinkedIn content is straightforward - just the content
    return content.trim()
  }

  /**
   * Format content for Instagram
   * - Preserves line breaks
   * - Preserves emojis
   * - Includes hashtags at the end
   */
  const formatForInstagram = (): string => {
    let formattedContent = content.trim()

    // Add hashtags at the end with double line break
    if (hashtags.length > 0) {
      formattedContent += '\n\n' + hashtags.join(' ')
    }

    return formattedContent
  }

  /**
   * Copy content to clipboard
   */
  const copyToClipboard = async (targetPlatform: 'linkedin' | 'instagram') => {
    try {
      const formattedContent = targetPlatform === 'linkedin'
        ? formatForLinkedIn()
        : formatForInstagram()

      await navigator.clipboard.writeText(formattedContent)

      // Set copied state for visual feedback
      setCopiedPlatform(targetPlatform)

      // Show success toast with platform-specific message
      const platformName = targetPlatform === 'linkedin' ? 'LinkedIn' : 'Instagram'
      toast.success(
        <ToastContent
          platform={targetPlatform}
          message={`Contenu copié pour ${platformName}!`}
        />,
        {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }
      )

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedPlatform(null)
      }, 2000)

    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Impossible de copier. Essayez de sélectionner le texte manuellement.', {
        duration: 4000,
        position: 'bottom-center',
      })
    }
  }

  // Button sizes
  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-xs',
      icon: 'w-3.5 h-3.5',
      gap: 'gap-1.5',
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-2',
    },
  }

  const sizes = sizeClasses[size]

  // Determine which buttons to show
  const showLinkedIn = !showSingle || platform === 'linkedin' || platform === 'both'
  const showInstagram = !showSingle || platform === 'instagram' || platform === 'both'

  // Layout classes
  const layoutClasses = layout === 'stacked'
    ? 'flex flex-col gap-2 w-full'
    : 'flex flex-wrap items-center gap-2'

  return (
    <div className={layoutClasses}>
      {showLinkedIn && (
        <CopyButton
          platform="linkedin"
          onClick={() => copyToClipboard('linkedin')}
          isCopied={copiedPlatform === 'linkedin'}
          size={sizes}
          layout={layout}
        />
      )}

      {showInstagram && (
        <CopyButton
          platform="instagram"
          onClick={() => copyToClipboard('instagram')}
          isCopied={copiedPlatform === 'instagram'}
          size={sizes}
          layout={layout}
        />
      )}
    </div>
  )
}

// Individual copy button component
interface CopyButtonProps {
  platform: 'linkedin' | 'instagram'
  onClick: () => void
  isCopied: boolean
  size: {
    button: string
    icon: string
    gap: string
  }
  layout: 'inline' | 'stacked'
}

function CopyButton({ platform, onClick, isCopied, size, layout }: CopyButtonProps) {
  const isLinkedIn = platform === 'linkedin'

  // Platform-specific styles
  const platformStyles = {
    linkedin: {
      base: 'bg-white border border-gray-200 text-gray-700 hover:border-[#0A66C2] hover:text-[#0A66C2]',
      copied: 'bg-[#0A66C2] border-[#0A66C2] text-white',
      icon: Linkedin,
      label: 'Copier pour LinkedIn',
      copiedLabel: 'Copié!',
    },
    instagram: {
      base: 'bg-white border border-gray-200 text-gray-700 hover:border-[#E4405F] hover:text-[#E4405F]',
      copied: 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] border-transparent text-white',
      icon: Instagram,
      label: 'Copier pour Instagram',
      copiedLabel: 'Copié!',
    },
  }

  const styles = platformStyles[platform]
  const Icon = styles.icon

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isCopied ? styles.copied : styles.base}
        ${isCopied ? 'focus:ring-green-500' : isLinkedIn ? 'focus:ring-[#0A66C2]' : 'focus:ring-[#E4405F]'}
        ${size.button}
        ${size.gap}
        ${layout === 'stacked' ? 'w-full' : ''}
      `}
    >
      {isCopied ? (
        <>
          <Check className={size.icon} />
          <span>{styles.copiedLabel}</span>
        </>
      ) : (
        <>
          <Icon className={size.icon} />
          <Copy className={size.icon} />
          <span className="hidden sm:inline">{styles.label}</span>
          <span className="sm:hidden">{isLinkedIn ? 'LinkedIn' : 'Instagram'}</span>
        </>
      )}
    </button>
  )
}

// Toast content component for styled notifications
interface ToastContentProps {
  platform: 'linkedin' | 'instagram'
  message: string
}

function ToastContent({ platform, message }: ToastContentProps) {
  const Icon = platform === 'linkedin' ? Linkedin : Instagram
  const iconColor = platform === 'linkedin' ? 'text-[#0A66C2]' : 'text-[#E4405F]'
  const platformUrl = platform === 'linkedin'
    ? 'https://www.linkedin.com/feed/'
    : 'https://www.instagram.com/'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        <a
          href={platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-indigo-600 inline-flex items-center gap-1 mt-0.5"
        >
          Ouvrir {platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
    </div>
  )
}
