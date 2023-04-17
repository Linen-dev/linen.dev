import { AccountType, ChannelType, prisma } from '@linen/database';
import {
  createAccount,
  createChannel,
  createThread,
  createMessage,
  createUser,
} from '@linen/factory';
import {
  getChannels,
  getChannelsFreeTier,
  getCommunities,
  getThreadsAsyncIterable,
  getThreadsAsyncIterableFreeTier,
} from './query';

const random = () => Math.random().toString(36).substring(2);
const randomNum = () => Math.floor(Math.random() * 3);

const accountsList = [
  'premium_public_account',
  'premium_private_account',
  'free_public_account',
  'free_private_account',
  'premium_public_account_without_domain',
  'free_public_account_with_domain',
];

const channelsList = [
  'hidden_public_channel',
  'hidden_private_channel',
  'hidden_dm_channel',
  'public_channel',
  'private_channel',
  'dm_channel',
  'empty_public_channel',
  'empty_private_channel',
  'empty_dm_channel',
];

describe('queries', () => {
  jest.setTimeout(15000);
  beforeAll(async () => {
    await seed();
  });

  test('check seed', async () => {
    const accounts = await prisma.accounts.findMany({
      where: {
        name: {
          in: accountsList,
        },
      },
    });
    expect(accounts).toHaveLength(accountsList.length);
  });

  test('premium communities', async () => {
    // getCommunities :: should return only non-private premium with redirect
    const accounts = await getCommunities();
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts.some((a) => a.premium === false)).toBe(false);
    expect(accounts.some((a) => !a.redirectDomain)).toBe(false);

    const accountsFromSeed = accounts.filter((a) =>
      accountsList.some((l) => l === a.name)
    );

    for (const account of accountsFromSeed) {
      // getChannels :: should return only non-hidden channels with messages
      const channels = await getChannels(account);
      expect(channels.length).toBe(1);
      expect(channels[0].channelName).toBe('public_channel');

      // getThreadsAsyncIterable
      let threadsCount = 0;
      for await (const threads of getThreadsAsyncIterable(account)) {
        for (const thread of threads) {
          threadsCount++;
          expect(thread.channel.channelName).toBe('public_channel');
          expect(thread.slug).toBe('thread');
        }
      }
      expect(threadsCount).toBe(1);
    }
  });

  test('free communities', async () => {
    // getChannelsFreeTier :: should return only non-hidden channels from non-private free tier communities
    const channels = await getChannelsFreeTier({} as any);
    const channelsFromSeed = channels.filter((c) =>
      channelsList.some((l) => l === c.channelName)
    );
    for (const c of channelsFromSeed) {
      expect(c.channelName).toBe('public_channel');
    }

    //   getThreadsAsyncIterableFreeTier
    const threads: any[] = [];
    for await (const batch of getThreadsAsyncIterableFreeTier({} as any)) {
      threads.push(...batch);
    }

    expect(threads.length > 0).toBe(true);
    const threadsFromSeed = threads.filter((t) =>
      channelsList.some((l) => l === t.channel.channelName)
    );
    expect(threadsFromSeed.length > 0).toBe(true);
    for (const t of threadsFromSeed) {
      expect(t.channel.channelName).toBe('public_channel');
      expect(t.slug).toBe('thread');
    }
  });

  afterAll(async () => {
    await unSeed();
    await prisma.$disconnect();
  });
});

async function seed() {
  const premium_public_account = await createAccount({
    premium: true,
    type: AccountType.PUBLIC,
    redirectDomain: random(),
    name: 'premium_public_account',
  });
  await bulkCreateChannels(premium_public_account.id);

  const premium_public_account_without_domain = await createAccount({
    premium: true,
    type: AccountType.PUBLIC,
    slackDomain: random(),
    name: 'premium_public_account_without_domain',
  });
  await bulkCreateChannels(premium_public_account_without_domain.id);

  const premium_private_account = await createAccount({
    premium: true,
    type: AccountType.PRIVATE,
    redirectDomain: random(),
    name: 'premium_private_account',
  });
  await bulkCreateChannels(premium_private_account.id);

  const free_public_account = await createAccount({
    premium: false,
    type: AccountType.PUBLIC,
    slackDomain: random(),
    name: 'free_public_account',
  });
  await bulkCreateChannels(free_public_account.id);

  const free_public_account_with_domain = await createAccount({
    premium: false,
    type: AccountType.PUBLIC,
    slackDomain: random(),
    redirectDomain: random(),
    name: 'free_public_account_with_domain',
  });
  await bulkCreateChannels(free_public_account_with_domain.id);

  const free_private_account = await createAccount({
    premium: true,
    type: AccountType.PRIVATE,
    slackDomain: random(),
    name: 'free_private_account',
  });
  await bulkCreateChannels(free_private_account.id);
}

async function bulkCreateChannels(accountId: string) {
  const hidden_public_channel = await createChannel({
    accountId,
    channelName: 'hidden_public_channel',
    hidden: true,
    type: ChannelType.PUBLIC,
  });

  const hidden_private_channel = await createChannel({
    accountId,
    channelName: 'hidden_private_channel',
    hidden: true,
    type: ChannelType.PRIVATE,
  });

  const hidden_dm_channel = await createChannel({
    accountId,
    channelName: 'hidden_dm_channel',
    hidden: true,
    type: ChannelType.DM,
  });

  const public_channel = await createChannel({
    accountId,
    channelName: 'public_channel',
    hidden: false,
    type: ChannelType.PUBLIC,
  });

  const private_channel = await createChannel({
    accountId,
    channelName: 'private_channel',
    hidden: false,
    type: ChannelType.PRIVATE,
  });

  const dm_channel = await createChannel({
    accountId,
    channelName: 'dm_channel',
    hidden: false,
    type: ChannelType.DM,
  });

  const empty_public_channel = await createChannel({
    accountId,
    channelName: 'empty_public_channel',
    hidden: false,
    type: ChannelType.PUBLIC,
  });

  const empty_private_channel = await createChannel({
    accountId,
    channelName: 'empty_private_channel',
    hidden: false,
    type: ChannelType.PRIVATE,
  });

  const empty_dm_channel = await createChannel({
    accountId,
    channelName: 'empty_dm_channel',
    hidden: false,
    type: ChannelType.DM,
  });

  const user = await createUser({ accountsId: accountId, isBot: false });

  for (const channel of [
    hidden_public_channel,
    hidden_private_channel,
    hidden_dm_channel,
    public_channel,
    private_channel,
    dm_channel,
  ]) {
    const thread = await createThread({
      channelId: channel.id,
      hidden: false,
      slug: 'thread',
      viewCount: randomNum(),
      messageCount: 3,
    });
    await bulkCreateMessages({
      channelId: channel.id,
      threadId: thread.id,
      userId: user.id,
    });

    const hidden_thread = await createThread({
      channelId: channel.id,
      hidden: true,
      slug: 'hidden_thread',
      viewCount: randomNum(),
      messageCount: 3,
    });
    await bulkCreateMessages({
      channelId: channel.id,
      threadId: hidden_thread.id,
      userId: user.id,
    });

    const empty_thread = await createThread({
      channelId: channel.id,
      hidden: false,
      slug: 'empty_thread',
      viewCount: randomNum(),
    });
  }
}

async function bulkCreateMessages({
  channelId,
  threadId,
  num = 3,
  userId,
}: {
  channelId: string;
  threadId: string;
  num?: number;
  userId: string;
}) {
  await Promise.all(
    Array.from(Array(num).keys()).map(() =>
      createMessage({
        body: random(),
        channelId,
        threadId,
        usersId: userId,
      })
    )
  );
}

async function unSeed() {
  const deleteMessages = prisma.messages.deleteMany({
    where: { channel: { account: { name: { in: accountsList } } } },
  });
  const deleteThreads = prisma.threads.deleteMany({
    where: { channel: { account: { name: { in: accountsList } } } },
  });
  const deleteChannels = prisma.channels.deleteMany({
    where: { account: { name: { in: accountsList } } },
  });
  const deleteUsers = prisma.users.deleteMany({
    where: { account: { name: { in: accountsList } } },
  });
  const deleteAccounts = prisma.accounts.deleteMany({
    where: { name: { in: accountsList } },
  });

  await prisma.$transaction([
    deleteMessages,
    deleteThreads,
    deleteChannels,
    deleteUsers,
    deleteAccounts,
  ]);
}
