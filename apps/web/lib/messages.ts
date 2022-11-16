import { prisma } from 'client';

export function findMessageById({ id }: { id: string }) {
  return prisma.messages.findUnique({
    where: { id },
    include: {
      author: true,
      mentions: {
        include: {
          users: true,
        },
      },
      reactions: true,
      attachments: true,
      channel: {
        select: { accountId: true },
      },
    },
  });
}
