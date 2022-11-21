export function normalizeUrl(url: string): string {
  return url.replace(/\.\.(\w+)$/, '.$1');
}
