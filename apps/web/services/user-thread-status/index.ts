import { prisma } from '@linen/database';

export const USER_THREAD_STATUS_DAYS_LIMIT = 60;

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

  static async markAllAsRead({
    communityId,
    userId,
  }: {
    communityId: string;
    userId: string;
  }) {
    return prisma.$queryRaw`
      INSERT INTO "userThreadStatus" ("userId", "threadId", "muted", "read", "createdAt", "updatedAt")
      SELECT ${userId}, thread.id, false, true, current_timestamp, current_timestamp
      FROM threads AS thread
      WHERE "lastReplyAt" > extract(epoch from now() - '60 days'::interval) * 1000
      AND "channelId" IN (SELECT id FROM channels WHERE "accountId" = ${communityId})
      ON CONFLICT DO NOTHING
    `;
  }

  static async cleanup() {
    return prisma.$queryRaw`
    DELETE FROM "userThreadStatus"
    WHERE "createdAt" < current_date - interval '60' day;
  `;
  }
}

export default UserThreadStatusService;
