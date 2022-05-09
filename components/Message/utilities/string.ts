import { decodeHTML } from 'entities';

export function truncate(text: string): string {
  const excerpt = text.substring(0, 220);
  return `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
}

export function normalizeCode(text: string): string {
  return decodeHTML(text);
}
