export { patterns } from '@linen/types';
//Todos: Probably want to strip @ channel @ here later
//remove the, if, of, for etc words
export const createSlug = (message: string) => {
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

export const toObject = <T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K
): Record<string, T> => arr.reduce((a, b) => ({ ...a, [b[key]]: b }), {});

export function cleanUpUrl(reqUrl?: string) {
  if (!reqUrl) return;
  const url = new URL(reqUrl, 'http://fa.ke');
  url.searchParams.delete('customDomain');
  return url.toString().split('http://fa.ke').join('');
}
