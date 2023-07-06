import { accounts as accountsType, prisma } from '@linen/database';
import { yesterday } from '@linen/utilities/date';
import { serializeThread } from '@linen/serializers/thread';
import { serializeAccount } from '@linen/serializers/account';
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
