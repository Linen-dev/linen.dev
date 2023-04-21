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
