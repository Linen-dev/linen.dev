import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';

interface CreateAuthParams {
  email: string;
  password: string;
  verificationToken: string;
  accountId?: string;
}

export async function createAuth({
  email,
  password,
  verificationToken,
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
      verificationToken,
    },
  });
}

export async function verifyAuthByToken(
  token?: string | string[]
): Promise<boolean> {
  if (!token || Array.isArray(token)) {
    return false;
  }
  const auth = await prisma.auths.findFirst({
    where: { verificationToken: token as string },
  });
  if (auth) {
    await prisma.auths.update({
      where: { id: auth.id },
      data: { verified: true, verificationToken: null },
    });
    return true;
  }
  return false;
}
