import { prisma } from '@linen/database';
import { lastWeek } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeSettings } from '@linen/serializers/settings';

export default class FeedService {
  static async get({ skip }: { skip: number }) {
    const threads = await prisma.threads.findMany({
      where: {
        channel: {
          account: {
            type: 'PUBLIC',
          },
        },
        lastReplyAt: { gt: lastWeek().getTime() },
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
      take: 10,
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
