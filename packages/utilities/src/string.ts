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

export function truncate(text: string, limit: number): string {
  if (text.length > limit) {
    return `${text.substring(0, limit)}...`;
  }
  return text;
}

export function random(): string {
  return (Math.random() * 100000000000).toString();
}

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function isWhitespace(character: string) {
  return /\s/.test(character);
}

export function normalize(str?: string | null) {
  if (!str) return '';
  return str.replace(/[^\p{L}\p{N}\p{Z}$+<=>^`|~]/gu, ' ').replace(/\s+/g, ' ');
}

export function pad(string: string, length: number) {
  if (string.length < length) {
    return `0`.repeat(length - string.length) + string;
  }
  return string;
}

export const slugify = (message: string) => {
  let slug = message
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .replace(/[^\w\s$*_+~.()'"!\-:@]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60)
    .toLowerCase();
  if (slug === '') {
    return 'conversation';
  }
  return slug;
};

function isLetter(character: string): boolean {
  return character.toLowerCase() !== character.toUpperCase();
}

export function getLetter(text: string): string {
  const character = text.trim().slice(0, 1).toLowerCase();
  if (isLetter(character)) {
    return character;
  }
  return 'u';
}
