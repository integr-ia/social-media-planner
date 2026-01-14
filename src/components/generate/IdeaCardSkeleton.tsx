// Skeleton loading component for idea cards
// Displays animated placeholders while content is being generated

export function IdeaCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 animate-pulse">
      {/* Header with Platform Badge Skeleton */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-5 w-20 bg-gray-100 rounded-lg" />
        <div className="h-5 w-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}
