import { accounts, users } from '@prisma/client';
import {
  findOrCreateAccount,
  findOrCreateAuth,
  findOrCreateUser,
  findOrCreateChannel,
  findOrCreateThread,
  findOrCreateMessage,
} from '.';

import messages from './messages';

export const seed = async () => {
  const account2 = await findOrCreateAccount({
    domain: 'empty.dev',
    slackDomain: 'empty',
  });
  await findOrCreateAccount({
    domain: 'pulumi.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/pulumi-logo.svg',
  });
  await findOrCreateAccount({
    domain: 'prefect.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/prefect-logo.svg',
  });
  const account = await findOrCreateAccount({
    domain: 'linen.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
  });

  await findOrCreateAuth({ email: 'emil@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'jarek@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'kam@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'sandro@linen.dev', accountId: account.id });

  await createMessagesAndThreads(account);
  await createMessagesAndThreads(account2);
};

const createMessagesAndThreads = async (account: accounts) => {
  const user1 = await findOrCreateUser({
    accountsId: account.id,
    slackUserId: '1',
  });
  const user2 = await findOrCreateUser({
    accountsId: account.id,
    slackUserId: '2',
  });

  await createChannelThreadsMessages({
    name: 'general',
    account,
    user1,
    user2,
    slug: 'slug',
  });
  await createChannelThreadsMessages({
    name: 'sql',
    account,
    user1,
    user2,
    slug: 'something',
  });
  await createChannelThreadsMessages({
    name: 'alpha',
    account,
    user1,
    user2,
    slug: 'cool',
  });
  await createChannelThreadsMessages({
    name: 'hidden',
    account,
    user1,
    user2,
    slug: 'cool',
    hidden: true,
  });
};

async function createChannelThreadsMessages({
  account,
  user1,
  user2,
  name,
  slug,
  hidden,
}: {
  account: accounts;
  user1: users;
  user2: users;
  name: string;
  slug: string;
  hidden?: boolean;
}) {
  const channel = await findOrCreateChannel({
    name,
    accountId: account.id,
    hidden,
  });

  for (let i = 0; i < 100; i++) {
    const thread = await findOrCreateThread({
      channelId: channel.id,
      slug: `${slug}-${channel.channelName}-${channel.id}-${i}`,
    });
    await findOrCreateMessage({
      body: messages[i] || `foo-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user1.id,
    });
    await findOrCreateMessage({
      body: `bar-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user1.id,
    });
    await findOrCreateMessage({
      body: `baz-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user2.id,
    });
    await findOrCreateMessage({
      body: `qux-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user2.id,
    });
  }
  return channel;
}
