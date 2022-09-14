import prisma from 'client';

export interface messageInput {
  body: string;
  threadId: string | null;
  channelId: string;
  userId: string;
}

export async function saveMessage({
  body,
  threadId,
  channelId,
  userId,
}: messageInput) {
  const sentAt = new Date();

  const messages = {
    create: {
      body,
      channelId,
      sentAt,
      usersId: userId,
    },
  };

  if (threadId) {
    return prisma.threads.update({
      where: {
        id: threadId,
      },
      data: {
        messageCount: {
          increment: 1,
        },
        messages,
      },
    });
  } else {
    return prisma.threads.create({
      data: {
        channelId: channelId,
        sentAt: sentAt.getTime(),
        messageCount: 1,
        messages,
      },
    });
  }
}
