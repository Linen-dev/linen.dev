import prisma from '../../client';
import { truncateTables } from './truncate';
import { ChatType, MessageFormat, Roles } from '@linen/types';
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
  const user1 = await prisma.users.create({
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
  const user2 = await prisma.users.create({
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
  const user3 = await prisma.users.create({
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
  const user4 = await prisma.users.create({
    data: {
      displayName: 'Sandro',
      accountsId: community.id,
      authsId: auth4.id,
      isAdmin: true,
      isBot: false,
      role: Roles.ADMIN,
    },
  });

  const channel = await prisma.channels.create({
    data: {
      accountId: community.id,
      channelName: 'general',
    },
  });
  await prisma.threads.create({
    data: {
      channelId: channel.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel.id,
            body: 'I’m setting up a docker compose file for integration tests so it doesn’t mess with your current db',
            usersId: user3.id,
            sentAt: new Date().toISOString(),
            messageFormat: MessageFormat.LINEN,
            reactions: {
              create: [
                {
                  name: 'white_heavy_check_mark',
                  count: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });
  await prisma.threads.create({
    data: {
      channelId: channel.id,
      sentAt: new Date().getTime(),
      messages: {
        create: [
          {
            channelId: channel.id,
            body: "I had a look at optimizing pages and they're being slown down heavily by avatars right now. `Next.js` offers `next/image` which supports lazy loading, so we could fix that, but I would need to spend some time refactoring avatars. Does that make sense?",
            usersId: user1.id,
            sentAt: new Date().toISOString(),
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel.id,
            body: "Yeah that sounds good i'm only working on backend now",
            usersId: user3.id,
            sentAt: new Date().toISOString(),
            messageFormat: MessageFormat.LINEN,
          },
          {
            channelId: channel.id,
            body: 'Ok, thanks',
            usersId: user1.id,
            sentAt: new Date().toISOString(),
            messageFormat: MessageFormat.LINEN,
          },
        ],
      },
    },
  });
}

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
};
