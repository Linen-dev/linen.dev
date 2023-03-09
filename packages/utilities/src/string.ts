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
  return str.replace(/[\p{P}$+<=>^`|~]/gu, ' ').replace(/\s+/g, ' ');
}

export function pad(string: string, length: number) {
  if (string.length < length) {
    return `0`.repeat(length - string.length) + string;
  }
  return string;
}
