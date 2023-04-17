import { AccountType, ChannelType, prisma } from '@linen/database';
import { Account } from './types';

const threadNotHiddenWithMessage = {
  OR: [
    {
      messageCount: { gt: 1 },
    },
    {
      viewCount: { gt: 1 },
    },
  ],
  messages: {
    some: {
      author: {
        is: { id: {} },
        isNot: { isBot: true },
      },
    },
  },
  hidden: false,
};

const channelPublicNotHidden = {
  type: ChannelType.PUBLIC,
  hidden: false,
};

const channelPublicNotHiddenWithMessages = {
  ...channelPublicNotHidden,
  threads: {
    some: {
      ...threadNotHiddenWithMessage,
    },
  },
};

/**
 * return all premium communities with redirect domain and PUBLIC
 */
export async function getCommunities() {
  return await prisma.accounts.findMany({
    select: {
      id: true,
      name: true,
      redirectDomain: true,
      discordDomain: true,
      slackDomain: true,
      discordServerId: true,
      premium: true,
    },
    where: {
      premium: true,
      redirectDomain: { not: null },
      type: AccountType.PUBLIC,
      channels: {
        some: {
          ...channelPublicNotHiddenWithMessages,
        },
      },
    },
  });
}

export async function getChannels(account: Account) {
  return await prisma.channels.findMany({
    select: { channelName: true, pages: true },
    where: {
      ...channelPublicNotHiddenWithMessages,
      account: { id: account.id },
    },
  });
}

export async function* getThreadsAsyncIterable(account: Account) {
  let sentAt = BigInt(Date.now() * 1000);
  while (true) {
    const threads = await prisma.threads.findMany({
      select: {
        incrementId: true,
        lastReplyAt: true,
        messageCount: true,
        resolutionId: true,
        sentAt: true,
        viewCount: true,
        slug: true,
        channel: { select: { channelName: true } },
      },
      where: {
        ...threadNotHiddenWithMessage,
        channel: {
          ...channelPublicNotHidden,
          account: { id: account.id },
        },
        sentAt: { lt: sentAt },
      },
      take: 50,
      orderBy: [{ lastReplyAt: 'desc' }, { sentAt: 'desc' }],
    });

    if (!threads.length) return;

    sentAt = threads[threads.length - 1].sentAt;
    yield threads;
  }
}

export async function getChannelsFreeTier(_: Account) {
  const accounts = await prisma.accounts.findMany({
    select: { id: true },
    where: { premium: false, type: AccountType.PUBLIC },
    orderBy: { createdAt: 'desc' },
  });
  const channels = [];

  for (const account of accounts) {
    channels.push(
      ...(await prisma.channels.findMany({
        select: {
          channelName: true,
          pages: true,
          account: {
            select: {
              id: true,
              name: true,
              redirectDomain: true,
              discordDomain: true,
              slackDomain: true,
              discordServerId: true,
              premium: true,
            },
          },
        },
        where: {
          ...channelPublicNotHiddenWithMessages,
          account: {
            id: account.id,
          },
        },
        orderBy: { lastPageBuildAt: 'desc' },
      }))
    );
  }
  return channels;
}

export async function* getThreadsAsyncIterableFreeTier(_: Account) {
  let sentAt = BigInt(Date.now() * 1000);
  while (true) {
    const threads = await prisma.threads.findMany({
      select: {
        incrementId: true,
        lastReplyAt: true,
        messageCount: true,
        resolutionId: true,
        sentAt: true,
        viewCount: true,
        slug: true,
        channel: {
          select: {
            channelName: true,
            account: {
              select: {
                id: true,
                name: true,
                redirectDomain: true,
                discordDomain: true,
                slackDomain: true,
                discordServerId: true,
                premium: true,
              },
            },
          },
        },
      },
      where: {
        ...threadNotHiddenWithMessage,
        channel: {
          ...channelPublicNotHidden,
          account: {
            premium: false,
            type: AccountType.PUBLIC,
          },
        },
        sentAt: { lt: sentAt },
      },
      take: 50,
      orderBy: [{ lastReplyAt: 'desc' }, { sentAt: 'desc' }],
    });

    if (!threads.length) return;

    sentAt = threads[threads.length - 1].sentAt;
    yield threads;
  }
}
