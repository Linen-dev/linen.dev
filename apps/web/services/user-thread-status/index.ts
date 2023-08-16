import { prisma } from '@linen/database';

class UserThreadStatusService {
  static async markAsUnread(threadId: string, userId?: string) {
    if (userId) {
      return prisma.userThreadStatus.deleteMany({
        where: {
          threadId,
          read: true,
          NOT: {
            userId,
          },
        },
      });
    }
    return prisma.userThreadStatus.deleteMany({
      where: {
        threadId,
        read: true,
      },
    });
  }

  static async markAsUnmutedForMentionedUsers(
    threadId: string,
    userIds: string[]
  ) {
    if (userIds.length === 0) {
      return Promise.resolve();
    }
    return prisma.userThreadStatus.deleteMany({
      where: {
        threadId,
        userId: {
          in: userIds,
        },
        muted: true,
      },
    });
  }

  static async markAllAsRead({ userId }: { userId: string }) {
    return prisma.$queryRaw`
      INSERT INTO "userThreadStatus" ("userId", "threadId", "muted", "read", "createdAt", "updatedAt")
      SELECT ${userId}, thread.id, false, true, current_timestamp, current_timestamp
      FROM threads AS thread
      WHERE "lastReplyAt" > extract(epoch from now() - '60 days'::interval) * 1000
      ON CONFLICT DO NOTHING
    `;
  }
}

export default UserThreadStatusService;
