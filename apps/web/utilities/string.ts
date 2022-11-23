export function random(): string {
  return (Math.random() * 100000000000).toString();
}

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export function isWhitespace(character: string) {
  return /\s/.test(character);
}

const cleanUpRegex = /[^a-zA-Z0-9 ]/g;

export function cleanUpStringForSeo(str?: string | null) {
  if (!str) return '';
  return str.replace(cleanUpRegex, ' ').replace(/\s+/g, ' ');
}

export function cleanUpString(str: string) {
  return cleanUpStringForSeo(str);
}
