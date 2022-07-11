import { accounts, users } from '@prisma/client';
import prisma from '../../client';

import messages from './messages';
import { generateHash } from '../../utilities/password';
import { random } from '../../utilities/string';

import { truncateTables } from './truncate';

export const seed = async () => {
  await truncateTables();
  await prisma.accounts.create({
    data: {
      homeUrl: `https://pulumi.dev`,
      docsUrl: `https://pulumi.dev/docs`,
      redirectDomain: 'pulumi.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/pulumi-logo.svg',
    },
  });
  await prisma.accounts.create({
    data: {
      homeUrl: `https://prefect.dev`,
      docsUrl: `https://prefect.dev/docs`,
      redirectDomain: 'prefect.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/prefect-logo.svg',
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

  await createMessagesAndThreads(account);
  await createMessagesAndThreads(account2);
};

const createMessagesAndThreads = async (account: accounts) => {
  const user1 = await prisma.users.create({
    data: {
      accountsId: account.id,
      slackUserId: '1',
      isBot: false,
      isAdmin: false,
      displayName: 'John Doe',
    },
  });
  const user2 = await prisma.users.create({
    data: {
      accountsId: account.id,
      slackUserId: '2',
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
    slackChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'sql',
    account,
    user1,
    user2,
    slug: 'something',
    slackChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'alpha',
    account,
    user1,
    user2,
    slug: 'cool',
    slackChannelId: `slack-channel-id-${random()}`,
  });
  await createChannelThreadsMessages({
    name: 'hidden',
    account,
    user1,
    user2,
    slug: 'cool',
    hidden: true,
    slackChannelId: `slack-channel-id-${random()}`,
  });
};

async function createChannelThreadsMessages({
  account,
  user1,
  user2,
  name,
  slug,
  hidden,
  slackChannelId,
}: {
  account: accounts;
  user1: users;
  user2: users;
  name: string;
  slug: string;
  hidden?: boolean;
  slackChannelId: string;
}) {
  const channel = await prisma.channels.create({
    data: {
      channelName: name,
      accountId: account.id,
      slackChannelId,
      hidden,
    },
  });

  for (let i = 0; i < 100; i++) {
    const thread = await prisma.slackThreads.create({
      data: {
        channelId: channel.id,
        slug: `${slug}-${channel.channelName}-${channel.id}-${i}`,
        messageCount: 2,
        slackThreadTs: `slack-thread-ts-${slug}-${random()}`,
      },
    });
    const message1 = await prisma.messages.create({
      data: {
        body: messages[i] || `foo-${i}`,
        channelId: channel.id,
        slackThreadId: thread.id,
        usersId: user1.id,
        sentAt: new Date().toISOString(),
        slackMessageId: `slack-message-id-${random()}`,
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
        slackThreadId: thread.id,
        usersId: user1.id,
        sentAt: new Date().toISOString(),
        slackMessageId: `slack-message-id-${random()}`,
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
        slackThreadId: thread.id,
        usersId: user2.id,
        sentAt: new Date().toISOString(),
        slackMessageId: `slack-message-id-${random()}`,
      },
    });
    await prisma.messages.create({
      data: {
        body: `qux-${i}`,
        channelId: channel.id,
        slackThreadId: thread.id,
        usersId: user2.id,
        sentAt: new Date().toISOString(),
        slackMessageId: `slack-message-id-${random()}`,
      },
    });
  }
  return channel;
}
