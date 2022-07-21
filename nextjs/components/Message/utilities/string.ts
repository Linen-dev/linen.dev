import { decodeHTML as decode } from 'entities';

export function truncate(text: string): string {
  const excerpt = text.substring(0, 220);
  return `${excerpt}${excerpt.length === 220 ? '...' : ''}`;
}

export function decodeHTML(text?: string): string {
  if (!text) {
    return '';
  }
  try {
    return decode(text);
  } catch (exception) {
    return '';
  }
}
