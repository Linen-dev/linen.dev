import { accounts, prisma } from '@linen/database';
import { yesterday } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeSettings } from '@linen/serializers/settings';
import unique from 'lodash.uniq';

export default class FeedService {
  static async get({ skip, take }: { skip: number; take: number }) {
    const threads = await prisma.threads.findMany({
      where: {
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
        },
        messages: {
          none: {
            author: {
              isBot: true,
            },
          },
        },
        lastReplyAt: { gt: yesterday().getTime() },
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
      orderBy: { lastReplyAt: 'desc' },
      take,
      skip,
    });

    const accounts = unique(
      threads.map((thread) => thread.channel.account)
    ) as accounts[];

    return {
      threads: threads.map(serializeThread),
      settings: accounts.map(serializeSettings),
    };
  }
}
