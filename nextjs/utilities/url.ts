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
