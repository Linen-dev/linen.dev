import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';

interface FindAuthParams {
  email: string;
}

interface CreateAuthParams {
  email: string;
  password: string;
  accountId?: string;
}

export async function findAuth({ email }: FindAuthParams) {
  return await prisma.auths.findFirst({
    where: { email },
  });
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
