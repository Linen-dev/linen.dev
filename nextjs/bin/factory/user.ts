import { accounts } from '@prisma/client';
import prisma from '../../client';

export async function createUsers(account: accounts) {
  const user1 = await prisma.users.create({
    data: {
      accountsId: account.id,
      externalUserId: '1',
      isBot: false,
      isAdmin: false,
      displayName: 'John Doe',
    },
  });
  const user2 = await prisma.users.create({
    data: {
      accountsId: account.id,
      externalUserId: '2',
      isBot: false,
      isAdmin: false,
      displayName: 'Jane Doe',
    },
  });
  return [user1, user2];
}
