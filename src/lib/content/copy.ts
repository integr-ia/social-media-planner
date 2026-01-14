// STORY-018: Copy utilities for manual publishing
// Provides functions to copy post content formatted for different platforms

/**
 * Copy post content to clipboard formatted for a specific platform
 *
 * @param content - The post content
 * @param hashtags - Array of hashtags (used for Instagram)
 * @param platform - Target platform ('linkedin' | 'instagram')
 * @returns Promise<boolean> - True if copy succeeded, false otherwise
 */
export async function copyPostContent(
  content: string,
  hashtags: string[],
  platform: 'linkedin' | 'instagram'
): Promise<boolean> {
  try {
    let formattedContent = content.trim()

    // For Instagram, append hashtags at the end
    if (platform === 'instagram' && hashtags.length > 0) {
      formattedContent += '\n\n' + hashtags.join(' ')
    }

    await navigator.clipboard.writeText(formattedContent)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Format content for LinkedIn (no special processing needed)
 *
 * @param content - The post content
 * @returns The formatted content for LinkedIn
 */
export function formatForLinkedIn(content: string): string {
  return content.trim()
}

/**
 * Format content for Instagram (includes hashtags)
 *
 * @param content - The post content
 * @param hashtags - Array of hashtags
 * @returns The formatted content with hashtags appended
 */
export function formatForInstagram(content: string, hashtags: string[]): string {
  let formattedContent = content.trim()

  if (hashtags.length > 0) {
    formattedContent += '\n\n' + hashtags.join(' ')
  }

  return formattedContent
}
