import prisma from '../client';

interface FindMessageParams {
  channelId: string;
  threadId: string;
  body: string;
}

interface CreateMessageParams {
  channelId: string;
  threadId: string;
  body: string;
}

export function findMessage({ channelId, threadId, body }: FindMessageParams) {
  return prisma.messages.findFirst({
    where: { channelId, slackThreadId: threadId, body },
  });
}

export function createMessage({
  channelId,
  threadId,
  body,
}: CreateMessageParams) {
  return prisma.messages.create({
    data: {
      channelId,
      slackThreadId: threadId,
      body,
      sentAt: new Date(),
    },
  });
}
