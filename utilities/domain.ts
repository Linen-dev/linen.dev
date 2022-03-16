export function getDomain(hostname: string): string {
  return hostname.split('.').slice(-1)[0];
}

export function getSubdomain(hostname: string): string | null {
  return hostname.includes('.') ? hostname.split('.')[0] : null;
}
