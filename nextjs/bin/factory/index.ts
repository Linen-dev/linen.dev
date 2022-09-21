import { accounts, users } from '@prisma/client';
import prisma from '../../client';

import messages from './messages';
import { random } from '../../utilities/string';

import { truncateTables } from './truncate';
import { createAccounts } from './account';
import { createAuthsAndUsers } from './auth';
import { createAuthorizations } from './authorizations';
import { createUsers } from './user';

export const seed = async () => {
  await truncateTables();
  const accounts = await createAccounts();
  await createAuthsAndUsers(accounts[0]);
  await createAuthorizations(accounts[0]);

  await createMessagesAndThreads(accounts[0]);
  await createMessagesAndThreads(accounts[1]);
  await createMessagesAndThreads(accounts[2]);
};

const createMessagesAndThreads = async (account: accounts) => {
  const [user1, user2] = await createUsers(account);
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
