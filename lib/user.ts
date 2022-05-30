import prisma from '../client';
import { generateHash, generateSalt } from '../utilities/password';

interface FindUserParams {
  accountsId: string;
  slackUserId: string;
}

interface CreateUserParams {
  accountsId: string;
  slackUserId: string;
}

export async function findUser({ accountsId, slackUserId }: FindUserParams) {
  return await prisma.users.findFirst({
    where: { accountsId, slackUserId },
  });
}

export async function createUser({
  accountsId,
  slackUserId,
}: CreateUserParams) {
  return prisma.users.create({
    data: {
      accountsId,
      slackUserId,
      isBot: false,
      isAdmin: false,
    },
  });
}
