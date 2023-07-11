import { accounts as accountsType, prisma } from '@linen/database';
import { yesterday } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeAccount } from '@linen/serializers/account';
import { serializeSettings } from '@linen/serializers/settings';
import memoize from 'p-memoize';
import ExpiryMap from 'expiry-map';

const PRODUCTION = process.env.NODE_ENV === 'production';

const fetch = memoize(
  ({ skip, take }: { skip: number; take: number }) => {
    return prisma.threads.findMany({
      where: {
        OR: [
          {
            messageCount: {
              gte: 3,
            },
            channel: {
              type: 'PUBLIC',
              account: {
                anonymizeUsers: false,
                type: 'PUBLIC',
              },
              archived: false,
              hidden: false,
            },
            messages: {
              none: {
                author: {
                  isBot: true,
                },
              },
            },
            lastReplyAt: { gt: yesterday().getTime() },
            hidden: false,
          },
          PRODUCTION
            ? { channelId: 'b876a398-be14-4b2f-970d-835a9e61b3d4' }
            : {
                channel: {
                  channelName: 'feed',
                  account: { slackDomain: 'linen' },
                },
              },
        ],
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
      orderBy: [{ lastActivityAt: 'desc' }, { lastReplyAt: 'desc' }],
      take,
      skip,
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
  static async get({ skip, take }: { skip: number; take: number }) {
    const threads = await fetch({ skip, take });

    let accounts: accountsType[] = [];
    let ids: string[] = [];

    threads.forEach((thread) => {
      const { account } = thread.channel;
      if (account && !ids.includes(account.id)) {
        ids.push(account.id);
        accounts.push(account);
      }
    });

    return {
      threads: threads.map(serializeThread),
      settings: accounts.map(serializeSettings),
      communities: accounts.map(serializeAccount),
    };
  }
}
