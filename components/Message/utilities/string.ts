export function truncate(text: string) {
  const excerpt = text.substr(0, 220);
  return `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
}
