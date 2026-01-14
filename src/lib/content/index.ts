/**
 * Content management module
 *
 * Exports all content-related functions for posts, templates, and media.
 */

// Posts CRUD operations
export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  updatePostWithLock,
  deletePost,
  ratePost,
  schedulePost,
  markPostPublished,
  unschedulePost,
  getPostsCountByStatus,
  duplicatePost,
} from './posts'

// Types
export type {
  PostFilters,
  PaginationOptions,
  PaginatedPosts,
  OperationResult,
} from './posts'

// Copy utilities (STORY-018)
export {
  copyPostContent,
  formatForLinkedIn,
  formatForInstagram,
} from './copy'
