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
  slackMessageId: string;
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
  slackMessageId,
}: CreateMessageParams) {
  return prisma.messages.create({
    data: {
      channelId,
      slackMessageId,
      slackThreadId: threadId,
      body,
      sentAt: new Date(),
    },
  });
}
