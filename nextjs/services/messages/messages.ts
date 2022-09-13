import prisma from 'client';

export interface messageParams {
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
}: messageParams) {
  const sentAt = new Date();
  if (threadId) {
    return prisma.threads.update({
      where: {
        id: threadId,
      },
      data: {
        messageCount: {
          increment: 1,
        },
        messages: {
          create: {
            body,
            channelId,
            sentAt,
            usersId: userId
          },
        },
      },
    });
  } else {
    return prisma.threads.create({
      data: {
        channelId: channelId,
        sentAt: sentAt.getTime(),
        messages: {
          create: {
            body,
            channelId,
            sentAt,
          },
        },
      },
    });
  }
}
