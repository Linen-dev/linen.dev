import { auths, prisma } from '@linen/database';
import { createHmac, randomBytes } from 'crypto';

// dup from utilities to avoid circular dependency
function generateSalt(): string {
  return randomBytes(16).toString('hex');
}
// dup from utilities to avoid circular dependency
function generateHash(password: string, salt: string): string {
  const hash = createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

export default function createAuth(options?: Partial<auths>): Promise<auths> {
  const password = options?.password || 'password';
  const salt = generateSalt();
  const hash = generateHash(password, salt);
  const data = {
    email: 'john@doe.com',
    token: 'token',
    password: '',
    salt: '',
    ...options,
  };
  data.password = hash;
  data.salt = salt;
  return prisma.auths.create({
    data,
  });
}
