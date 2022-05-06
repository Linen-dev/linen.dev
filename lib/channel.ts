import prisma from '../client';
import { stripProtocol } from '../utilities/url';

interface FindChannelParams {
  name: string;
  accountId: string;
}

interface CreateChannelParams {
  name: string;
  accountId: string;
  slackChannelId: string;
}

export function findChannel({ name, accountId }: FindChannelParams) {
  return prisma.channels.findFirst({
    where: { channelName: name, accountId },
  });
}

export function createChannel({
  name,
  accountId,
  slackChannelId,
}: CreateChannelParams) {
  return prisma.channels.create({
    data: {
      channelName: name,
      accountId,
      slackChannelId,
    },
  });
}
