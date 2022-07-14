import prisma from '../client';
import { stripProtocol } from '../utilities/url';

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
