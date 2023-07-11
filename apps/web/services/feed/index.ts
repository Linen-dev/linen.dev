import { accounts as accountsType, prisma } from '@linen/database';
import { yesterday } from '@linen/utilities/date';
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
        OR: [
          { channelId: config.linen.feedChannelId },
          {
            messageCount: {
              gte: 3,
            },
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
        lastReplyAt: {
          ...(!!lastReplyAt
            ? { lt: lastReplyAt }
            : { gt: yesterday().getTime() }),
        },
        hidden: false,
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
      // we filter threads with messages from bots here instead of through query
      .filter((thread) =>
        thread.messages.every(
          (m) => !m.author?.isBot || m.author.externalUserId === 'linen-bot'
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
}
