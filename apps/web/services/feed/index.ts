import { accounts as accountsType, prisma } from '@linen/database';
import { daysAgo, yesterday } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeAccount } from '@linen/serializers/account';
import { serializeSettings } from '@linen/serializers/settings';
import memoize from 'p-memoize';
import ExpiryMap from 'expiry-map';
import { config } from 'config';

const fetch = memoize(
  ({ lastReplyAt }: { lastReplyAt?: number }) => {
    return prisma.threads.findMany({
      where: {
        feed: true,
        lastReplyAt: {
          ...(!!lastReplyAt
            ? { lt: lastReplyAt }
            : { gt: yesterday().getTime() }),
        },
      },
      include: {
        messages: {
          include: {
            author: true,
            mentions: {
              include: {
                users: true,
              },
            },
            reactions: true,
            attachments: true,
          },
          orderBy: { sentAt: 'asc' },
        },
        channel: {
          include: {
            account: true,
          },
        },
      },
      orderBy: [
        // { lastActivityAt: 'desc' },
        { lastReplyAt: 'desc' },
      ],
      take: 12,
    });
  },
  {
    cache: new ExpiryMap(180000),
    cacheKey(params) {
      return JSON.stringify(params);
    },
  }
);

export default class FeedService {
  static async get({ lastReplyAt }: { lastReplyAt?: number }) {
    let accounts: accountsType[] = [];
    let ids: string[] = [];

    const queryResult = await fetch({ lastReplyAt });

    const threads = queryResult
      .filter((thread) =>
        thread.messages.every(
          (m) =>
            // we filter threads with messages from bots here instead of through query
            !m.author?.isBot ||
            // except linenBot messages from feed channel
            (m.author.externalUserId === config.linen.bot.externalId &&
              thread.channelId === config.linen.feedChannelId)
        )
      )
      .map((thread) => {
        const { account } = thread.channel;
        if (account && !ids.includes(account.id)) {
          ids.push(account.id);
          accounts.push(account);
        }
        return serializeThread(thread);
      });

    let cursor;
    try {
      // using queryResult because it was not filtered on code
      cursor = queryResult[queryResult.length - 1].lastReplyAt?.toString();
    } catch (error) {}

    return {
      threads,
      settings: accounts.map(serializeSettings),
      communities: accounts.map(serializeAccount),
      cursor,
    };
  }

  static async mark() {
    const threads = await prisma.threads.findMany({
      select: { id: true },
      where: {
        OR: [
          {
            channelId: config.linen.feedChannelId,
          },
          {
            messageCount: {
              gte: 3,
            },
            // messages: {
            //   none: {
            //     author: {
            //       isBot: true,
            //     },
            //   },
            // },
          },
        ],
        channel: {
          type: 'PUBLIC',
          account: {
            anonymizeUsers: false,
            type: 'PUBLIC',
          },
          archived: false,
          hidden: false,
        },
        lastReplyAt: { gt: daysAgo(1).getTime() },
        hidden: false,
      },
    });
    await prisma.$transaction(async (tx) => {
      await tx.threads.updateMany({
        where: {
          feed: true,
          id: { notIn: threads.map((t) => t.id) },
        },
        data: {
          feed: false,
        },
      });
      await tx.threads.updateMany({
        where: {
          id: { in: threads.map((t) => t.id) },
        },
        data: {
          feed: true,
        },
      });
    });
  }
}
