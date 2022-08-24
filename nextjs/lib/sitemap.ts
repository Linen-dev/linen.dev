import { Prisma } from '@prisma/client';
import prisma from '../client';

const accountsWithChannelsStats = Prisma.validator<Prisma.accountsArgs>()({
  select: {
    id: true,
    discordDomain: true,
    discordServerId: true,
    slackDomain: true,
    slackTeamId: true,
    channels: {
      select: {
        channelName: true,
        _count: {
          select: {
            messages: true,
            threads: true,
          },
        },
      },
      where: {
        hidden: false,
      },
    },
  },
});

export type AccountsWithChannelsStats = Prisma.accountsGetPayload<
  typeof accountsWithChannelsStats
>;

export const getAccountByHostWithChannelsStats = (host: string) =>
  prisma.accounts.findFirst({
    ...accountsWithChannelsStats,
    where: {
      redirectDomain: host,
    },
  });

export const findFreeAccountsWithChannelsStats = () =>
  prisma.accounts.findMany({
    ...accountsWithChannelsStats,
    where: {
      premium: false,
      AND: {
        OR: [
          { discordDomain: { not: null } },
          { slackDomain: { not: null } },
          { discordServerId: { not: null } },
          { slackTeamId: { not: null } },
        ],
      },
    },
  });

export const findAccountByNameWithChannelsStats = (community: string) =>
  prisma.accounts.findFirst({
    ...accountsWithChannelsStats,
    where: {
      OR: [
        { discordDomain: community },
        { discordServerId: community },
        { slackDomain: community },
      ],
    },
  });

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
    where: { channelId: channelId, sentAt: { gt: cursor } },
    orderBy: { sentAt: 'asc' },
    select: {
      incrementId: true,
      slug: true,
      messageCount: true,
      sentAt: true,
    },
    take: limit,
  });
