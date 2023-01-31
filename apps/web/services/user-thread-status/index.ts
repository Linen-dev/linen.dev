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
}

export default UserThreadStatusService;
