export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function normalizeUrl(url: string): string {
  return url.replace(/\.\.(\w+)$/, '.$1');
}
