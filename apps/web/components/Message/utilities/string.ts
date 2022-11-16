import { decodeHTML as decode } from 'entities';

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
