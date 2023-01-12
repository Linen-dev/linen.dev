import prisma from '../../../../client';
import { ChatType, MessageFormat, Roles } from '@linen/types';
import { generateHash } from '../../../../utilities/password';

export default async function createIpsumCommunity() {
  const community = await prisma.accounts.create({
    data: {
      name: 'Ipsum',
      homeUrl: `https://ipsum.dev`,
      docsUrl: `https://ipsum.dev/docs`,
      brandColor: '#ff0000',
      slackDomain: 'ipsum',
      chat: ChatType.MEMBERS,
      syncStatus: 'DONE',
      premium: true,
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
}
