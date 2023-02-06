import { AccountType } from '@linen/types';
import { prisma } from '@linen/database';

export const findChannelByNameAndHost = (channelName: string, host: string) =>
  prisma.channels.findFirst({
    where: {
      channelName,
      account: {
        OR: [
          { discordDomain: host },
          { discordServerId: host },
          { slackDomain: host },
          { redirectDomain: host },
        ],
        AND: { type: AccountType.PUBLIC },
      },
      hidden: false,
    },
  });

export const findThreadsByChannelAndCursor = (
  channelId: string,
  cursor: bigint,
  limit = 10
) =>
  prisma.threads.findMany({
    where: {
      channelId: channelId,
      sentAt: { lt: cursor },
      hidden: false,
      messageCount: { gt: 1 },
    },
    orderBy: { sentAt: 'desc' },
    select: {
      incrementId: true,
      slug: true,
      sentAt: true,
    },
    take: limit,
  });
