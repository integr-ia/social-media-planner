// STORY-017: Post Preview Component
// Displays posts as they would appear on LinkedIn or Instagram

import { Linkedin, User, ThumbsUp, MessageCircle, Repeat2, Send, Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react'
import type { PostPlatform } from '../../types/database'

interface PostPreviewProps {
  platform: PostPlatform
  content: string
  hashtags: string[]
  imageUrl?: string
  userName?: string
  userTitle?: string
  userAvatar?: string
}

export function PostPreview({
  platform,
  content,
  hashtags,
  imageUrl,
  userName = 'Utilisateur',
  userTitle = 'Entrepreneur | Suisse romande',
  userAvatar,
}: PostPreviewProps) {
  if (platform === 'linkedin' || platform === 'both') {
    return (
      <LinkedInPreview
        content={content}
        imageUrl={imageUrl}
        userName={userName}
        userTitle={userTitle}
        userAvatar={userAvatar}
      />
    )
  }

  return (
    <InstagramPreview
      content={content}
      hashtags={hashtags}
      imageUrl={imageUrl}
      userName={userName}
      userAvatar={userAvatar}
    />
  )
}

// LinkedIn-style preview
function LinkedInPreview({
  content,
  imageUrl,
  userName,
  userTitle,
  userAvatar,
}: Omit<PostPreviewProps, 'platform' | 'hashtags'>) {
  // Process content: convert line breaks and handle "Read more" truncation
  const formattedContent = content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < content.split('\n').length - 1 && <br />}
    </span>
  ))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-lg mx-auto font-sans">
      {/* Header */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {userTitle}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              maintenant
              <span className="mx-1">·</span>
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8zm8 3a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </p>
          </div>

          {/* LinkedIn logo */}
          <div className="flex-shrink-0">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 pb-3">
        <div
          className="text-sm text-gray-900 whitespace-pre-wrap"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {formattedContent}
        </div>
      </div>

      {/* Image (if present) */}
      {imageUrl && (
        <div className="border-t border-b border-gray-100">
          <img
            src={imageUrl}
            alt="Post media"
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Engagement stats (mock) */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <span className="ml-1">12</span>
        </div>
        <span>3 commentaires</span>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ThumbsUp className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:inline">J'aime</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:inline">Commenter</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Repeat2 className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:inline">Republier</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Send className="w-5 h-5" />
          <span className="text-xs font-medium hidden sm:inline">Envoyer</span>
        </button>
      </div>
    </div>
  )
}

// Instagram-style preview
function InstagramPreview({
  content,
  hashtags,
  imageUrl,
  userName,
  userAvatar,
}: Omit<PostPreviewProps, 'platform' | 'userTitle'>) {
  // Combine content with hashtags for display
  const hashtagsText = hashtags.length > 0 ? `\n\n${hashtags.join(' ')}` : ''
  const fullContent = content + hashtagsText

  // Process content to show emojis and line breaks nicely
  const formattedContent = fullContent.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < fullContent.split('\n').length - 1 && <br />}
    </span>
  ))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto font-sans">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full" />
            <div className="relative bg-white p-0.5 rounded-full">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <span className="text-sm font-semibold text-gray-900">
            {userName?.toLowerCase().replace(/\s+/g, '_') || 'user'}
          </span>
        </div>

        {/* More options */}
        <button className="text-gray-900">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-gray-100 aspect-square">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                Ajoutez une image pour un meilleur apercu Instagram
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-gray-900 hover:text-gray-600 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button className="text-gray-900 hover:text-gray-600 transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="text-gray-900 hover:text-gray-600 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
        <button className="text-gray-900 hover:text-gray-600 transition-colors">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Likes (mock) */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-gray-900">
          42 mentions J'aime
        </p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-900">
          <span className="font-semibold mr-1">
            {userName?.toLowerCase().replace(/\s+/g, '_') || 'user'}
          </span>
          <span className="whitespace-pre-wrap">{formattedContent}</span>
        </p>
      </div>

      {/* View comments */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-500">
          Voir les 5 commentaires
        </p>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <p className="text-xs text-gray-400 uppercase">
          Il y a 2 heures
        </p>
      </div>
    </div>
  )
}
