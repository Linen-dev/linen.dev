import { prisma } from '@linen/database';
import { yesterday } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeSettings } from '@linen/serializers/settings';

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
        channel: true,
      },
      orderBy: { lastReplyAt: 'desc' },
      take,
      skip,
    });

    const accounts = await prisma.accounts.findMany({
      where: {
        id: {
          in: threads.map((thread) => thread.channel.accountId) as string[],
        },
      },
    });

    return {
      threads: threads.map(serializeThread),
      settings: accounts.map(serializeSettings),
    };
  }
}
