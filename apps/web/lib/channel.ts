import { accounts, Prisma } from '@prisma/client';
import prisma from '../client';

interface FindChannelParams {
  name: string;
  accountId: string;
}

interface FindChannelByExternalIdParams {
  externalId: string;
  accountId: string;
}

interface CreateChannelParams {
  name: string;
  accountId: string;
  externalChannelId: string;
  hidden?: boolean;
}

interface RenameChannelParams {
  name: string;
  id: string;
}

export function findChannel({ name, accountId }: FindChannelParams) {
  return prisma.channels.findFirst({
    where: { channelName: name, accountId },
  });
}

export function findChannelByExternalId({
  externalId,
  accountId,
}: FindChannelByExternalIdParams) {
  return prisma.channels.findFirst({
    where: { externalChannelId: externalId, accountId },
  });
}

export async function findChannelWithAccountByExternalId(
  externalId: string,
  externalAccountId: string
) {
  return await prisma.channels.findUnique({
    where: {
      externalChannelId: externalId,
    },
    include: {
      account: {
        include: {
          slackAuthorizations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
}

export function createChannel({
  name,
  accountId,
  externalChannelId,
  hidden,
}: CreateChannelParams) {
  return prisma.channels.create({
    data: {
      channelName: name,
      accountId,
      externalChannelId,
      hidden,
    },
  });
}

export function renameChannel({ name, id }: RenameChannelParams) {
  return prisma.channels.update({
    where: {
      id,
    },
    data: {
      channelName: name,
    },
  });
}

export async function hideEmptyChannels(accountId: string) {
  const channels = await prisma.channels.findMany({
    include: { _count: true },
    where: { accountId },
  });
  const promise = channels
    .map(async (channel) => {
      if (!channel._count.threads && !channel._count.messages) {
        await prisma.channels.update({
          where: { id: channel.id },
          data: { hidden: true },
        });
      }
    })
    .filter(Boolean);
  return Promise.all(promise);
}

export async function shouldThisChannelBeAnonymous(channelId: string) {
  return await prisma.accounts
    .findFirst({
      where: {
        channels: {
          some: { id: channelId },
        },
      },
      select: { anonymizeUsers: true },
    })
    .then((account) => account?.anonymizeUsers);
}

const channelSerialized = Prisma.validator<Prisma.channelsFindManyArgs>()({
  select: {
    id: true,
    channelName: true,
    default: true,
    hidden: true,
    accountId: true,
  },
});

export type ChannelSerialized = Prisma.channelsGetPayload<
  typeof channelSerialized
>;

export async function findChannelsByAccount({
  isCrawler,
  account,
}: {
  isCrawler: boolean;
  account: Partial<accounts>;
}): Promise<ChannelSerialized[]> {
  // if crawler, get only channels with threads
  // for normal users, we may see channels empty (e.g. new channels)
  return await prisma.channels.findMany({
    ...channelSerialized,
    where: {
      hidden: false,
      account: { id: account.id },
      ...(isCrawler && {
        threads: {
          some: {
            hidden: false,
            messages: { some: {} },
          },
        },
      }),
    },
  });
}
