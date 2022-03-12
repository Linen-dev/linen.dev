export const DOMAIN = process.env.DOMAIN || 'localhost:3000';

export function getSubdomain(hostname: string): string | null {
  return hostname.includes('.') ? hostname.split('.')[0] : null;
}
