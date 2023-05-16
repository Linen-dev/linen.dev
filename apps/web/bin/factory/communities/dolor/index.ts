import { prisma } from '@linen/database';
import { ChatType, Roles } from '@linen/types';
import { generateHash } from '@linen/utilities/password';

export default async function createDolorCommunity() {
  const community = await prisma.accounts.create({
    data: {
      name: 'Dolor',
      homeUrl: `https://dolor.dev`,
      docsUrl: `https://dolor.dev/docs`,
      brandColor: '#ffffff',
      slackDomain: 'dolor',
      chat: ChatType.MEMBERS,
      syncStatus: 'DONE',
      premium: false,
      description: 'Lorem dolor dolor sit amet.',
    },
  });
  const auth1 = await prisma.auths.create({
    data: {
      email: 'john@dolor.lorem',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  await prisma.users.create({
    data: {
      displayName: 'John',
      accountsId: community.id,
      authsId: auth1.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });

  const user2 = await prisma.users.findFirst({
    where: {
      displayName: 'Emil',
    },
  });

  if (user2) {
    await prisma.users.create({
      data: {
        displayName: 'John',
        accountsId: community.id,
        authsId: user2.authsId,
        isAdmin: true,
        isBot: false,
        role: Roles.ADMIN,
      },
    });
  }

  await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
    },
  });
}
