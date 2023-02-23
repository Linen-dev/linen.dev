import { prisma } from '@linen/database';

class UserThreadStatusService {
  static async markAsUnreadForAllUsers(threadId: string) {
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

  static async markManyAsRead({
    channelId,
    userId,
    limit,
  }: {
    channelId?: string;
    userId: string;
    limit: number;
  }) {
    if (channelId) {
      return prisma.$queryRaw`
        INSERT INTO "userThreadStatus" ("userId", "threadId", "muted", "read", "createdAt", "updatedAt")
        SELECT ${userId}, t.id, false, true, current_timestamp, current_timestamp
        FROM threads as t
        LIMIT ${limit}
        JOIN channels as c on t."channelId" = c.id
        WHERE c.id = ${channelId}
        ON CONFLICT DO NOTHING
      `;
    }
    return prisma.$queryRaw`
      INSERT INTO "userThreadStatus" ("userId", "threadId", "muted", "read", "createdAt", "updatedAt")
      SELECT ${userId}, t.id, false, true, current_timestamp, current_timestamp
      FROM threads as t
      LIMIT ${limit}
      ON CONFLICT DO NOTHING
    `;
  }
}

export default UserThreadStatusService;
