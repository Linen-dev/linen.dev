import { accounts } from '@prisma/client';
import prisma from '../../client';
import { generateHash } from '../../utilities/password';

export async function createAuths(account: accounts) {
  await prisma.auths.create({
    data: {
      email: 'emil@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'jarek@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'kam@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'sandro@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
}
