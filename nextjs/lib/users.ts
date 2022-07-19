import { UserMap } from '../types/partialTypes';
import prisma from '../client';

export async function findUsersByAccountId(
  accountId: string
): Promise<UserMap[]> {
  return await prisma.users.findMany({
    where: { accountsId: accountId },
    select: {
      externalUserId: true,
      id: true,
    },
  });
}
