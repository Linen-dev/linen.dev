export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
