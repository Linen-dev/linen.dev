import prisma from '../client';

interface FindThreadParams {
  channelId: string;
  slug: string;
}

interface CreateThreadParams {
  channelId: string;
  messageCount: number;
  slackThreadTs: string;
  slug: string;
}

export function findThread({ channelId, slug }: FindThreadParams) {
  return prisma.slackThreads.findFirst({
    where: { channelId, slug },
  });
}

export function createThread({
  channelId,
  messageCount,
  slackThreadTs,
  slug,
}: CreateThreadParams) {
  return prisma.slackThreads.create({
    data: {
      channelId,
      messageCount,
      slackThreadTs,
      slug,
    },
  });
}
