import { accounts } from '@prisma/client';
import prisma from '../../client';
import { generateHash } from '../../utilities/password';
import { Roles } from '@prisma/client';

export async function createAuthsAndUsers(account: accounts) {
  const auth1 = await prisma.auths.create({
    data: {
      email: 'emil@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Emil',
      accountsId: account.id,
      authsId: auth1.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });
  const auth2 = await prisma.auths.create({
    data: {
      email: 'jarek@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Jarek',
      accountsId: account.id,
      authsId: auth2.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });
  const auth3 = await prisma.auths.create({
    data: {
      email: 'kam@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Kam',
      accountsId: account.id,
      authsId: auth3.id,
      isAdmin: true,
      isBot: false,
      role: Roles.OWNER,
    },
  });
  const auth4 = await prisma.auths.create({
    data: {
      email: 'sandro@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Sandro',
      accountsId: account.id,
      authsId: auth4.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });
}
