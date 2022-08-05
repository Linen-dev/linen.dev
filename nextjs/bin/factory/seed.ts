import { accounts, users } from '@prisma/client';
import prisma from '../../client';

import messages from './messages';
import { generateHash } from '../../utilities/password';
import { random } from '../../utilities/string';

export const seed = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      } catch (error) {
        console.log({ error });
      }
    }
  }
  await prisma.accounts.create({
    data: {
      homeUrl: `https://communityTwo.dev`,
      docsUrl: `https://communityTwo.dev/docs`,
      redirectDomain: 'communityTwo.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/communityTwo-logo.svg',
    },
  });
  await prisma.accounts.create({
    data: {
      homeUrl: `https://communityOne.dev`,
      docsUrl: `https://communityOne.dev/docs`,
      redirectDomain: 'communityOne.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/communityOne-logo.svg',
    },
  });
  const account = await prisma.accounts.create({
    data: {
      homeUrl: `https://linen.dev`,
      docsUrl: `https://linen.dev/docs`,
      redirectDomain: 'linen.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
    },
  });
  const account2 = await prisma.accounts.create({
    data: {
      homeUrl: `https://empty.dev`,
      docsUrl: `https://empty.dev/docs`,
      redirectDomain: 'empty.dev',
      brandColor: '#00bcd4',
      slackDomain: 'empty',
    },
  });

  await prisma.auths.create({
    data: {
      email: 'emil@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
      verified: true,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'jarek@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
      verified: true,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'kam@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
      verified: true,
    },
  });
  await prisma.auths.create({
    data: {
      email: 'sandro@linen.dev',
      password: generateHash('password1!', 'salt'),
      salt: 'salt',
      accountId: account.id,
      verified: true,
    },
  });

  await createMessagesAndThreads(account);
  await createMessagesAndThreads(account2);
};

const createMessagesAndThreads = async (account: accounts) => {
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

  await createChannelThreadsMessages({
    name: 'general',
    account,
    user1,
    user2,
    slug: 'slug',
    externalChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'sql',
    account,
    user1,
    user2,
    slug: 'something',
    externalChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'alpha',
    account,
    user1,
    user2,
    slug: 'cool',
    externalChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'hidden',
    account,
    user1,
    user2,
    slug: 'cool',
    hidden: true,
    externalChannelId: `slack-channel-id-${random()}`,
  });
};

async function createChannelThreadsMessages({
  account,
  user1,
  user2,
  name,
  slug,
  hidden,
  externalChannelId,
}: {
  account: accounts;
  user1: users;
  user2: users;
  name: string;
  slug: string;
  hidden?: boolean;
  externalChannelId: string;
}) {
  const channel = await prisma.channels.create({
    data: {
      channelName: name,
      accountId: account.id,
      externalChannelId,
      hidden,
    },
  });

  for (let i = 0; i < 100; i++) {
    const thread = await prisma.threads.create({
      data: {
        channelId: channel.id,
        slug: `${slug}-${channel.channelName}-${channel.id}-${i}`,
        messageCount: 2,
        externalThreadId: `slack-thread-ts-${slug}-${random()}`,
        sentAt: new Date().getTime(),
      },
    });
    const message1 = await prisma.messages.create({
      data: {
        body: messages[i] || `foo-${i}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user1.id,
        sentAt: new Date().toISOString(),
        externalMessageId: `slack-message-id-${random()}`,
      },
    });
    await prisma.messageReactions.create({
      data: {
        messagesId: message1.id,
        name: ':thumbsup:',
        count: 5,
      },
    });
    const message2 = await prisma.messages.create({
      data: {
        body: `bar-${i}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user1.id,
        sentAt: new Date().toISOString(),
        externalMessageId: `slack-message-id-${random()}`,
      },
    });
    await prisma.messageReactions.create({
      data: {
        messagesId: message2.id,
        name: ':thumbsup:',
        count: 5,
      },
    });
    await prisma.messages.create({
      data: {
        body: `baz-${i}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user2.id,
        sentAt: new Date().toISOString(),
        externalMessageId: `slack-message-id-${random()}`,
      },
    });
    await prisma.messages.create({
      data: {
        body: `qux-${i}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: user2.id,
        sentAt: new Date().toISOString(),
        externalMessageId: `slack-message-id-${random()}`,
      },
    });
  }
  return channel;
}
