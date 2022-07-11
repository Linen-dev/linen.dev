import { accounts, users } from '@prisma/client';
import prisma from '../../client';

import messages from './messages';
import { random } from '../../utilities/string';

import { truncateTables } from './truncate';
import { createAccounts } from './account';
import { createAuths } from './auth';
import { createUsers } from './user';

export const seed = async () => {
  await truncateTables();
  const [account, account2] = await createAccounts();
  await createAuths(account);

  await createMessagesAndThreads(account);
  await createMessagesAndThreads(account2);
};

const createMessagesAndThreads = async (account: accounts) => {
  const [user1, user2] = await createUsers(account);
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
