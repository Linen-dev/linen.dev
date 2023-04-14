import { prisma } from '@linen/database';
import { ChatType, MessageFormat, Roles } from '@linen/types';
import { generateHash } from '@linen/utilities/password';

export default async function createIpsumCommunity() {
  const community = await prisma.accounts.create({
    data: {
      name: 'Ipsum',
      homeUrl: `https://ipsum.dev`,
      docsUrl: `https://ipsum.dev/docs`,
      brandColor: '#000000',
      slackDomain: 'ipsum',
      chat: ChatType.MEMBERS,
      syncStatus: 'DONE',
      premium: false,
      description: 'Lorem ipsum dolor sit amet.',
    },
  });
  const auth1 = await prisma.auths.create({
    data: {
      email: 'john@ipsum.lorem',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: community.id,
    },
  });
  const user1 = await prisma.users.create({
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

  const channel1 = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
    },
  });

  await prisma.threads.create({
    data: {
      channelId: channel1.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel1.id,
            body: 'Welcome to the ipsum community!',
            usersId: user1.id,
            sentAt: '2021-12-09T08:01:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });

  const channel2 = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'bugs',
    },
  });

  await prisma.threads.create({
    data: {
      channelId: channel2.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel2.id,
            body: 'Can you see this image? https://static.main.linendev.com/not-found.png',
            usersId: user1.id,
            sentAt: '2021-12-09T08:02:00.000Z',
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
}
