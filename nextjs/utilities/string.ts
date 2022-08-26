export function random(): string {
  return (Math.random() * 100000000000).toString();
}

export function truncate(text: string, limit: number): string {
  if (text.length > limit) {
    return `${text.substring(0, limit)}...`;
  }
  return text;
}

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const cleanUpRegex = /[^a-zA-Z0-9 ]/g;

export function cleanUpStringForSeo(str?: string | null) {
  if (!str) return '';
  return str.replace(cleanUpRegex, ' ').replace(/\s+/g, ' ');
}
