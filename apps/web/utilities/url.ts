export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function normalizeUrl(url: string): string {
  return url.replace(/\.\.(\w+)$/, '.$1');
}

export const appendProtocol = (host: string) =>
  (['localhost'].includes(host) ? 'http' : 'https') + '://' + host;

// TODO: Should handle this on validation/save when creating an account
export const addHttpsToUrl = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

/** this function will parse an object into query string params */
export const qs = (params: any) => {
  return Object.entries(params)
    .filter(([key, value]) => !!key && !!value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join('&');
};
