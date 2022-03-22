import { randomBytes } from 'crypto';

export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}
