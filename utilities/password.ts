import { createHmac, randomBytes } from 'crypto';

export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

export function generateHash(password: string, salt: string): string {
  const hash = createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}
