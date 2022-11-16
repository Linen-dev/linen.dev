import { randomBytes } from 'crypto';

export function generateToken(length: number = 16): string {
  return (
    randomBytes(length).toString('hex') +
    Math.random().toString(length).substr(2)
  );
}
