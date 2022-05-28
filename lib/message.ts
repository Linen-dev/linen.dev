import prisma from '../client';

interface FindMessageParams {
  channelId: string;
  threadId: string;
  body: string;
  usersId?: string;
}

interface CreateMessageParams {
  channelId: string;
  threadId: string;
  body: string;
  slackMessageId: string;
  usersId?: string;
}

export function findMessage({
  channelId,
  threadId,
  body,
  usersId,
}: FindMessageParams) {
  return prisma.messages.findFirst({
    where: { channelId, slackThreadId: threadId, body, usersId },
  });
}

export function createMessage({
  channelId,
  threadId,
  body,
  slackMessageId,
  usersId,
}: CreateMessageParams) {
  return prisma.messages.create({
    data: {
      channelId,
      slackMessageId,
      slackThreadId: threadId,
      body,
      sentAt: new Date(),
      usersId,
    },
  });
}
