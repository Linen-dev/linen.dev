import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';

interface CreateAuthParams {
  email: string;
  password: string;
  accountId?: string;
}

export async function createAuth({
  email,
  password,
  accountId,
}: CreateAuthParams) {
  const salt = generateSalt();
  const hash = generateHash(password, salt);
  return prisma.auths.create({
    data: {
      salt,
      password: hash,
      email,
      accountId,
    },
  });
}
