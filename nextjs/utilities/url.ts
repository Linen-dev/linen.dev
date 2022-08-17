export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function normalizeUrl(url: string): string {
  return url.replace(/\.\.(\w+)$/, '.$1');
}

export const appendProtocol = (host: string) =>
  (['localhost'].includes(host) ? 'http' : 'https') + '://' + host;
