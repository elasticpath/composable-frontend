/**
 * Strips HTML tags from a string and returns plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Processes HTML description: strips tags and truncates
 */
export function processDescription(description: string | undefined, maxLength: number = 150): string {
  if (!description) return '';
  
  // First strip HTML tags
  const plainText = stripHtml(description);
  
  // Then truncate
  return truncateText(plainText, maxLength);
}