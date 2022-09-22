import { AccountType } from '@prisma/client';
import prisma from '../client';

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
    where: { channelId: channelId, sentAt: { gt: cursor }, hidden: false },
    orderBy: { sentAt: 'asc' },
    select: {
      incrementId: true,
      slug: true,
      messageCount: true,
      sentAt: true,
    },
    take: limit,
  });
