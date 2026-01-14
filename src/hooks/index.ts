// React Hooks exports for Social Media Planner

// AI Generation hooks
export { useGenerateIdeas } from './useGenerateIdeas'
export type { UseGenerateIdeasResult } from './useGenerateIdeas'

export { useGeneratePost } from './useGeneratePost'
export type { UseGeneratePostResult, GeneratePostOptions } from './useGeneratePost'

export { useAIQuota } from './useAIQuota'
export type { UseAIQuotaResult } from './useAIQuota'

// Posts hooks
export { usePosts } from './usePosts'
export type { UsePostsResult } from './usePosts'

export { usePost } from './usePost'
export type { UsePostResult } from './usePost'

export { useBatchGeneration } from './useBatchGeneration'
export type {
  UseBatchGenerationResult,
  BatchGenerationItem,
  BatchGenerationProgress,
  BatchGenerationResult,
} from './useBatchGeneration'

// Utility hooks
export { useDebounce } from './useDebounce'
export { useAutoSave } from './useAutoSave'
export type {
  AutoSaveStatus,
  AutoSaveState,
  UseAutoSaveOptions,
  UseAutoSaveResult,
} from './useAutoSave'
