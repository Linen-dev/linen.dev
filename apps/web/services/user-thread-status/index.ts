import prisma from 'client';

class UserThreadStatusService {
  static async markAsUnread(threadId: string) {
    console.log(
      await prisma.userThreadStatus.findMany({
        where: {
          threadId,
        },
      })
    );
    return prisma.userThreadStatus.updateMany({
      where: {
        threadId,
        read: true,
        muted: false,
      },
      data: {
        read: false,
      },
    });
  }
}

export default UserThreadStatusService;
