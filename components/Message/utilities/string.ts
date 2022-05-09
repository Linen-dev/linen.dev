export function truncate(text: string): string {
  const excerpt = text.substring(0, 220);
  return `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
}

export function normalizeCode(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
