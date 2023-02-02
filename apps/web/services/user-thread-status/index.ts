import prisma from 'client';

class UserThreadStatusService {
  static async markAsUnread(threadId: string) {
    return prisma.userThreadStatus.deleteMany({
      where: {
        threadId,
        read: true,
        muted: false,
      },
    });
  }

  static async markAsUnmuted(threadId: string, userIds: string[]) {
    if (userIds.length === 0) {
      return Promise.resolve();
    }
    return prisma.userThreadStatus.deleteMany({
      where: {
        threadId,
        userId: {
          in: userIds,
        },
        read: false,
        muted: true,
      },
    });
  }

  static async markAsAllRead(channelId: string, userId: string) {
    const threads = await prisma.threads.findMany({
      where: {
        channelId,
      },
      select: { id: true },
    });
    await prisma.userThreadStatus.createMany({
      data: threads.map((thread) => {
        return {
          threadId: thread.id,
          userId,
          read: true,
          muted: false,
        };
      }),
    });
  }
}

export default UserThreadStatusService;
