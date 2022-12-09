import prisma from '../../client';
import { truncateTables } from './truncate';
import { ChatType, Roles } from '@linen/types';
import { generateHash } from '../../utilities/password';

async function createLinenCommunity() {
  const community = await prisma.accounts.create({
    data: {
      name: 'Linen',
      homeUrl: `https://linen.dev`,
      docsUrl: `https://linen.dev/docs`,
      redirectDomain: 'linen.dev',
      brandColor: '#000000',
      slackDomain: 'linen',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
      chat: ChatType.MEMBERS,
      syncStatus: 'DONE',
      premium: true,
    },
  });
  const auth1 = await prisma.auths.create({
    data: {
      email: 'emil@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Emil',
      accountsId: community.id,
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
      accountId: community.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Jarek',
      accountsId: community.id,
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
      accountId: community.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Kam',
      accountsId: community.id,
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
      accountId: community.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'Sandro',
      accountsId: community.id,
      authsId: auth4.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });

  await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
    },
  });
}

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
};
