import type { auths } from '@prisma/client';
import prisma from 'client';
import { generateHash, generateSalt } from 'utilities/password';

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
