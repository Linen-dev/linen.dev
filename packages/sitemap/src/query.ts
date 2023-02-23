import { prisma } from '@linen/database';
import { Account } from './types';

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
    },
    where: {
      premium: true,
      redirectDomain: { not: null },
      type: 'PUBLIC',
      channels: {
        some: { hidden: false, threads: { some: { messageCount: { gt: 1 } } } },
      },
    },
  });
}

export async function getChannels(account: Account) {
  return await prisma.channels.findMany({
    select: { channelName: true, pages: true },
    where: {
      hidden: false,
      account: { id: account.id },
      pages: { gt: 0 },
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
        hidden: false,
        channel: { account: { id: account.id } },
        messages: {},
        sentAt: { lt: sentAt },
        messageCount: { gt: 1 },
      },
      take: 50,
      orderBy: [{ viewCount: 'desc' }, { sentAt: 'desc' }],
    });

    if (!threads.length) return;

    sentAt = threads[threads.length - 1].sentAt;
    yield threads;
  }
}

export async function getChannelsFreeTier(_: Account) {
  return await prisma.channels.findMany({
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
        },
      },
    },
    where: {
      hidden: false,
      account: {
        premium: false,
        type: 'PUBLIC',
      },
      threads: {},
    },
    orderBy: { account: { createdAt: 'desc' } },
  });
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
              },
            },
          },
        },
      },
      where: {
        hidden: false,
        channel: {
          account: {
            premium: false,
            type: 'PUBLIC',
          },
        },
        messages: {},
        sentAt: { lt: sentAt },
        messageCount: { gt: 1 },
      },
      take: 50,
      orderBy: [{ viewCount: 'desc' }, { sentAt: 'desc' }],
    });

    if (!threads.length) return;

    sentAt = threads[threads.length - 1].sentAt;
    yield threads;
  }
}
