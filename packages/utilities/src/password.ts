import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

export function generateHash(password: string, salt: string): string {
  const hash = createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

export function secureCompare(a: string, b: string): boolean {
  if (
    typeof a !== 'string' ||
    typeof b !== 'string' ||
    !a ||
    !b ||
    a.length !== b.length
  )
    return false;

  const buffer1 = Buffer.from(a);
  const buffer2 = Buffer.from(b);
  try {
    return timingSafeEqual(buffer1, buffer2);
  } catch (exception) {
    return false;
  }
}
