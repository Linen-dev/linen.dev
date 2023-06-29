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

  const auth2 = await prisma.auths.findFirst({
    where: {
      email: 'emil@linen.dev',
    },
  });

  const user2 = await prisma.users.create({
    data: {
      displayName: 'Emil',
      accountsId: community.id,
      authsId: auth2!.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });

  const users = [user1, user2].filter(Boolean);

  const channel1 = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
      default: true,
    },
  });

  await prisma.memberships.createMany({
    data: users.map((user: any) => ({
      channelsId: channel1.id,
      usersId: user.id,
    })),
  });
}
